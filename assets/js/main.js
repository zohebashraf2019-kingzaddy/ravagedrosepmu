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
  document.querySelectorAll("[data-book-frame]").forEach((f) => { f.src = C.BOOKING_URL; });

  /* Year */
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* Header shadow + mobile menu */
  const header = document.querySelector(".site-header");
  const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 10);
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
})();
