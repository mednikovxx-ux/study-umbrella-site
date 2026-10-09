/* Доступ администраторов.
   ВЛАДЕЛЕЦ задаётся здесь и не может быть удалён или изменён из кабинета.
   Впишите свой Telegram (@username) и/или телефон и почту — по ним кабинет узнает владельца.
   Других администраторов владелец добавляет сам в кабинете: «Администраторы → Добавить».
   ВАЖНО: в рабочей версии эта проверка должна выполняться на сервере — код на сайте
   виден всем, поэтому настоящая защита появится вместе с базой и сервером. */
import { storage } from "./storage.js";

/* Контакты владельца и закреплённых администраторов лежат в owner.local.js:
   этот файл не попадает в репозиторий. Шаблон — owner.example.js
   (при первой сборке копируется автоматически). */
import { OWNER, FIXED_ADMINS } from "./owner.local.js";
export { OWNER, FIXED_ADMINS };

const KEY = "su-admins-v1";
export const norm = (c) => {
  const s = String(c || "").trim().toLowerCase();
  if (!s) return "";
  if (s.startsWith("@")) return s;
  if (s.includes("@")) return s;
  const d = s.replace(/\D/g, "");
  if (d.length >= 10) return "+7" + d.slice(-10);
  return "@" + s.replace(/^@/, "");
};

export async function loadAdmins() {
  try { const r = await storage.get(KEY, true); return JSON.parse(r.value) || []; } catch (e) { return []; }
}
export async function saveAdmins(list) {
  try { await storage.set(KEY, JSON.stringify(list), true); } catch (e) {}
}
const ownerKeys = () => [OWNER.telegram, OWNER.phone, OWNER.email].map(norm).filter(Boolean);

/* Возвращает { isAdmin, isOwner, name } для введённого контакта */
export async function whoIs(contact) {
  const c = norm(contact);
  if (!c) return { isAdmin: false, isOwner: false };
  if (ownerKeys().includes(c)) return { isAdmin: true, isOwner: true, name: OWNER.name };
  const admins = [...FIXED_ADMINS, ...(await loadAdmins())];
  const a = admins.find((x) => (x.contacts || []).map(norm).includes(c));
  return a ? { isAdmin: true, isOwner: false, name: a.name } : { isAdmin: false, isOwner: false };
}
