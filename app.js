(function () {
  const world = document.getElementById("world");
  const portal = document.getElementById("portal");
  const cL = document.getElementById("cL");
  const cR = document.getElementById("cR");
  let rx = 0, ry = 0, tx = 0, ty = 0;
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  window.addEventListener("mousemove", (e) => {
    tx = (e.clientX / window.innerWidth) * 2 - 1;
    ty = (e.clientY / window.innerHeight) * 2 - 1;
  });
  function tick() {
    rx = lerp(rx, tx, 0.07);
    ry = lerp(ry, ty, 0.07);
    const hero = document.getElementById("hero");
    let p = 0;
    if (hero) {
      const max = Math.max(1, hero.offsetHeight - window.innerHeight);
      p = clamp(window.scrollY / max, 0, 1);
    }
    const scale = lerp(1, 1.18, p);
    if (world) world.style.transform = `scale(${scale}) translate3d(${rx * 6}px, ${ry * 6}px, 0)`;
    if (portal) portal.style.transform = `translate3d(${rx * 7}px, ${ry * 7}px, 0)`;
    if (cL) cL.style.transform = `translate3d(${-p * 40 + rx * 14}px,0,0)`;
    if (cR) cR.style.transform = `translate3d(${p * 40 + rx * 14}px,0,0)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }
  const form = document.getElementById("consult");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      form.style.display = "none";
      const ok = document.getElementById("success");
      if (ok) ok.style.display = "block";
    });
  }
})();
