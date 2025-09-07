// src/components/AvailabilityWidget.jsx
import React, { useMemo, useState } from "react";
import { getAvailabilityMonth, getBasePrice, computePriceCustom } from "../services/AvailabilityService";

const WD = ["Po","Ut","Sr","Če","Pe","Su","Ne"];

export default function AvailabilityWidget({ slug, initialPax = 2, reserveHrefBase, basePrice: basePriceProp }) {
  const today = new Date();
  const [cursor, setCursor] = useState(today);
  const [date, setDate]   = useState(null);
  const [pax, setPax]     = useState(initialPax);

  const y = cursor.getFullYear();
  const m = cursor.getMonth();

  // --- SIGURNA DOHVATNA FUNKCIJA (nikad ne puca) ---
  const safeMonth = useMemo(() => {
    try {
      const arr = getAvailabilityMonth(slug, y, m);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      console.warn("[Availability] getAvailabilityMonth error:", e);
      return [];
    }
  }, [slug, y, m]);

  const byDate = useMemo(() => {
    try {
      return Object.fromEntries(safeMonth.map(d => [d.date, d]));
    } catch {
      return {};
    }
  }, [safeMonth]);

  const basePrice = useMemo(() => {
    if (typeof basePriceProp === "number") return basePriceProp;
    try {
      const v = getBasePrice(slug);
      return typeof v === "number" ? v : 0;
    } catch {
      return 0;
    }
  }, [basePriceProp, slug]);

  const price = useMemo(() => {
    if (!date) return null;
    try {
      return computePriceCustom(slug, date, pax, basePrice);
    } catch (e) {
      console.warn("[Availability] computePriceCustom error:", e);
      return null;
    }
  }, [slug, date, pax, basePrice]);

  function monthName(d){ return d.toLocaleDateString("hr-HR", { month:"long", year:"numeric" }); }
  function ymd(d){ const Y=d.getFullYear(), M=String(d.getMonth()+1).padStart(2,"0"), D=String(d.getDate()).padStart(2,"0"); return `${Y}-${M}-${D}`; }

  const first = new Date(y, m, 1);
  const startOffset = (first.getDay()+6)%7; // pon=0
  const daysInMonth = new Date(y, m+1, 0).getDate();

  const cells = [];
  for (let i=0;i<startOffset;i++) cells.push({ empty:true, key:`b${i}` });
  for (let d=1; d<=daysInMonth; d++){
    const ds = ymd(new Date(y, m, d));
    // ⚠️ Default zapis da NIKAD ne bude undefined (inače bi c.date bio undefined i rušio render)
    const rec = byDate[ds] || { date: ds, available: 0, capacity: 0, blackout: true, season: null };
    cells.push({ key: ds, ...rec });
  }

  const selected = date ? byDate[date] : null;
  const canBook = selected && (selected.available ?? 0) >= pax && !selected.blackout && (selected.capacity ?? 0) > 0;

  const reserveHref = canBook
    ? (reserveHrefBase ? `${reserveHrefBase}?date=${date}&pax=${pax}` : `#/rezervacija/ture/${slug}?date=${date}&pax=${pax}`)
    : undefined;

  return (
    <div className="avw">
      <style>{css}</style>

      <div className="avw-head">
        <button className="avw-btn" onClick={() => setCursor(new Date(y, m-1, 1))}>‹</button>
        <strong>{monthName(cursor)}</strong>
        <button className="avw-btn" onClick={() => setCursor(new Date(y, m+1, 1))}>›</button>
      </div>

      <div className="avw-grid">
        {WD.map(w => <div key={w} className="avw-wd">{w}</div>)}
        {cells.map(c => c.empty ? (
          <div key={c.key} className="avw-cell avw-empty" />
        ) : (
          <button
            key={c.key}
            className={
              "avw-cell avw-day" +
              (date === c.date ? " avw-selected" : "") +
              ((c.blackout || (c.capacity ?? 0)===0 || (c.available ?? 0)===0) ? " avw-disabled" : "")
            }
            disabled={c.blackout || (c.capacity ?? 0)===0 || (c.available ?? 0)===0}
            onClick={() => setDate(c.date)}
            title={
              c.blackout ? "Nije dostupno" :
              `${c.available}/${c.capacity} mjesta — sezona: ${c.season?.name ?? "—"}`
            }
          >
            <div className="avw-n">{c.date.slice(-2)}</div>
            <div className="avw-a">{c.available}</div>
          </button>
        ))}
      </div>

      <div className="avw-side">
        <div className="avw-row">
          <label>
            Broj osoba
            <input
              type="number"
              min="1"
              max="10"
              value={pax}
              onChange={e => setPax(Math.max(1, Number(e.target.value||1)))}
            />
          </label>
        </div>
        <div className="avw-info">
          <div><strong>Osnovna cijena:</strong> {basePrice} € / osobi</div>
          {price ? (
            <>
              <div><strong>Sezona:</strong> {price.season?.name ?? "—"} {price.season?.multiplier ? `(×${price.season.multiplier})` : ""}</div>
              <div><strong>Cijena po osobi:</strong> {price.perPerson} €</div>
              <div><strong>Ukupno ({pax} os.):</strong> {price.subtotal} €</div>
              {selected && <div><strong>Slobodna mjesta:</strong> {selected.available}/{selected.capacity}</div>}
            </>
          ) : (
            <div>Odaberi datum u kalendaru.</div>
          )}
        </div>

        <a
          className={"avw-book" + (!canBook ? " avw-disabled" : "")}
          href={reserveHref}
          onClick={(e) => { if (!canBook) e.preventDefault(); }}
        >
          Rezerviraj
        </a>
        <div className="avw-muted">Cijene su informativne; potvrđuju se u zadnjem koraku.</div>
      </div>
    </div>
  );
}

