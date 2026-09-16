(function () {
  const hero = document.getElementById("hero");
  const world = document.getElementById("world");
  const media = world && world.querySelector(".media");
  const portal = document.getElementById("portal");
  const cL = document.getElementById("cL");
  const cR = document.getElementById("cR");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scrollDriven =
    !reduceMotion &&
    typeof CSS !== "undefined" &&
    CSS.supports &&
    (CSS.supports("animation-timeline: scroll()") ||
      CSS.supports("animation-timeline", "scroll()"));

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(function () {});
  }

  const form = document.getElementById("consult");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      form.style.display = "none";
      const ok = document.getElementById("success");
      if (ok) ok.style.display = "block";
    });
  }

  if (!hero || reduceMotion) return;

  if (scrollDriven) hero.classList.add("is-scroll-driven");

  let rx = 0;
  let ry = 0;
  let tx = 0;
  let ty = 0;
  let progress = 0;
  let range = 1;
  let ticking = false;
  let lastWorld = "";
  let lastMedia = "";
  let lastPortal = "";
  let lastL = "";
  let lastR = "";

  function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
  }

  function measure() {
    const vh = window.innerHeight || 1;
    range = Math.max(1, hero.offsetHeight - vh);
  }

  function readProgress() {
    const y = window.scrollY || window.pageYOffset || 0;
    return clamp(y / range, 0, 1);
  }

  function setTransform(node, next, prevKey) {
    if (!node || next === prevKey) return next;
    node.style.transform = next;
    return next;
  }

  function apply() {
    ticking = false;
    rx += (tx - rx) * 0.07;
    ry += (ty - ry) * 0.07;

    const mx = rx * 6;
    const my = ry * 6;
    lastWorld = setTransform(
      world,
      "translate3d(" + mx.toFixed(2) + "px," + my.toFixed(2) + "px,0)",
      lastWorld
    );
    lastPortal = setTransform(
      portal,
      "translate3d(" + (rx * 7).toFixed(2) + "px," + (ry * 7).toFixed(2) + "px,0)",
      lastPortal
    );

    if (scrollDriven) {
      lastL = setTransform(cL, "translate3d(" + (rx * 14).toFixed(2) + "px,0,0)", lastL);
      lastR = setTransform(cR, "translate3d(" + (rx * 14).toFixed(2) + "px,0,0)", lastR);
    } else {
      const scale = 0.84746 + 0.15254 * progress;
      lastMedia = setTransform(
        media,
        "scale3d(" + scale + "," + scale + ",1)",
        lastMedia
      );
      lastL = setTransform(
        cL,
        "translate3d(" + (-progress * 40 + rx * 14).toFixed(2) + "px,0,0)",
        lastL
      );
      lastR = setTransform(
        cR,
        "translate3d(" + (progress * 40 + rx * 14).toFixed(2) + "px,0,0)",
        lastR
      );
    }

    if (Math.abs(tx - rx) > 0.001 || Math.abs(ty - ry) > 0.001) schedule();
  }

  function schedule() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(apply);
  }

  function onScroll() {
    if (scrollDriven) return;
    const next = readProgress();
    if (next === progress) return;
    progress = next;
    schedule();
  }

  function onResize() {
    measure();
    if (!scrollDriven) progress = readProgress();
    schedule();
  }

  measure();
  progress = readProgress();

  window.addEventListener("scroll", onScroll, { passive: true, capture: true });
  window.addEventListener(
    "mousemove",
    function (e) {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      tx = (e.clientX / w) * 2 - 1;
      ty = (e.clientY / h) * 2 - 1;
      schedule();
    },
    { passive: true }
  );
  window.addEventListener("resize", onResize, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", onResize, { passive: true });
  }

  schedule();
})();
