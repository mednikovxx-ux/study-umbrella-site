// «Тренажёр»: банк экзаменационных заданий по предметам (его пополняют
// преподаватели), решение заданий учеником с мгновенной проверкой тестовой
// части и проверкой развёрнутых ответов преподавателем.
// Задания: su-trainer-v1, попытки: su-trainer-att-v1. Генерация заданий ИИ
// по загруженным материалам — следующий шаг, когда появится сервер школы.
import React, { useMemo, useState } from "react";

export const TASK_TYPES = { choice: "Выбор ответа", short: "Краткий ответ", open: "Развёрнутый ответ" };
const uid = () => "tr" + Math.random().toString(36).slice(2, 10);
const norm = (v) => String(v ?? "").toLowerCase().replace(/ё/g, "е").replace(/[\s.,;:!?«»"'()-]+/g, "");
const fmtDay = (iso) => (iso ? new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" }) : "");
const shuffle = (a) => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };

// Проверка без преподавателя: выбор ответа и краткий ответ (несколько верных вариантов через «;»).
export function autoCheck(task, answer) {
  if (task.type === "choice") return Number(answer) === Number(task.correct);
  if (task.type === "short") return String(task.answer || "").split(";").map(norm).filter(Boolean).includes(norm(answer));
  return null;
}

// Небольшой стартовый банк, чтобы демо не было пустым. Только проверяемые факты.
export const seedTrainer = [
  { id: "trs1", subject: "history", exam: "ЕГЭ", part: "Хронология и даты", type: "choice", text: "В каком году в России было отменено крепостное право?", options: ["1803", "1861", "1905", "1917"], correct: 1, explanation: "Манифест об отмене крепостного права подписан Александром II 19 февраля (3 марта) 1861 года.", author: "Study Umbrella" },
  { id: "trs2", subject: "history", exam: "ОГЭ", part: "Хронология", type: "short", text: "Назовите князя, при котором в 988 году произошло крещение Руси. Запишите имя.", answer: "Владимир; Владимир Святославич; Владимир I", explanation: "Крещение Руси связано с князем Владимиром Святославичем.", author: "Study Umbrella" },
  { id: "trs3", subject: "social", exam: "ЕГЭ", part: "Понятия и термины", type: "choice", text: "Какой признак характерен для рыночной экономики?", options: ["Директивное планирование", "Свободное ценообразование", "Распределение товаров по карточкам", "Государственная монополия на все ресурсы"], correct: 1, explanation: "В рыночной экономике цены складываются под влиянием спроса и предложения.", author: "Study Umbrella" },
  { id: "trs4", subject: "social", exam: "ЕГЭ", part: "Обоснование и примеры", type: "open", text: "Приведите три примера, иллюстрирующих положительное влияние конкуренции на потребителей. Каждый пример сформулируйте развёрнуто.", maxScore: 3, explanation: "По 1 баллу за каждый корректный развёрнутый пример (снижение цен, рост качества, расширение ассортимента и т. п.).", author: "Study Umbrella" },
  { id: "trs5", subject: "english", exam: "ЕГЭ", part: "Грамматика и лексика", type: "choice", text: "She ___ to London last year.", options: ["go", "went", "has gone", "goes"], correct: 1, explanation: "«Last year» — законченное время в прошлом, поэтому Past Simple: went.", author: "Study Umbrella" },
  { id: "trs6", subject: "english", exam: "IELTS", part: "Writing Task 2 (эссе)", type: "open", text: "Some people think that university education should be free for everyone. To what extent do you agree or disagree? Write at least 250 words.", maxScore: 9, explanation: "Оценивается по четырём критериям IELTS: Task Response, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy.", author: "Study Umbrella" },
];

const blank = (subject, exam, part) => ({ subject, exam: exam || "", part: part || "", type: "choice", text: "", options: ["", "", "", ""], correct: 0, answer: "", maxScore: 3, explanation: "" });

function TaskForm({ value, exams, partsOf, onSave, onCancel }) {
  const [f, setF] = useState(value);
  const parts = partsOf(f.exam);
  const ok = f.exam && f.part && f.text.trim() && (f.type !== "choice" || f.options.filter((o) => o.trim()).length >= 2) && (f.type !== "short" || f.answer.trim());
  return (
    <div className="add-panel tr-form">
      <div className="row-gap" style={{ flexWrap: "wrap" }}>
        <select className="mini-select" value={f.exam} onChange={(e) => setF({ ...f, exam: e.target.value, part: "" })}>
          <option value="">Экзамен…</option>
          {exams.map((x) => <option key={x}>{x}</option>)}
        </select>
        <select className="mini-select" value={parts.includes(f.part) || !f.part ? f.part : "__own"} onChange={(e) => setF({ ...f, part: e.target.value === "__own" ? " " : e.target.value })} disabled={!f.exam}>
          <option value="">Задание / часть…</option>
          {parts.map((x) => <option key={x}>{x}</option>)}
          <option value="__own">Своё название…</option>
        </select>
        {f.part && !parts.includes(f.part) && <input className="mini-input" placeholder="Например: задание 25" value={f.part.trim()} onChange={(e) => setF({ ...f, part: e.target.value || " " })} />}
        <select className="mini-select" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
          {Object.entries(TASK_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <textarea className="mini-textarea" rows={3} placeholder="Текст задания" value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} />
      {f.type === "choice" && (
        <div className="tr-opts">
          <div className="hint-text">Варианты ответа, отметьте верный:</div>
          {f.options.map((o, i) => (
            <label key={i} className="row-gap">
              <input type="radio" name="tr-correct" checked={Number(f.correct) === i} onChange={() => setF({ ...f, correct: i })} />
              <input className="mini-input" style={{ flex: 1 }} placeholder={"Вариант " + (i + 1)} value={o} onChange={(e) => setF({ ...f, options: f.options.map((x, j) => (j === i ? e.target.value : x)) })} />
            </label>
          ))}
          <button className="btn-small" onClick={() => setF({ ...f, options: [...f.options, ""] })}>+ вариант</button>
        </div>
      )}
      {f.type === "short" && <input className="mini-input" placeholder="Верный ответ. Несколько вариантов — через «;»" value={f.answer} onChange={(e) => setF({ ...f, answer: e.target.value })} />}
      {f.type === "open" && <label className="hint-text">Максимальный балл: <input className="mini-input" type="number" min="1" style={{ width: 70 }} value={f.maxScore} onChange={(e) => setF({ ...f, maxScore: e.target.value })} /></label>}
      <textarea className="mini-textarea" rows={2} placeholder={f.type === "open" ? "Критерии оценивания и что должно быть в ответе" : "Пояснение: почему ответ такой (ученик увидит после ответа)"} value={f.explanation} onChange={(e) => setF({ ...f, explanation: e.target.value })} />
      <div className="row-gap">
        <button className="btn-small accent" disabled={!ok} onClick={() => onSave({ ...f, part: f.part.trim(), options: f.type === "choice" ? f.options.filter((o) => o.trim()) : [], maxScore: Number(f.maxScore) || 1 })}>Сохранить задание</button>
        <button className="btn-small" onClick={onCancel}>Отмена</button>
      </div>
    </div>
  );
}

// Статистика по номерам заданий: где теряются баллы.
function partStats(tasks, attempts) {
  const byId = Object.fromEntries(tasks.map((t) => [t.id, t]));
  const m = {};
  attempts.forEach((a) => {
    const t = byId[a.taskId]; if (!t) return;
    const k = t.exam + " · " + t.part;
    const r = (m[k] = m[k] || { key: k, n: 0, got: 0, max: 0 });
    r.n++;
    if (a.status === "pending") return;
    const max = t.type === "open" ? Number(t.maxScore) || 1 : 1;
    r.max += max;
    r.got += t.type === "open" ? Number(a.score) || 0 : a.correct ? 1 : 0;
  });
  return Object.values(m).map((r) => ({ ...r, pct: r.max ? Math.round((r.got / r.max) * 100) : null })).sort((a, b) => (a.pct ?? 101) - (b.pct ?? 101));
}

function Stats({ rows }) {
  if (!rows.length) return <div className="muted-text">Пока нет решённых заданий.</div>;
  return (
    <div className="tr-stats">
      {rows.map((r) => (
        <div key={r.key} className="tr-stat">
          <span>{r.key}</span>
          <div className="tr-bar"><i style={{ width: (r.pct ?? 0) + "%", background: r.pct === null ? "#E2DCCF" : r.pct >= 70 ? "#2F6F73" : r.pct >= 40 ? "#E7B93E" : "#B8303C" }} /></div>
          <b>{r.pct === null ? "на проверке" : r.pct + "%"}</b>
          <small>{r.n} реш.</small>
        </div>
      ))}
    </div>
  );
}

/* ----------------------------- преподаватель ----------------------------- */

export function TrainerTeacher({ teacher, subjectLabel, exams, partsOf, tasks, attempts, students, actions }) {
  const mine = tasks.filter((t) => t.subject === teacher.subject);
  const [exam, setExam] = useState("");
  const [form, setForm] = useState(null);
  const [review, setReview] = useState({});
  const myIds = new Set(students.map((s) => s.id));
  const pending = attempts.filter((a) => a.status === "pending" && myIds.has(a.studentId));
  const list = mine.filter((t) => !exam || t.exam === exam);
  const nameOf = (id) => students.find((s) => s.id === id)?.name || "ученик";

  return (
    <div className="tr">
      <div className="row-gap" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <div>
          <h3 className="lib-title">🎯 Тренажёр: {subjectLabel}</h3>
          <div className="hint-text">Банк заданий в формате экзамена. Его видят все преподаватели предмета, ученики решают задания в своём кабинете. Тестовые ответы проверяются сразу, развёрнутые приходят вам на проверку.</div>
        </div>
        {!form && <button className="btn-small accent" onClick={() => setForm(blank(teacher.subject, exam))}>+ Добавить задание</button>}
      </div>

      {pending.length > 0 && (
        <div className="tr-pending">
          <div className="field-label">✍️ Ждут проверки: {pending.length}</div>
          {pending.map((a) => {
            const t = tasks.find((x) => x.id === a.taskId) || {};
            const r = review[a.id] || { score: "", comment: "" };
            return (
              <div key={a.id} className="tr-rev">
                <div><b>{nameOf(a.studentId)}</b> <span className="muted-text">· {t.exam} · {t.part} · {fmtDay(a.at)}</span></div>
                <div className="tr-q">{t.text}</div>
                <div className="tr-ans">{a.answer}</div>
                {t.explanation && <div className="hint-text">Критерии: {t.explanation}</div>}
                <div className="row-gap" style={{ flexWrap: "wrap" }}>
                  <label className="hint-text">Балл: <input className="mini-input" type="number" min="0" max={t.maxScore} style={{ width: 70 }} value={r.score} onChange={(e) => setReview({ ...review, [a.id]: { ...r, score: e.target.value } })} /> из {t.maxScore}</label>
                  <input className="mini-input" style={{ flex: 1, minWidth: 200 }} placeholder="Комментарий ученику" value={r.comment} onChange={(e) => setReview({ ...review, [a.id]: { ...r, comment: e.target.value } })} />
                  <button className="btn-small accent" disabled={r.score === ""} onClick={() => { actions.reviewTrainerAttempt(a.id, Math.min(Number(r.score), Number(t.maxScore) || 99), r.comment); setReview({ ...review, [a.id]: undefined }); }}>Проверено</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {form && <TaskForm value={form} exams={exams} partsOf={partsOf} onCancel={() => setForm(null)} onSave={(v) => { v.id ? actions.updateTrainerTask(v.id, v) : actions.addTrainerTask({ ...v, id: uid(), author: teacher.name, createdAt: new Date().toISOString() }); setForm(null); }} />}

      <div className="row-gap" style={{ flexWrap: "wrap", margin: "12px 0 6px" }}>
        <span className="hint-text">Экзамен:</span>
        <button className={"btn-small" + (!exam ? " accent" : "")} onClick={() => setExam("")}>Все · {mine.length}</button>
        {exams.map((x) => <button key={x} className={"btn-small" + (exam === x ? " accent" : "")} onClick={() => setExam(x)}>{x} · {mine.filter((t) => t.exam === x).length}</button>)}
      </div>
      {list.length === 0 && <div className="muted-text">Заданий пока нет. Добавьте первое — его сразу увидят ученики.</div>}
      <div className="tr-list">
        {list.map((t) => {
          const at = attempts.filter((a) => a.taskId === t.id && a.status !== "pending");
          const ok = at.filter((a) => (t.type === "open" ? (Number(a.score) || 0) >= (Number(t.maxScore) || 1) / 2 : a.correct)).length;
          return (
            <div key={t.id} className="tr-item">
              <div className="tr-item-top">
                <span className="pill-mini">{t.exam} · {t.part}</span>
                <span className="pill-mini">{TASK_TYPES[t.type]}</span>
                {at.length > 0 && <span className="muted-text">решали {at.length} раз, верно {Math.round((ok / at.length) * 100)}%</span>}
                <span style={{ marginLeft: "auto" }} className="row-gap">
                  <button className="btn-small" onClick={() => setForm({ ...blank(t.subject), ...t, options: t.options?.length ? t.options : ["", "", "", ""] })}>Изменить</button>
                  <button className="btn-small" onClick={() => setForm({ ...blank(t.subject), ...t, id: undefined, options: t.options?.length ? t.options : ["", "", "", ""] })}>Похожее</button>
                  <button className="btn-small" onClick={() => { if (window.confirm("Удалить задание из банка?")) actions.removeTrainerTask(t.id); }}>Удалить</button>
                </span>
              </div>
              <div className="tr-q">{t.text}</div>
              {t.type === "choice" && <ol className="tr-olist">{t.options.map((o, i) => <li key={i} className={i === Number(t.correct) ? "ok" : ""}>{o}</li>)}</ol>}
              {t.type === "short" && <div className="hint-text">Ответ: {t.answer}</div>}
            </div>
          );
        })}
      </div>

      <div className="field-label" style={{ marginTop: 16 }}>📊 Мои ученики в тренажёре</div>
      {students.map((s) => {
        const rows = partStats(tasks, attempts.filter((a) => a.studentId === s.id));
        return rows.length ? <div key={s.id} style={{ marginBottom: 10 }}><b>{s.name}</b><Stats rows={rows} /></div> : null;
      })}
      {!students.some((s) => attempts.some((a) => a.studentId === s.id)) && <div className="muted-text">Ученики ещё не решали задания.</div>}
    </div>
  );
}

/* --------------------------------- ученик -------------------------------- */

export function TrainerStudent({ student, subject, subjectLabel, exams, tasks, attempts, actions }) {
  const bank = tasks.filter((t) => t.subject === subject);
  const myAtt = attempts.filter((a) => a.studentId === student.id);
  const defExam = exams.includes(student.examTarget?.exam) ? student.examTarget.exam : bank[0]?.exam || exams[0] || "";
  const [exam, setExam] = useState(defExam);
  const [part, setPart] = useState("");
  const [run, setRun] = useState(null); // { ids, i, answer, result }
  const parts = useMemo(() => [...new Set(bank.filter((t) => t.exam === exam).map((t) => t.part))], [bank, exam]);
  const pool = bank.filter((t) => t.exam === exam && (!part || t.part === part));

  const start = () => {
    const solved = new Set(myAtt.map((a) => a.taskId));
    const fresh = shuffle(pool.filter((t) => !solved.has(t.id)));
    const ids = [...fresh, ...shuffle(pool.filter((t) => solved.has(t.id)))].slice(0, 5).map((t) => t.id);
    setRun({ ids, i: 0, answer: "", result: null, got: 0, total: 0 });
  };

  if (run) {
    const t = tasks.find((x) => x.id === run.ids[run.i]);
    if (!t) return <div className="tr"><div className="tr-done">Готово! Верно {run.got} из {run.total} с автопроверкой.<div className="row-gap" style={{ marginTop: 10 }}><button className="btn-small accent" onClick={start}>Ещё 5 заданий</button><button className="btn-small" onClick={() => setRun(null)}>К статистике</button></div></div></div>;
    const submit = () => {
      const correct = autoCheck(t, run.answer);
      actions.addTrainerAttempt({ id: uid(), taskId: t.id, studentId: student.id, answer: t.type === "choice" ? t.options[Number(run.answer)] : run.answer, correct, status: correct === null ? "pending" : "auto", at: new Date().toISOString() });
      setRun({ ...run, result: correct === null ? "pending" : correct ? "ok" : "bad", got: run.got + (correct ? 1 : 0), total: run.total + (correct === null ? 0 : 1) });
    };
    return (
      <div className="tr">
        <div className="hint-text">Задание {run.i + 1} из {run.ids.length} · {t.exam} · {t.part}</div>
        <div className="tr-q big">{t.text}</div>
        {t.type === "choice" && t.options.map((o, i) => (
          <label key={i} className={"tr-choice" + (run.result && i === Number(t.correct) ? " ok" : run.result === "bad" && String(i) === String(run.answer) ? " bad" : "")}>
            <input type="radio" name="tr-a" disabled={!!run.result} checked={String(run.answer) === String(i)} onChange={() => setRun({ ...run, answer: String(i) })} /> {o}
          </label>
        ))}
        {t.type === "short" && <input className="mini-input" style={{ width: "100%" }} disabled={!!run.result} placeholder="Ваш ответ" value={run.answer} onChange={(e) => setRun({ ...run, answer: e.target.value })} />}
        {t.type === "open" && <textarea className="mini-textarea" rows={8} disabled={!!run.result} placeholder="Развёрнутый ответ" value={run.answer} onChange={(e) => setRun({ ...run, answer: e.target.value })} />}
        {run.result && (
          <div className={"tr-fb " + run.result}>
            {run.result === "ok" ? "✅ Верно!" : run.result === "bad" ? "❌ Неверно." + (t.type === "short" ? " Верный ответ: " + String(t.answer).split(";")[0] : "") : "✍️ Ответ отправлен преподавателю на проверку. Балл и комментарий появятся ниже, в «Мои развёрнутые ответы»."}
            {t.explanation && run.result !== "pending" && <div className="hint-text" style={{ marginTop: 4 }}>{t.explanation}</div>}
          </div>
        )}
        <div className="row-gap" style={{ marginTop: 10 }}>
          {!run.result ? <button className="btn-small accent" disabled={!String(run.answer).trim()} onClick={submit}>Ответить</button> : <button className="btn-small accent" onClick={() => setRun({ ...run, i: run.i + 1, answer: "", result: null })}>{run.i + 1 < run.ids.length ? "Следующее →" : "Итог"}</button>}
          <button className="btn-small" onClick={() => setRun(null)}>Выйти</button>
        </div>
      </div>
    );
  }

  const opens = myAtt.filter((a) => tasks.find((t) => t.id === a.taskId)?.type === "open").sort((a, b) => b.at.localeCompare(a.at));
  return (
    <div className="tr">
      <h3 className="lib-title">🎯 Тренажёр: {subjectLabel}</h3>
      <div className="hint-text">Задания в формате экзамена от преподавателей школы. Тест проверяется сразу, развёрнутые ответы проверяет преподаватель.</div>
      {bank.length === 0 ? <div className="muted-text" style={{ marginTop: 10 }}>Задания по вашему предмету скоро появятся.</div> : <>
        <div className="row-gap" style={{ flexWrap: "wrap", margin: "12px 0" }}>
          <select className="mini-select" value={exam} onChange={(e) => { setExam(e.target.value); setPart(""); }}>
            {[...new Set(bank.map((t) => t.exam))].map((x) => <option key={x}>{x}</option>)}
          </select>
          <select className="mini-select" value={part} onChange={(e) => setPart(e.target.value)}>
            <option value="">Все задания · {bank.filter((t) => t.exam === exam).length}</option>
            {parts.map((p) => <option key={p} value={p}>{p} · {bank.filter((t) => t.exam === exam && t.part === p).length}</option>)}
          </select>
          <button className="btn-small accent" disabled={!pool.length} onClick={start}>▶ Решать задания: {Math.min(5, pool.length)}</button>
        </div>
      </>}
      <div className="field-label">📊 Где я теряю баллы</div>
      <Stats rows={partStats(tasks, myAtt)} />
      {opens.length > 0 && <>
        <div className="field-label" style={{ marginTop: 14 }}>✍️ Мои развёрнутые ответы</div>
        {opens.map((a) => { const t = tasks.find((x) => x.id === a.taskId); return (
          <div key={a.id} className="tr-rev">
            <div className="muted-text">{t.exam} · {t.part} · {fmtDay(a.at)}</div>
            <div className="tr-q">{t.text}</div>
            <div className="tr-ans">{a.answer}</div>
            {a.status === "pending" ? <div className="hint-text">Ждёт проверки преподавателем</div> : <div><b>{a.score} из {t.maxScore}</b>{a.comment ? " · " + a.comment : ""}</div>}
          </div>
        ); })}
      </>}
    </div>
  );
}

export const TRAINER_CSS = `
.tr { display:flex; flex-direction:column; gap:8px; }
.tr-form { display:flex; flex-direction:column; gap:8px; margin:10px 0; }
.tr-opts { display:flex; flex-direction:column; gap:6px; }
.tr-list { display:flex; flex-direction:column; gap:10px; }
.tr-item { border:1px solid #E2D9CB; border-radius:14px; padding:12px 14px; background:#fff; }
.tr-item-top { display:flex; flex-wrap:wrap; gap:6px; align-items:center; margin-bottom:6px; }
.tr-q { font-size:15px; line-height:1.5; white-space:pre-wrap; }
.tr-q.big { font-size:17px; margin:6px 0 10px; }
.tr-olist { margin:6px 0 0; padding-left:20px; font-size:14px; }
.tr-olist li.ok { color:#2F6F73; font-weight:600; }
.tr-choice { display:flex; gap:8px; align-items:center; padding:10px 12px; border:1px solid #E2D9CB; border-radius:12px; margin-bottom:6px; cursor:pointer; background:#fff; }
.tr-choice.ok { border-color:#2F6F73; background:#eef3f3; }
.tr-choice.bad { border-color:#B8303C; background:#F7DCD9; }
.tr-fb { margin-top:8px; padding:10px 12px; border-radius:12px; background:#f5f0e8; }
.tr-fb.ok { background:#eef3f3; } .tr-fb.bad { background:#F7DCD9; } .tr-fb.pending { background:#FFF0C7; }
.tr-done { padding:18px; border-radius:16px; background:#eef3f3; font-size:16px; }
.tr-pending { background:#FFF0C7; border-radius:16px; padding:12px 14px; display:flex; flex-direction:column; gap:10px; }
.tr-rev { background:#fff; border-radius:12px; padding:10px 12px; display:flex; flex-direction:column; gap:6px; border:1px solid #E2D9CB; }
.tr-ans { background:#f5f0e8; border-radius:10px; padding:8px 10px; white-space:pre-wrap; font-size:14px; }
.tr-stats { display:flex; flex-direction:column; gap:6px; margin-top:4px; }
.tr-stat { display:grid; grid-template-columns:minmax(0,2fr) minmax(0,2fr) 90px 60px; gap:10px; align-items:center; font-size:14px; }
.tr-bar { height:10px; background:#EEE7DA; border-radius:6px; overflow:hidden; } .tr-bar i { display:block; height:100%; }
.tr-stat small { color:#8a887f; }
@media (max-width:600px){ .tr-stat { grid-template-columns:1fr 70px; } .tr-bar, .tr-stat small { display:none; } }
`;
