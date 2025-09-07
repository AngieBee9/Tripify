import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../services/firebase";

const mapError = (e) => {
  const c = e?.code || "";
  if (c === "auth/invalid-credential" || c === "auth/wrong-password" || c === "auth/user-not-found")
    return "Neispravan email ili lozinka.";
  return e?.message || "Došlo je do pogreške.";
};

export default function Prijava() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr(""); setOk("");
    try {
      await login(form.email, form.password);
      setOk("Prijava uspješna! Preusmjeravam…");
      setTimeout(() => { window.location.hash = "#/"; }, 2000);
    } catch (e) {
      setErr(mapError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="container" style={{ paddingTop: "calc(var(--header-h) + 24px)", maxWidth: 540 }}>
      <h1>Prijava</h1>

      {ok && <div className="alert ok">{ok}</div>}
      {err && <div className="alert err">{err}</div>}

      <form className="form-grid" onSubmit={onSubmit} style={{ maxWidth: 420 }}>
        <div className="field">
          <label>E-mail</label>
          <input className="input" type="email" name="email" required value={form.email} onChange={onChange}/>
        </div>
        <div className="field">
          <label>Lozinka</label>
          <input className="input" type="password" name="password" required value={form.password} onChange={onChange}/>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button className="btn" disabled={busy}>{busy ? "Prijavljujem..." : "Prijava"}</button>
          <button
            type="button"
            className="btn ghost"
            onClick={() => form.email ? sendPasswordResetEmail(auth, form.email) : alert("Upiši email pa klikni reset.")}
          >
            Zaboravljena lozinka
          </button>
        </div>
      </form>
    </main>
  );
}
