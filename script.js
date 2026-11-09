// Svevende UX-ikoner i toppen, framdriftsmåler og inn-animasjoner.
(() => {
  const roligBevegelse = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Svevende ikoner ---------- */
  const lerret = document.getElementById("partikler");
  const ctx = lerret.getContext("2d");
  const farger = ["#c9a6ff", "#a66bff", "#e9ddff", "#8a3ffc"];

  // Enkle strekikoner tegnet på et 24 × 24-rutenett.
  const ikoner = {
    mobilapp:   "M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z M10 18.5h4 M8 6h8 M8 9.5h8 M8 13h5",
    wireframe:  "M3 4h18v16H3z M3 8h18 M5.5 6h.01 M6 11h5v6H6z M13.5 11h5 M13.5 14h5 M13.5 17h3",
    skisse:     "M4 20l4-1 11-11-3-3L5 16l-1 4z M14 6l3 3",
    klikk:      "M5 3l6 16 2.5-6.5L20 10z",
    postit:     "M4 4h16v11l-5 5H4z M15 20v-5h5 M7 8.5h9 M7 11.5h6",
    bruker:     "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4.2 3.6-6.5 8-6.5s8 2.3 8 6.5",
    test:       "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13z M15.5 15.5L21 21 M7.5 10.5l2 2 3.5-4",
    brukerflyt: "M5 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M19 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M5 7v3a3 3 0 0 0 3 3h8a3 3 0 0 1 3 3v1",
    tilbakemelding: "M4 5h16v11H10l-4.5 4V16H4z M8 9h8 M8 12h5",
    oye:        "M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12z M12 14.8a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6z",
    vurdering:  "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17 6.6 19.9l1-6.1L3.2 9.5l6.1-.9z",
    komponent:  "M12 2.5l4 4-4 4-4-4z M17.5 8l4 4-4 4-4-4z M12 13.5l4 4-4 4-4-4z M6.5 8l4 4-4 4-4-4z",
    hake:       "M4.5 12.5l4.5 4.5L19.5 6.5",
  };
  const stier = Object.values(ikoner).map((d) => new Path2D(d));

  let b, h, dpr, partikler = [];
  const mus = { x: -9999, y: -9999 };

  function lagPartikkel(tilfeldigY = true) {
    const dybde = Math.random(); // 0 = langt unna, 1 = nær
    const erIkon = Math.random() < 0.6;
    return {
      x: Math.random() * b,
      y: tilfeldigY ? Math.random() * h : h + 40,
      st: erIkon ? 22 + dybde * 30 : 2 + dybde * 4,
      vx: (0.1 + Math.random() * 0.25) * (Math.random() < 0.5 ? -1 : 1),
      vy: -(0.1 + dybde * 0.35),
      vinkel: (Math.random() - 0.5) * 0.6,
      spinn: (Math.random() - 0.5) * 0.004,
      fase: Math.random() * Math.PI * 2,
      farge: farger[(Math.random() * farger.length) | 0],
      alfa: erIkon ? 0.22 + dybde * 0.55 : 0.25 + dybde * 0.5,
      sti: erIkon ? stier[(Math.random() * stier.length) | 0] : null,
      dx: 0, dy: 0,
    };
  }

  function tilpass() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    b = lerret.clientWidth; h = lerret.clientHeight;
    lerret.width = b * dpr; lerret.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const antall = Math.round(Math.min(60, (b * h) / 22000));
    partikler = Array.from({ length: antall }, () => lagPartikkel());
  }

  function tegn(p) {
    ctx.save();
    ctx.translate(p.x + p.dx, p.y + p.dy);
    ctx.rotate(p.vinkel);
    ctx.globalAlpha = p.alfa;
    ctx.fillStyle = ctx.strokeStyle = p.farge;
    if (p.sti) {
      const skala = p.st / 24;
      ctx.scale(skala, skala);
      ctx.translate(-12, -12);
      ctx.lineWidth = 1.6 / skala * (p.st > 28 ? 1.15 : 1);
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.stroke(p.sti);
    } else {
      ctx.beginPath(); ctx.arc(0, 0, p.st * 0.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function steg(t) {
    ctx.clearRect(0, 0, b, h);
    for (const p of partikler) {
      if (!roligBevegelse) {
        p.x += p.vx + Math.sin(t / 1600 + p.fase) * 0.25;
        p.y += p.vy;
        p.vinkel += p.spinn;
        // dytt unna musepekeren
        const ax = p.x - mus.x, ay = p.y - mus.y, avst = Math.hypot(ax, ay);
        const maal = avst < 130 ? (130 - avst) / 130 : 0;
        p.dx += ((ax / (avst || 1)) * maal * 40 - p.dx) * 0.08;
        p.dy += ((ay / (avst || 1)) * maal * 40 - p.dy) * 0.08;
        if (p.y < -50 || p.x < -50 || p.x > b + 50) Object.assign(p, lagPartikkel(false));
      }
      tegn(p);
    }
    if (!roligBevegelse) requestAnimationFrame(steg);
  }

  addEventListener("resize", tilpass);
  lerret.parentElement.addEventListener("pointermove", (e) => {
    const r = lerret.getBoundingClientRect();
    mus.x = e.clientX - r.left; mus.y = e.clientY - r.top;
  });
  lerret.parentElement.addEventListener("pointerleave", () => { mus.x = mus.y = -9999; });
  tilpass();
  requestAnimationFrame(steg);

  /* ---------- Topp og framdriftsmåler ---------- */
  const topp = document.querySelector(".topp");
  const tall = document.querySelector(".framdrift-tall");
  const prikk = document.querySelector(".framdrift-prikk");
  function vedRulling() {
    const maks = document.documentElement.scrollHeight - innerHeight;
    const andel = maks > 0 ? Math.min(1, scrollY / maks) : 0;
    tall.textContent = String(Math.round(andel * 100)).padStart(2, "0") + " %";
    prikk.style.top = andel * 100 + "%";
    const helt = document.querySelector(".hero");
    const grense = helt.offsetHeight - 70;
    topp.classList.toggle("rullet", scrollY > grense);
    document.querySelector(".framdrift").classList.toggle("paa-mork", scrollY < helt.offsetHeight - innerHeight / 2);
  }
  addEventListener("scroll", vedRulling, { passive: true });
  vedRulling();

  /* ---------- Inn-animasjoner ---------- */
  const elementer = document.querySelectorAll(".case, .case-bred, .kort, .seksjon-tittel, .om-tekst, .tidslinje li, .nokkeltall, .kompetanse-kort, .kontakt");
  if ("IntersectionObserver" in window && !roligBevegelse) {
    const obs = new IntersectionObserver((oppf) => {
      oppf.forEach((o) => { if (o.isIntersecting) { o.target.classList.add("synlig"); obs.unobserve(o.target); } });
    }, { threshold: 0.12 });
    elementer.forEach((el) => { el.classList.add("vis"); obs.observe(el); });
  }
})();
