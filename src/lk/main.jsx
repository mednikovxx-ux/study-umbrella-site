import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { CalendarDays, NotebookPen, ListChecks, Wallet } from "lucide-react";
import App from "./app.jsx";
import { whoIs } from "./access.js";

const DEMO_ROLES = [
  { key: "student", label: "Ученик", who: "Маша Соколова, 11 класс", role: "student", studentId: "s1", department: "humanities" },
  { key: "parent", label: "Родитель", who: "Ирина Соколова — мама Маши", role: "student", studentId: "s1", department: "humanities" },
  { key: "teacher", label: "Преподаватель", who: "Антон Бердечевский", role: "teacher", teacherId: "t6", department: "humanities" },
];

function Login({ onDone }) {
  const [step, setStep] = useState("start");
  const [tab, setTab] = useState("phone");
  const [via, setVia] = useState("");
  const [phone, setPhone] = useState("");
  const [mail, setMail] = useState("");
  const [msg, setMsg] = useState("");
  const [me, setMe] = useState({ isAdmin: false, isOwner: false });
  const go = async (how, contact) => { setMe(await whoIs(contact)); setVia(how); setStep("role"); setMsg(""); };

  return (
    <div className="auth">
      <aside className="auth-side">
        <div className="auth-top">
          <a href="/"><img className="auth-logo" src="/img/logo-white.png" alt="Study Umbrella — на сайт" /></a>
          <a className="auth-back" href="/">← На сайт</a>
        </div>
        <div className="auth-copy">
          <p className="auth-hand">личный кабинет</p>
          <h1>Вся учёба — в одном окне</h1>
          <p>Расписание, домашние задания, план и остаток занятий. Для учеников, родителей, преподавателей и администратора.</p>
        </div>
        <ul className="auth-list">
          <li><CalendarDays size={20} />Ближайший урок и ссылка на него</li>
          <li><NotebookPen size={20} />Домашние задания и переписка с преподавателем</li>
          <li><ListChecks size={20} />Темы: что пройдено и что дальше</li>
          <li><Wallet size={20} />Сколько занятий осталось в пакете</li>
        </ul>
      </aside>
      <main className="auth-main">
        <div className="auth-card">
          {step === "start" && <>
            <h2>Вход</h2>
            <p className="auth-muted">По номеру телефона или почте, которые вы указывали при записи.</p>
            <div className="auth-tabs" role="tablist">
              <button role="tab" aria-selected={tab === "phone"} onClick={() => setTab("phone")}>Телефон</button>
              <button role="tab" aria-selected={tab === "mail"} onClick={() => setTab("mail")}>Почта</button>
            </div>
            {tab === "phone" ? (
              <form className="auth-form" onSubmit={(e) => { e.preventDefault(); if (phone.replace(/\D/g, "").length < 10) { setMsg("Введите номер полностью"); return; } setStep("code"); setMsg(""); }}>
                <label htmlFor="ph">Номер телефона</label>
                <input id="ph" inputMode="tel" autoComplete="tel" placeholder="+7 ___ ___-__-__" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <button className="auth-btn">Получить код</button>
              </form>
            ) : (
              <form className="auth-form" onSubmit={(e) => { e.preventDefault(); if (!mail.includes("@")) { setMsg("Проверьте адрес почты"); return; } go("почту", mail); }}>
                <label htmlFor="em">Почта</label>
                <input id="em" type="email" autoComplete="email" placeholder="name@mail.ru" value={mail} onChange={(e) => setMail(e.target.value)} />
                <label htmlFor="pw">Пароль</label>
                <input id="pw" type="password" autoComplete="current-password" />
                <button className="auth-btn">Войти</button>
                <button type="button" className="auth-link" onClick={() => { if (!mail.includes("@")) { setMsg("Сначала введите почту"); return; } setMsg("Ссылка для входа отправлена на " + mail + " (демо)"); }}>Войти по ссылке на почту, без пароля</button>
              </form>
            )}
            {msg && <p className="auth-msg" role="status">{msg}</p>}
            <button className="auth-link" onClick={() => { setStep("register"); setMsg(""); }}>Впервые здесь? Создать аккаунт</button>
          </>}

          {step === "code" && <>
            <h2>Код подтверждения</h2>
            <p className="auth-muted">Отправили код по SMS на {phone}.</p>
            <div className="auth-code">{[0, 1, 2, 3].map((i) => <input key={i} maxLength={1} inputMode="numeric" aria-label={"Цифра " + (i + 1)} onInput={(e) => { const n = e.target.nextElementSibling; if (e.target.value && n) n.focus(); }} autoFocus={i === 0} />)}</div>
            <p className="auth-hint">В демо подойдёт любой код.</p>
            <button className="auth-btn" onClick={() => go("телефон", phone)}>Войти</button>
            <button className="auth-link" onClick={() => setStep("start")}>Изменить номер</button>
          </>}

          {step === "register" && <>
            <h2>Создать аккаунт</h2>
            <p className="auth-muted">Если вы уже занимаетесь у нас, укажите тот же телефон, что при записи, — кабинет подтянет ваши занятия.</p>
            <form className="auth-form" onSubmit={(e) => { e.preventDefault(); const f = e.target; if (!f.rn.value || !f.rc.value) { setMsg("Заполните имя и контакт"); return; } go("регистрацию", f.rc.value); }}>
              <label htmlFor="rn">Имя</label><input id="rn" name="rn" autoComplete="name" />
              <label htmlFor="rc">Телефон или почта</label><input id="rc" name="rc" />
              <label htmlFor="rr">Кто вы</label>
              <select id="rr" name="rr"><option>Ученик</option><option>Родитель ученика</option><option>Преподаватель</option></select>
              <button className="auth-btn">Зарегистрироваться</button>
            </form>
            {msg && <p className="auth-msg" role="status">{msg}</p>}
            <p className="auth-hint">Новых учеников и преподавателей подтверждает администратор — после этого откроется доступ к расписанию.</p>
            <button className="auth-link" onClick={() => setStep("start")}>У меня уже есть аккаунт</button>
          </>}

          {step === "role" && <>
            <h2>Готово</h2>
            <p className="auth-muted">Вход через {via} выполнен. В рабочей версии кабинет сам поймёт, кто вы. В демо выберите, чей кабинет посмотреть:</p>
            <div className="auth-roles">
              {me.isAdmin && <button className="auth-role admin" onClick={() => onDone({ key: "admin", label: "Администратор", who: me.name + (me.isOwner ? " · владелец" : " · администратор"), role: "admin", department: "humanities", demo: true, isAdmin: true, isOwner: me.isOwner })}><b>Администратор</b><span>{me.name}{me.isOwner ? " — владелец школы" : ""}</span></button>}
              {DEMO_ROLES.map((r) => <button key={r.key} className="auth-role" onClick={() => onDone({ ...r, demo: true, isAdmin: me.isAdmin, isOwner: me.isOwner })}><b>{r.label}</b><span>{r.who}</span></button>)}
            </div>
            {!me.isAdmin && <p className="auth-hint">Вход администратора доступен только владельцу школы и тем, кому он выдал доступ.</p>}
          </>}
        </div>
      </main>
    </div>
  );
}

function Root() {
  const [session, setSession] = useState(null);
  if (!session) return <Login onDone={setSession} />;
  return <App key={session.key} session={session} onLogout={() => setSession(null)} />;
}

createRoot(document.getElementById("root")).render(<Root />);
