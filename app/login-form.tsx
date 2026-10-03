"use client";

import { useState } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";

export function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    const response = await fetch("/api/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password }) });
    setLoading(false);
    if (!response.ok) { setError("Das Passwort ist nicht richtig."); return; }
    window.location.reload();
  }

  return <main className="login-shell">
    <section className="login-panel">
      <img className="login-logo" src="/debruyn-logo.png" alt="De Bruyn Physiotherapie" />
      <p className="overline">DE BRUYN PHYSIOTHERAPIE</p>
      <h1>DeBruyn<br /><span>Operations</span></h1>
      <div className="person-line"><strong>Melanie Franke</strong><span>Teamleitung Rezeption &amp; operative Koordination</span></div>
      <form onSubmit={submit} className="login-form">
        <label htmlFor="password">Passwort</label>
        <div className="password-field"><LockKeyhole size={18} /><input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" autoFocus /></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button type="submit" disabled={loading || !password}>{loading ? "Wird geöffnet …" : "Operations öffnen"}<ArrowRight size={18} /></button>
      </form>
    </section>
    <aside className="login-accent" aria-hidden="true"><span>Organisation.<br />Klar kalkuliert.</span></aside>
  </main>;
}
