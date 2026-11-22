/* Ravaged Rose PMU — online form filler (form.html?f=<form-id>) */
(function () {
  const FORMS = window.RR_FORMS || {};
  const app = document.getElementById("form-app");
  if (!app) return;
  const id = new URLSearchParams(location.search).get("f");
  const F = FORMS[id];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  if (!F) {
    app.innerHTML = `<div class="ff-card ff-center"><h2>Choose a form</h2><p>That form wasn't found.</p><a class="btn btn-dark" href="/forms">See all client forms</a></div>`;
    return;
  }
  document.title = `${F.title} | Client Forms | Ravaged Rose PMU`;
  document.querySelectorAll("[data-form-title]").forEach((el) => (el.textContent = F.title));
  document.querySelectorAll("[data-form-sub]").forEach((el) => (el.textContent = F.subtitle));
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/Los_Angeles" });

  const field = (f) => {
    if (f.type === "note")
      return `<div class="ff-note${f.alert ? " ff-alert" : ""}">${f.head ? `<b>${esc(f.head)}</b>` : ""}<p>${esc(f.text)}</p></div>`;
    if (f.type === "yesno")
      return `<fieldset class="ff-q" data-yn="${f.id}">
        <legend>${esc(f.label)}</legend>
        <div class="ff-yn">
          <label><input type="radio" name="${f.id}" value="Yes" required><span>Yes</span></label>
          <label><input type="radio" name="${f.id}" value="No" required><span>No</span></label>
        </div>
        <label class="ff-explain" hidden><span>If yes, explain</span><textarea name="${f.id}__explain" rows="2" maxlength="1500"></textarea></label>
      </fieldset>`;
    if (f.type === "radio")
      return `<fieldset class="ff-q"><legend>${esc(f.label)}</legend><div class="ff-opts">${f.options
        .map((o) => `<label class="ff-opt"><input type="radio" name="${f.id}" value="${o.v}" required><span>${esc(o.t)}</span></label>`).join("")}</div></fieldset>`;
    if (f.type === "checks")
      return `<fieldset class="ff-q" data-checks="${f.id}"><legend>${esc(f.label)} <small>(choose all that apply)</small></legend><div class="ff-pills">${f.options
        .map((o) => `<label><input type="checkbox" name="${f.id}" value="${o.v}"><span>${esc(o.t)}</span></label>`).join("")}</div></fieldset>`;
    if (f.type === "ack")
      return `<label class="ff-ack"><input type="checkbox" name="${f.id}" value="Agreed" ${f.required ? "required" : ""}><span class="ff-box"></span><span>${esc(f.label)}</span></label>`;
    return "";
  };

  app.innerHTML = `
  <form class="ff" id="ff" novalidate>
    <div class="ff-card">
      <div class="ff-head"><span class="ff-step">1</span><h2>Your information</h2></div>
      <div class="ff-grid">
        <label>Full legal name *<input name="name" autocomplete="name" required maxlength="120"></label>
        <label>Date<input value="${today}" disabled></label>
        <label>Email *<input type="email" name="email" autocomplete="email" required maxlength="160"></label>
        <label>Phone *<input type="tel" name="phone" autocomplete="tel" required maxlength="40"></label>
        <label>Appointment date <small>(if booked)</small><input type="date" name="appt"></label>
      </div>
    </div>
    ${F.sections.map((s, i) => `
    <div class="ff-card">
      <div class="ff-head"><span class="ff-step">${i + 2}</span><h2>${esc(s.title)}</h2></div>
      ${i === 0 ? `<p class="ff-intro">${esc(F.intro)}</p>` : ""}
      ${s.fields.map(field).join("")}
    </div>`).join("")}
    <div class="ff-card">
      <div class="ff-head"><span class="ff-step">${F.sections.length + 2}</span><h2>Sign &amp; submit</h2></div>
      ${F.confirm ? `<label class="ff-ack"><input type="checkbox" name="confirm" value="Agreed" required><span class="ff-box"></span><span>${esc(F.confirm)}</span></label>` : ""}
      <div class="ff-sign">
        <div class="ff-sign-top"><span>Client signature *</span><button type="button" class="ff-clear">Clear</button></div>
        <canvas id="sig" aria-label="Signature pad — draw your signature"></canvas>
        <p class="ff-sign-hint">Sign with your finger or mouse · ${today}</p>
      </div>
      <label class="ff-hp" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>
      <p class="ff-privacy">Your answers are sent securely to Ravaged Rose PMU and kept confidential as described in our <a href="/privacy" target="_blank" rel="noopener">Privacy Policy</a>.</p>
      <p class="ff-error" role="alert" hidden></p>
      <button class="btn btn-gold ff-submit" type="submit">Submit ${esc(F.title)} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
    </div>
  </form>`;

  const form = document.getElementById("ff");
  const clearMark = (e) => { const x = e.target.closest(".ff-invalid"); if (x) x.classList.remove("ff-invalid"); };
  form.addEventListener("input", clearMark); form.addEventListener("change", clearMark);

  /* Yes → show "If yes, explain" (required) */
  form.querySelectorAll("[data-yn]").forEach((fs) => {
    const ex = fs.querySelector(".ff-explain"), ta = ex.querySelector("textarea");
    fs.addEventListener("change", (e) => {
      if (e.target.type !== "radio") return;
      const yes = e.target.value === "Yes";
      ex.hidden = !yes; ta.required = yes; fs.classList.toggle("is-yes", yes); fs.classList.remove("ff-invalid");
      if (yes) ta.focus();
    });
  });

  /* Signature pad */
  const cv = document.getElementById("sig"), ctx = cv.getContext("2d");
  let drawing = false, signed = false, last = null;
  const size = () => {
    const r = cv.getBoundingClientRect(), d = window.devicePixelRatio || 1;
    const img = signed ? cv.toDataURL() : null;
    cv.width = r.width * d; cv.height = r.height * d; ctx.scale(d, d);
    ctx.lineWidth = 2.4; ctx.lineCap = ctx.lineJoin = "round"; ctx.strokeStyle = "#21141a";
    if (img) { const i = new Image(); i.onload = () => ctx.drawImage(i, 0, 0, r.width, r.height); i.src = img; }
  };
  size(); window.addEventListener("resize", size);
  const pt = (e) => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  cv.addEventListener("pointerdown", (e) => { drawing = true; last = pt(e); cv.setPointerCapture(e.pointerId); e.preventDefault(); });
  cv.addEventListener("pointermove", (e) => {
    if (!drawing) return; const p = pt(e);
    ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke(); last = p;
    if (!signed) { signed = true; cv.parentElement.classList.add("has-sig"); cv.parentElement.classList.remove("ff-invalid"); }
  });
  ["pointerup", "pointercancel", "pointerleave"].forEach((t) => cv.addEventListener(t, () => (drawing = false)));
  form.querySelector(".ff-clear").addEventListener("click", () => {
    ctx.clearRect(0, 0, cv.width, cv.height); signed = false; cv.parentElement.classList.remove("has-sig");
  });

  /* Validate + submit */
  const err = form.querySelector(".ff-error");
  const fail = (msg, el) => {
    err.textContent = msg; err.hidden = false;
    if (el) { el.classList.add("ff-invalid"); el.scrollIntoView({ behavior: "smooth", block: "center" }); }
  };
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    err.hidden = true;
    form.querySelectorAll(".ff-invalid").forEach((x) => x.classList.remove("ff-invalid"));
    for (const el of form.querySelectorAll("input[required],textarea[required]")) {
      if (el.type === "radio") {
        if (!form.querySelector(`input[name="${el.name}"]:checked`)) return fail("Please answer every question.", el.closest("fieldset"));
      } else if (el.type === "checkbox") {
        if (!el.checked) return fail("Please check each required statement.", el.closest("label"));
      } else if (!el.checkValidity()) {
        el.focus();
        return fail(el.name.endsWith("__explain") ? "Please explain each “Yes” answer." : "Please complete the highlighted field.", el.closest("label"));
      }
    }
    for (const fs of form.querySelectorAll("[data-checks]"))
      if (!fs.querySelector("input:checked")) return fail("Please choose your service.", fs);
    if (!signed) return fail("Please sign in the signature box.", cv.parentElement);

    const fd = new FormData(form), answers = {};
    F.sections.forEach((s) => s.fields.forEach((f) => {
      if (!f.id) return;
      if (f.type === "yesno") answers[f.id] = { answer: fd.get(f.id), explain: (fd.get(f.id + "__explain") || "").trim() };
      else if (f.type === "checks") answers[f.id] = fd.getAll(f.id);
      else answers[f.id] = fd.get(f.id);
    }));
    const payload = {
      form: F.id,
      contact: { name: fd.get("name").trim(), email: fd.get("email").trim(), phone: fd.get("phone").trim(), appt: fd.get("appt") || "" },
      answers, confirm: F.confirm ? fd.get("confirm") === "Agreed" : true,
      signature: cv.toDataURL("image/png"), website: fd.get("website") || "",
    };
    const btn = form.querySelector(".ff-submit");
    btn.disabled = true; btn.classList.add("is-sending"); btn.firstChild.textContent = "Sending… ";
    try {
      const r = await fetch("/api/submit-form", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.error || "Something went wrong.");
      app.innerHTML = `<div class="ff-card ff-done">
        <div class="ff-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
        <h2>Thank you, ${esc(payload.contact.name.split(" ")[0])}!</h2>
        <p>Your <b>${esc(F.title)}</b> was submitted to Ravaged Rose PMU. Destiny will review it before your appointment.</p>
        <p class="ff-ref">Confirmation # ${esc(j.ref)}</p>
        <div class="hero-ctas" style="justify-content:center"><a class="btn btn-dark" href="/forms">Back to client forms</a><a class="btn btn-outline" href="/book">Book an appointment</a></div>
      </div>`;
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (x) {
      btn.disabled = false; btn.classList.remove("is-sending"); btn.firstChild.textContent = `Submit ${F.title} `;
      fail(`${x.message} Please try again, or call or text (775) 342-4443.`);
    }
  });
})();
