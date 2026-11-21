/* =========================================================
   Suzana Galery — interações
   Carrossel, pétalas, filtros, visualizador e detalhes.
   ========================================================= */

(() => {
  "use strict";

  document.documentElement.classList.add("js");
  if (location.hostname.endsWith(".vercel.app")) {
    document.documentElement.classList.add("is-deploy");
  }

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const EASE = "cubic-bezier(.16,1,.3,1)";

  const SLIDES = [
    {
      title: "Bem-vindo!",
      desc: "Oi, visitantes! Essa é a Galeria da Suzana. Seja bem-vindo!",
      art: "assets/img/suzana1_reconstruida.png",
      alt: "Hu Tao de chapéu, com a mão no rosto, entre borboletas claras.",
      orb: "#fbd0d8",
      audio: "assets/Oi!.mp3",
    },
    {
      title: "Dá uma olhada!",
      desc: "Você tá aqui pra ver as incríveis fotos dela, né? Eu sei que tá... Dá uma olhada!",
      art: "assets/img/suzana2_reconstruida.png",
      alt: "Hu Tao rindo de olhos fechados sobre fundo vermelho, com um fantasma ao lado.",
      orb: "#f7c2c9",
      audio: "assets/dáumaolhada.mp3",
    },
    {
      title: "Incrível!",
      desc: "Você não vai se arrepender. Tudo aqui dentro é incrível. A Suzana é incrível.",
      art: "assets/img/suzana3_reconstruida.png",
      alt: "Close de Hu Tao de óculos redondos e flor de ameixa no cabelo.",
      orb: "#fbd3dc",
      audio: "assets/incrível.mp3",
    },
  ];

  const WORKS = [
    { title: "Flor de ameixa", note: "Retrato · sem fundo", img: "assets/img/suzana1_reconstruida.png", frame: "#eee2e8", alt: "Hu Tao de chapéu, entre borboletas claras." },
    { title: "Rindo em vermelho", note: "Cena · sem fundo", img: "assets/img/suzana2_reconstruida.png", frame: "#f2dcdb", alt: "Hu Tao rindo sobre fundo vermelho, com um fantasma ao lado." },
    { title: "Close de sakura", note: "Close · sem fundo", img: "assets/img/suzana3_reconstruida.png", frame: "#f6e1e3", alt: "Close de Hu Tao de óculos redondos e flor de ameixa." },
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
  const heroAudio = $("#heroAudio");
  const autoBtn = $("#autoToggle");
  const bgMusic = $("#bgMusic");
  const soundButtons = $$("[data-sound-toggle]");
  const SOUND_KEY = "suzana-gallery-sound-muted";
  let soundMuted = false;
  try { soundMuted = localStorage.getItem(SOUND_KEY) === "1"; } catch {}

  if (bgMusic) {
    bgMusic.volume = 0.12;
    bgMusic.loop = true;
    bgMusic.muted = soundMuted;
  }
  if (heroAudio) heroAudio.muted = soundMuted;

  let index = 0;
  let frontEl = artA;
  let busy = false;
  let autoPaused = reduceMotion.matches;
  let audioSlide = -1;
  let audioBlocked = false;
  let audioGestureArmed = false;
  let audioGestureHandler = null;
  let suppressToggleOnce = false;
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
    $("#openArt").setAttribute("aria-label", `Ver ${WORKS[target].title} inteira`);
    live.textContent = `Cartão ${target + 1} de ${SLIDES.length}: ${slide.title}`;
    playCurrentAudio({ restart: true });

    window.setTimeout(() => {
      busy = false;
    }, reduceMotion.matches ? 30 : 520);
  }

  /* ---------- áudio dos cartões ---------- */

  function isLandingVisible() {
    const landing = $("#viewLanding");
    return !landing || !landing.hidden;
  }

  function reflectAudioButton() {
    if (!autoBtn) return;
    const showPlay = autoPaused || audioBlocked;
    autoBtn.classList.toggle("is-paused", showPlay);
    autoBtn.setAttribute("aria-label", showPlay ? "Ouvir a apresentação" : "Pausar o áudio");
    autoBtn.dataset.tip = showPlay ? "Ouvir" : "Pausar";
    autoBtn.querySelector("use")?.setAttribute("href", showPlay ? "#i-play" : "#i-pause");
  }

  function disarmAudioGesture() {
    if (!audioGestureHandler) return;
    document.removeEventListener("pointerdown", audioGestureHandler, true);
    document.removeEventListener("keydown", audioGestureHandler, true);
    document.removeEventListener("touchstart", audioGestureHandler, true);
    audioGestureHandler = null;
    audioGestureArmed = false;
  }

  function armAudioGesture() {
    if (audioGestureArmed) return;
    audioGestureArmed = true;
    const onGesture = (event) => {
      disarmAudioGesture();
      if (event.target instanceof Element && event.target.closest("#autoToggle") && !autoPaused) {
        suppressToggleOnce = true;
        window.setTimeout(() => { suppressToggleOnce = false; }, 500);
      }
      if (autoPaused) return;
      playCurrentAudio();
    };
    audioGestureHandler = onGesture;
    document.addEventListener("pointerdown", onGesture, true);
    document.addEventListener("keydown", onGesture, true);
    document.addEventListener("touchstart", onGesture, true);
  }

  function playCurrentAudio({ restart = false } = {}) {
    if (!heroAudio) return;
    if (document.documentElement.classList.contains("is-preloading")) return;
    if (autoPaused || document.hidden || !isLandingVisible()) return;
    if (document.querySelector("dialog[open]")) return;
    const slide = SLIDES[index];
    if (!slide || !slide.audio) return;
    if (audioSlide !== index) {
      audioSlide = index;
      heroAudio.src = slide.audio;
      heroAudio.load();
    } else if (restart) {
      try { heroAudio.currentTime = 0; } catch {}
    }
    const playing = heroAudio.play();
    if (playing && typeof playing.then === "function") {
      playing.then(() => {
        audioBlocked = false;
        disarmAudioGesture();
        reflectAudioButton();
      }).catch((err) => {
        if (err && err.name === "NotAllowedError") {
          audioBlocked = true;
          reflectAudioButton();
          armAudioGesture();
        }
      });
    }
  }

  function setAutoPaused(paused) {
    autoPaused = paused;
    if (paused) heroAudio?.pause();
    reflectAudioButton();
    if (!paused) playCurrentAudio();
  }

  autoBtn?.addEventListener("click", () => {
    if (suppressToggleOnce) {
      suppressToggleOnce = false;
      return;
    }
    setAutoPaused(!autoPaused);
  });

  heroAudio?.addEventListener("ended", () => {
    if (autoPaused || document.hidden) return;
    if (document.querySelector("dialog[open]") || !isLandingVisible()) return;
    go(index + 1, { user: false });
  });

  heroAudio?.addEventListener("error", () => {
    audioBlocked = false;
    reflectAudioButton();
  });

  document.querySelectorAll("dialog").forEach((dialog) => {
    dialog.addEventListener("toggle", () => {
      if (document.querySelector("dialog[open]")) {
        heroAudio?.pause();
      } else if (!autoPaused && isLandingVisible() && !document.hidden) {
        playCurrentAudio();
      }
    });
  });

  window.addEventListener("hashchange", () => {
    window.setTimeout(() => {
      if (!isLandingVisible()) {
        heroAudio?.pause();
      } else if (!autoPaused && !document.hidden && !document.querySelector("dialog[open]")) {
        playCurrentAudio();
      }
      syncBgMusic();
    }, 0);
  });

  /* ---------- som global / música de fundo ---------- */

  function isGalleryAudioView() {
    const scenes = $("#viewScenes");
    const gallery = $("#viewGallery");
    return Boolean((scenes && !scenes.hidden) || (gallery && !gallery.hidden));
  }

  function reflectSoundButtons() {
    for (const button of soundButtons) {
      button.classList.toggle("is-muted", soundMuted);
      button.setAttribute("aria-pressed", String(soundMuted));
      button.setAttribute("aria-label", soundMuted ? "Ativar som" : "Silenciar som");
      button.dataset.tip = soundMuted ? "Ativar som" : "Silenciar som";
      button.querySelector("use")?.setAttribute("href", soundMuted ? "#i-volume-off" : "#i-volume");
    }
  }

  function syncBgMusic() {
    if (!bgMusic) return;
    const canPlay =
      !soundMuted &&
      !document.hidden &&
      !document.documentElement.classList.contains("is-preloading") &&
      isGalleryAudioView();
    if (!canPlay) {
      bgMusic.pause();
      return;
    }
    const playing = bgMusic.play();
    if (playing && typeof playing.catch === "function") playing.catch(() => {});
  }

  function setSoundMuted(muted) {
    soundMuted = Boolean(muted);
    if (bgMusic) {
      bgMusic.muted = soundMuted;
      if (soundMuted) bgMusic.pause();
    }
    if (heroAudio) heroAudio.muted = soundMuted;
    try { localStorage.setItem(SOUND_KEY, soundMuted ? "1" : "0"); } catch {}
    reflectSoundButtons();
    if (!soundMuted) syncBgMusic();
  }

  soundButtons.forEach((button) => {
    button.addEventListener("click", () => setSoundMuted(!soundMuted));
  });
  reflectSoundButtons();

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
    heroAudio?.pause();
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
  $("#viewerClose").addEventListener("click", closeViewer);
  $("#viewerPrev").addEventListener("click", () => renderViewer(viewerIndex - 1));
  $("#viewerNext").addEventListener("click", () => renderViewer(viewerIndex + 1));

  /* ---------- abertura da obra em destaque ---------- */

  $("#openArt").addEventListener("click", (e) => {
    burstAt(e.clientX || window.innerWidth * 0.75, e.clientY || window.innerHeight * 0.3);
    window.setTimeout(() => openViewer(index), reduceMotion.matches ? 0 : 170);
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
      const target =
        link.dataset.nav === "inicio" ? "stage" :
        link.dataset.nav === "cenas" ? "boards" :
        "faq";
      const section = document.getElementById(target);
      if (!section) return;
      section.scrollIntoView({
        behavior: reduceMotion.matches ? "auto" : "smooth",
        block: link.dataset.nav === "inicio" ? "center" : "start",
      });
    });
  });

  /* ---------- perguntas frequentes ---------- */

  const faqItems = $$(".faq__item");

  function setFaqOpen(item, open) {
    const question = $(".faq__q", item);
    const answer = $(".faq__answer", item);
    if (!question || !answer) return;
    item.classList.toggle("is-open", open);
    question.setAttribute("aria-expanded", String(open));
    answer.setAttribute("aria-hidden", String(!open));
    if ("inert" in answer) answer.inert = !open;
  }

  faqItems.forEach((item) => {
    const question = $(".faq__q", item);
    if (!question) return;
    question.addEventListener("click", () => {
      const open = !item.classList.contains("is-open");
      faqItems.forEach((other) => {
        if (other !== item) setFaqOpen(other, false);
      });
      setFaqOpen(item, open);
    });
    setFaqOpen(item, item.classList.contains("is-open"));
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
    [$(".shelf--faq"), 90],
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
      heroAudio?.pause();
      bgMusic?.pause();
      stopPetals();
    } else {
      if (!autoPaused && isLandingVisible() && !document.querySelector("dialog[open]")) {
        playCurrentAudio();
      }
      syncBgMusic();
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
      if (isLandingVisible() && !document.hidden) setAutoPaused(false);
    }
  });

  window.addEventListener("resize", fitViewer);

  $("#year").textContent = String(new Date().getFullYear());

  /* ---------- preloader ---------- */

  function initPreloader() {
    const preloader = $("#preloader");
    const heartButton = $("#preloaderHeart");
    if (!preloader || !heartButton) {
      document.documentElement.classList.remove("is-preloading");
      document.body.classList.remove("is-preloading");
      return;
    }

    const showHeart = () => {
      preloader.classList.add("is-heart-visible");
      heartButton.disabled = false;
      heartButton.focus({ preventScroll: true });
    };

    const openPage = () => {
      preloader.classList.add("is-opening");
      document.documentElement.classList.remove("is-preloading");
      document.body.classList.remove("is-preloading");
      if (!autoPaused) playCurrentAudio();
      syncBgMusic();
      window.setTimeout(() => preloader.remove(), 900);
    };

    const fillSteps = [34, 67, 100];
    let presses = 0;

    const labelForPresses = () => {
      const remaining = 3 - presses;
      heartButton.setAttribute(
        "aria-label",
        remaining > 0
          ? `Pressione mais ${remaining} ${remaining === 1 ? "vez" : "vezes"} para abrir a galeria`
          : "Abrindo a galeria"
      );
    };

    window.setTimeout(() => {
      showHeart();
      heartButton.setAttribute("aria-label", "Pressione 3 vezes para abrir a galeria");
    }, 1500);

    heartButton.addEventListener("click", () => {
      if (heartButton.disabled || preloader.classList.contains("is-opening")) return;
      if (presses >= 3) return;

      presses += 1;
      preloader.classList.add("is-pumping");
      preloader.style.setProperty("--fill", `${fillSteps[presses - 1]}%`);

      heartButton.classList.remove("is-beating");
      void heartButton.offsetWidth;
      heartButton.classList.add("is-beating");
      window.setTimeout(() => heartButton.classList.remove("is-beating"), 650);

      if (presses < 3) {
        labelForPresses();
        return;
      }

      preloader.classList.add("is-full");
      heartButton.disabled = true;
      labelForPresses();
      window.setTimeout(openPage, 1250);
    });
  }

  /* ---------- estado inicial ---------- */

  animateTitle(SLIDES[0].title, { immediate: !document.fonts });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (index === 0) animateTitle(SLIDES[0].title);
    });
  }
  $("#openArt").setAttribute("aria-label", `Ver ${WORKS[0].title} inteira`);
  setAutoPaused(autoPaused);
  syncBgMusic();
  initPreloader();
})();
