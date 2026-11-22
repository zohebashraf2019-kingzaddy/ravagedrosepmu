/* Vercel serverless function: POST /api/submit-form
   Validates an online client form and emails it to the studio via Resend.

   Vercel → Project → Settings → Environment Variables:
     RESEND_API_KEY   (required)  from resend.com → API Keys
     FORMS_TO_EMAIL   (required)  where submissions go, e.g. ravagedrosepmu@gmail.com
     FORMS_FROM_EMAIL (optional)  verified sender, e.g. "Ravaged Rose Forms <forms@yourdomain.com>"
                                  defaults to Resend's test sender onboarding@resend.dev
   Nothing is stored on the website — the email is the record. */
const FORMS = require("../assets/js/forms-data.js");

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clip = (s, n) => String(s ?? "").trim().slice(0, n);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(body) {
  const F = FORMS[body && body.form];
  if (!F) return { error: "Unknown form." };
  const c = body.contact || {};
  const contact = { name: clip(c.name, 120), email: clip(c.email, 160), phone: clip(c.phone, 40), appt: clip(c.appt, 20) };
  if (!contact.name || !EMAIL_RE.test(contact.email) || contact.phone.length < 7) return { error: "Please complete your name, email and phone." };
  if (F.confirm && body.confirm !== true) return { error: "Please confirm your answers are accurate." };
  const sig = String(body.signature || "");
  if (!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(sig) || sig.length > 1_500_000) return { error: "Please sign the form." };

  const a = body.answers || {}, rows = [];
  for (const s of F.sections) {
    for (const f of s.fields) {
      if (!f.id) continue;
      const v = a[f.id];
      if (f.type === "yesno") {
        const ans = v && v.answer;
        if (ans !== "Yes" && ans !== "No") return { error: "Please answer every question." };
        const explain = clip(v.explain, 1500);
        if (ans === "Yes" && !explain) return { error: "Please explain each “Yes” answer." };
        rows.push({ type: f.type, label: f.label, value: ans, explain, flag: ans === "Yes" });
      } else if (f.type === "radio") {
        const o = f.options.find((x) => x.v === v);
        if (!o) return { error: "Please choose an option." };
        rows.push({ type: f.type, label: f.label, value: o.t.split(":")[0], detail: o.t });
      } else if (f.type === "checks") {
        const picked = f.options.filter((o) => Array.isArray(v) && v.includes(o.v)).map((o) => o.t);
        if (f.required && !picked.length) return { error: "Please choose your service." };
        rows.push({ type: f.type, label: f.label, value: picked.join(", ") });
      } else if (f.type === "ack") {
        if (f.required && v !== "Agreed") return { error: "Please check each required statement." };
        rows.push({ type: f.type, label: f.label, value: v === "Agreed" ? "✓ Agreed" : "Not checked" });
      }
    }
  }
  return { F, contact, rows, sig };
}