const css = `
.avw{ display:grid; grid-template-columns: 2fr 1fr; gap:12px; border:1px solid #e6f0ea; border-radius:12px; padding:12px; }
.avw-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
.avw-btn{ border:1px solid #e6f0ea; background:#fff; border-radius:8px; padding:6px 10px; cursor:pointer; }

.avw-grid{ display:grid; grid-template-columns: repeat(7, 1fr); gap:6px; }
.avw-wd{ text-align:center; font-size:12px; color:#777; padding:4px 0; }
.avw-cell{ min-height:52px; border:1px solid #eef3f0; border-radius:10px; display:flex; align-items:center; justify-content:center; background:#fff; }
.avw-empty{ background:transparent; border:none; }
.avw-day{ flex-direction:column; gap:2px; cursor:pointer; }
.avw-day .avw-n{ font-weight:600; }
.avw-day .avw-a{ font-size:12px; color:#2e8b57; }
.avw-day.avw-selected{ outline:2px solid #2e8b57; outline-offset:-2px; }
.avw-day.avw-disabled{ opacity:.45; cursor:not-allowed; }
.avw-day.avw-disabled .avw-a{ color:#b42318; }

.avw-side{ display:flex; flex-direction:column; gap:10px; }
.avw-row label{ display:flex; flex-direction:column; gap:6px; font-size:.95rem; }
.avw-row input{ border:1px solid #e6f0ea; border-radius:10px; padding:10px 12px; font:inherit; }

.avw-info{ display:grid; gap:6px; font-size:.95rem; }
.avw-book{ display:inline-block; text-align:center; background:#2e8b57; color:#fff; border-radius:10px; padding:10px 14px; text-decoration:none; }
.avw-book.avw-disabled{ opacity:.5; pointer-events:none; }
.avw-muted{ color:#777; font-size:.9rem; }

@media (max-width: 980px){ .avw{ grid-template-columns: 1fr; } }
`;
