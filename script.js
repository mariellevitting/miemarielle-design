// Svevende UX-ikoner i toppen, framdriftsmåler og inn-animasjoner.
(() => {
  const roligBevegelse = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Svevende ikoner ---------- */
  const lerret = document.getElementById("partikler");
  const ctx = lerret.getContext("2d");
  const farger = ["#c9a6ff", "#a66bff", "#e9ddff", "#8a3ffc"];

  // Enkle strekikoner tegnet på et 24 × 24-rutenett.
  const mobil = "M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z M10 19h4";
  const ikoner = {
    mobilapp:     mobil + " M8 6h8 M8 9.5h8 M8 13h5",
    mobilWire:    mobil + " M8 5h8v5H8z M8 12h8 M8 14.5h5",
    mobilChat:    mobil + " M8.5 6h5v2.5h-5z M10.5 10.5h5V13h-5z M8.5 15h4",
    nettbrett:    "M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z M11 18.5h2 M7 5h10v6H7z M7 13h10",
    laptop:       "M5 5h14a1 1 0 0 1 1 1v9H4V6a1 1 0 0 1 1-1z M2 18h20l-1.5 2h-17z M7 8h6 M7 11h10",
    skjerm:       "M3 4h18v12H3z M8 20h8 M12 16v4 M6 7h5v6H6z M13 7h5 M13 10h5",
    wireframe:    "M3 4h18v16H3z M3 8h18 M6 11h5v6H6z M13.5 11h5 M13.5 14h5 M13.5 17h3",
    bruker:       "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4.2 3.6-6.5 8-6.5s8 2.3 8 6.5",
    brukere:      "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z M2.5 20c0-3.6 3-5.5 6.5-5.5s6.5 1.9 6.5 5.5 M16 4.5a3.2 3.2 0 0 1 0 6.3 M18 14.8c2.2.6 3.5 2.3 3.5 5.2",
    persona:      "M3 5h18v14H3z M9 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M5.5 16c.4-1.8 1.8-2.8 3.5-2.8s3.1 1 3.5 2.8 M14 9h5 M14 12h5 M14 15h3",
    skisse:       "M4 20l4-1 11-11-3-3L5 16l-1 4z M14 6l3 3",
    postit:       "M4 4h16v11l-5 5H4z M15 20v-5h5 M7 8.5h9 M7 11.5h6",
    klikk:        "M5 3l6 16 2.5-6.5L20 10z",
    trykk:        "M9 11V5a1.5 1.5 0 0 1 3 0v5 M12 10V8.5a1.5 1.5 0 0 1 3 0V11 M15 10.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1a6 6 0 0 1-4.6-2.2L4 15.5a1.5 1.5 0 0 1 2.3-1.9L9 16",
    test:         "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13z M15.5 15.5L21 21 M7.5 10.5l2 2 3.5-4",
    brukerflyt:   "M5 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M19 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M5 7v3a3 3 0 0 0 3 3h8a3 3 0 0 1 3 3v1",
    tilbakemelding: "M4 5h16v11H10l-4.5 4V16H4z M8 9h8 M8 12h5",
    vurdering:    "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17 6.6 19.9l1-6.1L3.2 9.5l6.1-.9z",
    bryter:       "M8 8h8a4 4 0 0 1 0 8H8a4 4 0 0 1 0-8z M16 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
    komponent:    "M12 2.5l4 4-4 4-4-4z M17.5 8l4 4-4 4-4-4z M12 13.5l4 4-4 4-4-4z M6.5 8l4 4-4 4-4-4z",
  };
  // Mobiler, brukere og PC-er dukker oftere opp enn resten.
  const vekter = { mobilapp: 3, mobilWire: 3, mobilChat: 2, bruker: 3, brukere: 3, laptop: 2, skjerm: 2, nettbrett: 2 };
  const stier = Object.entries(ikoner).flatMap(([navn, d]) => Array(vekter[navn] || 1).fill(new Path2D(d)));

  let b, h, dpr, partikler = [];
  const mus = { x: -9999, y: -9999 };

  function lagPartikkel(tilfeldigY = true) {
    const dybde = Math.random(); // 0 = langt unna, 1 = nær
    return {
      x: Math.random() * b,
      y: tilfeldigY ? Math.random() * h : h + 40,
      st: 22 + dybde * 30,
      vx: (0.1 + Math.random() * 0.25) * (Math.random() < 0.5 ? -1 : 1),
      vy: -(0.1 + dybde * 0.35),
      vinkel: (Math.random() - 0.5) * 0.6,
      spinn: (Math.random() - 0.5) * 0.004,
      fase: Math.random() * Math.PI * 2,
      farge: farger[(Math.random() * farger.length) | 0],
      alfa: 0.2 + dybde * 0.5,
      sti: stier[(Math.random() * stier.length) | 0],
      dx: 0, dy: 0,
    };
  }

  function tilpass() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    b = lerret.clientWidth; h = lerret.clientHeight;
    lerret.width = b * dpr; lerret.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const antall = Math.round(Math.min(45, (b * h) / 26000));
    partikler = Array.from({ length: antall }, () => lagPartikkel());
  }

  function tegn(p) {
    ctx.save();
    ctx.translate(p.x + p.dx, p.y + p.dy);
    ctx.rotate(p.vinkel);
    ctx.globalAlpha = p.alfa;
    ctx.fillStyle = ctx.strokeStyle = p.farge;
    const skala = p.st / 24;
    ctx.scale(skala, skala);
    ctx.translate(-12, -12);
    ctx.lineWidth = 1.6 / skala * (p.st > 28 ? 1.15 : 1);
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.stroke(p.sti);
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
  const elementer = document.querySelectorAll(".case, .case-bred:not(.di-case), .di-intro, .di-del, .kort, .seksjon-tittel, .om-kolonne, .tidslinje li, .nokkeltall, .kompetanse-kort, .kontakt");
  if ("IntersectionObserver" in window && !roligBevegelse) {
    const obs = new IntersectionObserver((oppf) => {
      oppf.forEach((o) => { if (o.isIntersecting) { o.target.classList.add("synlig"); obs.unobserve(o.target); } });
    }, { threshold: 0.12 });
    elementer.forEach((el) => { el.classList.add("vis"); obs.observe(el); });
  }
})();
