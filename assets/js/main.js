(function () {
  const C = window.RRB || {};

  /* Wire every link that carries a data-link key to the central config */
  document.querySelectorAll("[data-link]").forEach((el) => {
    const url = C[el.dataset.link];
    if (!url) return;
    el.setAttribute("href", url);
    if (/^https?:/.test(url)) { el.target = "_blank"; el.rel = "noopener"; }
  });
  document.querySelectorAll("[data-phone]").forEach((el) => {
    el.href = "tel:" + C.PHONE_RAW; if (!el.children.length && !el.textContent.trim()) el.textContent = C.PHONE;
  });
  /* Booking: the calendar and booking links stay locked until the client
     checks the Terms & Booking Policies acknowledgment box. */
  const ack = document.querySelector("#booking-ack");
  const frames = document.querySelectorAll("[data-book-frame]");
  if (!ack) frames.forEach((f) => { f.src = C.BOOKING_URL; });
  else {
    const box = document.querySelector("#ack-box");
    const setAck = () => {
      document.body.classList.toggle("ack-ok", ack.checked);
      if (ack.checked) frames.forEach((f) => { if (!f.getAttribute("src")) f.src = C.BOOKING_URL; });
    };
    ack.checked = false; setAck();
    ack.addEventListener("change", setAck);
    document.querySelectorAll("[data-gate]").forEach((a) => a.addEventListener("click", (e) => {
      if (ack.checked) return;
      e.preventDefault();
      box.scrollIntoView({ behavior: "smooth", block: "center" });
      box.classList.remove("nudge"); void box.offsetWidth; box.classList.add("nudge");
      setTimeout(() => ack.focus({ preventScroll: true }), 400);
    }));
  }

  /* Year */
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* Header shadow + mobile menu */
  const header = document.querySelector(".site-header");
  const floatBtn = document.querySelector(".float-book");
  const onScroll = () => {
    header && header.classList.toggle("scrolled", window.scrollY > 10);
    floatBtn && floatBtn.classList.toggle("show", window.scrollY > window.innerHeight * 0.7);
  };
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  const toggle = document.querySelector(".menu-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", open);
    });
    document.querySelectorAll(".nav-links a").forEach((a) =>
      a.addEventListener("click", () => document.body.classList.remove("menu-open"))
    );
  }

  /* Active nav item */
  const page = location.pathname.split("/").pop().replace(".html", "") || "index";
  document.querySelectorAll(".nav-links a[data-page]").forEach((a) => {
    if (a.dataset.page === page) a.classList.add("active");
  });

  /* Reveal on scroll */
  const io = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      }), { threshold: 0.12 })
    : null;
  document.querySelectorAll(".reveal").forEach((el) => (io ? io.observe(el) : el.classList.add("in")));

  /* Service filters */
  const filters = document.querySelectorAll(".filter");
  filters.forEach((btn) =>
    btn.addEventListener("click", () => {
      filters.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const cat = btn.dataset.filter;
      document.querySelectorAll(".svc-card[data-cat]").forEach((card) => {
        card.classList.toggle("hide", cat !== "all" && card.dataset.cat !== cat);
      });
    })
  );

  /* Reels: tap to play with sound, one at a time */
  const reels = document.querySelectorAll(".reel");
  reels.forEach((reel) => {
    const v = reel.querySelector("video");
    reel.addEventListener("click", () => {
      const playing = !v.paused;
      reels.forEach((r) => { const o = r.querySelector("video"); o.pause(); r.classList.remove("playing"); });
      if (!playing) { v.muted = false; v.play(); reel.classList.add("playing"); }
    });
    v.addEventListener("ended", () => reel.classList.remove("playing"));
  });

  /* Highlight today in hours list */
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", timeZone: "America/Los_Angeles" });
  document.querySelectorAll(".hours li").forEach((li) => {
    if (li.dataset.day === today) li.classList.add("today");
  });

  /* Contact form */
  const form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(form).entries());
      const ok = form.querySelector(".form-success");
      if (C.FORM_ENDPOINT) {
        try {
          const r = await fetch(C.FORM_ENDPOINT, { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) });
          if (!r.ok) throw new Error();
          form.reset(); ok.textContent = "Thank you! Your message was sent — Destiny will be in touch soon. 🌹"; ok.style.display = "block";
        } catch (err) {
          ok.textContent = "Something went wrong. Please call or text " + C.PHONE + "."; ok.style.display = "block";
        }
        return;
      }
      const body =
        `Hi Destiny! I'm ${d.name}.` +
        (d.service ? ` I'm interested in: ${d.service}.` : "") +
        (d.date ? ` Preferred date: ${d.date}.` : "") +
        (d.message ? ` ${d.message}` : "") +
        (d.email ? ` (Email: ${d.email})` : "");
      const sep = /iPhone|iPad|Mac/.test(navigator.userAgent) ? "&" : "?";
      window.location.href = `sms:${C.PHONE_RAW}${sep}body=${encodeURIComponent(body)}`;
      ok.textContent = "Opening your messages app… If nothing happens, text " + C.PHONE + " directly.";
      ok.style.display = "block";
    });
  }

  /* FAQ: search + jump chips open their group */
  const search = document.querySelector("#faq-search");
  if (search) {
    const groups = [...document.querySelectorAll(".faq-group")];
    const empty = document.querySelector(".faq-empty");
    search.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      let hits = 0;
      groups.forEach((g) => {
        let gh = 0;
        g.querySelectorAll(".faq-q").forEach((d) => {
          const m = !q || d.textContent.toLowerCase().includes(q);
          d.hidden = !m; if (m) gh++;
          d.open = !!q && m && q.length > 2 && gh <= 3;
        });
        g.hidden = gh === 0; g.open = !!q && gh > 0; hits += gh;
      });
      empty.hidden = hits > 0;
    });
  }
  document.querySelectorAll(".faq-chips a").forEach((a) => a.addEventListener("click", () => {
    const g = document.querySelector(a.getAttribute("href"));
    if (g) g.open = true;
  }));
  if (location.hash) { const g = document.querySelector(location.hash + ".faq-group"); if (g) g.open = true; }
})();
