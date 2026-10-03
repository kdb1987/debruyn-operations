"use client";

import { useState } from "react";
import { CalculatorIcon, Gauge, Home, LogOut, Target } from "lucide-react";
import { Calculator } from "./calculator";
import { GoalCockpit } from "./goal-cockpit";

type View = "dashboard" | "calculator" | "goal";

export function OperationsApp() {
  const [view, setView] = useState<View>("dashboard");

  return <main className="app-shell">
    <header className="app-header">
      <button className="brand-button" onClick={() => setView("dashboard")} aria-label="Startseite öffnen">
        <img className="header-logo" src="/debruyn-bildmarke.png" alt="De Bruyn Physiotherapie" />
        <div><span>DE BRUYN PHYSIOTHERAPIE</span><strong>DeBruyn Operations</strong></div>
      </button>
      <div className="profile"><div><strong>Melanie Franke</strong><span>Teamleitung Rezeption &amp; operative Koordination</span></div><a href="/api/logout" aria-label="Abmelden"><LogOut size={18}/></a></div>
    </header>
    <div className="workspace">
      <aside className="side-nav">
        <p>ÜBERSICHT</p>
        <button className={view === "dashboard" ? "active" : ""} onClick={() => setView("dashboard")}><Home size={19}/>Startseite</button>
        <p className="nav-section">WERKZEUGE</p>
        <button className={view === "calculator" ? "active" : ""} onClick={() => setView("calculator")}><CalculatorIcon size={19}/>Kalkulation</button>
        <button className={view === "goal" ? "active" : ""} onClick={() => setView("goal")}><Target size={19}/>Ziel</button>
      </aside>
      {view === "dashboard" && <Dashboard open={setView}/>} 
      {view === "calculator" && <Calculator />}
      {view === "goal" && <GoalCockpit />}
    </div>
  </main>;
}

function Dashboard({ open }: { open: (view: View) => void }) {
  return <section className="content dashboard-content">
    <div className="dashboard-intro">
      <div><p className="overline">DEBRUYN OPERATIONS</p><h1>Guten Tag, Melanie.</h1><span>Was möchtest du heute bearbeiten?</span></div>
      <div className="dashboard-status"><i/>Operations bereit</div>
    </div>
    <div className="tool-grid">
      <button className="tool-card calculation-card" onClick={() => open("calculator")}>
        <div className="tool-icon"><CalculatorIcon size={30}/></div>
        <div><span className="tool-kicker">ANGEBOTE</span><h2>Kalkulation</h2><p>BGM-Veranstaltungen mit Personal, Fahrt und weiteren Kosten kalkulieren.</p></div>
        <strong>Öffnen</strong>
      </button>
      <button className="tool-card goal-card" onClick={() => open("goal")}>
        <div className="tool-icon"><Gauge size={31}/></div>
        <div><span className="tool-kicker">MONATSZIEL</span><h2>Ziel</h2><p>Aktuellen Stand der ausgewählten Leistung und Zielerreichung sehen.</p></div>
        <strong>Öffnen</strong>
      </button>
    </div>
  </section>;
}
