// src/services/AvailabilityService.js
const CONFIG = {
  // ⬇️ OVDJE upiši SVOJE stvarne slugove i baze cijena za najbolje rezultate
  // "tura-toskana-7dana": { basePrice: 120, seasons:[...], capacity:{ defaultPerDay:20, overrides:{} }, blackout: [] },
};

function cfgFor(slug){
  return CONFIG[slug] || {
    basePrice: 100,
    seasons: [{ name: "standard", multiplier: 1, ranges: [["2025-01-01","2025-12-31"]] }],
    capacity: { defaultPerDay: 20, overrides: {} },
    blackout: [],
  };
}

function fmt(d){ const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,"0"), dd=String(d.getDate()).padStart(2,"0"); return `${y}-${m}-${dd}`; }
function inRange(dateStr,[a,b]){ return dateStr>=a && dateStr<=b; }

function seasonFor(slug, dateStr){
  const cfg = cfgFor(slug);
  for (const s of cfg.seasons) for (const r of s.ranges) if (inRange(dateStr,r)) return { name:s.name, multiplier:s.multiplier };
  return { name:"standard", multiplier:1 };
}
function dayCapacity(slug, dateStr){
  const c = cfgFor(slug).capacity;
  if (!c) return 0;
  if (c.overrides && c.overrides[dateStr] != null) return c.overrides[dateStr];
  return c.defaultPerDay ?? 0;
}
function isBlackout(slug, dateStr){ return (cfgFor(slug).blackout || []).includes(dateStr); }

export function getBasePrice(slug){ return cfgFor(slug).basePrice; }

export function getAvailabilityMonth(slug, year, month /* 0-11 */){
  const first = new Date(year, month, 1);
  const last  = new Date(year, month+1, 0);
  const out = [];
  for (let d=new Date(first); d<=last; d.setDate(d.getDate()+1)){
    const ds = fmt(d);
    const blackout = isBlackout(slug, ds);
    const capacity = blackout ? 0 : dayCapacity(slug, ds);
    const available = capacity; // demo
    out.push({ date: ds, available, capacity, blackout, season: seasonFor(slug, ds) });
  }
  return out;
}

/** Fleks cijena s base override: computePriceCustom(slug, dateStr, pax, baseOverride) */
export function computePriceCustom(slug, dateStr, pax, baseOverride){
  const base = baseOverride ?? getBasePrice(slug);
  const s = seasonFor(slug, dateStr);
  const d = new Date(dateStr);
  const weekend = [0,6].includes(d.getDay());   // ned/ sub
  let per = base * s.multiplier + (weekend ? 5 : 0); // vikendom +5€/os
  if (pax >= 4) per *= 0.95;                     // 4+ osoba -5%
  per = Math.round(per);
  return { perPerson: per, subtotal: per * Math.max(1, pax), season: s };
}
