/* Дополнения кабинета: общая библиотека материалов по предметам, сводка
   прогресса ученика, вызов администратора, запросы на оплату и смайлы в чате.
   Данные хранятся отдельными ключами (su-library-v1, su-calls-v1, su-payreq-v1). */
import React, { useState } from "react";
import { BookOpen, Check, CreditCard, ExternalLink, Hand, Pencil, Plus, Smile, Trash2, X } from "lucide-react";

const uid = (p) => p + "_" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const fmtDT = (iso) => iso ? new Date(iso).toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "";
const fmtD = (ymd) => new Date(ymd + "T12:00:00").toLocaleDateString("ru-RU", { weekday: "short", day: "2-digit", month: "short" });
const rub = (n) => Math.round(n || 0).toLocaleString("ru-RU") + " ₽";
const plural = (n, one, few, many) => { const a = Math.abs(n) % 100, b = a % 10; return a > 10 && a < 20 ? many : b === 1 ? one : b >= 2 && b <= 4 ? few : many; };
const lessonsWord = (n) => n + " " + plural(n, "занятие", "занятия", "занятий");

/* ------------------------------ smileys ------------------------------ */

export const EMOJI_SET = ["😊", "😂", "🥰", "😍", "🤩", "😎", "🤔", "😅", "😢", "😮", "🙏", "👍", "👎", "👏", "🙌", "💪", "🔥", "⭐", "🎉", "❤️", "💯", "✅", "❌", "❓", "📚", "✍️", "📝", "🎓", "⏰", "📅", "☂️", "🌞"];
export const QUICK_REACTIONS = ["👍", "❤️", "😂", "🔥", "🎉", "🙏", "✅", "❓"];

export function EmojiPicker({ onPick, label = "Смайлы" }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="emoji-wrap">
      <button type="button" className="btn-icon ghost" title={label} aria-label={label} aria-expanded={open} onClick={() => setOpen((v) => !v)}><Smile size={16} /></button>
      {open && (
        <div className="emoji-pop" role="dialog" aria-label="Выберите смайл">
          {EMOJI_SET.map((e) => <button type="button" key={e} className="emoji-btn" onClick={() => { onPick(e); setOpen(false); }}>{e}</button>)}
        </div>
      )}
    </span>
  );
}

/* ------------------------------ package ------------------------------ */

// How many lessons of the current package are used and left.
export function packageStats(student, slots) {
  const t = today();
  const used = (slots || []).filter((sl) =>
    sl.studentId === student.id && sl.type === "regular" && sl.status !== "cancelled" && sl.date < t &&
    (!student.packageAssignedAt || sl.date >= student.packageAssignedAt)
  ).length;
  const total = student.packageTotal || 0;
  return { total, used: Math.min(used, total || used), left: total ? Math.max(0, total - used) : null };
}

/* -------------------------- student overview ------------------------- */

const ST = { done: "Пройдено", in_progress: "В работе", todo: "Впереди" };

