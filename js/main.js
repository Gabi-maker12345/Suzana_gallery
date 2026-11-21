/* =========================================================
   Suzana Galery — interações
   Carrossel, pétalas, filtros, visualizador e detalhes.
   ========================================================= */

(() => {
  "use strict";

  document.documentElement.classList.add("js");

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const EASE = "cubic-bezier(.16,1,.3,1)";

  const SLIDES = [
    {
      title: "Hu Tao",
      desc: "Ela é a 77ª diretora da Funerária Wangsheng. Estuda poemas antigos, coleciona borboletas e encara a morte com uma piada pronta.",
      art: "assets/img/arte-1.jpg",
      alt: "Hu Tao de chapéu, com a mão no rosto, entre borboletas claras.",
      orb: "#fbd0d8",
    },
    {
      title: "Hu Tao ri",
      desc: "Rindo de olhos fechados, o chapéu de ameixa inclinado e um fantasma que ri junto. A cena mais barulhenta da coleção.",
      art: "assets/img/arte-2.jpg",
      alt: "Hu Tao rindo de olhos fechados sobre fundo vermelho, com um fantasma ao lado.",
      orb: "#f7c2c9",
    },
    {
      title: "Hu Tao de óculos",
      desc: "Óculos redondos, flor de ameixa no cabelo e um sorriso de canto. Um close de verão sobre listras cor-de-rosa.",
      art: "assets/img/arte-3.jpg",
      alt: "Close de Hu Tao de óculos redondos e flor de ameixa no cabelo.",
      orb: "#fbd3dc",
    },
  ];

  const WORKS = [
    { title: "Flor de ameixa", note: "Retrato · fundo lavanda", img: "assets/img/arte-1.jpg", frame: "#eee2e8", alt: "Hu Tao de chapéu, entre borboletas claras." },
    { title: "Rindo em vermelho", note: "Cena · fundo carmim", img: "assets/img/arte-2.jpg", frame: "#f2dcdb", alt: "Hu Tao rindo sobre fundo vermelho, com um fantasma ao lado." },
    { title: "Close de sakura", note: "Close · listras rosas", img: "assets/img/arte-3.jpg", frame: "#f6e1e3", alt: "Close de Hu Tao de óculos redondos e flor de ameixa." },
  ];

  const hero = $("#hero");
  const titleEl = $("#heroTitle");
  const descEl = $("#heroDesc");
  const artA = $("#artA");
  const artB = $("#artB");
  const live = $("#live");
  const bars = $$(".bar", $("#heroBars"));
  const viewer = $("#viewer");
  const viewerImg = $("#viewerImg");
  const viewerTitle = $("#viewerTitle");
  const viewerNote = $("#viewerNote");
  const viewerFrame = $(".viewer__frame");
  const toastEl = $("#toast");
  const toastText = $("#toastText");

  let index = 0;
  let frontEl = artA;
  let busy = false;
  let autoTimer = 0;
  let hoverPaused = false;
  let autoPaused = reduceMotion.matches;
  let viewerIndex = 0;
  const preloaded = SLIDES.map((s) => {
    const img = new Image();
    img.src = s.art;
    return img;
  });

  /* ---------- tipografia animada ---------- */

  function splitTitle(text) {
    titleEl.textContent = "";
    titleEl.setAttribute("aria-label", text);
    const frag = document.createDocumentFragment();
    [...text].forEach((ch) => {
      const span = document.createElement("span");
      span.className = "ch" + (ch === " " ? " ch--space" : "");
      span.textContent = ch;
      span.setAttribute("aria-hidden", "true");
      frag.append(span);
    });
    titleEl.append(frag);
    return [...titleEl.children];
  }

  function animateTitle(text, { immediate = false } = {}) {
    const chars = splitTitle(text);
    if (reduceMotion.matches || immediate) return;
    chars.forEach((ch, i) => {
      ch.animate(
        [
          { opacity: 0, transform: "translateY(38%) rotate(6deg)", filter: "blur(6px)" },
          { opacity: 1, transform: "none", filter: "none" },
        ],
        {
          duration: 720,
          delay: 34 * i,
          easing: EASE,
          fill: "both",
        }
      );
    });
  }

  function animateDesc(text) {
    if (reduceMotion.matches) {
      descEl.textContent = text;
      return;
    }
    descEl.animate(
      [
        { opacity: 1, transform: "none" },
        { opacity: 0, transform: "translateY(-6px)" },
      ],
      { duration: 170, easing: "ease-in", fill: "forwards" }
    ).finished.then(() => {
      descEl.textContent = text;
      descEl.animate(
        [
          { opacity: 0, transform: "translateY(8px)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 480, easing: EASE, fill: "both" }
      );
    }).catch(() => {
      descEl.textContent = text;
      descEl.style.opacity = "";
    });
  }

  /* ---------- carrossel ---------- */

  function go(next, { user = true } = {}) {
    if (next === index || busy) return;
    const target = (next + SLIDES.length) % SLIDES.length;
    const slide = SLIDES[target];
    busy = true;

    const nextEl = frontEl === artA ? artB : artA;
    nextEl.src = slide.art;
    nextEl.alt = "";
    nextEl.classList.add("is-front");
    frontEl.classList.remove("is-front");
    frontEl = nextEl;

    hero.style.setProperty("--orb-big", slide.orb);
    animateTitle(slide.title);
    animateDesc(slide.desc);

    bars.forEach((bar, i) => {
      const active = i === target;
      bar.classList.toggle("is-active", active);
      bar.setAttribute("aria-current", String(active));
      bar.tabIndex = active ? 0 : -1;
    });

    index = target;
    $("#openArt").setAttribute("aria-label", `Ver ${slide.title} inteira`);
    live.textContent = `Obra ${target + 1} de ${SLIDES.length}: ${slide.title}`;
    restartAuto();

    window.setTimeout(() => {
      busy = false;
    }, reduceMotion.matches ? 30 : 520);
  }

  function restartAuto() {
    window.clearTimeout(autoTimer);
    if (autoPaused || hoverPaused || document.hidden) return;
    if (document.querySelector("dialog[open]")) return;
    autoTimer = window.setTimeout(() => {
      if (document.querySelector("dialog[open]")) return;
      go(index + 1, { user: false });
    }, 7800);
  }

  function setAutoPaused(paused, { resumeHover = false } = {}) {
    autoPaused = paused;
    if (resumeHover) hoverPaused = false;
    window.clearTimeout(autoTimer);
    const autoBtn = $("#autoToggle");
    autoBtn.classList.toggle("is-paused", paused);
    autoBtn.setAttribute("aria-label", paused ? "Reproduzir apresentação" : "Pausar apresentação");
    autoBtn.dataset.tip = paused ? "Reproduzir" : "Pausar";
    autoBtn.querySelector("use").setAttribute("href", paused ? "#i-play" : "#i-pause");
    if (!paused) restartAuto();
  }

  $("#autoToggle").addEventListener("click", () => {
    setAutoPaused(!autoPaused, { resumeHover: true });
  });

  /* ---------- pétalas ---------- */

  const canvas = $("#petals");
  const ctx = canvas ? canvas.getContext("2d") : null;
  const petalState = {
    w: 0,
    h: 0,
    dpr: 1,
    parts: [],
    bursts: [],
    raf: 0,
    visible: true,
    time: 0,
  };

  const rand = (a, b) => a + Math.random() * (b - a);

  function sizeCanvas() {
    if (!canvas || !hero) return;
    const rect = hero.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    petalState.w = rect.width;
    petalState.h = rect.height;
    petalState.dpr = dpr;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedPetals();
  }

  function makePetal(fromTop = false) {
    const tones = [
      "rgba(255,255,255," ,
      "rgba(255,230,235,",
      "rgba(255,199,211,",
    ];
    return {
      x: rand(-20, petalState.w + 20),
      y: fromTop ? rand(-80, -10) : rand(-petalState.h * 0.3, petalState.h),
      r: rand(2.2, 6.2),
      rot: rand(0, Math.PI * 2),
      spin: rand(-0.012, 0.012),
      vy: rand(0.12, 0.42),
      sway: rand(0.35, 1.1),
      phase: rand(0, Math.PI * 2),
      tone: tones[Math.floor(Math.random() * tones.length)],
      alpha: rand(0.24, 0.6),
    };
  }

  function seedPetals() {
    const count = petalState.w < 700 ? 14 : 22;
    petalState.parts = Array.from({ length: count }, () => makePetal());
  }

  function drawPetal(p) {
    const r = p.r;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.bezierCurveTo(r * 0.95, -r * 0.85, r, r * 0.2, 0, r);
    ctx.bezierCurveTo(-r, r * 0.2, -r * 0.95, -r * 0.85, 0, -r);
    ctx.fillStyle = p.tone + p.alpha + ")";
    ctx.fill();
  }

  function stepPetals(now) {
    if (!ctx) return;
    const dt = Math.min(now - (petalState.last || now), 40);
    petalState.last = now;
    petalState.time += dt;
    const t = petalState.time * 0.001;
    ctx.clearRect(0, 0, petalState.w, petalState.h);

    for (const p of petalState.parts) {
      p.y += p.vy * (dt / 16);
      p.rot += p.spin * (dt / 16);
      p.x += Math.sin(t * p.sway + p.phase) * 0.22;
      if (p.y > petalState.h + 20) Object.assign(p, makePetal(true));
      if (p.x < -30) p.x = petalState.w + 20;
      if (p.x > petalState.w + 30) p.x = -20;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot + Math.sin(t * 0.8 + p.phase) * 0.28);
      ctx.scale(1, Math.max(0.35, Math.abs(Math.cos(t * 0.9 + p.phase))));
      drawPetal(p);
      ctx.restore();
    }

    for (let i = petalState.bursts.length - 1; i >= 0; i--) {
      const b = petalState.bursts[i];
      b.life -= dt / 1100;
      if (b.life <= 0) {
        petalState.bursts.splice(i, 1);
        continue;
      }
      b.vy += 0.045 * (dt / 16);
      b.x += b.vx * (dt / 16);
      b.y += b.vy * (dt / 16);
      b.rot += b.spin * (dt / 16);
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);
      ctx.globalAlpha = Math.max(0, Math.min(1, b.life));
      drawPetal(b);
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    petalState.raf = requestAnimationFrame(stepPetals);
  }

  function startPetals() {
    if (!ctx || reduceMotion.matches || petalState.raf) return;
    petalState.last = performance.now();
    petalState.raf = requestAnimationFrame(stepPetals);
  }

  function stopPetals() {
    cancelAnimationFrame(petalState.raf);
    petalState.raf = 0;
  }

  function burstAt(clientX, clientY) {
    if (!ctx || reduceMotion.matches) return;
    const rect = hero.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    for (let i = 0; i < 16; i++) {
      const angle = rand(-Math.PI, 0);
      const speed = rand(1.2, 4.6);
      petalState.bursts.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: rand(2, 5.4),
        rot: rand(0, Math.PI * 2),
        spin: rand(-0.08, 0.08),
        life: rand(0.65, 1),
        tone: Math.random() < 0.5 ? "rgba(255,255,255," : "rgba(255,214,224,",
        alpha: 0.85,
      });
    }
    startPetals();
  }

  /* ---------- visualizador ---------- */

  function fitViewer() {
    if (!viewerImg.naturalWidth) return;
    const narrow = window.innerWidth <= 520;
    const pad = narrow ? 18 : 28;
    const frameH = viewerFrame.clientHeight || 560;
    const ratio = viewerImg.naturalWidth / viewerImg.naturalHeight;
    const desired = Math.round(frameH * ratio) + pad + 12;
    viewer.style.width = `${Math.min(window.innerWidth - (narrow ? 12 : 28), desired)}px`;
  }

  function renderViewer(i, animate = true) {
    viewerIndex = (i + WORKS.length) % WORKS.length;
    const work = WORKS[viewerIndex];
    viewerImg.src = work.img;
    viewerImg.alt = work.alt;
    viewerTitle.textContent = work.title;
    viewerNote.textContent = work.note;
    viewerFrame.style.setProperty("--frame", work.frame);
    if (viewerImg.complete) fitViewer();
    else viewerImg.addEventListener("load", fitViewer, { once: true });
    if (animate && !reduceMotion.matches) {
      viewerImg.animate(
        [
          { opacity: 0, transform: "scale(0.98)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 420, easing: EASE }
      );
    }
  }

  function openViewer(i) {
    if (!viewer) return;
    renderViewer(i);
    requestAnimationFrame(fitViewer);
    window.clearTimeout(autoTimer);
    if (typeof viewer.showModal === "function" && !viewer.open) {
      viewer.showModal();
    } else {
      viewer.setAttribute("open", "");
    }
  }

  function closeViewer() {
    if (!viewer.open) return;
    viewer.close();
  }

  viewer.addEventListener("click", (e) => {
    if (e.target === viewer) closeViewer();
  });
  viewer.addEventListener("close", () => {
    restartAuto();
  });
  $("#viewerClose").addEventListener("click", closeViewer);
  $("#viewerPrev").addEventListener("click", () => renderViewer(viewerIndex - 1));
  $("#viewerNext").addEventListener("click", () => renderViewer(viewerIndex + 1));

  /* ---------- avisos ---------- */

  let toastTimer = 0;
  function toast(message) {
    toastText.textContent = message;
    toastEl.classList.add("is-on");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("is-on"), 3600);
  }

  /* ---------- guardados ---------- */

  function closeKeep(keep) {
    keep.classList.add("is-leaving");
    window.setTimeout(() => {
      keep.hidden = true;
      keep.classList.remove("is-leaving");
      syncKeepsState();
      $("#restoreKeeps").focus({ preventScroll: true });
    }, reduceMotion.matches ? 0 : 380);
  }

  function syncKeepsState() {
    const all = $$(".keep");
    const hiddenCount = all.filter((k) => k.hidden).length;
    $("#keepsEmpty").hidden = hiddenCount === 0;
    $("#keeps").hidden = hiddenCount === all.length;
    $("#keepsEmptyText").textContent =
      hiddenCount === all.length
        ? "Nada recente por aqui."
        : hiddenCount === 1
          ? "1 recente oculto."
          : `${hiddenCount} recentes ocultos.`;
  }

  $$(".keep__close").forEach((btn) => {
    btn.addEventListener("click", () => closeKeep(btn.closest(".keep")));
  });

  $("#restoreKeeps").addEventListener("click", () => {
    $$(".keep").forEach((keep) => {
      keep.hidden = false;
      keep.classList.remove("is-leaving");
      if (!reduceMotion.matches) {
        keep.animate(
          [
            { opacity: 0, transform: "scale(0.9) translateY(6px)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: 460, easing: EASE }
        );
      }
    });
    syncKeepsState();
    toast("Recentes restaurados.");
    $$(".keep__close")[0]?.focus({ preventScroll: true });
  });

  /* ---------- filtros ---------- */

  const pills = $$(".pill");
  const works = $$(".work");
  const worksEmpty = $("#worksEmpty");

  function applyFilter(tag) {
    const first = new Map(
      works.map((el) => [el, el.classList.contains("is-hidden") ? null : el.getBoundingClientRect()])
    );

    works.forEach((el) => {
      const tags = (el.dataset.tags || "").split(/\s+/);
      const show = tag === "all" || tags.includes(tag);
      el.classList.toggle("is-hidden", !show);
    });

    const visibleCount = works.filter((el) => !el.classList.contains("is-hidden")).length;
    worksEmpty.hidden = visibleCount > 0;
    const status = $("#worksStatus");
    if (status) {
      status.textContent = visibleCount
        ? `${visibleCount} ${visibleCount === 1 ? "obra" : "obras"} na prateleira com este filtro.`
        : "Nenhuma obra com este filtro.";
    }

    pills.forEach((pill) => {
      const on = pill.dataset.filter === tag;
      pill.classList.toggle("is-active", on);
      pill.setAttribute("aria-pressed", String(on));
    });

    if (reduceMotion.matches) return;

    works.forEach((el) => {
      if (el.classList.contains("is-hidden")) return;
      const prev = first.get(el);
      const next = el.getBoundingClientRect();
      if (!prev || prev.width === 0) {
        el.animate(
          [
            { opacity: 0, transform: "translateY(10px)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: 460, easing: EASE }
        );
        return;
      }
      const dx = prev.left - next.left;
      const dy = prev.top - next.top;
      if (!dx && !dy) return;
      el.animate(
        [
          { transform: `translate(${dx}px, ${dy}px)` },
          { transform: "none" },
        ],
        { duration: 520, easing: EASE }
      );
    });
  }

  pills.forEach((pill) => {
    pill.addEventListener("click", () => applyFilter(pill.dataset.filter));
  });

  $("#clearFilter").addEventListener("click", () => applyFilter("all"));

  /* ---------- cenas ---------- */

  const scenes = $("#scenes");
  const more = $("#more");
  const expandScenes = $("#expandScenes");
  const extra = $("#extraScene");
  const sceneCards = $$(".scene", scenes);

  function setExpanded(open) {
    scenes.classList.toggle("is-expanded", open);
    extra.hidden = !open;
    more.setAttribute("aria-expanded", String(open));
    expandScenes.setAttribute("aria-expanded", String(open));
    expandScenes.setAttribute("aria-label", open ? "Recolher cenas" : "Expandir cenas");
    $(".more__label", more).textContent = open ? "Ver menos" : "Ver mais";
    const third = sceneCards[2];
    third.setAttribute("aria-hidden", String(!open));
    third.tabIndex = open ? 0 : -1;
  }

  more.addEventListener("click", () => setExpanded(more.getAttribute("aria-expanded") !== "true"));
  expandScenes.addEventListener("click", () => {
    const open = expandScenes.getAttribute("aria-expanded") !== "true";
    setExpanded(open);
  });
  setExpanded(false);

  /* ---------- abertura de obras ---------- */

  $$("[data-open]").forEach((el) => {
    el.addEventListener("click", () => openViewer(Number(el.dataset.open)));
  });

  $("#openArt").addEventListener("click", (e) => {
    burstAt(e.clientX || window.innerWidth * 0.75, e.clientY || window.innerHeight * 0.3);
    window.setTimeout(() => openViewer(index), reduceMotion.matches ? 0 : 170);
  });

  $$("[data-auth]").forEach((btn) => {
    btn.addEventListener("click", () => {
      toast(
        btn.dataset.auth === "signup"
          ? "As contas ainda não estão abertas nesta prévia."
          : "O acesso está desligado nesta prévia da galeria."
      );
    });
  });

  $(".chip--ink").addEventListener("click", () => {
    toast("Seu perfil aparece aqui quando as contas abrirem.");
  });

  /* ---------- navegação ---------- */

  $$("[data-nav]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      $$("[data-nav]").forEach((l) => {
        l.classList.toggle("is-current", l === link);
        if (l === link) l.setAttribute("aria-current", "page");
        else l.removeAttribute("aria-current");
      });
      if (link.dataset.nav === "inicio") {
        document.getElementById("stage").scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "center" });
      } else if (link.dataset.nav === "buscar") {
        document.getElementById("boards").scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
      } else {
        toast("Nenhum recado novo por aqui.");
      }
    });
  });

  /* ---------- paralaxe e brilho ---------- */

  let spotFrame = 0;
  let lastPointer = null;

  function paintPointer() {
    spotFrame = 0;
    if (!lastPointer) return;
    const { x, y, rect } = lastPointer;
    const nx = (x - rect.left) / rect.width;
    const ny = (y - rect.top) / rect.height;
    hero.style.setProperty("--px", (nx - 0.5).toFixed(3));
    hero.style.setProperty("--py", (ny - 0.5).toFixed(3));
    hero.style.setProperty("--spot-x", `${(nx * 100).toFixed(2)}%`);
    hero.style.setProperty("--spot-y", `${(ny * 100).toFixed(2)}%`);
  }

  hero.addEventListener("pointermove", (e) => {
    if (reduceMotion.matches || !finePointer.matches) return;
    lastPointer = { x: e.clientX, y: e.clientY, rect: hero.getBoundingClientRect() };
    if (!spotFrame) spotFrame = requestAnimationFrame(paintPointer);
  });

  hero.addEventListener("pointerleave", () => {
    hero.style.setProperty("--px", "0");
    hero.style.setProperty("--py", "0");
  });

  /* ---------- pausa do carrossel ---------- */

  hero.addEventListener("pointerenter", () => {
    hoverPaused = true;
    window.clearTimeout(autoTimer);
  });
  hero.addEventListener("pointerleave", () => {
    hoverPaused = false;
    restartAuto();
  });
  hero.addEventListener("focusin", () => {
    hoverPaused = true;
    window.clearTimeout(autoTimer);
  });
  hero.addEventListener("focusout", (e) => {
    if (hero.contains(e.relatedTarget)) return;
    hoverPaused = false;
    restartAuto();
  });

  /* ---------- controles do carrossel ---------- */

  $("#prev").addEventListener("click", () => go(index - 1));
  $("#next").addEventListener("click", () => go(index + 1));

  bars.forEach((bar, i) => {
    bar.tabIndex = i === 0 ? 0 : -1;
    bar.addEventListener("click", () => go(i));
  });

  document.addEventListener("keydown", (e) => {
    if (viewer.open) {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        renderViewer(viewerIndex + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        renderViewer(viewerIndex - 1);
      }
      return;
    }
    if (document.querySelector("dialog[open]")) return;
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select" || e.target.isContentEditable) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(index - 1);
    }
  });

  /* ---------- gesto ---------- */

  let touchStart = null;
  hero.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse") return;
    touchStart = { x: e.clientX, y: e.clientY, t: Date.now() };
  });
  hero.addEventListener("pointerup", (e) => {
    if (!touchStart || e.pointerType === "mouse") return;
    const dx = e.clientX - touchStart.x;
    const dy = e.clientY - touchStart.y;
    const fast = Date.now() - touchStart.t < 700;
    if (Math.abs(dx) > 46 && Math.abs(dx) > Math.abs(dy) * 1.35 && fast) {
      go(index + (dx < 0 ? 1 : -1));
    }
    touchStart = null;
  });

  /* ---------- revelações ---------- */

  const revealTargets = [
    [$(".shelf--scenes"), 0],
    [$(".shelf--search"), 90],
    [$(".shelf--works"), 170],
    [$(".baseline"), 0],
  ].filter(([el]) => el);

  if (reduceMotion.matches) revealTargets.forEach(([el]) => el.classList.add("is-in"));

  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    /* revela só quando há movimento permitido; sem JS nada fica oculto */
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -4% 0px" }
    );
    revealTargets.forEach(([el, delay]) => {
      el.dataset.reveal = "";
      el.style.setProperty("--d", `${delay}ms`);
      io.observe(el);
    });
  }

  /* ---------- ciclo de vida ---------- */

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.clearTimeout(autoTimer);
      stopPetals();
    } else {
      restartAuto();
      if (petalState.visible) startPetals();
    }
  });

  if (canvas && hero) {
    new ResizeObserver(sizeCanvas).observe(hero);
    sizeCanvas();
    new IntersectionObserver(
      ([entry]) => {
        petalState.visible = entry.isIntersecting;
        if (entry.isIntersecting && !reduceMotion.matches) startPetals();
        else stopPetals();
      },
      { threshold: 0.05 }
    ).observe(hero);
    startPetals();
  }

  reduceMotion.addEventListener("change", () => {
    if (reduceMotion.matches) {
      stopPetals();
      setAutoPaused(true);
      revealTargets.forEach(([el]) => el.classList.add("is-in"));
    } else {
      startPetals();
      restartAuto();
    }
  });

  window.addEventListener("resize", fitViewer);
  document.addEventListener("sg:archive-closed", restartAuto);

  $("#year").textContent = String(new Date().getFullYear());

  /* ---------- estado inicial ---------- */

  animateTitle(SLIDES[0].title, { immediate: !document.fonts });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (index === 0) animateTitle(SLIDES[0].title);
    });
  }
  syncKeepsState();
  $("#openArt").setAttribute("aria-label", `Ver ${SLIDES[0].title} inteira`);
  setAutoPaused(autoPaused);
  restartAuto();
})();
