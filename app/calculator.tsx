"use client";

import { useEffect, useMemo, useState } from "react";
import { CalculatorIcon, ChevronDown, Clipboard, Euro, LogOut, Plus, Trash2, Users } from "lucide-react";

type Staff = { id: number; hours: string };
type Result = { staff:number; travelTime:number; mileage:number; travel:number; other:number; profit:number; total:number; externalStaff:number };
const money = new Intl.NumberFormat("de-DE", { style:"currency", currency:"EUR" });

export function Calculator() {
  const [staff,setStaff] = useState<Staff[]>([{id:1,hours:""}]);
  const [travelMinutes,setTravelMinutes] = useState("");
  const [kilometers,setKilometers] = useState("");
  const [other,setOther] = useState("");
  const [result,setResult] = useState<Result|null>(null);
  const [open,setOpen] = useState<"internal"|"external"|null>(null);
  const [copied,setCopied] = useState(false);
  const totalHours = useMemo(()=>staff.reduce((sum,item)=>sum+(Number(item.hours)||0),0),[staff]);

  function addStaff(){ setStaff(current=>[...current,{id:Math.max(...current.map(item=>item.id),0)+1,hours:""}]); setResult(null); }
  function removeStaff(id:number){ setStaff(current=>current.filter(item=>item.id!==id)); setResult(null); }
  async function calculate(payload?:{staffHours:number[];travelMinutes:number;kilometers:number;otherCosts:number}){
    const input=payload??{staffHours:staff.map(item=>Number(item.hours)||0),travelMinutes:Number(travelMinutes)||0,kilometers:Number(kilometers)||0,otherCosts:Number(other)||0};
    const response=await fetch("/api/calculate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(input)});
    if(!response.ok) throw new Error("Berechnung fehlgeschlagen");
    const data=await response.json() as Result; setResult(data); setOpen(null); return data;
  }
  async function copyExternal(){
    if(!result)return;
    await navigator.clipboard.writeText(`Personalkosten: ${money.format(result.externalStaff)}\nFahrtkosten: ${money.format(result.travel)}\nSonstige Kosten: ${money.format(result.other)}\nGesamtpreis: ${money.format(result.total)}`);
    setCopied(true); window.setTimeout(()=>setCopied(false),1800);
  }

  useEffect(()=>{
    const context=(document as Document&{modelContext?:{registerTool?:(tool:unknown,options?:{signal?:AbortSignal})=>void|Promise<void>}}).modelContext;
    if(!context?.registerTool)return;
    const lifecycle=new AbortController();
    void Promise.resolve(context.registerTool({name:"calculate_bgm_offer",title:"BGM-Angebot berechnen",description:"Berechnet den Gesamtpreis einer BGM-Veranstaltung aus Personalstunden, Fahrtzeit, Kilometern und sonstigen Kosten.",inputSchema:{type:"object",properties:{staffHours:{type:"array",items:{type:"number",minimum:0}},travelMinutes:{type:"number",minimum:0},kilometers:{type:"number",minimum:0},otherCosts:{type:"number",minimum:0}},required:["staffHours","travelMinutes","kilometers","otherCosts"],additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:async(input:unknown)=>calculate(input as {staffHours:number[];travelMinutes:number;kilometers:number;otherCosts:number})},{signal:lifecycle.signal})).catch(()=>undefined);
    return()=>lifecycle.abort();
  },[]);

  return <main className="app-shell">
    <header className="app-header">
      <div className="app-brand"><img className="header-logo" src="/debruyn-bildmarke.png" alt="De Bruyn Physiotherapie"/><div><span>DE BRUYN PHYSIOTHERAPIE</span><strong>DeBruyn Operations</strong></div></div>
      <div className="profile"><div><strong>Melanie Franke</strong><span>Teamleitung Rezeption &amp; operative Koordination</span></div><a href="/api/logout" aria-label="Abmelden"><LogOut size={18}/></a></div>
    </header>
    <div className="workspace">
      <aside className="side-nav"><p>WERKZEUGE</p><button className="active"><CalculatorIcon size={19}/>BGM-Kalkulation</button></aside>
      <section className="content">
        <div className="page-heading"><div className="heading-icon"><CalculatorIcon size={25}/></div><div><p className="overline">KOSTENKALKULATION</p><h1>BGM-Veranstaltung</h1><span>Personal, Anfahrt und weitere Kosten kalkulieren.</span></div></div>
        <div className="calculator-grid">
          <section className="form-card">
            <div className="card-heading"><div><span>01</span><div><strong>Personalbedarf</strong><small>{staff.length} {staff.length===1?"Person":"Personen"} · {totalHours.toLocaleString("de-DE")} Std.</small></div></div><Users size={21}/></div>
            <div className="staff-list">{staff.map((item,index)=><div className="staff-row" key={item.id}><span>Personal {index+1}</span><label><input aria-label={`Stunden Personal ${index+1}`} type="number" min="0" step="0.25" placeholder="0" value={item.hours} onChange={event=>{setStaff(current=>current.map(entry=>entry.id===item.id?{...entry,hours:event.target.value}:entry));setResult(null)}}/><em>Stunden</em></label>{staff.length>1&&<button onClick={()=>removeStaff(item.id)} aria-label={`Personal ${index+1} entfernen`}><Trash2 size={17}/></button>}</div>)}</div>
            <button className="add-button" onClick={addStaff}><Plus size={17}/>Weiteres Personal hinzufügen</button>
            <div className="section-divider"/>
            <div className="card-heading compact"><div><span>02</span><div><strong>Anfahrt &amp; Sonstiges</strong><small>Gesamtwerte für die Veranstaltung</small></div></div></div>
            <div className="input-grid">
              <label><span>Fahrtzeit gesamt</span><div><input type="number" min="0" step="5" placeholder="0" value={travelMinutes} onChange={event=>{setTravelMinutes(event.target.value);setResult(null)}}/><em>Minuten</em></div></label>
              <label><span>Strecke gesamt</span><div><input type="number" min="0" step="1" placeholder="0" value={kilometers} onChange={event=>{setKilometers(event.target.value);setResult(null)}}/><em>Kilometer</em></div></label>
              <label className="full"><span>Sonstige Kosten</span><div><input type="number" min="0" step="0.01" placeholder="0,00" value={other} onChange={event=>{setOther(event.target.value);setResult(null)}}/><em>Euro</em></div></label>
            </div>
            <button className="calculate-button" onClick={()=>void calculate()}><CalculatorIcon size={18}/>Gesamtpreis berechnen</button>
          </section>
          <aside className={`result-card ${result?"has-result":""}`}>
            <p className="overline">ERGEBNIS</p>
            {!result?<div className="result-empty"><Euro size={30}/><strong>Noch keine Kalkulation</strong><span>Trage die Werte ein und berechne anschließend den Gesamtpreis.</span></div>:<>
              <div className="price-block"><span>Gesamtpreis</span><strong>{money.format(result.total)}</strong><small>ohne Ausweis der Mehrwertsteuer</small></div>
              <Detail title="Interne Kalkulation" open={open==="internal"} toggle={()=>setOpen(open==="internal"?null:"internal")}><Row label="Personalkosten" value={result.staff}/><Row label="Fahrtzeit" value={result.travelTime}/><Row label="Kilometerkosten" value={result.mileage}/><Row label="Sonstige Kosten" value={result.other}/><Row label="Gewinnaufschlag (25 %)" value={result.profit}/><Row label="Gesamtpreis" value={result.total} total/></Detail>
              <Detail title="Externe Angebotsansicht" open={open==="external"} toggle={()=>setOpen(open==="external"?null:"external")}><Row label="Personalkosten" value={result.externalStaff}/><Row label="Fahrtkosten" value={result.travel}/><Row label="Sonstige Kosten" value={result.other}/><Row label="Gesamtpreis" value={result.total} total/><button className="copy-button" onClick={()=>void copyExternal()}><Clipboard size={16}/>{copied?"Kopiert":"Angebotsaufstellung kopieren"}</button></Detail>
            </>}
          </aside>
        </div>
      </section>
    </div>
  </main>;
}

function Detail({title,open,toggle,children}:{title:string;open:boolean;toggle:()=>void;children:React.ReactNode}){return <div className="detail-group"><button onClick={toggle}><span>{title}</span><ChevronDown className={open?"rotate":""} size={18}/></button>{open&&<div className="details">{children}</div>}</div>}
function Row({label,value,total}:{label:string;value:number;total?:boolean}){return <div className={total?"detail-row total":"detail-row"}><span>{label}</span><strong>{money.format(value)}</strong></div>}