function buildEmail({ F, contact, rows }, meta) {
  const yes = rows.filter((r) => r.flag).length;
  const tr = rows.map((r) => `
    <tr style="${r.flag ? "background:#fff1ec;" : ""}">
      <td style="padding:10px 12px;border-bottom:1px solid #eedcd3;font-size:14px;color:#3e2631;vertical-align:top">${esc(r.label)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eedcd3;font-size:14px;vertical-align:top;white-space:nowrap;font-weight:700;color:${r.flag ? "#b4442c" : "#21141a"}">${esc(r.value)}</td>
    </tr>${r.explain ? `<tr style="background:#fff1ec"><td colspan="2" style="padding:0 12px 12px;border-bottom:1px solid #eedcd3;font-size:14px;color:#21141a"><b>Explanation:</b> ${esc(r.explain)}</td></tr>` : ""}`).join("");
  const html = `<!doctype html><html><body style="margin:0;background:#faf3ee;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:680px;margin:0 auto;padding:24px">
    <div style="background:#21141a;color:#f3dfd3;padding:22px 24px;border-radius:14px 14px 0 0">
      <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#d19a7f">Ravaged Rose PMU · Online client form</div>
      <div style="font-size:24px;margin-top:6px;color:#fff">${esc(F.title)}</div>
    </div>
    <div style="background:#fff;padding:20px 24px;border:1px solid #eedcd3;border-top:0">
      ${F.sections[0].fields.some((f) => f.type === "yesno") ? `<p style="margin:0 0 14px;padding:10px 12px;border-radius:8px;font-size:14px;background:${yes ? "#fff1ec" : "#eef7ef"};color:${yes ? "#b4442c" : "#2d6a3a"}"><b>${yes ? `${yes} “Yes” answer${yes > 1 ? "s" : ""} — review highlighted rows` : "All answers “No”"}</b></p>` : ""}
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px">
        <tr><td style="padding:4px 0;color:#8c7279;width:150px">Client</td><td style="padding:4px 0"><b>${esc(contact.name)}</b></td></tr>
        <tr><td style="padding:4px 0;color:#8c7279">Email</td><td style="padding:4px 0"><a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></td></tr>
        <tr><td style="padding:4px 0;color:#8c7279">Phone</td><td style="padding:4px 0">${esc(contact.phone)}</td></tr>
        <tr><td style="padding:4px 0;color:#8c7279">Appointment</td><td style="padding:4px 0">${esc(contact.appt || "Not provided")}</td></tr>
      </table>
      ${F.intro ? `<p style="font-size:13px;color:#8c7279;margin:0 0 10px">${esc(F.intro)}</p>` : ""}
      <table style="width:100%;border-collapse:collapse">${tr}</table>
      ${F.confirm ? `<p style="font-size:14px;margin:16px 0 0">✓ ${esc(F.confirm)}</p>` : ""}
      <p style="font-size:13px;color:#8c7279;margin:18px 0 6px">Client signature (also attached):</p>
      <img src="cid:signature" alt="Client signature" style="max-width:360px;width:100%;border:1px solid #eedcd3;border-radius:8px;background:#fff">
    </div>
    <div style="background:#f3dfd3;padding:14px 24px;border-radius:0 0 14px 14px;font-size:12px;color:#523441">
      Signed electronically ${esc(meta.when)} (Pacific) · Confirmation # ${esc(meta.ref)}<br>IP ${esc(meta.ip)} · ${esc(meta.ua)}
    </div>
  </div></body></html>`;
  const subject = `${F.title} — ${contact.name}${F.sections[0].fields.some((f) => f.type === "yesno") ? (yes ? ` (${yes} Yes)` : " (all No)") : ""}`;
  const text = [`${F.title} — ${contact.name}`, `Email: ${contact.email}`, `Phone: ${contact.phone}`, `Appointment: ${contact.appt || "Not provided"}`, "",
    ...rows.map((r) => `${r.label}\n  → ${r.value}${r.explain ? `\n  Explanation: ${r.explain}` : ""}`), "",
    `Signed electronically ${meta.when} (Pacific) · Confirmation # ${meta.ref}`].join("\n");
  return { subject, html, text };
}

async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ ok: false, error: "Method not allowed." }); }
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = null; } }
  if (body && body.website) return res.status(200).json({ ok: true, ref: "RR-OK" }); // honeypot: quietly drop bots

  const v = validate(body);
  if (v.error) return res.status(400).json({ ok: false, error: v.error });

  const { RESEND_API_KEY, FORMS_TO_EMAIL, FORMS_FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !FORMS_TO_EMAIL)
    return res.status(503).json({ ok: false, error: "Online forms are not connected yet." });

  const now = new Date();
  const meta = {
    ref: "RR-" + now.toISOString().slice(2, 10).replace(/-/g, "") + "-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
    when: now.toLocaleString("en-US", { timeZone: "America/Los_Angeles", dateStyle: "medium", timeStyle: "short" }),
    ip: String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown",
    ua: clip(req.headers["user-agent"], 180),
  };
  const mail = buildEmail(v, meta);
  const safeName = v.contact.name.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "") || "client";
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FORMS_FROM_EMAIL || "Ravaged Rose Forms <onboarding@resend.dev>",
        to: FORMS_TO_EMAIL.split(",").map((s) => s.trim()).filter(Boolean),
        reply_to: v.contact.email,
        subject: mail.subject, html: mail.html, text: mail.text,
        attachments: [{
          filename: `signature-${safeName}.png`, content: v.sig.split(",")[1],
          content_type: "image/png", content_id: "signature",
        }],
      }),
    });
    if (!r.ok) { console.error("Resend error", r.status, await r.text()); throw new Error("send failed"); }
  } catch (e) {
    return res.status(502).json({ ok: false, error: "We couldn't send your form right now." });
  }
  return res.status(200).json({ ok: true, ref: meta.ref });
}

module.exports = handler;
module.exports._test = { validate, buildEmail };
