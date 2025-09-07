// src/components/Registracija.jsx
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const mapError = (e) => {
  const c = e?.code || "";
  if (c === "auth/email-already-in-use") return "Taj email je već registriran.";
  if (c === "auth/weak-password") return "Lozinka mora imati barem 6 znakova.";
  return e?.message || "Došlo je do pogreške.";
};

export default function Registracija() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr(""); setOk("");
    try {
      await register({ email: form.email, password: form.password, displayName: form.name });
      setOk("Račun je kreiran! Prijavljujem i preusmjeravam…");
      setTimeout(() => { window.location.hash = "#/"; }, 2000);
    } catch (e) {
      setErr(mapError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="container" style={{ paddingTop: "calc(var(--header-h) + 24px)", maxWidth: 620 }}>
      <h1>Registracija</h1>

      {ok && <div className="alert ok">{ok}</div>}
      {err && <div className="alert err">{err}</div>}

      <form className="form-grid" onSubmit={onSubmit} style={{ maxWidth: 480 }}>
        <div className="field">
          <label>Ime i prezime (ili korisničko ime)</label>
          <input className="input" name="name" value={form.name} onChange={onChange}/>
        </div>

        <div className="field">
          <label>E-mail</label>
          <input className="input" type="email" name="email" required value={form.email} onChange={onChange}/>
        </div>

        {/* ⬇️ NOVO: lozinka + gumb u istom redu, poravnati po dnu */}
        <div className="row-end">
          <div className="field" style={{ flex: 1 }}>
            <label>Lozinka (min. 6 znakova)</label>
            <input
              className="input"
              type="password"
              name="password"
              required
              minLength={6}
              value={form.password}
              onChange={onChange}
            />
          </div>

          <button className="btn" disabled={busy} type="submit">
            {busy ? "Kreiram..." : "Kreiraj račun"}
          </button>
        </div>
      </form>
    </main>
  );
}
