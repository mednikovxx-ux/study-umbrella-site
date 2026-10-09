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

export function StudentOverview({ student, teacher, subjMeta, slots, payRequests, onPay, onPayAction, ctx = {}, showProgram = true }) {
  const fmt = formatOf(student);
  const umb = fmt === "umbrella" ? umbrellaOf(ctx.umbrellas, student) : null;
  const um = umb ? umbrellaStats(umb, ctx.students || [], ctx.teachers || [], ctx.allSlots || slots, ctx.subjectMeta) : null;
  const grp = (fmt === "pair" || fmt === "group") ? groupOf(ctx.groups, student.id) : null;
  const pk = um ? { total: um.total, used: um.used, left: um.left } : packageStats(student, slots);
  // «Сам, но не один»: this week's lesson, task and written review.
  const wk = (() => { const d = new Date(); const mon = new Date(d); mon.setDate(d.getDate() - ((d.getDay() + 6) % 7)); const from = mon.toISOString().slice(0, 10); const to = new Date(mon.getTime() + 7 * 864e5).toISOString().slice(0, 10);
    const lesson = (slots || []).find((sl) => sl.studentId === student.id && sl.status !== "cancelled" && sl.date >= from && sl.date < to);
    const task = (student.homework || []).filter((h) => (h.createdAt || "") >= from).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))[0];
    return { lesson, task }; })();
  const t = today();
  const next = (slots || []).filter((sl) => sl.studentId === student.id && sl.status === "booked" && sl.date >= t).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
  const topics = [
    ...(student.grammarTopics || []).map((x) => ({ ...x, group: subjMeta.grammarLabel + (x.level ? " · " + x.level : "") })),
    ...(student.vocabTopics || []).map((x) => ({ ...x, group: subjMeta.vocabLabel })),
    ...(student.examTopics || []).map((x) => ({ ...x, group: "Экзамен" })),
  ];
  const by = (s) => topics.filter((x) => (x.status || "todo") === s);
  const hw = student.homework || [];
  const hwOpen = hw.filter((h) => h.status === "assigned" || h.status === "needs_revision" || h.status === "not_done" || !h.status);
  const hwDone = hw.filter((h) => h.status === "submitted" || h.status === "in_review" || h.status === "reviewed");
  const lastChk = [...(student.checkpoints || [])].sort((a, b) => (b.date || "").localeCompare(a.date || ""))[0];
  const myReq = (payRequests || []).filter((r) => r.studentId === student.id && r.status !== "confirmed" && r.status !== "rejected" && r.status !== "cancelled");
  const pct = topics.length ? Math.round((by("done").length + by("in_progress").length * 0.5) / topics.length * 100) : 0;

  return (
    <div className="ov">
      <div className="ov-card ov-fmt">
        <FormatBadge student={student} />
        <span className="ov-note" style={{ margin: 0 }}>{FORMATS[fmt].hint}</span>
        {um && <span className="ov-note" style={{ margin: 0 }}>В пакете: {um.rows.map((r) => r.emoji + " " + r.label).join(" + ")}</span>}
        {grp && <span className="ov-note" style={{ margin: 0 }}>{grp.name}: {scheduleText(grp)} · вместе с {(grp.studentIds || []).filter((id) => id !== student.id).map((id) => (ctx.students || []).find((s) => s.id === id)?.name.split(" ")[0]).filter(Boolean).join(", ") || "—"}</span>}
      </div>
      <div className="ov-grid">
        <div className="ov-card">
          <div className="ov-label">{fmt === "self" ? "☂️ Абонемент на месяц" : fmt === "umbrella" ? "🌂 Комплексный пакет" : "📦 Пакет"}</div>
          {pk.total ? <>
            <div className="ov-big">{pk.left} <span>из {pk.total} осталось</span></div>
            <div className="progress-track"><div className="progress-fill" style={{ width: Math.round(pk.used / pk.total * 100) + "%" }} /></div>
            <div className="ov-note">Пройдено {lessonsWord(pk.used)}{student.packageLabel && !um ? " · " + student.packageLabel : ""}</div>
            {um && <UmbrellaBreakdown st={um} mineId={student.id} />}
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

      {showProgram && <div className="ov-card ov-topics">
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
      </div>}
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

export const EXTRA_CSS_BASE = `
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
@media (max-width: 1700px) { .call-btn .call-txt { display:none; } }
@media (max-width: 1300px) {
  .header-titles { display:none !important; }
  .top-bar .mini-select { max-width:190px; }
  .site-link .site-txt { display:none; }
  .role-btn { padding:6px 10px !important; font-size:12px !important; }
}
.top-bar .logout-btn { white-space:nowrap; }
.student-item > .btn-icon.danger, .student-item > button.btn-icon { width:26px; height:26px; min-width:26px; opacity:0; transition:opacity .15s; align-self:flex-start; margin-top:4px; }
.student-item:hover > .btn-icon, .student-item.active > .btn-icon, .student-item > .btn-icon:focus-visible { opacity:.75; }
.student-item > .btn-icon.armed { opacity:1; }
.student-item-meta { flex-wrap:wrap; }
@media (max-width: 900px) {
  .ov-grid, .ov-cols { grid-template-columns:minmax(0,1fr); }
  .call-btn { padding:7px 10px; }
}
`;

/* ------------------------------ formats ------------------------------ */

export const FORMATS = {
  individual: { icon: "👤", label: "Индивидуально", hint: "Один на один с преподавателем, программа под цель. Пакеты 4/6/8/12 или разовые занятия." },
  self: { icon: "☂️", label: "«Сам, но не один»", hint: "Абонемент на месяц: одно занятие в неделю (4 в месяц), между ними задание под пробелы и письменный разбор." },
  umbrella: { icon: "🌂", label: "«Под одним зонтом»", hint: "Комплексный пакет: несколько предметов в любой комбинации в одном пакете, у каждого предмета свой преподаватель, остаток общий." },
  pair: { icon: "👥", label: "В паре", hint: "Занятия вдвоём со своим партнёром по общему расписанию. Цена за одного." },
  group: { icon: "👨‍👩‍👧", label: "Мини-группа", hint: "3–4 человека, курс с общим стартом." },
};
export const formatOf = (s) => FORMATS[s.format] ? s.format : "individual";
export const FormatBadge = ({ student }) => { const f = FORMATS[formatOf(student)]; return <span className="fmt-badge" title={f.hint}>{f.icon} {f.label}</span>; };

const WEEKDAYS = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];
const scheduleText = (g) => (g.slots || []).map((x) => WEEKDAYS[x.weekday - 1] + " " + x.time).join(", ") || "расписание не задано";
export const groupOf = (groups, studentId) => (groups || []).find((g) => (g.studentIds || []).includes(studentId));
export const umbrellaOf = (umbrellas, student) => (umbrellas || []).find((u) => u.id === student.umbrellaId || (u.memberIds || []).includes(student.id));

// A complex package: lessons of every subject in it count against one total.
export function umbrellaStats(u, students, teachers, slots, subjectMeta) {
  const t = today();
  const rows = (u.memberIds || []).map((id) => {
    const st = students.find((s) => s.id === id);
    const te = st && teachers.find((x) => x.id === st.teacherId);
    const used = (slots || []).filter((sl) => sl.studentId === id && sl.type === "regular" && sl.status !== "cancelled" && sl.date < t && (!u.assignedAt || sl.date >= u.assignedAt)).length;
    return { id, subject: te?.subject, label: subjectMeta?.[te?.subject]?.label || "—", emoji: subjectMeta?.[te?.subject]?.emoji || "", teacher: te?.name || "—", used };
  });
  const used = rows.reduce((a, r) => a + r.used, 0);
  return { rows, total: u.total || 0, used, left: Math.max(0, (u.total || 0) - used) };
}

function UmbrellaBreakdown({ st, mineId }) {
  return (
    <div className="um-rows">
      {st.rows.map((r) => (
        <div key={r.id} className={"um-row" + (r.id === mineId ? " mine" : "")}>
          <span>{r.emoji} {r.label}</span><span className="muted-text">{r.teacher}</span><b>{lessonsWord(r.used)}</b>
        </div>
      ))}
      <div className="um-total">Пакет {st.total}: пройдено {st.used}, осталось <b>{st.left}</b></div>
    </div>
  );
}

// Format of the student: a visible select under the name; details below it.
export function FormatPanel({ student, students, teachers, groups, umbrellas, slots, subjectMeta, canEdit, canManage, actions, onOpenAdminTab }) {
  const fmt = formatOf(student);
  const g = groupOf(groups, student.id);
  const um = umbrellaOf(umbrellas, student);
  const st = um ? umbrellaStats(um, students, teachers, slots, subjectMeta) : null;
  const sameKind = (groups || []).filter((x) => x.kind === fmt && x.teacherId === student.teacherId && !(x.studentIds || []).includes(student.id) && (x.studentIds || []).length < (x.kind === "pair" ? 2 : 4));
  return (
    <div className="fmt-panel">
      <div className="fmt-head">
        <span className="fmt-title">Формат</span>
        {canEdit ? (
          <select className="fmt-select" value={fmt} onChange={(e) => actions.setFormat(student.id, e.target.value)}>
            {Object.entries(FORMATS).map(([k, f]) => <option key={k} value={k}>{f.icon} {f.label}</option>)}
          </select>
        ) : <FormatBadge student={student} />}
      </div>
      <div className="hint-text">{FORMATS[fmt].hint}</div>

      {fmt === "umbrella" && (
        <div className="fmt-box">
          {st ? <UmbrellaBreakdown st={st} mineId={student.id} /> : <div className="ov-note">Комплексный пакет ещё не собран.{canManage ? "" : " Его оформляет администратор: предметы, преподаватели и размер пакета."}</div>}
          {canManage && onOpenAdminTab && <button className="btn-small" onClick={() => onOpenAdminTab("umbrella")}>{st ? "Изменить пакет" : "Собрать пакет"} во вкладке «Под одним зонтом» →</button>}
        </div>
      )}

      {(fmt === "pair" || fmt === "group") && (
        <div className="fmt-box">
          {g ? <>
            <div>{FORMATS[g.kind].icon} <b>{g.name}</b> · {scheduleText(g)}</div>
            <div className="ov-note">Участники: {(g.studentIds || []).map((id) => students.find((s) => s.id === id)?.name || "—").join(", ")}</div>
          </> : <div className="ov-note">Ученик ещё не в {fmt === "pair" ? "паре" : "группе"}.{canManage ? "" : " Состав и расписание задаёт администратор."}</div>}
          {canManage && <div className="row-gap" style={{ flexWrap: "wrap" }}>
            {g ? <button className="btn-small" onClick={() => actions.leaveGroup(g.id, student.id)}>Убрать из {g.kind === "pair" ? "пары" : "группы"}</button>
              : <>{sameKind.map((x) => <button key={x.id} className="btn-small" onClick={() => actions.joinGroup(x.id, student.id)}>Добавить в «{x.name}»</button>)}
                <button className="btn-small accent" onClick={() => actions.createGroup({ kind: fmt, teacherId: student.teacherId, studentIds: [student.id] })}><Plus size={13} /> Новая {fmt === "pair" ? "пара" : "группа"}</button></>}
            {onOpenAdminTab && <button className="btn-small" onClick={() => onOpenAdminTab("groups")}>Расписание пар и групп →</button>}
          </div>}
        </div>
      )}
    </div>
  );
}

/* -------------------------- «Под одним зонтом» -------------------------- */

export const UMBRELLA_PRICES = { 8: 10000, 12: 14400 }; // «от», как на сайте

export function UmbrellaPanel({ umbrellas, students, teachers, slots, subjectMeta, actions }) {
  const [form, setForm] = useState(null);
  const [addRow, setAddRow] = useState({});
  const subjects = Object.keys(subjectMeta);
  const blank = () => ({ baseId: "", name: "", contact: "", total: 12, rows: [{ subject: "", teacherId: "" }, { subject: "", teacherId: "" }] });
  const teachersOf = (subj) => teachers.filter((t) => t.subject === subj);
  const ok = form && (form.baseId || form.name.trim()) && form.rows.filter((r) => r.teacherId).length >= 2;

  return (
    <div className="lib">
      <div className="row-gap" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <div>
          <h3 className="lib-title">🌂 «Под одним зонтом»: комплексные пакеты</h3>
          <div className="hint-text">Один пакет на несколько предметов в любой комбинации. У каждого предмета свой преподаватель, занятия всех предметов списываются с общего остатка. На сайте: 8 занятий от 10 000 ₽, 12 занятий от 14 400 ₽.</div>
        </div>
        {!form && <button className="btn-small accent" onClick={() => setForm(blank())}><Plus size={13} /> Собрать пакет</button>}
      </div>

      {form && (
        <div className="add-panel lib-form">
          <div className="field-label">Ученик</div>
          <div className="row-gap" style={{ flexWrap: "wrap" }}>
            <select className="mini-select" value={form.baseId} onChange={(e) => { const b = students.find((s) => s.id === e.target.value); setForm({ ...form, baseId: e.target.value, name: b?.name || "", contact: b?.contact || "", rows: b ? [{ subject: teachers.find((t) => t.id === b.teacherId)?.subject || "", teacherId: b.teacherId }, ...form.rows.slice(1)] : form.rows }); }}>
              <option value="">Новый ученик…</option>
              {students.filter((s) => !s.umbrellaId).map((s) => <option key={s.id} value={s.id}>{s.name} — {subjectMeta[teachers.find((t) => t.id === s.teacherId)?.subject]?.label}</option>)}
            </select>
            {!form.baseId && <><input className="mini-input" placeholder="Имя" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><input className="mini-input" placeholder="Контакт" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></>}
          </div>
          <div className="field-label">Предметы в пакете</div>
          {form.rows.map((r, i) => (
            <div className="row-gap" key={i}>
              <select className="mini-select" value={r.subject} onChange={(e) => setForm({ ...form, rows: form.rows.map((x, j) => j === i ? { subject: e.target.value, teacherId: teachersOf(e.target.value)[0]?.id || "" } : x) })}>
                <option value="">Предмет…</option>
                {subjects.map((k) => <option key={k} value={k} disabled={form.rows.some((x, j) => j !== i && x.subject === k)}>{subjectMeta[k].emoji} {subjectMeta[k].label}</option>)}
              </select>
              <select className="mini-select" value={r.teacherId} disabled={!r.subject} onChange={(e) => setForm({ ...form, rows: form.rows.map((x, j) => j === i ? { ...x, teacherId: e.target.value } : x) })}>
                {!r.subject && <option value="">Преподаватель…</option>}
                {teachersOf(r.subject).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                {r.subject && teachersOf(r.subject).length === 0 && <option value="">нет преподавателя</option>}
              </select>
              {form.rows.length > 2 && <button className="btn-icon ghost" onClick={() => setForm({ ...form, rows: form.rows.filter((_, j) => j !== i) })}><Trash2 size={14} /></button>}
            </div>
          ))}
          <button className="btn-small" onClick={() => setForm({ ...form, rows: [...form.rows, { subject: "", teacherId: "" }] })}><Plus size={13} /> Ещё предмет</button>
          <div className="field-label">Размер пакета</div>
          <div className="row-gap">
            {[8, 12].map((n) => <button key={n} className={"btn-small" + (form.total === n ? " accent" : "")} onClick={() => setForm({ ...form, total: n })}>{n} занятий · от {rub(UMBRELLA_PRICES[n])}</button>)}
            <input type="number" min="2" className="mini-input" style={{ width: 90 }} value={form.total} onChange={(e) => setForm({ ...form, total: Number(e.target.value) })} /> <span className="hint-text">занятий</span>
          </div>
          <div className="row-gap" style={{ justifyContent: "flex-end" }}>
            <button className="btn-small" onClick={() => setForm(null)}>Отмена</button>
            <button className="btn-small accent" disabled={!ok} onClick={() => { actions.createUmbrella({ baseId: form.baseId, name: form.name.trim(), contact: form.contact.trim(), total: form.total, rows: form.rows.filter((r) => r.teacherId) }); setForm(null); }}><Check size={13} /> Собрать пакет</button>
          </div>
        </div>
      )}

      {(umbrellas || []).length === 0 && !form && <div className="muted-text">Комплексных пакетов пока нет.</div>}
      {(umbrellas || []).map((u) => {
        const st = umbrellaStats(u, students, teachers, slots, subjectMeta);
        const have = st.rows.map((r) => r.subject);
        const ar = addRow[u.id] || { subject: "", teacherId: "" };
        return (
          <div key={u.id} className="um-card">
            <div className="row-gap" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
              <div><b style={{ fontSize: 16 }}>🌂 {u.name}</b> <span className="muted-text">· {u.contact || "контакт не указан"} · с {u.assignedAt ? fmtD(u.assignedAt) : "—"}</span></div>
              <div className="row-gap">
                {[8, 12].map((n) => <button key={n} className="btn-small" title="Новый пакет: остаток переносится" onClick={() => actions.renewUmbrella(u.id, n)}>Продлить +{n}</button>)}
                <button className="btn-small danger" onClick={() => { if (window.confirm("Расформировать пакет «" + u.name + "»? Карточки учеников останутся.")) actions.removeUmbrella(u.id); }}>Расформировать</button>
              </div>
            </div>
            <div className="progress-track" style={{ margin: "8px 0" }}><div className="progress-fill" style={{ width: (st.total ? Math.round(st.used / st.total * 100) : 0) + "%" }} /></div>
            <UmbrellaBreakdown st={st} />
            {st.rows.some((r) => r.used === 0) && st.left <= st.rows.length && <div className="ov-warn">Остаток заканчивается, а по некоторым предметам ещё не было занятий.</div>}
            <div className="row-gap" style={{ marginTop: 8, flexWrap: "wrap" }}>
              <select className="mini-select" value={ar.subject} onChange={(e) => setAddRow({ ...addRow, [u.id]: { subject: e.target.value, teacherId: teachersOf(e.target.value)[0]?.id || "" } })}>
                <option value="">Добавить предмет…</option>
                {subjects.filter((k) => !have.includes(k)).map((k) => <option key={k} value={k}>{subjectMeta[k].emoji} {subjectMeta[k].label}</option>)}
              </select>
              {ar.subject && <select className="mini-select" value={ar.teacherId} onChange={(e) => setAddRow({ ...addRow, [u.id]: { ...ar, teacherId: e.target.value } })}>{teachersOf(ar.subject).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>}
              {ar.teacherId && <button className="btn-small accent" onClick={() => { actions.addUmbrellaSubject(u.id, ar.teacherId); setAddRow({ ...addRow, [u.id]: { subject: "", teacherId: "" } }); }}><Plus size={13} /> Добавить</button>}
              {st.rows.length > 2 && <select className="mini-select" value="" onChange={(e) => e.target.value && actions.removeUmbrellaSubject(u.id, e.target.value)}><option value="">Убрать предмет…</option>{st.rows.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}</select>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------ groups ------------------------------ */

export function GroupsPanel({ groups, students, teachers, subjectMeta, teacherIds, canPickTeacher, actions }) {
  const list = (groups || []).filter((g) => teacherIds.includes(g.teacherId));
  const [editId, setEditId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [weeks, setWeeks] = useState(4);
  const [msg, setMsg] = useState("");
  const startEdit = (g) => { setEditId(g.id); setDraft(JSON.parse(JSON.stringify(g))); setMsg(""); };
  const pool = draft ? students.filter((s) => s.teacherId === draft.teacherId) : [];
  const max = draft?.kind === "pair" ? 2 : 4;

  return (
    <div className="lib">
      <div className="row-gap" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <div>
          <h3 className="lib-title">👥 Пары и мини-группы</h3>
          <div className="hint-text">Состав и постоянное расписание. Кнопка «Поставить занятия» создаёт уроки в расписании сразу всем участникам, у каждого списывается его пакет.</div>
        </div>
        <div className="row-gap">
          <button className="btn-small" onClick={() => actions.createGroup({ kind: "pair", teacherId: teacherIds[0], studentIds: [] }, (g) => startEdit(g))}><Plus size={13} /> Пара</button>
          <button className="btn-small accent" onClick={() => actions.createGroup({ kind: "group", teacherId: teacherIds[0], studentIds: [] }, (g) => startEdit(g))}><Plus size={13} /> Мини-группа</button>
        </div>
      </div>
      {msg && <div className="ov-note" role="status">{msg}</div>}
      {list.length === 0 && <div className="muted-text">Пар и групп пока нет.</div>}
      {list.map((g) => {
        const t = teachers.find((x) => x.id === g.teacherId);
        if (editId === g.id && draft) return (
          <div key={g.id} className="add-panel lib-form">
            <div className="row-gap" style={{ flexWrap: "wrap" }}>
              <select className="mini-select" value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value, studentIds: draft.studentIds.slice(0, e.target.value === "pair" ? 2 : 4) })}><option value="pair">👥 Пара</option><option value="group">👨‍👩‍👧 Мини-группа</option></select>
              <input className="mini-input" placeholder="Название" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              {canPickTeacher && <select className="mini-select" value={draft.teacherId} onChange={(e) => setDraft({ ...draft, teacherId: e.target.value, studentIds: [] })}>{teachers.filter((x) => teacherIds.includes(x.id)).map((x) => <option key={x.id} value={x.id}>{subjectMeta[x.subject].emoji} {x.name}</option>)}</select>}
              <label className="hint-text">Старт <input type="date" className="mini-input" value={draft.startDate || ""} onChange={(e) => setDraft({ ...draft, startDate: e.target.value })} /></label>
            </div>
            <div className="field-label">Участники (до {max})</div>
            <div className="row-gap" style={{ flexWrap: "wrap" }}>
              {pool.length === 0 && <span className="muted-text">У преподавателя пока нет учеников</span>}
              {pool.map((s) => {
                const on = draft.studentIds.includes(s.id);
                const busy = !on && (groups || []).some((x) => x.id !== g.id && (x.studentIds || []).includes(s.id));
                return <label key={s.id} className={"pay-opt" + (on ? " on" : "")} style={{ padding: "6px 10px" }}><input type="checkbox" checked={on} disabled={busy || (!on && draft.studentIds.length >= max)} onChange={() => setDraft({ ...draft, studentIds: on ? draft.studentIds.filter((x) => x !== s.id) : [...draft.studentIds, s.id] })} />{s.name}{busy ? " (в другой группе)" : ""}</label>;
              })}
            </div>
            <div className="field-label">Постоянное расписание</div>
            {(draft.slots || []).map((x, i) => (
              <div className="row-gap" key={i}>
                <select className="mini-select" value={x.weekday} onChange={(e) => setDraft({ ...draft, slots: draft.slots.map((y, j) => j === i ? { ...y, weekday: Number(e.target.value) } : y) })}>{WEEKDAYS.map((w, j) => <option key={j} value={j + 1}>{w}</option>)}</select>
                <input type="time" className="mini-input" value={x.time} onChange={(e) => setDraft({ ...draft, slots: draft.slots.map((y, j) => j === i ? { ...y, time: e.target.value } : y) })} />
                <select className="mini-select" value={x.duration} onChange={(e) => setDraft({ ...draft, slots: draft.slots.map((y, j) => j === i ? { ...y, duration: Number(e.target.value) } : y) })}><option value={60}>60 мин</option><option value={90}>90 мин</option></select>
                <button className="btn-icon ghost" onClick={() => setDraft({ ...draft, slots: draft.slots.filter((_, j) => j !== i) })}><Trash2 size={14} /></button>
              </div>
            ))}
            <button className="btn-small" onClick={() => setDraft({ ...draft, slots: [...(draft.slots || []), { weekday: 1, time: "18:00", duration: 60 }] })}><Plus size={13} /> День недели</button>
            <div className="row-gap" style={{ justifyContent: "flex-end" }}>
              <button className="btn-small danger" onClick={() => { actions.removeGroup(g.id); setEditId(null); }}>Удалить</button>
              <button className="btn-small" onClick={() => setEditId(null)}>Отмена</button>
              <button className="btn-small accent" onClick={() => { actions.updateGroup(g.id, draft); setEditId(null); }}><Check size={13} /> Сохранить</button>
            </div>
          </div>
        );
        return (
          <div key={g.id} className="lib-item">
            <div className="lib-main">
              <div className="lib-name">{FORMATS[g.kind].icon} {g.name} <span className="muted-text">· {subjectMeta[t?.subject]?.label} · {t?.name}</span></div>
              <div className="hint-text">📅 {scheduleText(g)}{g.startDate ? " · старт " + fmtD(g.startDate) : ""}</div>
              <div className="hint-text">Участники ({(g.studentIds || []).length}/{g.kind === "pair" ? 2 : 4}): {(g.studentIds || []).map((id) => students.find((s) => s.id === id)?.name).filter(Boolean).join(", ") || "пока никого"}</div>
            </div>
            <div className="row-gap" style={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
              <button className="btn-icon ghost" title="Изменить" onClick={() => startEdit(g)}><Pencil size={14} /></button>
              <select className="mini-select" value={weeks} onChange={(e) => setWeeks(Number(e.target.value))}>{[1, 2, 4, 8].map((n) => <option key={n} value={n}>на {n} нед.</option>)}</select>
              <button className="btn-small accent" disabled={!(g.slots || []).length || !(g.studentIds || []).length} onClick={() => setMsg(actions.generateGroupLessons(g.id, weeks))}>Поставить занятия</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------- program by levels ------------------------- */

// Topics of the course grouped by level; the teacher adds, renames, removes and marks them.
export function ProgramEditor({ label, topics, levels, bank, startLevel, currentLevel, canEdit, onAdd, onRename, onRemove, onCycle, onSetLevel }) {
  const levelOf = (x) => x.level || levels.find((l) => (bank[l] || []).includes(x.name)) || "";
  const groupsList = [...levels, ""].map((l) => ({ l, items: topics.filter((x) => levelOf(x) === l) })).filter((g) => g.l !== "" || g.items.length);
  const [open, setOpen] = useState(() => new Set([currentLevel || startLevel || levels[0]]));
  const [adding, setAdding] = useState(null);
  const [custom, setCustom] = useState("");
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const toggle = (l) => setOpen((s) => { const n = new Set(s); n.has(l) ? n.delete(l) : n.add(l); return n; });
  const sym = (st) => (st === "done" ? "✓" : st === "in_progress" ? "◐" : "○");

  return (
    <div className="prog">
      <div className="field-label">{label}</div>
      {canEdit && <div className="hint-text" style={{ marginBottom: 6 }}>Нажмите на тему, чтобы сменить статус: ○ впереди → ◐ в работе → ✓ пройдено. ✏️ — переименовать или перенести на другой уровень.</div>}
      {groupsList.map(({ l, items }) => {
        const done = items.filter((x) => x.status === "done").length;
        const isOpen = open.has(l) || (!canEdit && items.length > 0);
        const free = (bank[l] || []).filter((n) => !topics.some((x) => x.name === n));
        return (
          <div key={l || "none"} className={"prog-level" + (l === currentLevel ? " current" : "")}>
            <button className="prog-head" onClick={() => toggle(l)} aria-expanded={isOpen}>
              <span className="prog-name">{l || "Без уровня"}</span>
              {l === currentLevel && <span className="pill-mini">сейчас</span>}
              {l === startLevel && l !== currentLevel && <span className="pill-mini">старт</span>}
              <span className="prog-count">{items.length ? done + " из " + items.length : "нет тем"}</span>
              <span className="prog-bar"><span style={{ width: (items.length ? Math.round(done / items.length * 100) : 0) + "%" }} /></span>
            </button>
            {isOpen && (
              <div className="prog-body">
                <div className="chip-row">
                  {items.map((x) => editing === x.id ? (
                    <span key={x.id} className="row-gap">
                      <input className="mini-input" value={name} autoFocus onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) { onRename(x.id, name.trim()); setEditing(null); } }} />
                      <select className="mini-select" value={levelOf(x)} onChange={(e) => onSetLevel(x.id, e.target.value)}>{levels.map((lv) => <option key={lv} value={lv}>{lv}</option>)}</select>
                      <button className="btn-icon ghost" title="Сохранить" onClick={() => { if (name.trim()) onRename(x.id, name.trim()); setEditing(null); }}><Check size={14} /></button>
                      <button className="btn-icon ghost" title="Удалить тему" onClick={() => { onRemove(x.id); setEditing(null); }}><Trash2 size={14} /></button>
                    </span>
                  ) : (
                    <span key={x.id} className="prog-chip-wrap">
                      <button className={"chip chip-" + (x.status || "todo")} disabled={!canEdit} onClick={() => onCycle(x.id)}><span className="chip-symbol">{sym(x.status)}</span> {x.name}</button>
                      {canEdit && <button className="prog-edit" title="Изменить тему" onClick={() => { setEditing(x.id); setName(x.name); }}>✏️</button>}
                    </span>
                  ))}
                  {items.length === 0 && <span className="muted-text">Тем на этом уровне пока нет</span>}
                </div>
                {canEdit && l !== "" && (adding === l ? (
                  <div className="topic-dropdown" style={{ marginTop: 8 }}>
                    {free.length > 0 && <div className="chip-row">{free.map((n) => <button key={n} className="btn-small" onClick={() => onAdd(n, l)}><Plus size={11} /> {n}</button>)}</div>}
                    <div className="row-gap" style={{ marginTop: 6 }}>
                      <input className="mini-input wide" placeholder={"Своя тема для уровня " + l} value={custom} onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && custom.trim()) { onAdd(custom.trim(), l); setCustom(""); } }} />
                      <button className="btn-icon" disabled={!custom.trim()} onClick={() => { onAdd(custom.trim(), l); setCustom(""); }}><Plus size={14} /></button>
                      <button className="btn-small" onClick={() => setAdding(null)}>Готово</button>
                    </div>
                  </div>
                ) : <button className="btn-small" style={{ marginTop: 8 }} onClick={() => { setAdding(l); setCustom(""); }}><Plus size={11} /> Добавить тему</button>)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const FORMAT_CSS = `
.fmt-badge { display:inline-flex; gap:3px; align-items:center; font-size:11px; font-weight:600; color:var(--ink-soft, #55544d); background:#f3eee4; border-radius:6px; padding:1px 7px; white-space:nowrap; }
.fmt-panel { display:flex; flex-direction:column; gap:4px; margin:8px 0 4px; }
.fmt-head { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.fmt-title { font:700 11px var(--font-ui, sans-serif); text-transform:uppercase; letter-spacing:.05em; color:var(--ink-soft, #6b6a63); }
.fmt-select { font:500 13px var(--font-ui, sans-serif); color:var(--ink, #1E2B2F); border:1px solid var(--border, #e2dccf); border-radius:8px; padding:4px 8px; background:#fff; cursor:pointer; }
.fmt-select:hover { border-color:var(--accent, #2F6F73); }
.fmt-panel > .hint-text { font-size:12px; }
.um-rows { display:flex; flex-direction:column; gap:4px; margin-top:6px; }
.um-row { display:grid; grid-template-columns:minmax(0,1.2fr) minmax(0,1fr) auto; gap:8px; font-size:13px; padding:4px 0; border-bottom:1px solid rgba(30,43,47,.07); }
.um-row.mine { font-weight:700; }
.um-total { font-size:13px; margin-top:4px; }
.um-card { background:#fff; border:1.5px solid var(--line, #e2dccf); border-radius:18px; padding:14px 16px; }
.fmt-box { margin-top:2px; background:transparent; border-left:3px solid var(--accent, #2F6F73); border-radius:0 !important; padding:2px 0 2px 10px !important; border-radius:14px; padding:10px 14px; display:flex; flex-direction:column; gap:6px; }
.prog { display:flex; flex-direction:column; gap:6px; }
.prog-level { border:1.5px solid var(--line, #e2dccf); border-radius:14px; background:#fff; }
.prog-level.current { border-color:var(--teal, #2F6F73); }
.prog-head { width:100%; display:flex; align-items:center; gap:10px; background:transparent; border:0; padding:10px 14px; cursor:pointer; font:inherit; text-align:left; }
.prog-name { font-weight:700; min-width:80px; }
.prog-count { margin-left:auto; font-size:12px; color:#6b6a63; white-space:nowrap; }
.prog-bar { width:90px; height:6px; border-radius:6px; background:#ece6da; overflow:hidden; }
.prog-bar span { display:block; height:100%; background:var(--teal, #2F6F73); }
.prog-body { padding:0 14px 12px; }
.prog-chip-wrap { display:inline-flex; align-items:center; }
.prog-edit { border:0; background:transparent; cursor:pointer; opacity:.5; font-size:12px; padding:2px; }
.prog-edit:hover { opacity:1; }
.ov-fmt { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
.week-track { display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:8px; margin-top:8px; }
.week-step { border-radius:12px; padding:8px 10px; background:#f6f2ea; font-size:13px; }
.week-step.ok { background:#e3efee; }
`;



/* --------------------------- student lessons --------------------------- */

export const PAY_DEADLINE_H = 12;   // a lesson must be paid at least 12 hours before it starts
export const CHANGE_DEADLINE_H = 4; // moving or cancelling closes 4 hours before the lesson
const startOf = (sl) => new Date(sl.date + "T" + sl.time + ":00");
const hoursTo = (sl) => (startOf(sl).getTime() - Date.now()) / 36e5;
const fmtDeadline = (sl, h) => new Date(startOf(sl).getTime() - h * 36e5).toLocaleString("ru-RU", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

// Upcoming lessons covered by the lessons left in the package count as paid.
export function withPackagePaid(student, slots) {
  const pk = packageStats(student, slots);
  const now = Date.now();
  const upcoming = (slots || []).filter((sl) => sl.studentId === student.id && sl.type === "regular" && sl.status !== "cancelled" && !sl.paid && startOf(sl).getTime() > now).sort((a, b) => startOf(a) - startOf(b));
  const covered = new Set(upcoming.slice(0, pk.left || 0).map((sl) => sl.id));
  return (slots || []).map((sl) => (covered.has(sl.id) ? { ...sl, paid: true, paidByPackage: true } : sl));
}

export function StudentLessons({ student, teacher, slots, products, payRequests, actions }) {
  const now = Date.now();
  const mine = (slots || []).filter((sl) => sl.studentId === student.id);
  const upcoming = mine.filter((sl) => startOf(sl).getTime() > now - 60 * 6e4 && sl.status !== "cancelled").sort((a, b) => startOf(a) - startOf(b));
  const past = mine.filter((sl) => startOf(sl).getTime() <= now - 60 * 6e4 || sl.status === "cancelled").sort((a, b) => startOf(b) - startOf(a));
  const single = (products || []).find((p) => p.subject === teacher.subject && !p.lessonsIncluded && p.price > 0);
  const [moving, setMoving] = useState(null);
  const [mv, setMv] = useState({ date: "", time: "18:00", note: "" });
  const [showAll, setShowAll] = useState(false);
  const reqFor = (sl) => (payRequests || []).find((r) => r.slotId === sl.id && ["new", "link_sent", "paid"].includes(r.status));
  const hwOn = (date) => (student.homework || []).filter((h) => (h.createdAt || "").slice(0, 10) === date);

  return (
    <div className="lessons">
      <div className="lib-title" style={{ fontSize: 18 }}>📅 Ближайшие занятия</div>
      <div className="hint-text">Оплатить урок нужно не позже чем за {PAY_DEADLINE_H} часов до начала, тогда откроется ссылка. Перенести или отменить можно до {CHANGE_DEADLINE_H} часов до урока.</div>
      {upcoming.length === 0 && <div className="muted-text">Пока ничего не запланировано. Преподаватель поставит занятие в расписание.</div>}
      {upcoming.map((sl) => {
        const h = hoursTo(sl);
        const req = reqFor(sl);
        const canChange = h > CHANGE_DEADLINE_H && (sl.status === "booked" || sl.status === "reschedule-requested");
        const payOpen = !sl.paid && h > PAY_DEADLINE_H;
        return (
          <div key={sl.id} className={"lesson-row" + (sl.paid ? " paid" : "")}>
            <div className="lesson-main">
              <div className="lesson-when">{fmtD(sl.date)} · {sl.time} <span className="muted-text">· {sl.duration || 60} мин · {teacher.name}{sl.groupName ? " · 👥 " + sl.groupName : ""}</span></div>
              {sl.isCheck && <div className="st-wait">📝 Контрольный срез</div>}
              {sl.topicsCovered?.length > 0 && <div className="hint-text">Тема: {sl.topicsCovered.join(", ")}</div>}
              <div className="lesson-status">
                {sl.status === "reschedule-requested" ? <span className="st-wait">🔁 Вы предложили перенос на {sl.requested ? fmtD(sl.requested.date) + " " + sl.requested.time : "другое время"}, ждём ответа преподавателя</span>
                  : sl.paid ? <span className="st-ok">✅ Оплачено{sl.paidByPackage ? " из пакета" : ""}</span>
                  : payOpen ? <span className="st-wait">💳 Оплатите до {fmtDeadline(sl, PAY_DEADLINE_H)}</span>
                  : <span className="st-bad">⛔ Срок оплаты прошёл. Напишите администратору, чтобы урок состоялся.</span>}
              </div>
              {req && <div className="ov-note">{{ new: "Запрос на оплату отправлен, администратор пришлёт ссылку.", link_sent: "Ссылка на оплату готова.", paid: "Вы сообщили об оплате, ждём подтверждения." }[req.status]}</div>}
            </div>
            <div className="lesson-actions">
              {sl.paid && sl.meetingLink && <a className="btn-small accent" href={sl.meetingLink} target="_blank" rel="noopener"><ExternalLink size={13} /> Войти на урок</a>}
              {sl.paid && !sl.meetingLink && <span className="hint-text">Ссылку добавит преподаватель</span>}
              {!sl.paid && <span className="hint-text">🔒 Ссылка после оплаты</span>}
              {payOpen && !req && <button className="btn-small accent" disabled={!single} onClick={() => actions.requestPayment(student.id, teacher.id, { productId: single.id, lessons: 1, label: "Урок " + fmtD(sl.date) + " в " + sl.time, amount: single.price, note: "", slotId: sl.id })}><CreditCard size={13} /> Оплатить урок{single ? " · " + rub(single.price) : ""}</button>}
              {req && req.status === "link_sent" && req.link && <a className="btn-small accent" href={req.link} target="_blank" rel="noopener"><CreditCard size={13} /> Оплатить</a>}
              {req && (req.status === "link_sent" || req.status === "new") && <button className="btn-small" onClick={() => actions.payRequestAction(req.id, "paid")}><Check size={13} /> Я оплатил(а)</button>}
              {canChange ? <>
                {sl.status === "booked" && <button className="btn-small" onClick={() => { setMoving(sl.id); setMv({ date: sl.date, time: sl.time, note: "" }); }}>🔁 Перенести</button>}
                <button className="btn-small" onClick={() => { if (window.confirm("Отменить урок " + fmtD(sl.date) + " в " + sl.time + "?")) actions.studentCancelSlot(sl.id); }}>✕ Отменить</button>
              </> : (sl.status === "booked" || sl.status === "reschedule-requested") && <span className="hint-text">Перенос и отмена закрыты за {CHANGE_DEADLINE_H} ч до урока</span>}
            </div>
            {moving === sl.id && (
              <div className="lesson-move">
                <input type="date" className="mini-input" value={mv.date} min={today()} onChange={(e) => setMv({ ...mv, date: e.target.value })} />
                <input type="time" className="mini-input" value={mv.time} onChange={(e) => setMv({ ...mv, time: e.target.value })} />
                <input className="mini-input wide" placeholder="Комментарий (необязательно)" value={mv.note} onChange={(e) => setMv({ ...mv, note: e.target.value })} />
                <button className="btn-small accent" disabled={!mv.date || !mv.time} onClick={() => { actions.requestReschedule(sl.id, mv.date, mv.time, mv.note); setMoving(null); }}>Предложить</button>
                <button className="btn-small" onClick={() => setMoving(null)}>Отмена</button>
              </div>
            )}
          </div>
        );
      })}

      <div className="lib-title" style={{ fontSize: 18, marginTop: 14 }}>🗂 Прошедшие занятия <span className="muted-text" style={{ fontSize: 13 }}>{past.length}</span></div>
      {past.length === 0 && <div className="muted-text">Здесь появятся занятия, которые уже прошли: дата, темы и материалы.</div>}
      {(showAll ? past : past.slice(0, 10)).map((sl) => {
        const hw = hwOn(sl.date);
        const chk = (student.checkpoints || []).filter((c) => c.date === sl.date);
        return (
          <div key={sl.id} className={"lesson-row past" + (sl.status === "cancelled" ? " cancelled" : "")}>
            <div className="lesson-main">
              <div className="lesson-when">{fmtD(sl.date)} · {sl.time} <span className="muted-text">· {teacher.name}{sl.groupName ? " · 👥 " + sl.groupName : ""}</span>
                {sl.isCheck && <span className="ck-kind" style={{ marginLeft: 8 }}>📝 срез</span>}
                <span className={sl.status === "cancelled" ? "st-bad" : "st-ok"} style={{ marginLeft: 8 }}>{sl.status === "cancelled" ? (sl.cancelledBy === "student" ? "отменён вами" : "отменён") : "проведён"}</span>
              </div>
              {sl.status !== "cancelled" && <>
                <div className="body-text">📚 Темы: {sl.topicsCovered?.length ? sl.topicsCovered.join(", ") : <span className="muted-text">преподаватель ещё не отметил</span>}</div>
                {sl.lessonMaterial && <div className="body-text">📎 Материалы: {/^https?:\/\//.test(sl.lessonMaterial) ? <a href={sl.lessonMaterial} target="_blank" rel="noopener">{sl.lessonMaterial}</a> : sl.lessonMaterial}</div>}
                {hw.length > 0 && <div className="body-text">📝 Домашнее задание: {hw.map((x) => x.title).join(", ")}</div>}
                {chk.map((c) => <div key={c.id} className="body-text">🎯 {c.title}: <b>{c.achievedScore}/{c.maxScore}</b></div>)}
                {sl.history?.length > 0 && <div className="hint-text">Был перенесён с {sl.history.map((x) => fmtD(x.date) + " " + x.time).join(", ")}</div>}
              </>}
            </div>
          </div>
        );
      })}
      {past.length > 10 && <button className="btn-small" onClick={() => setShowAll((v) => !v)}>{showAll ? "Свернуть" : "Показать все " + past.length}</button>}
    </div>
  );
}

export const LESSONS_CSS = `
.lessons { display:flex; flex-direction:column; gap:8px; }
.lesson-row { display:flex; flex-wrap:wrap; gap:10px 16px; justify-content:space-between; align-items:flex-start; background:#fff; border:1.5px solid var(--line, #e2dccf); border-radius:16px; padding:12px 16px; }
.lesson-row.paid { border-color:#b9d6d3; }
.lesson-row.past { background:#fbf9f5; }
.lesson-row.cancelled { opacity:.65; }
.lesson-main { display:flex; flex-direction:column; gap:4px; min-width:260px; flex:1; }
.lesson-when { font-weight:700; }
.lesson-actions { display:flex; flex-wrap:wrap; gap:6px; align-items:center; justify-content:flex-end; }
.lesson-move { width:100%; display:flex; flex-wrap:wrap; gap:6px; align-items:center; border-top:1px dashed var(--line, #e2dccf); padding-top:8px; }
.st-ok { color:#2F6F73; font-weight:600; font-size:13px; }
.st-wait { color:#9a6b00; font-weight:600; font-size:13px; }
.st-bad { color:#B8303C; font-weight:600; font-size:13px; }
`;


/* ------------------------------ charts ------------------------------ */

const C = { done: "#2F6F73", prog: "#E7B93E", todo: "#E2DCCF", red: "#B8303C", ink: "#1E2B2F", muted: "#8a887f" };

function Donut({ parts, size = 150, label, sub }) {
  const total = parts.reduce((a, p) => a + p.value, 0);
  const r = size / 2 - 12, c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="ch-donut">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label + ": " + parts.map((p) => p.label + " " + p.value).join(", ")}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.todo} strokeWidth="18" />
        {total > 0 && parts.map((p, i) => {
          const len = (p.value / total) * c;
          const el = <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={p.color} strokeWidth="18" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-acc} transform={`rotate(-90 ${size / 2} ${size / 2})`}><title>{p.label}: {p.value}</title></circle>;
          acc += len; return el;
        })}
        <text x="50%" y="48%" textAnchor="middle" className="ch-big">{label}</text>
        <text x="50%" y="62%" textAnchor="middle" className="ch-small">{sub}</text>
      </svg>
      <div className="ch-legend">{parts.map((p) => <span key={p.label}><i style={{ background: p.color }} />{p.label} <b>{p.value}</b></span>)}</div>
    </div>
  );
}

function LevelBars({ rows }) {
  return (
    <div className="ch-bars">
      {rows.map((r) => {
        const t = r.done + r.prog + r.todo;
        return (
          <div key={r.level} className={"ch-bar-row" + (r.current ? " current" : "")}>
            <span className="ch-bar-name">{r.level}{r.current ? " · сейчас" : ""}</span>
            <span className="ch-bar-track">
              {t === 0 ? <span className="ch-empty">тем нет</span> : <>
                <span style={{ width: (r.done / t) * 100 + "%", background: C.done }} title={"Пройдено: " + r.done} />
                <span style={{ width: (r.prog / t) * 100 + "%", background: C.prog }} title={"В работе: " + r.prog} />
                <span style={{ width: (r.todo / t) * 100 + "%", background: C.todo }} title={"Впереди: " + r.todo} />
              </>}
            </span>
            <span className="ch-bar-val">{t ? r.done + "/" + t : ""}</span>
          </div>
        );
      })}
    </div>
  );
}

function MonthBars({ months }) {
  const max = Math.max(1, ...months.map((m) => m.n));
  return (
    <div className="ch-months">
      {months.map((m) => (
        <div key={m.key} className="ch-month">
          <span className="ch-month-val">{m.n || ""}</span>
          <span className="ch-month-bar" style={{ height: Math.max(4, (m.n / max) * 90) + "px", background: m.n ? C.done : C.todo }} title={m.label + ": " + m.n} />
          <span className="ch-month-label">{m.label}</span>
        </div>
      ))}
    </div>
  );
}

// Checkpoint scores on the way to the exam: real points, the planned line to the goal and the trend.
export function ExamTrajectory({ student, startDate }) {
  const ex = student.examTarget;
  const pts = [...(student.checkpoints || [])].filter((c) => c.date && c.maxScore).sort((a, b) => a.date.localeCompare(b.date));
  const max = Number(pts[pts.length - 1]?.maxScore) || 100;
  const target = Number(ex.targetScore) || null;
  const d = (s) => new Date(s + "T12:00:00").getTime();
  const x0 = d(pts[0]?.date || startDate || today()) - 7 * 864e5;
  const examT = ex.examDate ? d(ex.examDate) : null;
  const x1 = Math.max(examT || 0, (pts.length ? d(pts[pts.length - 1].date) : Date.now()) + 30 * 864e5, Date.now() + 14 * 864e5);
  const W = 1000, H = 330, L = 44, R = 20, T = 24, B = 34;
  const sx = (t) => L + ((t - x0) / (x1 - x0)) * (W - L - R);
  const sy = (v) => T + (1 - v / max) * (H - T - B);
  // Trend by least squares over the real points.
  let trend = null;
  if (pts.length >= 2) {
    const xs = pts.map((p) => d(p.date)), ys = pts.map((p) => Number(p.achievedScore));
    const mx = xs.reduce((a, b) => a + b) / xs.length, my = ys.reduce((a, b) => a + b) / ys.length;
    const k = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0) / (xs.reduce((a, x) => a + (x - mx) ** 2, 0) || 1);
    const at = (t) => Math.max(0, Math.min(max, my + k * (t - mx)));
    trend = { from: xs[xs.length - 1], to: examT || x1, v1: at(xs[xs.length - 1]), v2: at(examT || x1) };
  }
  const last = pts[pts.length - 1];
  const daysLeft = examT ? Math.ceil((examT - Date.now()) / 864e5) : null;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));
  const months = []; for (let t = new Date(x0); t.getTime() <= x1; t.setMonth(t.getMonth() + 1, 1)) months.push(new Date(t.getFullYear(), t.getMonth(), 1).getTime());

  return (
    <div className="ch-card ch-wide">
      <div className="ch-title">🎯 Траектория к экзамену: {ex.exam}</div>
      <div className="ch-kpis">
        <span>Сейчас: <b>{last ? last.achievedScore + " / " + last.maxScore : "—"}</b></span>
        <span>Цель: <b>{target ?? "не задана"}</b></span>
        <span>Экзамен: <b>{ex.examDate ? fmtD(ex.examDate) : "дата не задана"}</b>{daysLeft !== null && daysLeft >= 0 ? " · через " + daysLeft + " дн." : ""}</span>
        {trend && <span>При текущем темпе к экзамену: <b>≈ {Math.round(trend.v2)}</b>{target ? (trend.v2 >= target ? " ✅ успеваем" : " — нужно ускориться") : ""}</span>}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="ch-svg" role="img" aria-label="График баллов пробников и цель">
        {ticks.map((v) => <g key={v}><line x1={L} x2={W - R} y1={sy(v)} y2={sy(v)} stroke="#eee7da" /><text x={L - 6} y={sy(v) + 4} textAnchor="end" className="ch-axis">{v}</text></g>)}
        {months.filter((t) => t >= x0).map((t) => <text key={t} x={sx(t)} y={H - 10} className="ch-axis" textAnchor="middle">{new Date(t).toLocaleDateString("ru-RU", { month: "short" })}</text>)}
        {target && <><line x1={L} x2={W - R} y1={sy(target)} y2={sy(target)} stroke={C.red} strokeDasharray="6 5" /><text x={L + 6} y={sy(target) - 6} className="ch-axis" fill={C.red}>цель {target}</text></>}
        {examT && <><line x1={sx(examT)} x2={sx(examT)} y1={T} y2={H - B} stroke={C.ink} strokeDasharray="3 4" /><text x={sx(examT)} y={T - 8} textAnchor="end" className="ch-axis" fill={C.ink}>экзамен {fmtD(ex.examDate)}</text></>}
        {target && examT && pts.length > 0 && <line x1={sx(d(pts[0].date))} y1={sy(Number(pts[0].achievedScore))} x2={sx(examT)} y2={sy(target)} stroke={C.prog} strokeWidth="2" strokeDasharray="2 5"><title>План: от первого пробника к цели</title></line>}
        {trend && <line x1={sx(trend.from)} y1={sy(trend.v1)} x2={sx(trend.to)} y2={sy(trend.v2)} stroke={C.done} strokeWidth="2" strokeDasharray="8 6" opacity=".55"><title>Прогноз по текущему темпу</title></line>}
        {pts.length > 1 && <polyline fill="none" stroke={C.done} strokeWidth="3" points={pts.map((p) => sx(d(p.date)) + "," + sy(Number(p.achievedScore))).join(" ")} />}
        {pts.map((p) => <g key={p.id}><circle cx={sx(d(p.date))} cy={sy(Number(p.achievedScore))} r="7" fill="#fff" stroke={C.done} strokeWidth="3"><title>{p.title}: {p.achievedScore}/{p.maxScore} ({fmtD(p.date)})</title></circle><text x={sx(d(p.date))} y={sy(Number(p.achievedScore)) - 12} textAnchor="middle" className="ch-pt">{p.achievedScore}</text></g>)}
        <line x1={sx(Date.now())} x2={sx(Date.now())} y1={T} y2={H - B} stroke={C.ink} opacity=".18" /><text x={sx(Date.now())} y={H - B - 6} textAnchor="middle" className="ch-axis">сегодня</text>
      </svg>
      <div className="ch-legend">
        <span><i style={{ background: C.done }} />пробники и проверки</span>
        {target && examT && <span><i style={{ background: C.prog }} />план до цели</span>}
        {trend && <span><i style={{ background: C.done, opacity: .5 }} />прогноз</span>}
        {target && <span><i style={{ background: C.red }} />целевой балл</span>}
      </div>
      {pts.length === 0 && <div className="ov-note">Точки появятся после первого пробника: преподаватель добавит его в «Проверку пройденного».</div>}
    </div>
  );
}

export function ProgressCharts({ student, subjMeta, slots }) {
  const all = [...(student.grammarTopics || []), ...(student.vocabTopics || []), ...(student.examTopics || []), ...(student.examGrammar || []), ...(student.examVocab || [])];
  const cnt = (arr, st) => arr.filter((x) => (x.status || "todo") === st).length;
  const pct = all.length ? Math.round((cnt(all, "done") + cnt(all, "in_progress") * 0.5) / all.length * 100) : 0;
  const levelOf = (x) => x.level || subjMeta.levels.find((l) => (subjMeta.bank?.[l] || []).includes(x.name)) || "";
  const rows = subjMeta.levels.map((l) => { const it = (student.grammarTopics || []).filter((x) => levelOf(x) === l); return { level: l, done: cnt(it, "done"), prog: cnt(it, "in_progress"), todo: cnt(it, "todo"), current: l === student.currentLevel }; });
  const hw = student.homework || [];
  const hwParts = [
    { label: "Проверено", value: hw.filter((h) => h.status === "reviewed").length, color: C.done },
    { label: "Ждёт проверки", value: hw.filter((h) => h.status === "submitted" || h.status === "in_review").length, color: C.prog },
    { label: "На доработке", value: hw.filter((h) => h.status === "needs_revision").length, color: "#E08A5B" },
    { label: "Не сдано", value: hw.filter((h) => h.status === "assigned" || h.status === "not_done").length, color: C.red },
  ];
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => { const m = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1); const key = m.getFullYear() + "-" + String(m.getMonth() + 1).padStart(2, "0");
    return { key, label: m.toLocaleDateString("ru-RU", { month: "short" }), n: (slots || []).filter((sl) => sl.studentId === student.id && sl.status !== "cancelled" && sl.date.startsWith(key) && sl.date < today()).length }; });
  const lvlIdx = subjMeta.levels.indexOf(student.currentLevel), startIdx = subjMeta.levels.indexOf(student.startLevel);

  return (
    <div className="charts">
      {student.examTarget?.exam && <ExamTrajectory student={student} startDate={student.packageAssignedAt} />}
      <div className="ch-grid">
        <div className="ch-card">
          <div className="ch-title">🧭 Программа</div>
          <Donut label={pct + "%"} sub="пройдено" parts={[{ label: "Пройдено", value: cnt(all, "done"), color: C.done }, { label: "В работе", value: cnt(all, "in_progress"), color: C.prog }, { label: "Впереди", value: cnt(all, "todo"), color: C.todo }]} />
        </div>
        <div className="ch-card">
          <div className="ch-title">📝 Домашние задания</div>
          <Donut label={String(hw.length)} sub="всего" parts={hwParts} />
        </div>
        <div className="ch-card">
          <div className="ch-title">📅 Занятия по месяцам</div>
          <MonthBars months={months} />
        </div>
      </div>
      <div className="ch-card ch-wide">
        <div className="ch-title">🪜 Уровни: {student.startLevel} → {student.currentLevel}{lvlIdx > startIdx ? " · +" + (lvlIdx - startIdx) + " уровень" : ""}</div>
        <LevelBars rows={rows} />
        <div className="ch-legend"><span><i style={{ background: C.done }} />пройдено</span><span><i style={{ background: C.prog }} />в работе</span><span><i style={{ background: C.todo }} />впереди</span></div>
      </div>
    </div>
  );
}

export const CHARTS_CSS = `
.charts { display:flex; flex-direction:column; gap:14px; margin-bottom:14px; }
.ch-grid { display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:14px; }
.ch-card { background:#fff; border:1.5px solid var(--line, #e2dccf); border-radius:20px; padding:16px 18px; }
.ch-title { font:700 15px var(--font-display, serif); margin-bottom:10px; }
.ch-donut { display:flex; flex-direction:column; align-items:center; gap:10px; }
.ch-big { font:700 24px var(--font-display, serif); fill:#1E2B2F; }
.ch-small { font:500 11px var(--font-ui, sans-serif); fill:#8a887f; }
.ch-legend { display:flex; flex-wrap:wrap; gap:6px 14px; font-size:12px; color:#55544d; margin-top:6px; }
.ch-legend i { display:inline-block; width:10px; height:10px; border-radius:3px; margin-right:5px; vertical-align:-1px; }
.ch-bars { display:flex; flex-direction:column; gap:8px; }
.ch-bar-row { display:grid; grid-template-columns:130px minmax(0,1fr) 44px; gap:10px; align-items:center; font-size:13px; }
.ch-bar-row.current .ch-bar-name { font-weight:700; color:#2F6F73; }
.ch-bar-track { display:flex; height:14px; border-radius:8px; overflow:hidden; background:#f3eee4; }
.ch-bar-track span { height:100%; }
.ch-empty { font-size:11px; color:#8a887f; padding-left:6px; line-height:14px; }
.ch-bar-val { text-align:right; color:#55544d; }
.ch-months { display:flex; align-items:flex-end; gap:8px; height:130px; padding-top:6px; }
.ch-month { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; gap:4px; height:100%; }
.ch-month-bar { width:100%; max-width:34px; border-radius:8px 8px 3px 3px; }
.ch-month-val { font-size:12px; font-weight:700; }
.ch-month-label { font-size:11px; color:#8a887f; }
.ch-svg { width:100%; height:auto; display:block; }
.ch-axis { font:500 11px var(--font-ui, sans-serif); fill:#8a887f; }
.ch-pt { font:700 12px var(--font-ui, sans-serif); fill:#1E2B2F; }
.ch-kpis { display:flex; flex-wrap:wrap; gap:6px 18px; font-size:13px; margin-bottom:8px; }
@media (max-width: 900px) { .ch-grid { grid-template-columns:minmax(0,1fr); } .ch-bar-row { grid-template-columns:90px minmax(0,1fr) 40px; } }
`;


/* ------------------------- teacher rates & payroll ------------------------- */

// Lesson kinds the school pays differently for. A group or pair lesson is paid once, not per student.
export const LESSON_KINDS = {
  individual: "👤 Индивидуальный разовый",
  package: "📦 Индивидуальный из пакета",
  self: "☂️ «Сам, но не один»",
  umbrella: "🌂 «Под одним зонтом»",
  pair: "👥 Пара",
  group: "👨‍👩‍👧 Мини-группа",
  trial: "🎓 Пробный",
};
export const DEFAULT_RATES = { individual: 0, package: 0, self: 0, umbrella: 0, pair: 0, group: 0, trial: 0 };
// One-on-one lessons of a student with a package are paid at the package rate.
export const kindForStudent = (st) => { const f = formatOf(st || {}); return f === "individual" && st?.packageTotal ? "package" : f; };

export const slotKind = (sl, students) => sl.format || (sl.type === "trial" ? "trial" : sl.groupId ? ((students || []).find((s) => s.id === sl.studentId)?.format === "pair" ? "pair" : "group") : kindForStudent((students || []).find((s) => s.id === sl.studentId)));

// Lessons that already took place in the month; one group lesson counts once.
export function teacherPayroll(teacher, slots, students, monthPrefix) {
  const now = Date.now();
  const seen = new Set();
  const done = (slots || []).filter((sl) => {
    if (sl.teacherId !== teacher.id || !sl.date.startsWith(monthPrefix) || sl.status === "cancelled" || sl.status === "available") return false;
    if (new Date(sl.date + "T" + sl.time + ":00").getTime() > now) return false;
    if (!sl.studentId && !sl.trialName) return false;
    if (sl.groupId) { const k = sl.groupId + sl.date + sl.time; if (seen.has(k)) return false; seen.add(k); }
    return true;
  });
  const rates = { ...DEFAULT_RATES, ...(teacher.rates || {}) };
  const rows = Object.keys(LESSON_KINDS).map((k) => { const n = done.filter((sl) => slotKind(sl, students) === k).length; return { kind: k, n, rate: rates[k] || 0, sum: n * (rates[k] || 0) }; });
  return { rows, lessons: done.length, total: rows.reduce((a, r) => a + r.sum, 0), missing: rows.some((r) => r.n > 0 && !r.rate) };
}

export const monthPrefixOf = (d = new Date()) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");

export function PayrollCard({ teacher, slots, students, onSetRate }) {
  const [month, setMonth] = useState(0);
  const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + month);
  const pr = teacherPayroll(teacher, slots, students, monthPrefixOf(d));
  const rates = { ...DEFAULT_RATES, ...(teacher.rates || {}) };
  const noRates = !Object.values(teacher.rates || {}).some(Boolean);
  return (
    <details className="pay-card" onClick={(e) => e.stopPropagation()}>
      <summary>
        <span>💰 {d.toLocaleDateString("ru-RU", { month: "long" })}: <b>{rub(pr.total)}</b></span>
        <span className="muted-text">{pr.lessons ? lessonsWord(pr.lessons) : "уроков нет"}{noRates ? " · ставки не заданы" : pr.missing ? " · ⚠️" : ""}</span>
      </summary>
      <div className="row-gap" style={{ justifyContent: "space-between", margin: "6px 0 2px" }}>
        <span className="hint-text">Месяц</span>
        <span className="row-gap">
          <button className="btn-icon ghost" title="Предыдущий месяц" onClick={() => setMonth(month - 1)}>‹</button>
          <button className="btn-icon ghost" title="Следующий месяц" disabled={month >= 0} onClick={() => setMonth(month + 1)}>›</button>
        </span>
      </div>
      {pr.rows.filter((r) => r.n).map((r) => <div key={r.kind} className="pay-row"><span>{LESSON_KINDS[r.kind]}</span><span>{r.n} × {rub(r.rate)}</span><b>{rub(r.sum)}</b></div>)}
      {pr.missing && <div className="hint-text">⚠️ Для некоторых проведённых уроков ставка не задана.</div>}
      <div className="pay-sub">Ставки за урок</div>
      <div className="pay-rates">
        {Object.entries(LESSON_KINDS).map(([k, lbl]) => (
          <label key={k} className="pay-row"><span>{lbl}</span><input type="number" min="0" step="50" className="mini-input" style={{ width: 96 }} value={rates[k] || ""} placeholder="0 ₽" onChange={(e) => onSetRate(teacher.id, k, Number(e.target.value) || 0)} /></label>
        ))}
        <div className="hint-text">В рублях за урок. «Из пакета» — индивидуальные уроки ученика с оплаченным пакетом. Пара и мини-группа оплачиваются один раз за занятие.</div>
      </div>
    </details>
  );
}

export const PAY_CSS = `
.pay-card { margin-top:10px; background:#f6f2ea; border-radius:12px; padding:8px 12px; cursor:default; }
.pay-card summary { cursor:pointer; display:flex; flex-wrap:wrap; justify-content:space-between; gap:4px 8px; font-size:13px; list-style:none; }
.pay-card summary::-webkit-details-marker { display:none; }
.pay-card summary::after { content:"▾"; color:#8a887f; }
.pay-card[open] summary::after { content:"▴"; }
.pay-sub { font:700 11px var(--font-ui, sans-serif); text-transform:uppercase; letter-spacing:.05em; color:#6b6a63; margin-top:8px; }
.pay-title { font-size:14px; }
.pay-row { display:grid; grid-template-columns:minmax(0,1fr) auto auto; gap:8px; align-items:center; font-size:12px; padding:3px 0; }
.pay-rates { margin-top:6px; display:flex; flex-direction:column; gap:2px; }
.pay-rates .pay-row { grid-template-columns:minmax(0,1fr) auto; }
.slot-kind { font-size:11px; margin-right:3px; }
`;


/* ------------------- «Сам, но не один»: weeks and month check ------------------- */

const MARKS = { weak: { icon: "🔴", label: "Тяжело" }, ok: { icon: "🟡", label: "Нормально" }, good: { icon: "🟢", label: "Отлично" } };
const isoD = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");

// Monday-based weeks that start in the given month.
function weeksOfMonth(y, m) {
  const first = new Date(y, m, 1);
  const mon = new Date(first); mon.setDate(first.getDate() - ((first.getDay() + 6) % 7));
  const out = [];
  for (let d = new Date(mon); d.getMonth() <= m || d.getFullYear() < y; d.setDate(d.getDate() + 7)) {
    const end = new Date(d); end.setDate(d.getDate() + 6);
    if (end.getMonth() === m || d.getMonth() === m) out.push({ from: isoD(d), to: isoD(end), key: isoD(d) });
    if (out.length > 5 || (d.getFullYear() > y)) break;
  }
  return out;
}

export function SelfMonthPanel({ student, slots, canEdit, actions }) {
  const [shift, setShift] = useState(0);
  const base = new Date(); base.setDate(1); base.setMonth(base.getMonth() + shift);
  const y = base.getFullYear(), m = base.getMonth();
  const monthKey = y + "-" + String(m + 1).padStart(2, "0");
  const weeks = weeksOfMonth(y, m);
  const notes = student.selfWeeks || {};
  const [draft, setDraft] = useState({});
  const check = (student.checkpoints || []).find((c) => c.monthKey === monthKey);
  const [cf, setCf] = useState({ maxScore: "", achievedScore: "", note: "" });
  const lastDay = new Date(y, m + 1, 0);
  const t = today();
  const marked = weeks.filter((w) => notes[w.key]?.mark).length;

  return (
    <div className="self-month">
      <div className="row-gap" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <div className="lib-title" style={{ fontSize: 16 }}>☂️ «Сам, но не один»: {base.toLocaleDateString("ru-RU", { month: "long", year: "numeric" })}</div>
        <span className="row-gap">
          <button className="btn-small" onClick={() => setShift(shift - 1)}>← Пред.</button>
          <button className="btn-small" disabled={shift >= 0} onClick={() => setShift(shift + 1)}>След. →</button>
        </span>
      </div>
      <div className="hint-text">Каждую неделю: урок → задание → письменный разбор → отметка прогресса недели. В конце месяца — контрольный срез. Отмечено недель: {marked} из {weeks.length}.</div>
      <div className="sm-weeks">
        {weeks.map((w, i) => {
          const lesson = (slots || []).find((sl) => sl.studentId === student.id && sl.status !== "cancelled" && sl.date >= w.from && sl.date <= w.to);
          const task = (student.homework || []).filter((h) => (h.createdAt || "") >= w.from && (h.createdAt || "") <= w.to)[0];
          const n = notes[w.key] || {};
          const future = w.from > t;
          return (
            <div key={w.key} className={"sm-week" + (future ? " future" : "")}>
              <div className="sm-week-head">Неделя {i + 1} <span className="muted-text">· {fmtD(w.from)} – {fmtD(w.to)}</span></div>
              <div className="sm-steps">
                <span className={lesson && lesson.date < t ? "ok" : ""}>📅 {lesson ? "урок " + fmtD(lesson.date) + " " + lesson.time : "урока нет"}</span>
                <span className={task && task.status !== "assigned" && task.status !== "not_done" ? "ok" : ""}>📝 {task ? (task.status === "assigned" ? "задание выдано" : task.status === "not_done" ? "задание не сделано" : task.status === "needs_revision" ? "на доработке" : "задание сдано") : "задания нет"}</span>
                <span className={task?.status === "reviewed" ? "ok" : ""}>✍️ {task?.status === "reviewed" ? "разбор готов" : "разбор после сдачи"}</span>
              </div>
              {canEdit ? (
                <div className="row-gap" style={{ flexWrap: "wrap", marginTop: 6 }}>
                  <span className="hint-text">Прогресс недели:</span>
                  {Object.entries(MARKS).map(([k, x]) => <button key={k} className={"btn-small" + (n.mark === k ? " accent" : "")} onClick={() => actions.setSelfWeek(student.id, w.key, { mark: k })}>{x.icon} {x.label}</button>)}
                  <input className="mini-input wide" placeholder="Комментарий к неделе: что получилось, над чем работать" value={draft[w.key] ?? n.note ?? ""} onChange={(e) => setDraft({ ...draft, [w.key]: e.target.value })} onBlur={() => draft[w.key] !== undefined && actions.setSelfWeek(student.id, w.key, { note: draft[w.key] })} />
                </div>
              ) : (n.mark || n.note) ? (
                <div className="sm-note">{n.mark ? MARKS[n.mark].icon + " " + MARKS[n.mark].label : ""}{n.note ? " — " + n.note : ""}</div>
              ) : !future && <div className="hint-text">Преподаватель отметит прогресс недели после разбора.</div>}
            </div>
          );
        })}
      </div>
      <div className={"sm-check" + (check ? " done" : "")}>
        <div className="sm-week-head">📊 Контрольный срез месяца</div>
        {check ? <>
          <div><b>{check.achievedScore} / {check.maxScore}</b> · {fmtD(check.date)}{check.note ? " — " + check.note : ""}</div>
          <div className="progress-track" style={{ marginTop: 6 }}><div className="progress-fill" style={{ width: Math.round(check.achievedScore / check.maxScore * 100) + "%" }} /></div>
        </> : canEdit ? (
          <div className="row-gap" style={{ flexWrap: "wrap" }}>
            <input type="number" className="mini-input" style={{ width: 90 }} placeholder="Набрал(а)" value={cf.achievedScore} onChange={(e) => setCf({ ...cf, achievedScore: e.target.value })} />
            <span className="hint-text">из</span>
            <input type="number" className="mini-input" style={{ width: 90 }} placeholder="Максимум" value={cf.maxScore} onChange={(e) => setCf({ ...cf, maxScore: e.target.value })} />
            <input className="mini-input wide" placeholder="Вывод: что подтянуть в следующем месяце" value={cf.note} onChange={(e) => setCf({ ...cf, note: e.target.value })} />
            <button className="btn-small accent" disabled={!cf.maxScore || cf.achievedScore === ""} onClick={() => { actions.addCheckpoint(student.id, { title: "Срез за " + base.toLocaleDateString("ru-RU", { month: "long" }), maxScore: cf.maxScore, achievedScore: cf.achievedScore, note: cf.note, kind: "month", monthKey }); setCf({ maxScore: "", achievedScore: "", note: "" }); }}><Check size={13} /> Записать срез</button>
          </div>
        ) : <div className="hint-text">Срез пройдёт в конце месяца, ориентир — {fmtD(isoD(lastDay))}.</div>}
      </div>
    </div>
  );
}

export const CHECK_KINDS = { check: "📝 Контрольный срез", month: "📊 Срез месяца", mock: "🎯 Пробный экзамен", diag: "🔎 Диагностика" };

export const SELF_CSS = `
.self-month { display:flex; flex-direction:column; gap:8px; background:#fff; border:1.5px solid var(--line, #e2dccf); border-radius:20px; padding:16px 18px; margin-bottom:14px; }
.sm-weeks { display:flex; flex-direction:column; gap:8px; }
.sm-week { background:#f6f2ea; border-radius:14px; padding:10px 12px; }
.sm-week.future { opacity:.6; }
.sm-week-head { font-weight:700; font-size:14px; margin-bottom:4px; }
.sm-steps { display:flex; flex-wrap:wrap; gap:6px; font-size:12px; }
.sm-steps span { background:#fff; border-radius:999px; padding:3px 10px; }
.sm-steps span.ok { background:#e3efee; color:#2F6F73; font-weight:600; }
.sm-note { font-size:13px; margin-top:6px; }
.sm-check { background:#fbf1d3; border-radius:14px; padding:10px 12px; }
.sm-check.done { background:#e3efee; }
.ck-kind { font-size:11px; font-weight:600; background:#f3eee4; border-radius:999px; padding:1px 8px; margin-right:6px; }
`;


/* ------------------------- goal: start → now → result ------------------------- */

export function GoalMarker({ student, levels }) {
  const ex = student.examTarget?.exam ? student.examTarget : null;
  const target = student.targetLevel || "";
  const iS = levels.indexOf(student.startLevel), iC = levels.indexOf(student.currentLevel), iT = levels.indexOf(target);
  const pct = iT > iS && iC >= iS ? Math.min(100, Math.round(((iC - iS) / (iT - iS)) * 100)) : null;
  return (
    <div className="goal-mk">
      <div className="goal-step">
        <div className="goal-lbl">🚩 Изначальная цель</div>
        <div className="goal-val">{student.goal || "—"}</div>
        <div className="goal-sub">Старт: {student.startLevel || "—"}{student.startNote ? " · " + student.startNote : ""}</div>
      </div>
      <div className="goal-arrow">→</div>
      <div className="goal-step now">
        <div className="goal-lbl">📍 Сейчас</div>
        <div className="goal-val">{student.currentLevel || "—"}</div>
        {pct !== null && <><div className="progress-track" style={{ marginTop: 6 }}><div className="progress-fill" style={{ width: pct + "%" }} /></div><div className="goal-sub">{pct}% пути до уровня-цели</div></>}
      </div>
      <div className="goal-arrow">→</div>
      <div className="goal-step aim">
        <div className="goal-lbl">🏁 Желаемый результат</div>
        <div className="goal-val">{student.targetResult || (ex ? ex.exam + (ex.targetScore ? " на " + ex.targetScore : "") : "Преподаватель уточнит вместе с вами")}</div>
        <div className="goal-sub">{[target && "Уровень-цель: " + target, ex?.examDate && "Экзамен: " + fmtD(ex.examDate)].filter(Boolean).join(" · ")}</div>
      </div>
    </div>
  );
}

export const GOAL_CSS = `
.goal-mk { display:grid; grid-template-columns:minmax(0,1fr) auto minmax(0,1fr) auto minmax(0,1fr); gap:10px; align-items:stretch; margin-bottom:14px; }
.goal-step { background:#fff; border:1.5px solid var(--line, #e2dccf); border-radius:18px; padding:12px 14px; }
.goal-step.now { border-color:var(--accent, #2F6F73); }
.goal-step.aim { background:#fbf1d3; border-color:#efd88d; }
.goal-lbl { font:700 11px var(--font-ui, sans-serif); text-transform:uppercase; letter-spacing:.05em; color:#6b6a63; margin-bottom:4px; }
.goal-val { font:700 16px var(--font-display, serif); }
.goal-sub { font-size:12px; color:#6b6a63; margin-top:4px; }
.goal-arrow { align-self:center; font-size:20px; color:#8a887f; }
@media (max-width: 900px) { .goal-mk { grid-template-columns:minmax(0,1fr); } .goal-arrow { transform:rotate(90deg); justify-self:center; } }
`;
export const EXTRA_CSS = EXTRA_CSS_BASE + FORMAT_CSS + LESSONS_CSS + CHARTS_CSS + PAY_CSS + SELF_CSS + GOAL_CSS;
