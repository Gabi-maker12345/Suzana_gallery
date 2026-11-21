/* =========================================================
   Cenas, categorias e galeria
   Fonte local (acervo) ou seed; imagens locais ou do repo.
   ========================================================= */

(() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const views = {
    landing: $("#viewLanding"),
    scenes: $("#viewScenes"),
    gallery: $("#viewGallery"),
  };
  if (!views.landing || !views.scenes || !views.gallery) return;

  const el = {
    more: $("#more"),
    menu: $("#moreMenu"),
    menuMeta: $("#moreMenuMeta"),
    scenesTitle: $("#scenesTitle"),
    scenesMeta: $("#scenesMeta"),
    scenesTrack: $("#sceneCards"),
    catBarName: $("#catBarName"),
    catBarCount: $("#catBarCount"),
    catContent: $("#catContent"),
    viewer: $("#collectionViewer"),
    viewerImg: $("#collectionViewerImg"),
    viewerTitle: $("#collectionViewerTitle"),
    viewerNote: $("#collectionViewerNote"),
    viewerFrame: $(".collection-viewer .viewer__frame"),
    viewerClose: $("#collectionViewerClose"),
    viewerPrev: $("#collectionViewerPrev"),
    viewerNext: $("#collectionViewerNext"),
  };

  const assets = Array.isArray(window.SUZANA_ASSETS) ? window.SUZANA_ASSETS : [];
  const byName = new Map(assets.map((item) => [item.name, item]));
  const imageBase = window.SUZANA_IMAGE_BASE || "";
  const localData = window.SuzanaArchiveData || null;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const resolve = (path) => {
    if (!path) return "";
    if (/^(https?:|data:|blob:)/i.test(path)) return path;
    return imageBase ? new URL(path, imageBase).href : path;
  };

  const TONES = [
    { bg: "#fbe1e6", ink: "#591a2a" },
    { bg: "#fde8d6", ink: "#552818" },
    { bg: "#fbf1c9", ink: "#4b3914" },
    { bg: "#ddefe1", ink: "#1d4532" },
    { bg: "#dcebf7", ink: "#1b3a50" },
    { bg: "#e9e1f8", ink: "#392858" },
    { bg: "#f4e0ef", ink: "#4b2043" },
    { bg: "#fbe0d6", ink: "#51251c" }
  ];
  const ALL_TONE = {
    bg: "linear-gradient(135deg, #fbe1e6 0%, #fde8d6 36%, #e9e1f8 70%, #ddefe1 100%)",
    ink: "#4a1420"
  };
  const TILTS = [-1.3, 0.9, -0.7, 1.5, -1.1, 0.6, 1.4, -0.9];

  const state = {
    categories: [],
    allPhotos: [],
    route: null,
    landingScroll: 0,
    scenesScroll: 0,
    viewerPhotos: [],
    viewerTitle: "",
    viewerIndex: 0,
    built: false,
  };

  const clamp01 = (n) => Math.min(1, Math.max(0, n));

  /* ---------- dados ---------- */

  function slugify(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);
  }

  function readCategories() {
    if (localData) {
      try {
        return localData.list();
      } catch {
        return [];
      }
    }
    return Array.isArray(window.SUZANA_CATEGORIES) ? window.SUZANA_CATEGORIES : [];
  }

  function loadData() {
    const raw = readCategories();
    const seenSlugs = new Set();
    const categories = raw.map((record, index) => {
      const photos = (record.photos || [])
        .map((name) => byName.get(name))
        .filter(Boolean)
        .map((photo) => ({
          ...photo,
          srcResolved: resolve(photo.src),
          thumbResolved: resolve(photo.thumb),
        }));
      let slug = slugify(record.name) || `categoria-${index + 1}`;
      if (seenSlugs.has(slug)) slug = `${slug}-${index + 1}`;
      seenSlugs.add(slug);
      return {
        id: record.id || slug,
        name: String(record.name || "Sem nome"),
        description: String(record.description || ""),
        photos,
        slug,
        tone: TONES[index % TONES.length],
        tilt: TILTS[index % TILTS.length],
      };
    });

    const seen = new Set();
    const allPhotos = [];
    for (const category of categories) {
      for (const photo of category.photos) {
        if (seen.has(photo.name)) continue;
        seen.add(photo.name);
        allPhotos.push(photo);
      }
    }

    state.categories = categories;
    state.allPhotos = allPhotos;
    state.built = true;
  }

  function totalPlacements() {
    return state.categories.reduce((total, category) => total + category.photos.length, 0);
  }

  function categoryBySlug(slug) {
    return state.categories.find((category) => category.slug === slug) || null;
  }

  function photoCount(n) {
    return `${n} foto${n === 1 ? "" : "s"}`;
  }

  function firstCover(category) {
    return category.photos[0] || null;
  }

  function collage() {
    const seen = new Set();
    const covers = [];
    for (const category of state.categories) {
      const photo = firstCover(category);
      if (!photo || !photo.thumbResolved || seen.has(photo.name)) continue;
      seen.add(photo.name);
      covers.push(photo.thumbResolved);
      if (covers.length === 4) break;
    }
    if (covers.length < 4) {
      for (const photo of state.allPhotos) {
        if (!photo.thumbResolved || seen.has(photo.name)) continue;
        seen.add(photo.name);
        covers.push(photo.thumbResolved);
        if (covers.length === 4) break;
      }
    }
    return covers;
  }

  /* ---------- tela de categorias ---------- */

  function makeSceneCard({ title, href, tone, tilt, count, cover, covers, all = false }) {
    const card = document.createElement("a");
    card.className = "scene-card" + (all ? " scene-card--all" : "");
    card.href = href;
    card.draggable = false;
    card.style.setProperty("--tone", tone.bg);
    card.style.setProperty("--tone-ink", tone.ink);
    card.style.setProperty("--tilt", `${tilt}deg`);
    card.addEventListener("dragstart", (event) => event.preventDefault());

    const media = document.createElement("span");
    media.className = "scene-card__media";

    if (all) {
      for (const src of covers) {
        const img = document.createElement("img");
        img.src = src;
        img.alt = "";
        img.loading = "lazy";
        img.decoding = "async";
        img.draggable = false;
        media.append(img);
      }
    } else if (cover) {
      const img = document.createElement("img");
      img.src = cover.thumbResolved || cover.srcResolved;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      img.draggable = false;
      media.append(img);
    }
    card.append(media);

    const body = document.createElement("span");
    body.className = "scene-card__body";
    const name = document.createElement("span");
    name.className = "scene-card__name";
    name.textContent = title;
    const foot = document.createElement("span");
    foot.className = "scene-card__foot";
    const label = document.createElement("span");
    label.className = "scene-card__count";
    label.textContent = photoCount(count);
    const arrow = document.createElement("span");
    arrow.className = "scene-card__arrow";
    arrow.innerHTML =
      '<svg class="ico" aria-hidden="true"><use href="#i-arrow"></use></svg>';
    foot.append(label, arrow);
    body.append(name, foot);
    card.append(body);
    return card;
  }

  function buildScenes() {
    if (!el.scenesTrack) return;
    el.scenesTrack.textContent = "";

    el.scenesTrack.append(
      makeSceneCard({
        title: "Todas",
        href: "#/todas",
        tone: ALL_TONE,
        tilt: -0.35,
        count: state.allPhotos.length,
        covers: collage(),
        all: true,
      })
    );

    for (const category of state.categories) {
      el.scenesTrack.append(
        makeSceneCard({
          title: category.name,
          href: `#/categoria/${encodeURIComponent(category.slug)}`,
          tone: category.tone,
          tilt: category.tilt,
          count: category.photos.length,
          cover: firstCover(category),
        })
      );
    }

    const total = totalPlacements();
    if (el.scenesMeta) {
      el.scenesMeta.textContent =
        state.categories.length === 0
          ? "O acervo ainda não tem categorias."
          : `${photoCount(total)} em ${state.categories.length} categoria${
              state.categories.length === 1 ? "" : "s"
            }`;
    }
    const endMeta = $("#scenesEndMeta");
    if (endMeta) {
      endMeta.textContent =
        state.categories.length === 0
          ? "Nenhuma categoria ainda"
          : `${state.categories.length} categorias · ${photoCount(total)}`;
    }
    if (el.menuMeta) {
      el.menuMeta.textContent =
        state.categories.length === 0
          ? "Nenhuma categoria ainda"
          : `${state.categories.length} categorias · ${photoCount(total)}`;
    }

  }

  /* ---------- galeria da categoria ---------- */

  function makeHero(category, photos, isAll) {
    const hero = document.createElement("header");
    hero.className = "cat-hero";

    const title = document.createElement("h1");
    title.tabIndex = -1;
    title.textContent = isAll ? "Todas" : category.name;
    hero.append(title);

    const description = document.createElement("p");
    description.className = "cat-hero__desc";
    description.textContent = isAll
      ? "Todas as fotos das categorias, sem repetir."
      : category.description || "Uma categoria do acervo da Suzana.";
    hero.append(description);

    const meta = document.createElement("div");
    meta.className = "cat-hero__meta";
    const count = document.createElement("span");
    count.className = "cat-hero__pill";
    count.textContent = photoCount(photos.length);
    const order = document.createElement("span");
    order.className = "cat-hero__pill cat-hero__pill--ghost";
    order.textContent = isAll ? "sem repetir" : "na ordem do acervo";
    meta.append(count, order);
    hero.append(meta);
    return { hero, title };
  }

  function buildPhotoButton(photo, index, total) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.index = String(index);
    button.className = "cat-photo";
    button.setAttribute(
      "aria-label",
      `Abrir ${state.viewerTitle}, foto ${index + 1} de ${total}`
    );
    button.addEventListener("click", () => openViewer(index));

    const img = document.createElement("img");
    img.src = photo.thumbResolved || photo.srcResolved;
    img.alt = "";
    img.decoding = "async";
    img.loading = index === 0 ? "eager" : "lazy";
    if (photo.w && photo.h) {
      img.width = photo.w;
      img.height = photo.h;
    }
    button.append(img);

    const badge = document.createElement("span");
    badge.className = "cat-photo__num";
    badge.textContent = String(index + 1).padStart(2, "0");
    button.append(badge);
    return button;
  }

  function renderCategory(category, isAll = false) {
    const photos = isAll ? state.allPhotos : category.photos;
    const tone = isAll ? ALL_TONE : category.tone;
    const title = isAll ? "Todas" : category.name;

    state.viewerPhotos = photos;
    state.viewerTitle = title;
    state.viewerIndex = 0;

    views.gallery.style.setProperty("--tone", tone.bg);
    views.gallery.style.setProperty("--tone-ink", tone.ink);
    el.catBarName.textContent = title;
    el.catBarCount.textContent = photoCount(photos.length);
    el.catContent.textContent = "";

    const { hero, title: heading } = makeHero(category, photos, isAll);
    el.catContent.append(hero);

    if (photos.length > 0) {
      /* Bento: linhas que somam 6 colunas; 4+2, 2+2+2, 4+2, 3+3 em ciclo. */
      const rowPlans = [
        [4, 2],
        [2, 2, 2],
        [4, 2],
        [3, 3],
      ];
      const grid = document.createElement("div");
      grid.className = "cat-grid";
      if (photos.length > 30) grid.classList.add("cat-grid--many");

      let cursor = 0;
      let rowIndex = 0;
      while (cursor < photos.length) {
        const planned = rowPlans[rowIndex % rowPlans.length];
        const left = photos.length - cursor;
        let spans = planned;
        if (left < planned.length) {
          spans = left === 1 ? [6] : left === 2 ? [3, 3] : [2, 2, 2];
        }
        for (const span of spans) {
          const button = buildPhotoButton(photos[cursor], cursor, photos.length);
          button.style.gridColumn = `span ${span}`;
          if (span >= 3) button.classList.add("cat-photo--wide");
          grid.append(button);
          cursor += 1;
        }
        rowIndex += 1;
      }
      el.catContent.append(grid);
    } else {
      const empty = document.createElement("p");
      empty.className = "cat-empty";
      empty.textContent = "Esta categoría ainda não tem fotos.";
      el.catContent.append(empty);
    }

    const foot = document.createElement("footer");
    foot.className = "cat-foot";

    const right = document.createElement("div");
    right.style.display = "flex";
    right.style.alignItems = "center";
    right.style.gap = "16px";
    right.style.flexWrap = "wrap";

    if (!isAll) {
      const allLink = document.createElement("a");
      allLink.className = "cat-next";
      allLink.href = "#/todas";
      allLink.innerHTML = '<span>Todas as fotos</span><svg class="ico" aria-hidden="true"><use href="#i-arrow"></use></svg>';
      right.append(allLink);
    }

    if (!isAll && state.categories.length > 1) {
      const index = state.categories.indexOf(category);
      const next = state.categories[(index + 1) % state.categories.length];
      const nextLink = document.createElement("a");
      nextLink.className = "cat-next";
      nextLink.href = `#/categoria/${encodeURIComponent(next.slug)}`;
      const label = document.createElement("span");
      label.textContent = "Próxima";
      const name = document.createElement("strong");
      name.textContent = next.name;
      nextLink.append(label, name);
      nextLink.insertAdjacentHTML(
        "beforeend",
        '<svg class="ico" aria-hidden="true"><use href="#i-arrow"></use></svg>'
      );
      right.append(nextLink);
    }

    if (right.children.length) {
      foot.append(right);
      el.catContent.append(foot);
    }
    document.title = `${title} — Suzana Galery`;

    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      if (!reduceMotion.matches) heading.focus({ preventScroll: true });
    });
  }

  /* ---------- lightbox ---------- */

  function fitViewer() {
    if (!el.viewer || !el.viewerImg) return;
    const naturalWidth = el.viewerImg.naturalWidth;
    const naturalHeight = el.viewerImg.naturalHeight;
    if (!naturalWidth || !naturalHeight) return;
    const narrow = window.innerWidth <= 520;
    const pad = narrow ? 18 : 28;
    const frameHeight = el.viewerFrame?.clientHeight || 560;
    const desired = Math.round((frameHeight * naturalWidth) / naturalHeight) + pad + 12;
    el.viewer.style.width = `${Math.min(window.innerWidth - (narrow ? 12 : 28), desired)}px`;
  }

  function openViewer(index) {
    if (!el.viewer || !state.viewerPhotos.length) return;
    state.viewerIndex = (index + state.viewerPhotos.length) % state.viewerPhotos.length;
    const photo = state.viewerPhotos[state.viewerIndex];
    el.viewerImg.src = photo.srcResolved || photo.src;
    el.viewerImg.alt = `${state.viewerTitle}, foto ${state.viewerIndex + 1} de ${
      state.viewerPhotos.length
    }`;
    el.viewerTitle.textContent = state.viewerTitle;
    el.viewerNote.textContent = `${state.viewerIndex + 1} de ${state.viewerPhotos.length}`;
    if (!el.viewer.open) el.viewer.showModal();
    requestAnimationFrame(fitViewer);
  }

  function stepViewer(direction) {
    if (!el.viewer?.open || !state.viewerPhotos.length) return;
    state.viewerIndex =
      (state.viewerIndex + direction + state.viewerPhotos.length) %
      state.viewerPhotos.length;
    const photo = state.viewerPhotos[state.viewerIndex];
    el.viewerImg.src = photo.srcResolved || photo.src;
    el.viewerImg.alt = `${state.viewerTitle}, foto ${state.viewerIndex + 1} de ${
      state.viewerPhotos.length
    }`;
    el.viewerNote.textContent = `${state.viewerIndex + 1} de ${state.viewerPhotos.length}`;
    requestAnimationFrame(fitViewer);
  }

  function setupViewer() {
    if (!el.viewer) return;
    el.viewerClose?.addEventListener("click", () => el.viewer.close());
    el.viewerPrev?.addEventListener("click", () => stepViewer(-1));
    el.viewerNext?.addEventListener("click", () => stepViewer(1));
    el.viewer.addEventListener("click", (event) => {
      if (event.target === el.viewer) el.viewer.close();
    });
    el.viewerImg?.addEventListener("load", fitViewer);
    window.addEventListener("resize", fitViewer);
    document.addEventListener("keydown", (event) => {
      if (!el.viewer.open) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        stepViewer(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepViewer(-1);
      }
    });
  }

  /* ---------- menu Ver mais ---------- */

  function setMenu(open) {
    if (!el.menu || !el.more) return;
    el.menu.hidden = !open;
    el.more.setAttribute("aria-expanded", String(open));
    if (open) el.menu.querySelector("a")?.focus({ preventScroll: true });
  }

  function setupMenu() {
    if (!el.more || !el.menu) return;
    el.more.addEventListener("click", () => setMenu(el.menu.hidden));
    el.menu.querySelector("a")?.addEventListener("click", () => setMenu(false));
    document.addEventListener("click", (event) => {
      if (el.menu.hidden) return;
      if (event.target.closest(".more-wrap")) return;
      setMenu(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || el.menu.hidden) return;
      setMenu(false);
      el.more.focus();
    });
  }

  /* ---------- rotas ---------- */

  function showView(name) {
    for (const [key, node] of Object.entries(views)) {
      if (!node) continue;
      node.hidden = key !== name;
    }
    const node = views[name];
    if (!node) return;
    node.hidden = false;
    node.classList.remove("is-entering");
    void node.offsetWidth;
    node.classList.add("is-entering");
    document.body.classList.toggle("is-scenes", name === "scenes");
    document.body.classList.toggle("is-gallery", name === "gallery");
    document.body.classList.toggle("is-landing", name === "landing");
  }

  function parseRoute() {
    const hash = location.hash;
    if (hash === "#/cenas") return { view: "scenes" };
    if (hash === "#/todas") return { view: "gallery", all: true };
    if (hash.startsWith("#/categoria/")) {
      return {
        view: "gallery",
        slug: decodeURIComponent(hash.slice("#/categoria/".length)),
      };
    }
    if (hash === "" || hash === "#" || hash === "#/") return { view: "landing" };
    return null;
  }

  function goScenes({ replace = false } = {}) {
    if (replace) history.replaceState(null, "", "#/cenas");
    else location.hash = "#/cenas";
  }

  function applyRoute(route, { initial = false } = {}) {
    if (!route) return;
    if (state.route === "landing" && route.view !== "landing") {
      state.landingScroll = window.scrollY;
    }
    const previousRoute = state.route;
    if (previousRoute === "scenes" && route.view !== "scenes") {
      state.scenesScroll = window.scrollY;
    }

    setMenu(false);

    if (route.view === "scenes") {
      state.route = "scenes";
      showView("scenes");
      document.title = "Todas as cenas — Suzana Galery";
      window.scrollTo(0, 0);
      requestAnimationFrame(() => {
        window.scrollTo(0, previousRoute === "gallery" ? state.scenesScroll : 0);
        if (!initial && !reduceMotion.matches) el.scenesTitle?.focus({ preventScroll: true });
      });
      return;
    }

    if (route.view === "gallery") {
      let category = null;
      if (!route.all) {
        category = categoryBySlug(route.slug);
        if (!category) {
          goScenes({ replace: true });
          state.route = "scenes";
          showView("scenes");
          window.scrollTo(0, 0);
          return;
        }
      }
      state.route = "gallery";
      renderCategory(category, Boolean(route.all));
      showView("gallery");
      window.scrollTo(0, 0);
      return;
    }

    state.route = "landing";
    showView("landing");
    document.title = "Suzana Galery — galeria pessoal";
    requestAnimationFrame(() => {
      window.scrollTo(0, state.landingScroll);
    });
  }

  function setupRoutes() {
    window.addEventListener("hashchange", () => {
      const route = parseRoute();
      if (route) applyRoute(route);
    });
  }

  /* ---------- atualização dos dados ---------- */

  let refreshTimer = 0;
  function refreshFromData() {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => {
      loadData();
      buildScenes();
      if (state.route === "gallery") {
        const route = parseRoute();
        if (route?.view === "gallery") applyRoute(route);
      }
    }, 140);
  }

  /* ---------- inicialização ---------- */

  function init() {
    loadData();
    buildScenes();
    setupMenu();
    setupViewer();
    setupRoutes();
    document.addEventListener("sg:archive-changed", refreshFromData);
    document.addEventListener("sg:archive-data-changed", refreshFromData);

    if (el.scenesTitle) el.scenesTitle.tabIndex = -1;
    const route = parseRoute();
    if (route) applyRoute(route, { initial: true });
    else {
      state.route = "landing";
      showView("landing");
    }
  }

  init();
})();