export function StudentOverview({ student, teacher, subjMeta, slots, payRequests, onPay, onPayAction }) {
  const pk = packageStats(student, slots);
  const t = today();
  const next = (slots || []).filter((sl) => sl.studentId === student.id && sl.status === "booked" && sl.date >= t).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
  const topics = [
    ...(student.grammarTopics || []).map((x) => ({ ...x, group: subjMeta.grammarLabel })),
    ...(student.vocabTopics || []).map((x) => ({ ...x, group: subjMeta.vocabLabel })),
    ...(student.examTopics || []).map((x) => ({ ...x, group: "Экзамен" })),
  ];
  const by = (s) => topics.filter((x) => (x.status || "todo") === s);
  const hw = student.homework || [];
  const hwOpen = hw.filter((h) => h.status === "assigned" || h.status === "needs_revision" || !h.status);
  const hwDone = hw.filter((h) => h.status === "submitted" || h.status === "in_review" || h.status === "reviewed");
  const lastChk = [...(student.checkpoints || [])].sort((a, b) => (b.date || "").localeCompare(a.date || ""))[0];
  const myReq = (payRequests || []).filter((r) => r.studentId === student.id && r.status !== "confirmed" && r.status !== "rejected" && r.status !== "cancelled");
  const pct = topics.length ? Math.round((by("done").length + by("in_progress").length * 0.5) / topics.length * 100) : 0;

  return (
    <div className="ov">
      <div className="ov-grid">
        <div className="ov-card">
          <div className="ov-label">📦 Пакет</div>
          {pk.total ? <>
            <div className="ov-big">{pk.left} <span>из {pk.total} осталось</span></div>
            <div className="progress-track"><div className="progress-fill" style={{ width: Math.round(pk.used / pk.total * 100) + "%" }} /></div>
            <div className="ov-note">Пройдено {lessonsWord(pk.used)}{student.packageLabel ? " · " + student.packageLabel : ""}</div>
          </> : <div className="ov-note">Пакет не оформлен: занятия оплачиваются по одному.</div>}
          {pk.total > 0 && pk.left <= 1 && <div className="ov-warn">{pk.left === 0 ? "Занятия в пакете закончились" : "Осталось последнее занятие"}: самое время продлить.</div>}
          <button className="btn-small accent" style={{ marginTop: 10 }} onClick={onPay}><CreditCard size={13} /> Оплатить / продлить</button>
        </div>
        <div className="ov-card">
          <div className="ov-label">📅 Следующий урок</div>
          {next ? <>
            <div className="ov-big">{fmtD(next.date)} <span>в {next.time}</span></div>
            <div className="ov-note">{teacher.name}{next.topicsCovered?.length ? " · " + next.topicsCovered.join(", ") : ""}</div>
            {next.meetingLink && <a className="btn-small" style={{ marginTop: 10 }} href={next.meetingLink} target="_blank" rel="noopener"><ExternalLink size={13} /> Ссылка на урок</a>}
          </> : <div className="ov-note">Урок пока не назначен. Преподаватель поставит его в расписание.</div>}
        </div>
        <div className="ov-card">
          <div className="ov-label">📝 Домашние задания</div>
          <div className="ov-big">{hwDone.length} <span>из {hw.length} сдано</span></div>
          <div className="ov-note">{hwOpen.length ? "Ждут выполнения: " + hwOpen.length : "Все задания сданы 🎉"}</div>
          {lastChk && <div className="ov-note">Последняя проверка: {lastChk.title} — <b>{lastChk.achievedScore}/{lastChk.maxScore}</b></div>}
        </div>
      </div>

      {myReq.length > 0 && (
        <div className="ov-pay">
          {myReq.map((r) => (
            <div className="ov-pay-row" key={r.id}>
              <div><b>💳 {r.label}</b> · {rub(r.amount)} <span className="muted-text">· запрос от {fmtDT(r.at)}</span>
                <div className="ov-note">{{ new: "Ждём ссылку на оплату от администратора.", link_sent: "Ссылка на оплату готова. После оплаты нажмите «Я оплатил(а)».", paid: "Вы сообщили об оплате. Администратор проверит поступление и подтвердит." }[r.status]}</div>
              </div>
              <div className="row-gap">
                {r.status === "link_sent" && r.link && <a className="btn-small accent" href={r.link} target="_blank" rel="noopener"><CreditCard size={13} /> Оплатить</a>}
                {(r.status === "link_sent" || r.status === "new") && <button className="btn-small" onClick={() => onPayAction(r.id, "paid")}><Check size={13} /> Я оплатил(а)</button>}
                {r.status !== "paid" && <button className="btn-small" onClick={() => onPayAction(r.id, "cancelled")}>Отменить</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="ov-card ov-topics">
        <div className="row-gap" style={{ justifyContent: "space-between" }}>
          <div className="ov-label">🧭 Программа: что пройдено и что дальше</div>
          <div className="ov-pct">{pct}%</div>
        </div>
        <div className="progress-track" style={{ margin: "6px 0 14px" }}><div className="progress-fill" style={{ width: pct + "%" }} /></div>
        {topics.length === 0 ? <div className="ov-note">Преподаватель ещё не составил программу. Она появится здесь после первых занятий.</div> : (
          <div className="ov-cols">
            {["done", "in_progress", "todo"].map((s) => (
              <div key={s} className={"ov-col st-" + s}>
                <div className="ov-col-head">{s === "done" ? "✅" : s === "in_progress" ? "◐" : "○"} {ST[s]} <span>{by(s).length}</span></div>
                {by(s).length === 0 ? <div className="ov-note">—</div> : by(s).map((x, i) => <div className="ov-topic" key={i}>{x.name}<span>{x.group}</span></div>)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------------- payment request -------------------------- */

export function PayRequestModal({ student, products, subject, onSubmit, onClose }) {
  const opts = (products || []).filter((p) => p.subject === subject && p.price > 0).sort((a, b) => a.lessonsIncluded - b.lessonsIncluded);
  const [pick, setPick] = useState(opts.find((p) => p.lessonsIncluded === 8)?.id || opts[0]?.id || "");
  const [note, setNote] = useState("");
  const p = opts.find((x) => x.id === pick);
  return (
    <Modal title="Оплатить или продлить" onClose={onClose}>
      <p className="hint-text">Выберите вариант. Администратор пришлёт ссылку на оплату сюда, в кабинет, а после оплаты занятия добавятся в ваш пакет.</p>
      <div className="pay-opts">
        {opts.map((o) => (
          <label key={o.id} className={"pay-opt" + (pick === o.id ? " on" : "")}>
            <input type="radio" name="pk" checked={pick === o.id} onChange={() => setPick(o.id)} />
            <span>{o.lessonsIncluded ? "Пакет " + lessonsWord(o.lessonsIncluded) : "Одно занятие"}</span>
            <b>{rub(o.price)}</b>
          </label>
        ))}
      </div>
      <textarea className="mini-input wide" rows={2} placeholder="Комментарий (необязательно): например, «занимаюсь по прежним ценам»" value={note} onChange={(e) => setNote(e.target.value)} />
      <div className="row-gap" style={{ marginTop: 10, justifyContent: "flex-end" }}>
        <button className="btn-small" onClick={onClose}>Отмена</button>
        <button className="btn-small accent" disabled={!p} onClick={() => onSubmit({ productId: p.id, lessons: p.lessonsIncluded || 1, label: p.lessonsIncluded ? "Пакет " + lessonsWord(p.lessonsIncluded) : "Одно занятие", amount: p.price, note: note.trim() })}><CreditCard size={13} /> Запросить оплату</button>
      </div>
    </Modal>
  );
}

/* ----------------------------- admin call ----------------------------- */

const CALL_REASONS = { student: ["Оплата", "Перенос или расписание", "Сменить преподавателя", "Не работает ссылка или кабинет", "Другое"], teacher: ["Ученик пропал или не оплачивает", "Расписание и замены", "Оплата и выплаты", "Техническая проблема", "Другое"] };

export function CallAdminButton({ role, calls, fromId, onCall }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const mine = (calls || []).filter((c) => c.fromId === fromId && c.status === "open");
  return (
    <>
      <button className="call-btn" onClick={() => { setOpen(true); setSent(false); }} title="Позвать администратора" aria-label="Позвать администратора"><Hand size={15} /> <span className="call-txt">Позвать администратора</span>{mine.length ? <span className="call-dot">{mine.length}</span> : null}</button>
      {open && (
        <Modal title="Позвать администратора" onClose={() => setOpen(false)}>
          {sent ? <>
            <p className="body-text">✅ Администратор получил ваш вызов и ответит в разделе {role === "student" ? "«Поддержка»" : "«Администрация»"}.</p>
            <div className="row-gap" style={{ justifyContent: "flex-end" }}><button className="btn-small accent" onClick={() => setOpen(false)}>Хорошо</button></div>
          </> : <>
            <div className="field-label">По какому вопросу?</div>
            <div className="row-gap" style={{ flexWrap: "wrap", marginBottom: 10 }}>
              {CALL_REASONS[role].map((r) => <button key={r} className={"btn-small" + (reason === r ? " accent" : "")} onClick={() => setReason(r)}>{r}</button>)}
            </div>
            <textarea className="mini-input wide" rows={3} placeholder="Опишите коротко, что случилось (необязательно)" value={text} onChange={(e) => setText(e.target.value)} />
            {mine.length > 0 && <p className="hint-text">У вас уже есть открытый вызов от {fmtDT(mine[0].at)}: администратор его видит.</p>}
            <div className="row-gap" style={{ marginTop: 10, justifyContent: "flex-end" }}>
              <button className="btn-small" onClick={() => setOpen(false)}>Отмена</button>
              <button className="btn-small accent" disabled={!reason} onClick={() => { onCall({ reason, text: text.trim() }); setSent(true); setReason(""); setText(""); }}><Hand size={13} /> Позвать</button>
            </div>
          </>}
        </Modal>
      )}
    </>
  );
}

/* ------------------------------ admin inbox ------------------------------ */

export function AdminInbox({ calls, payRequests, students, teachers, onResolveCall, onPayAction }) {
  const open = (calls || []).filter((c) => c.status === "open").sort((a, b) => b.at.localeCompare(a.at));
  const reqs = (payRequests || []).filter((r) => r.status === "new" || r.status === "link_sent" || r.status === "paid").sort((a, b) => (a.status === "paid" ? -1 : 1) - (b.status === "paid" ? -1 : 1) || b.at.localeCompare(a.at));
  const [links, setLinks] = useState({});
  const nameOf = (c) => c.fromRole === "teacher" ? (teachers.find((t) => t.id === c.fromId)?.name || "Преподаватель") : (students.find((s) => s.id === c.fromId)?.name || "Ученик");
  if (!open.length && !reqs.length) return <div className="inbox-empty">✅ Новых вызовов и запросов на оплату нет</div>;
  return (
    <div className="inbox">
      {open.length > 0 && (
        <div className="inbox-col">
          <div className="inbox-head">🙋 Вызовы администратора <span>{open.length}</span></div>
          {open.map((c) => (
            <div className="inbox-item urgent" key={c.id}>
              <div><b>{nameOf(c)}</b> <span className="pill-mini">{c.fromRole === "teacher" ? "преподаватель" : "ученик"}</span> <span className="muted-text">· {fmtDT(c.at)}</span></div>
              <div className="body-text"><b>{c.reason}</b>{c.text ? ": " + c.text : ""}</div>
              <div className="hint-text">Ответить можно во вкладке «Сообщения»: вызов уже там.</div>
              <button className="btn-small accent" onClick={() => onResolveCall(c.id)}><Check size={13} /> Вопрос решён</button>
            </div>
          ))}
        </div>
      )}
      {reqs.length > 0 && (
        <div className="inbox-col">
          <div className="inbox-head">💳 Запросы на оплату <span>{reqs.length}</span></div>
          {reqs.map((r) => {
            const s = students.find((x) => x.id === r.studentId);
            return (
              <div className={"inbox-item" + (r.status === "paid" ? " urgent" : "")} key={r.id}>
                <div><b>{s?.name || "Ученик"}</b> <span className="muted-text">· {fmtDT(r.at)}</span></div>
                <div className="body-text">{r.label} · <b>{rub(r.amount)}</b>{r.note ? <span className="muted-text"> · «{r.note}»</span> : null}</div>
                <div className="hint-text">{{ new: "Нужно отправить ссылку на оплату.", link_sent: "Ссылка отправлена, ждём оплату.", paid: "Ученик сообщил, что оплатил. Проверьте поступление и подтвердите." }[r.status]}</div>
                {r.status === "new" && (
                  <div className="row-gap">
                    <input className="mini-input wide" placeholder="Ссылка на оплату https://…" value={links[r.id] || ""} onChange={(e) => setLinks({ ...links, [r.id]: e.target.value })} />
                    <button className="btn-small accent" disabled={!/^https?:\/\//.test(links[r.id] || "")} onClick={() => onPayAction(r.id, "link_sent", { link: links[r.id] })}>Отправить</button>
                  </div>
                )}
                <div className="row-gap" style={{ marginTop: 6 }}>
                  <button className="btn-small accent" onClick={() => onPayAction(r.id, "confirmed")}><Check size={13} /> Оплата получена: +{lessonsWord(r.lessons)}</button>
                  <button className="btn-small" onClick={() => onPayAction(r.id, "rejected")}>Отклонить</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ library ------------------------------ */

const KINDS = ["Учебник", "Рабочая тетрадь", "Видео и аудио", "Тесты и варианты", "Шпаргалка и теория", "Другое"];

function readFile(file) {
  return new Promise((res, rej) => {
    if (file.size > 3 * 1024 * 1024) return rej(new Error("Файл больше 3 МБ. Загрузите его в облако и добавьте ссылкой."));
    const r = new FileReader(); r.onload = () => res({ name: file.name, type: file.type, dataUrl: r.result }); r.onerror = () => rej(r.error); r.readAsDataURL(file);
  });
}

export function LibraryPanel({ items, subjects, subjectMeta, canEdit, author, onAdd, onUpdate, onRemove, title = "Общая библиотека материалов", hint }) {
  const [subj, setSubj] = useState(subjects.length === 1 ? subjects[0] : "all");
  const [q, setQ] = useState("");
  const [form, setForm] = useState(null);
  const [err, setErr] = useState("");
  const [armed, setArmed] = useState(null);
  const shown = (items || []).filter((m) => subjects.includes(m.subject) && (subj === "all" || m.subject === subj) && (!q || (m.title + " " + (m.note || "")).toLowerCase().includes(q.toLowerCase())));
  const groups = subjects.filter((s) => subj === "all" || s === subj).map((s) => ({ s, list: shown.filter((m) => m.subject === s) }));
  const blank = () => ({ subject: subj !== "all" ? subj : subjects.find((s) => canEdit(s)) || subjects[0], kind: KINDS[0], title: "", note: "", url: "", file: null });
  const save = () => {
    if (!form.title.trim()) return setErr("Напишите название");
    if (form.url && !/^https?:\/\//.test(form.url)) return setErr("Ссылка должна начинаться с https://");
    const data = { subject: form.subject, kind: form.kind, title: form.title.trim(), note: form.note.trim(), url: form.url.trim(), file: form.file };
    if (form.id) onUpdate(form.id, data); else onAdd({ id: uid("lib"), ...data, author, at: new Date().toISOString() });
    setForm(null); setErr("");
  };
  const anyEdit = subjects.some((s) => canEdit(s));

  return (
    <div className="lib">
      <div className="row-gap" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <div>
          <h3 className="lib-title"><BookOpen size={17} /> {title}</h3>
          <div className="hint-text">{hint || (anyEdit ? "Материалы общие для всех учеников предмета. Добавлять и править могут преподаватели предмета и администратор." : "Материалы от ваших преподавателей: учебники, видео, варианты и шпаргалки.")}</div>
        </div>
        {anyEdit && !form && <button className="btn-small accent" onClick={() => { setForm(blank()); setErr(""); }}><Plus size={13} /> Добавить материал</button>}
      </div>

      {subjects.length > 1 && (
        <div className="row-gap lib-filter">
          <button className={"btn-small" + (subj === "all" ? " accent" : "")} onClick={() => setSubj("all")}>Все предметы</button>
          {subjects.map((s) => <button key={s} className={"btn-small" + (subj === s ? " accent" : "")} onClick={() => setSubj(s)}>{subjectMeta[s].emoji} {subjectMeta[s].label} <span className="muted-text">{(items || []).filter((m) => m.subject === s).length}</span></button>)}
        </div>
      )}
      <input className="mini-input wide lib-search" placeholder="Поиск по названию" value={q} onChange={(e) => setQ(e.target.value)} />

      {form && (
        <div className="add-panel lib-form">
          <div className="row-gap" style={{ flexWrap: "wrap" }}>
            <select className="mini-select" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
              {subjects.filter((s) => canEdit(s)).map((s) => <option key={s} value={s}>{subjectMeta[s].emoji} {subjectMeta[s].label}</option>)}
            </select>
            <select className="mini-select" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>{KINDS.map((k) => <option key={k}>{k}</option>)}</select>
          </div>
          <input className="mini-input wide" placeholder="Название, например «Сборник ЕГЭ 2026, Котова»" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="mini-input wide" placeholder="Комментарий: для кого, какие страницы, уровень" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          <input className="mini-input wide" placeholder="Ссылка (Яндекс Диск, видео, документ)" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          <div className="row-gap">
            <label className="btn-small">📎 {form.file ? form.file.name : "Прикрепить файл (до 3 МБ)"}
              <input type="file" style={{ display: "none" }} onChange={async (e) => { const f = e.target.files[0]; e.target.value = ""; if (!f) return; try { setForm({ ...form, file: await readFile(f) }); setErr(""); } catch (x) { setErr(x.message); } }} />
            </label>
            {form.file && <button className="btn-small" onClick={() => setForm({ ...form, file: null })}>Убрать файл</button>}
          </div>
          {err && <div className="lib-err">{err}</div>}
          <div className="row-gap" style={{ justifyContent: "flex-end" }}>
            <button className="btn-small" onClick={() => { setForm(null); setErr(""); }}>Отмена</button>
            <button className="btn-small accent" onClick={save}><Check size={13} /> {form.id ? "Сохранить" : "Добавить"}</button>
          </div>
        </div>
      )}

      {groups.map(({ s, list }) => (
        <div key={s} className="lib-group">
          {subjects.length > 1 && <div className="lib-subj">{subjectMeta[s].emoji} {subjectMeta[s].label}</div>}
          {list.length === 0 ? <div className="muted-text lib-empty">{q ? "Ничего не нашлось" : "Материалов пока нет"}</div> : (
            <div className="lib-list">
              {KINDS.filter((k) => list.some((m) => m.kind === k)).map((k) => (
                <div key={k}>
                  <div className="lib-kind">{k}</div>
                  {list.filter((m) => m.kind === k).map((m) => (
                    <div className="lib-item" key={m.id}>
                      <div className="lib-main">
                        <div className="lib-name">{m.url ? <a href={m.url} target="_blank" rel="noopener">{m.title} <ExternalLink size={12} /></a> : m.title}</div>
                        {m.note && <div className="hint-text">{m.note}</div>}
                        {m.file && <a className="lib-file" href={m.file.dataUrl} download={m.file.name}>📎 {m.file.name}</a>}
                        <div className="lib-meta">{m.author ? "Добавил(а): " + m.author + " · " : ""}{fmtDT(m.at)}</div>
                      </div>
                      {canEdit(m.subject) && (
                        <div className="row-gap">
                          <button className="btn-icon ghost" title="Изменить" onClick={() => { setForm({ ...m }); setErr(""); }}><Pencil size={14} /></button>
                          {armed === m.id
                            ? <><button className="btn-small danger" onClick={() => { onRemove(m.id); setArmed(null); }}>Удалить</button><button className="btn-small" onClick={() => setArmed(null)}>Нет</button></>
                            : <button className="btn-icon ghost" title="Удалить" onClick={() => setArmed(m.id)}><Trash2 size={14} /></button>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* -------------------------------- modal -------------------------------- */

export function Modal({ title, children, onClose }) {
  return (
    <div className="su-modal-bg" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}>
      <div className="su-modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="row-gap" style={{ justifyContent: "space-between", marginBottom: 10 }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button className="btn-icon ghost" aria-label="Закрыть" onClick={onClose}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const seedLibrary = [
  { id: "lib1", subject: "social", kind: "Тесты и варианты", title: "Открытый банк заданий ЕГЭ (ФИПИ)", note: "Официальные задания по обществознанию, все типы.", url: "https://fipi.ru/ege/otkrytyy-bank-zadaniy-ege", file: null, author: "Администрация", at: "2026-10-01T10:00:00.000Z" },
  { id: "lib2", subject: "history", kind: "Тесты и варианты", title: "Открытый банк заданий ЕГЭ по истории (ФИПИ)", note: "", url: "https://fipi.ru/ege/otkrytyy-bank-zadaniy-ege", file: null, author: "Администрация", at: "2026-10-01T10:00:00.000Z" },
  { id: "lib3", subject: "english", kind: "Видео и аудио", title: "BBC Learning English", note: "Короткие видео по грамматике и лексике, уровни A2–B2.", url: "https://www.bbc.co.uk/learningenglish", file: null, author: "Администрация", at: "2026-10-01T10:00:00.000Z" },
];

export const EXTRA_CSS = `
.emoji-wrap { position:relative; display:inline-flex; }
.btn-icon.ghost { background:transparent; color:var(--ink); border:1.5px solid var(--line, #e2dccf); }
.emoji-pop { position:absolute; bottom:calc(100% + 6px); right:0; z-index:30; background:#fff; border:1.5px solid var(--ink); border-radius:16px; padding:8px; display:grid; grid-template-columns:repeat(8, 32px); gap:2px; box-shadow:0 18px 30px -18px rgba(30,43,47,.5); }
.emoji-btn { width:32px; height:32px; border:0; background:transparent; border-radius:8px; font-size:19px; cursor:pointer; }
.emoji-btn:hover { background:#f3eee4; }
.react-open { border:0; background:transparent; opacity:.45; cursor:pointer; padding:2px 4px; font-size:14px; align-self:center; }
.chat-row:hover .react-open, .react-open:focus-visible { opacity:1; }
.ov { display:flex; flex-direction:column; gap:14px; margin-bottom:18px; }
.ov-grid { display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:14px; }
.ov-card { background:#fff; border:1.5px solid var(--line, #e2dccf); border-radius:20px; padding:16px 18px; }
.ov-label { font:700 12px var(--font-ui, sans-serif); text-transform:uppercase; letter-spacing:.04em; color:#6b6a63; margin-bottom:8px; }
.ov-big { font:700 28px/1.1 var(--font-display, serif); margin-bottom:8px; }
.ov-big span { font:500 14px var(--font-ui, sans-serif); color:#6b6a63; }
.ov-note { font-size:13px; color:#55544d; margin-top:6px; }
.ov-warn { margin-top:8px; font-size:13px; font-weight:600; color:#B8303C; }
.ov-pct { font:700 20px var(--font-display, serif); }
.ov-cols { display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:12px; }
.ov-col { border-radius:14px; padding:10px 12px; background:#f6f2ea; }
.ov-col.st-done { background:#e3efee; }
.ov-col.st-in_progress { background:#fbf1d3; }
.ov-col-head { font-weight:700; font-size:14px; margin-bottom:6px; display:flex; gap:6px; align-items:center; }
.ov-col-head span { margin-left:auto; font-size:12px; background:#fff; border-radius:999px; padding:1px 8px; }
.ov-topic { font-size:13px; padding:6px 0; border-top:1px solid rgba(30,43,47,.08); display:flex; flex-direction:column; }
.ov-topic span { font-size:11px; color:#7a786f; }
.ov-pay { display:flex; flex-direction:column; gap:8px; }
.ov-pay-row { display:flex; gap:12px; justify-content:space-between; align-items:center; flex-wrap:wrap; background:#fbf1d3; border-radius:16px; padding:12px 16px; }
.call-btn { display:inline-flex; align-items:center; gap:6px; border:1.5px solid #B8303C; color:#B8303C; background:#fff; border-radius:999px; padding:7px 14px; font:600 13px var(--font-ui, sans-serif); cursor:pointer; position:relative; }
.call-btn:hover { background:#B8303C; color:#fff; }
.call-dot { background:#B8303C; color:#fff; border-radius:999px; font-size:11px; padding:0 6px; margin-left:2px; }
.su-modal-bg { position:fixed; inset:0; background:rgba(30,43,47,.45); display:grid; place-items:center; z-index:100; padding:16px; }
.su-modal { background:#fff; border-radius:24px; padding:22px; width:min(520px, 100%); max-height:90vh; overflow:auto; display:flex; flex-direction:column; gap:8px; }
.pay-opts { display:flex; flex-direction:column; gap:6px; margin:6px 0 10px; }
.pay-opt { display:flex; align-items:center; gap:10px; border:1.5px solid var(--line, #e2dccf); border-radius:14px; padding:10px 14px; cursor:pointer; }
.pay-opt.on { border-color:var(--ink); background:#f6f2ea; }
.pay-opt b { margin-left:auto; }
.inbox { display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:14px; margin-bottom:18px; }
.inbox-empty { margin-bottom:14px; font-size:13px; color:#55544d; }
.inbox-head { font:700 16px var(--font-display, serif); margin-bottom:8px; display:flex; gap:8px; align-items:center; }
.inbox-head span { background:#B8303C; color:#fff; border-radius:999px; font:700 12px var(--font-ui, sans-serif); padding:2px 9px; }
.inbox-item { background:#fff; border:1.5px solid var(--line, #e2dccf); border-radius:18px; padding:12px 14px; display:flex; flex-direction:column; gap:6px; margin-bottom:8px; }
.inbox-item.urgent { border-color:#B8303C; }
.pill-mini { font-size:11px; background:#f3eee4; border-radius:999px; padding:1px 8px; }
.lib { display:flex; flex-direction:column; gap:12px; }
.lib-title { display:flex; align-items:center; gap:8px; margin:0 0 4px; }
.lib-filter { flex-wrap:wrap; }
.lib-search { max-width:360px; }
.lib-form { display:flex; flex-direction:column; gap:8px; }
.lib-err { color:#B8303C; font-size:13px; }
.lib-subj { font:700 17px var(--font-display, serif); margin:6px 0; }
.lib-kind { font:700 11px var(--font-ui, sans-serif); text-transform:uppercase; letter-spacing:.05em; color:#7a786f; margin:10px 0 4px; }
.lib-item { display:flex; gap:12px; justify-content:space-between; align-items:flex-start; background:#fff; border:1.5px solid var(--line, #e2dccf); border-radius:14px; padding:10px 14px; margin-bottom:6px; }
.lib-name { font-weight:600; }
.lib-name a { color:inherit; }
.lib-file { font-size:13px; display:inline-block; margin-top:4px; }
.lib-meta { font-size:11px; color:#8a887f; margin-top:4px; }
.lib-empty { padding:4px 0 8px; }
@media (max-width: 1500px) { .role-switch-label { display:none; } }
@media (max-width: 1280px) { .call-btn .call-txt { display:none; } }
@media (max-width: 900px) {
  .ov-grid, .ov-cols { grid-template-columns:minmax(0,1fr); }
  .call-btn { padding:7px 10px; }
}
`;
