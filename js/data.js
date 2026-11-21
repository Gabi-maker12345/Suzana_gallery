/* =========================================================
   Categorias — armazenamento leve em localStorage
   Salva só nome, descrição e a ordem dos arquivos de foto.
   API: window.SuzanaArchiveData
   ========================================================= */

(() => {
  "use strict";

  const KEY = "suzana-galeria-categorias-v1";

  function normalize(record) {
    if (!record || typeof record !== "object") return null;
    const id = typeof record.id === "string" ? record.id : null;
    const name = typeof record.name === "string" ? record.name.trim() : "";
    if (!id || !name) return null;
    const photos = Array.isArray(record.photos)
      ? record.photos.filter((p) => typeof p === "string" && p.trim())
      : [];
    return {
      id,
      name,
      description: typeof record.description === "string" ? record.description : "",
      photos,
      createdAt: Number(record.createdAt) || Date.now(),
      updatedAt: Number(record.updatedAt) || Date.now(),
    };
  }

  function read() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (!Array.isArray(raw)) return [];
      return raw.map(normalize).filter(Boolean);
    } catch {
      return [];
    }
  }

  function write(records) {
    localStorage.setItem(KEY, JSON.stringify(records));
    document.dispatchEvent(
      new CustomEvent("sg:archive-data-changed", { detail: { count: records.length } })
    );
  }

  function supported() {
    try {
      const probe = `${KEY}__probe`;
      localStorage.setItem(probe, "1");
      localStorage.removeItem(probe);
      return true;
    } catch {
      return false;
    }
  }

  function list() {
    return read();
  }

  function get(id) {
    return read().find((record) => record.id === id) || null;
  }

  function save(record) {
    const next = normalize(record);
    if (!next) throw new Error("Registro de categoria inválido.");
    const records = read();
    const index = records.findIndex((item) => item.id === next.id);
    if (index >= 0) records[index] = next;
    else records.push(next);
    write(records);
    return next;
  }

  function remove(id) {
    const records = read().filter((record) => record.id !== id);
    write(records);
  }

  window.SuzanaArchiveData = {
    key: KEY,
    supported,
    list,
    get,
    save,
    remove,
  };
})();
