/* =========================================================
   Acervo local — modal de categorias e fotos
   As fotos vêm de assets/Suzana (manifesto); salvamos só
   quais foram escolhidas e em que ordem, em localStorage.
   ========================================================= */

(() => {
  "use strict";

  const dialog = document.getElementById("archiveDialog");
  const Data = window.SuzanaArchiveData;
  if (!dialog || !Data) return;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const assets = Array.isArray(window.SUZANA_ASSETS) ? window.SUZANA_ASSETS : [];
  const byName = new Map(assets.map((item) => [item.name, item]));

  const el = {
    close: $("#archiveClose"),
    exportBtn: $("#archiveExport"),
    exportBtnFooter: $("#archiveExportFooter"),
    confirmTail: $("#confirmTail"),
    origin: $("#archiveOrigin"),
    count: $("#archiveCount"),
    list: $("#archiveList"),
    empty: $("#archiveEmpty"),
    newBtn: $("#archiveNew"),
    formTitle: $("#archiveFormTitle"),
    form: $("#archiveForm"),
    name: $("#catName"),
    desc: $("#catDesc"),
    descCount: $("#descCount"),
    libraryCount: $("#libraryCount"),
    library: $("#photoLibrary"),
    libraryEmpty: $("#libraryEmpty"),
    libraryVisible: $("#libraryVisible"),
    search: $("#photoSearch"),
    selection: $("#photoSelection"),
    selectionEmpty: $("#selectionEmpty"),
    selectionCount: $("#selectionCount"),
    clearSelection: $("#clearSelection"),
    status: $("#archiveStatus"),
    error: $("#archiveError"),
    save: $("#archiveSave"),
    del: $("#archiveDelete"),
    confirm: $("#archiveConfirm"),
    confirmName: $("#confirmName"),
    cancelDelete: $("#cancelDelete"),
    confirmDelete: $("#confirmDelete"),
  };

  const state = {
    records: [],
    editingId: null,
    editingCategory: null,
    photos: [],
    dirty: false,
    storageBlocked: false,
    libraryBuilt: false,
    saving: false,
    tiles: new Map(),
    dragIndex: null,
  };

  /* ---------- utilitários ---------- */

  function icon(name, cls = "ico") {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", cls);
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", `#${name}`);
    svg.append(use);
    return svg;
  }

  function makeId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return `cat_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
  }

  function norm(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function canDiscard() {
    return (
      !state.dirty ||
      window.confirm("Descartar as alterações não salvas desta categoria?")
    );
  }

  function clearStatus() {
    el.status.textContent = "";
  }

  function setStatus(message) {
    el.status.textContent = message;
  }

  function showError(message) {
    el.error.textContent = message;
    el.error.hidden = false;
  }

  function clearError() {
    el.error.textContent = "";
    el.error.hidden = true;
  }

  function friendlyError(error) {
    if (!error) return "Não foi possível concluir a operação.";
    if (error.name === "QuotaExceededError") {
      return "O navegador ficou sem espaço para salvar o acervo.";
    }
    return error.message || "Não foi possível concluir a operação.";
  }

  function updateDescCount() {
    el.descCount.textContent = String(el.desc.value.length);
  }

  function exportData() {
    const records = Data.list();
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      categories: records,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2) + "\n"], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "suzana-categorias.json";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    setStatus(
      records.length
        ? `${records.length} categoria${records.length === 1 ? "" : "s"} exportada${
            records.length === 1 ? "" : "s"
          } em JSON.`
        : "Nenhuma categoria para exportar."
    );
  }

  function entryFor(name) {
    return byName.get(name) || {
      name,
      src: null,
      thumb: null,
      w: null,
      h: null,
      missing: true,
    };
  }

  /* ---------- lista de categorias ---------- */

  function renderList() {
    el.list.textContent = "";
    el.count.textContent = String(state.records.length);

    state.records.forEach((cat) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "acat__btn";
      btn.dataset.id = cat.id;
      if (cat.id === state.editingId) btn.setAttribute("aria-current", "true");

      const thumb = document.createElement("span");
      thumb.className = "acat__thumb";
      const first = cat.photos && cat.photos.length ? entryFor(cat.photos[0]) : null;
      if (first && first.thumb) {
        const img = document.createElement("img");
        img.src = first.thumb;
        img.alt = "";
        img.loading = "lazy";
        thumb.append(img);
      } else {
        thumb.classList.add("acat__thumb--empty");
        thumb.append(icon("i-image"));
      }

      const body = document.createElement("span");
      body.className = "acat__body";
      const name = document.createElement("strong");
      name.textContent = cat.name;
      const meta = document.createElement("span");
      const n = cat.photos ? cat.photos.length : 0;
      meta.textContent = n === 1 ? "1 foto" : `${n} fotos`;
      body.append(name, meta);

      btn.append(thumb, body);
      btn.addEventListener("click", () => selectCategory(cat.id));
      li.append(btn);
      el.list.append(li);
    });

    el.empty.hidden = state.records.length > 0;
    el.empty.textContent = state.storageBlocked
      ? "O armazenamento local não está disponível neste navegador."
      : assets.length === 0
        ? "Nenhuma foto encontrada em assets/Suzana. Gere o manifesto para começar."
        : "Nenhuma categoria ainda. A primeira começa no formulário.";
  }

  function loadRecords() {
    if (state.storageBlocked) {
      renderList();
      return;
    }
    try {
      state.records = Data.list().sort((a, b) =>
        String(a.name).localeCompare(String(b.name), "pt-BR", { sensitivity: "base" })
      );
    } catch (error) {
      state.records = [];
      showError(friendlyError(error));
    }
    renderList();
  }

  /* ---------- biblioteca ---------- */

  function ensureLibrary() {
    if (state.libraryBuilt) return;
    state.libraryBuilt = true;
    el.libraryCount.textContent =
      assets.length === 0
        ? "Pasta vazia"
        : `${assets.length} foto${assets.length === 1 ? "" : "s"} na pasta`;

    const frag = document.createDocumentFragment();
    for (const photo of assets) {
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "alib";
      tile.dataset.name = photo.name;
      tile.setAttribute("aria-pressed", "false");
      tile.title = photo.name;

      const img = document.createElement("img");
      img.src = photo.thumb;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      tile.append(img);

      const badge = document.createElement("span");
      badge.className = "alib__order";
      badge.hidden = true;
      tile.append(badge);

      tile.addEventListener("click", () => togglePhoto(photo.name));
      state.tiles.set(photo.name, tile);
      frag.append(tile);
    }
    el.library.append(frag);
    applyLibraryFilter();
    syncLibrarySelection();
  }

  function applyLibraryFilter() {
    const query = norm(el.search.value.trim());
    let visible = 0;
    for (const [name, tile] of state.tiles) {
      const show = !query || norm(name).includes(query);
      tile.hidden = !show;
      if (show) visible += 1;
    }
    el.libraryVisible.textContent = query
      ? `${visible} de ${assets.length}`
      : `${assets.length} foto${assets.length === 1 ? "" : "s"}`;
    el.libraryEmpty.textContent =
      assets.length === 0
        ? "Nenhuma foto encontrada em assets/Suzana. Gere o manifesto da pasta."
        : "Nenhuma foto com esse nome.";
    el.libraryEmpty.hidden = visible > 0;
  }

  function syncLibrarySelection() {
    const order = new Map(state.photos.map((photo, i) => [photo.name, i + 1]));
    for (const [name, tile] of state.tiles) {
      const position = order.get(name);
      const selected = Boolean(position);
      tile.classList.toggle("is-selected", selected);
      tile.setAttribute("aria-pressed", String(selected));
      tile.setAttribute(
        "aria-label",
        selected ? `Remover ${name} da seleção` : `Adicionar ${name} à seleção`
      );
      const badge = tile.querySelector(".alib__order");
      if (badge) {
        badge.hidden = !selected;
        if (selected) badge.textContent = String(position);
      }
    }
  }

  /* ---------- seleção ---------- */

  function togglePhoto(name) {
    if (state.saving) return;
    const entry = entryFor(name);
    const index = state.photos.findIndex((photo) => photo.name === name);
    if (index >= 0) {
      state.photos.splice(index, 1);
    } else {
      state.photos.push(entry);
    }
    state.dirty = true;
    clearStatus();
    renderSelection();
    syncLibrarySelection();
  }

  function reorderPhoto(from, to) {
    if (from === to || from == null || to == null) return;
    if (from < 0 || from >= state.photos.length || to < 0 || to >= state.photos.length) return;
    const [item] = state.photos.splice(from, 1);
    state.photos.splice(to, 0, item);
    state.dirty = true;
    clearStatus();
    renderSelection();
    syncLibrarySelection();
  }

  function renderSelection() {
    el.selection.textContent = "";
    state.photos.forEach((photo, index) => {
      const tile = document.createElement("div");
      tile.className = "asel" + (photo.missing ? " asel--missing" : "");
      tile.dataset.index = String(index);
      tile.dataset.name = photo.name;
      tile.title = photo.name;
      tile.draggable = true;

      if (photo.thumb) {
        const img = document.createElement("img");
        img.src = photo.thumb;
        img.alt = "";
        img.loading = "lazy";
        img.decoding = "async";
        tile.append(img);
      } else {
        const placeholder = document.createElement("span");
        placeholder.className = "asel__missing";
        placeholder.append(icon("i-image"));
        tile.append(placeholder);
      }

      const badge = document.createElement("span");
      badge.className = "asel__order";
      badge.textContent = String(index + 1);
      tile.append(badge);

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "asel__x";
      remove.setAttribute("aria-label", `Remover ${photo.name} da seleção`);
      remove.append(icon("i-x"));
      remove.addEventListener("click", (event) => {
        event.stopPropagation();
        togglePhoto(photo.name);
      });
      tile.append(remove);

      tile.addEventListener("dragstart", (event) => {
        state.dragIndex = index;
        tile.classList.add("is-dragging");
        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", String(index));
        }
      });
      tile.addEventListener("dragend", () => {
        state.dragIndex = null;
        tile.classList.remove("is-dragging");
        $$(".asel.is-over", el.selection).forEach((item) =>
          item.classList.remove("is-over")
        );
      });
      tile.addEventListener("dragover", (event) => {
        event.preventDefault();
        tile.classList.add("is-over");
      });
      tile.addEventListener("dragleave", () => tile.classList.remove("is-over"));
      tile.addEventListener("drop", (event) => {
        event.preventDefault();
        tile.classList.remove("is-over");
        const from = Number(
          event.dataTransfer ? event.dataTransfer.getData("text/plain") : state.dragIndex
        );
        reorderPhoto(from, index);
      });

      el.selection.append(tile);
    });

    el.selectionCount.textContent = String(state.photos.length);
    el.selectionEmpty.hidden = state.photos.length > 0;
    el.clearSelection.disabled = state.photos.length === 0;
  }

  function clearSelection() {
    if (!state.photos.length) return;
    if (
      state.photos.length > 8 &&
      !window.confirm(`Remover as ${state.photos.length} fotos da seleção?`)
    ) {
      return;
    }
    state.photos = [];
    state.dirty = true;
    clearStatus();
    renderSelection();
    syncLibrarySelection();
  }

  /* ---------- formulário ---------- */

  function updateSaveState() {
    el.save.disabled = state.saving || state.storageBlocked;
    el.save.setAttribute("aria-busy", String(state.saving));
    el.del.disabled = state.saving || state.storageBlocked;
    el.save.textContent = state.saving
      ? "Salvando…"
      : state.editingId
        ? "Salvar alterações"
        : "Salvar categoria";
  }

  function resetForm({ focus = false } = {}) {
    state.editingId = null;
    state.editingCategory = null;
    state.photos = [];
    state.dirty = false;
    state.saving = false;
    state.dragIndex = null;

    el.form.reset();
    el.name.value = "";
    el.desc.value = "";
    el.formTitle.textContent = "Nova categoria";
    el.del.hidden = true;
    el.confirm.hidden = true;
    clearError();
    clearStatus();
    updateDescCount();
    renderSelection();
    syncLibrarySelection();
    updateSaveState();
    renderList();
    if (focus) el.name.focus();
  }

  function selectCategory(id) {
    if (state.saving) return;
    if (id === state.editingId) {
      el.name.focus();
      return;
    }
    if (!canDiscard()) return;

    const record = Data.get(id);
    if (!record) {
      loadRecords();
      return;
    }

    state.editingId = record.id;
    state.editingCategory = record;
    state.photos = (record.photos || []).map(entryFor);
    state.dirty = false;

    el.name.value = record.name;
    el.desc.value = record.description || "";
    el.formTitle.textContent = "Editar categoria";
    el.del.hidden = false;
    el.confirm.hidden = true;
    clearError();
    clearStatus();
    updateDescCount();
    renderSelection();
    syncLibrarySelection();
    updateSaveState();
    renderList();

    const missing = state.photos.filter((photo) => photo.missing).length;
    if (missing) {
      showError(
        `${missing} foto${missing === 1 ? "" : "s"} desta categoria não está${
          missing === 1 ? "" : "o"
        } mais em assets/Suzana.`
      );
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (state.saving || state.storageBlocked) return;

    clearError();
    clearStatus();
    const name = el.name.value.trim();
    if (!name) {
      showError("Dê um nome à categoria.");
      el.name.focus();
      return;
    }

    const duplicate = state.records.some(
      (cat) =>
        cat.id !== state.editingId &&
        norm(cat.name) === norm(name)
    );
    if (duplicate) {
      showError("Já existe uma categoria com esse nome.");
      el.name.focus();
      return;
    }

    const now = Date.now();
    const record = {
      id: state.editingId || makeId(),
      name,
      description: el.desc.value.trim(),
      photos: state.photos.map((photo) => photo.name),
      createdAt: state.editingCategory ? state.editingCategory.createdAt : now,
      updatedAt: now,
    };

    state.saving = true;
    updateSaveState();

    try {
      Data.save(record);
      state.editingId = record.id;
      state.editingCategory = record;
      state.dirty = false;
      el.formTitle.textContent = "Editar categoria";
      el.del.hidden = false;
      el.confirm.hidden = true;
      loadRecords();
      const n = record.photos.length;
      setStatus(
        n === 0
          ? "Categoria salva. Você pode adicionar fotos depois."
          : `Categoria salva com ${n} foto${n === 1 ? "" : "s"}, nesta ordem.`
      );
      document.dispatchEvent(
        new CustomEvent("sg:archive-changed", {
          detail: { action: "save", id: record.id },
        })
      );
    } catch (error) {
      showError(friendlyError(error));
    } finally {
      state.saving = false;
      updateSaveState();
    }
  }

  function askDelete() {
    if (!state.editingId) return;
    el.confirmName.textContent = el.name.value.trim() || "esta categoria";
    const count = state.photos.length;
    el.confirmTail.textContent =
      count === 0
        ? "A categoria não tem fotos."
        : count === 1
          ? "A lista de 1 foto será removida; o arquivo continua em assets/Suzana."
          : `A lista de ${count} fotos será removida; os arquivos continuam em assets/Suzana.`;
    el.confirm.hidden = false;
    el.cancelDelete.focus();
  }

  function deleteCurrent() {
    if (!state.editingId || state.saving) return;
    state.saving = true;
    updateSaveState();
    el.confirmDelete.disabled = true;
    try {
      const id = state.editingId;
      Data.remove(id);
      loadRecords();
      resetForm({ focus: true });
      setStatus("Categoria excluída.");
      document.dispatchEvent(
        new CustomEvent("sg:archive-changed", {
          detail: { action: "delete", id },
        })
      );
    } catch (error) {
      showError(friendlyError(error));
    } finally {
      state.saving = false;
      el.confirmDelete.disabled = false;
      updateSaveState();
    }
  }

  /* ---------- abrir / fechar ---------- */

  function openArchive() {
    if (dialog.open) return;
    ensureLibrary();
    el.search.value = "";
    applyLibraryFilter();
    resetForm({ focus: false });
    loadRecords();
    dialog.showModal();
    el.origin.textContent = location.host
      ? `Salvo em ${location.host}.`
      : "Salvo neste navegador, neste arquivo.";
    requestAnimationFrame(() => el.name.focus());
  }

  function closeArchive() {
    if (!canDiscard()) return;
    dialog.close();
  }

  /* ---------- eventos ---------- */

  $("#newCategory").addEventListener("click", openArchive);
  el.close.addEventListener("click", closeArchive);
  el.exportBtn.addEventListener("click", exportData);
  el.exportBtnFooter.addEventListener("click", exportData);
  el.newBtn.addEventListener("click", () => {
    if (!canDiscard()) return;
    resetForm({ focus: true });
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeArchive();
  });
  dialog.addEventListener("cancel", (event) => {
    if (!canDiscard()) event.preventDefault();
  });
  dialog.addEventListener("close", () => {
    resetForm({ focus: false });
    document.dispatchEvent(new CustomEvent("sg:archive-closed"));
  });

  el.form.addEventListener("submit", handleSubmit);
  el.name.addEventListener("input", () => {
    state.dirty = true;
    clearStatus();
  });
  el.desc.addEventListener("input", () => {
    state.dirty = true;
    clearStatus();
    updateDescCount();
  });
  el.search.addEventListener("input", applyLibraryFilter);
  el.clearSelection.addEventListener("click", clearSelection);
  el.del.addEventListener("click", askDelete);
  el.cancelDelete.addEventListener("click", () => {
    el.confirm.hidden = true;
    el.del.focus();
  });
  el.confirmDelete.addEventListener("click", deleteCurrent);

  if (!Data.supported()) {
    state.storageBlocked = true;
    showError("Este navegador não permite salvar o acervo local.");
  }

  updateDescCount();
  updateSaveState();
})();
