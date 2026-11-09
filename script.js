// Svevende lilla partikler i toppen, framdriftsmåler og inn-animasjoner.
(() => {
  const roligBevegelse = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Partikler ---------- */
  const lerret = document.getElementById("partikler");
  const ctx = lerret.getContext("2d");
  const farger = ["#8a3ffc", "#a66bff", "#c9a6ff", "#6a1fd8"];
  let b, h, dpr, partikler = [];
  const mus = { x: -9999, y: -9999 };

  function lagPartikkel(tilfeldigY = true) {
    const dybde = Math.random(); // 0 = langt unna, 1 = nær
    return {
      x: Math.random() * b,
      y: tilfeldigY ? Math.random() * h : h + 20,
      st: 3 + dybde * 7,                       // størrelse
      vx: (0.15 + Math.random() * 0.35) * (Math.random() < 0.5 ? -1 : 1),
      vy: -(0.12 + dybde * 0.45),
      vinkel: Math.random() * Math.PI * 2,
      spinn: (Math.random() - 0.5) * 0.02,
      fase: Math.random() * Math.PI * 2,
      farge: farger[(Math.random() * farger.length) | 0],
      alfa: 0.25 + dybde * 0.6,
      form: Math.random() < 0.55 ? "stjerne" : Math.random() < 0.5 ? "strek" : "prikk",
      dx: 0, dy: 0,
    };
  }

  function tilpass() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    b = lerret.clientWidth; h = lerret.clientHeight;
    lerret.width = b * dpr; lerret.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const antall = Math.round(Math.min(90, (b * h) / 14000));
    partikler = Array.from({ length: antall }, () => lagPartikkel());
  }

  function tegn(p) {
    ctx.save();
    ctx.translate(p.x + p.dx, p.y + p.dy);
    ctx.rotate(p.vinkel);
    ctx.globalAlpha = p.alfa;
    ctx.fillStyle = ctx.strokeStyle = p.farge;
    const s = p.st;
    if (p.form === "stjerne") {
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        ctx.lineTo(Math.cos(a) * s, Math.sin(a) * s);
        ctx.lineTo(Math.cos(a + Math.PI / 4) * s * 0.28, Math.sin(a + Math.PI / 4) * s * 0.28);
      }
      ctx.closePath(); ctx.fill();
    } else if (p.form === "strek") {
      ctx.lineWidth = Math.max(1, s * 0.28); ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(-s * 1.4, 0); ctx.quadraticCurveTo(0, -s * 0.6, s * 1.4, 0); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.arc(0, 0, s * 0.35, 0, Math.PI * 2); ctx.fill();
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
        if (p.y < -20 || p.x < -30 || p.x > b + 30) Object.assign(p, lagPartikkel(false));
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
    topp.classList.toggle("rullet", scrollY > 40);
  }
  addEventListener("scroll", vedRulling, { passive: true });
  vedRulling();

  /* ---------- Inn-animasjoner ---------- */
  const elementer = document.querySelectorAll(".case, .case-bred, .kort, .seksjon-tittel, .om-tekst, .kontakt");
  if ("IntersectionObserver" in window && !roligBevegelse) {
    const obs = new IntersectionObserver((oppf) => {
      oppf.forEach((o) => { if (o.isIntersecting) { o.target.classList.add("synlig"); obs.unobserve(o.target); } });
    }, { threshold: 0.12 });
    elementer.forEach((el) => { el.classList.add("vis"); obs.observe(el); });
  }
})();
