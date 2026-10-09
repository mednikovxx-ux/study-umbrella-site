/* Хранилище кабинета.
   Сейчас: в claude.ai используется window.storage (как в исходном артефакте),
   на сайте — браузерное хранилище (демо, данные видит только этот браузер).
   При запуске: заменить browserStorage на запросы к API школы (сервер в РФ) —
   интерфейс тот же: get / set / list. */
const mem = {};
const ls = {
  get(k) { try { return window.localStorage.getItem(k); } catch (e) { return k in mem ? mem[k] : null; } },
  set(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { mem[k] = v; } },
  keys() { try { return Object.keys(window.localStorage); } catch (e) { return Object.keys(mem); } },
};
const browserStorage = {
  async get(key) { const v = ls.get(key); if (v === null || v === undefined) throw new Error("not found"); return { key, value: v }; },
  async set(key, value) { ls.set(key, value); return { key, value }; },
  async list(prefix) { return { keys: ls.keys().filter((k) => k.startsWith(prefix)) }; },
};
export const storage = (typeof window !== "undefined" && window.storage && typeof window.storage.get === "function") ? window.storage : browserStorage;
export const storageMode = storage === browserStorage ? "browser" : "shared";
