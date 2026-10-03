"use client";

import { useEffect, useState } from "react";
import { Activity, Target } from "lucide-react";

type GoalData = {
  metricCode: string;
  metricName: string;
  current: number;
  minimum: number;
  positive: number;
  dream: number;
  monthLabel: string;
  updatedAt?: string;
};

const number = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });

export function GoalCockpit() {
  const [data, setData] = useState<GoalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/goal", { cache: "no-store" })
      .then(async response => {
        if (!response.ok) throw new Error("Zieldaten konnten nicht geladen werden");
        return response.json() as Promise<GoalData | null>;
      })
      .then(setData)
      .catch(() => setError("Die zentralen Zieldaten sind momentan nicht erreichbar."))
      .finally(() => setLoading(false));
  }, []);

  return <section className="content goal-content">
    <div className="page-heading"><div className="heading-icon"><Target size={25}/></div><div><p className="overline">ZIEL-COCKPIT</p><h1>Monatsziel</h1><span>Aktueller Stand aus dem DeBruyn Praxis-Cockpit.</span></div></div>
    {loading && <div className="goal-state"><Activity className="pulse" size={28}/><strong>Zieldaten werden geladen …</strong></div>}
    {!loading && error && <div className="goal-state error"><strong>{error}</strong><span>Bitte später erneut versuchen.</span></div>}
    {!loading && !error && !data && <div className="goal-state"><Target size={28}/><strong>Noch kein aktives Ziel hinterlegt</strong><span>Das Ziel wird im DeBruynOS festgelegt.</span></div>}
    {data && <GoalGauge data={data}/>} 
  </section>;
}

function GoalGauge({ data }: { data: GoalData }) {
  const max = Math.max(data.dream, data.positive, data.minimum, 1);
  const ratio = Math.min(data.current / max, 1.08);
  const angle = -90 + ratio * 180;
  const achievement = data.positive ? Math.round(data.current / data.positive * 100) : 0;
  const status = data.current >= data.dream ? "Traumziel erreicht" : data.current >= data.positive ? "Positives Ziel erreicht" : data.current >= data.minimum ? "Minimalziel erreicht" : "Auf dem Weg zum Minimalziel";

  return <div className="goal-panel">
    <div className="goal-panel-head"><div><p className="overline">AUSGEWÄHLTE LEISTUNG</p><h2>{data.metricName}</h2><span>{data.metricCode} · {data.monthLabel}</span></div><div className="read-only-badge">Nur Ansicht</div></div>
    <div className="gauge-layout">
      <div className="gauge-wrap">
        <div className="gauge" style={{ "--needle-angle": `${angle}deg` } as React.CSSProperties}>
          <div className="gauge-arc"/>
          <div className="gauge-needle"><i/></div>
          <div className="gauge-center"><span>Aktuell</span><strong>{number.format(data.current)}</strong><small>Behandlungen</small></div>
        </div>
        <div className="gauge-scale"><span>0</span><span>{number.format(max)}</span></div>
      </div>
      <div className="goal-summary">
        <p className="overline">ZIELERREICHUNG</p><strong className="achievement">{achievement} %</strong><span className="goal-status">{status}</span>
        <div className="goal-levels">
          <Level className="minimum" label="Minimalziel" value={data.minimum}/>
          <Level className="positive" label="Gutes Ziel" value={data.positive}/>
          <Level className="dream" label="Traumziel" value={data.dream}/>
        </div>
      </div>
    </div>
    <p className="goal-note">Leistung und Zielwert werden zentral im DeBruynOS verwaltet.</p>
  </div>;
}

function Level({ label, value, className }: { label: string; value: number; className: string }) {
  return <div className={`goal-level ${className}`}><i/><span>{label}</span><strong>{number.format(value)}</strong></div>;
}
