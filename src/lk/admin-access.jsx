import React, { useEffect, useState } from "react";
import { ShieldCheck, Trash2, Plus } from "lucide-react";
import { FIXED_ADMINS, OWNER, loadAdmins, saveAdmins } from "./access.js";

/* Блок «Администраторы»: владелец видит и меняет список, остальные админы — только смотрят */
export default function AdminAccess({ session }) {
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [msg, setMsg] = useState("");
  useEffect(() => { loadAdmins().then(setList); }, []);
  const save = (next) => { setList(next); saveAdmins(next); };
  const add = () => {
    if (!name.trim() || !contact.trim()) { setMsg("Укажите имя и Telegram, телефон или почту"); return; }
    save([...list, { id: "adm_" + Math.random().toString(36).slice(2, 8), name: name.trim(), contacts: contact.split(",").map((c) => c.trim()).filter(Boolean), addedAt: new Date().toISOString() }]);
    setName(""); setContact(""); setMsg("Доступ выдан. Человек войдёт как администратор по этому контакту.");
  };
  return (
    <div className="card admin-access">
      <button className="products-dropdown-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        <ShieldCheck size={18} /> <h3 style={{ margin: 0 }}>Администраторы</h3>
        <span className="muted-text" style={{ marginLeft: 8 }}>{1 + FIXED_ADMINS.length + list.length} {FIXED_ADMINS.length + list.length === 0 ? "— только владелец" : "с доступом"}</span>
      </button>
      {open && (
        <div style={{ marginTop: 10 }}>
          <div className="materials-list" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div className="product-edit-row"><b>{OWNER.name}</b><span className="pill pill-gold">владелец</span><span className="muted-text">доступ закреплён, удалить нельзя</span></div>
            {FIXED_ADMINS.map((a) => (
              <div className="product-edit-row" key={a.id}>
                <b>{a.name}</b><span className="muted-text">{a.contacts.join(", ")}</span><span className="muted-text">закреплён в настройках сайта</span>
              </div>
            ))}
            {list.map((a) => (
              <div className="product-edit-row" key={a.id}>
                <b>{a.name}</b><span className="muted-text">{(a.contacts || []).join(", ")}</span>
                {session.isOwner && <button className="btn-icon danger" style={{ marginLeft: "auto" }} title="Забрать доступ" onClick={() => save(list.filter((x) => x.id !== a.id))}><Trash2 size={14} /></button>}
              </div>
            ))}
          </div>
          {session.isOwner ? (
            <div className="add-panel" style={{ marginTop: 10 }}>
              <div className="field-label">Выдать доступ администратора</div>
              <div className="row-gap">
                <input className="mini-input" placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} />
                <input className="mini-input wide" placeholder="@telegram, телефон или почта (можно через запятую)" value={contact} onChange={(e) => setContact(e.target.value)} />
                <button className="btn-small accent" onClick={add}><Plus size={13} /> Добавить</button>
              </div>
              {msg && <div className="hint-text">{msg}</div>}
            </div>
          ) : <div className="hint-text" style={{ marginTop: 8 }}>Выдавать и забирать доступ может только владелец.</div>}
        </div>
      )}
    </div>
  );
}
