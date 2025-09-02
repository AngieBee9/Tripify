import "./PackingList.css";
import React, { useState, useEffect, useMemo } from "react";

const LS_KEY = "tripify.packing.v1";
const LS_CHECKED = "tripify.packing.checked.v1";
const LS_CUSTOM = "tripify.packing.custom.v1";

// Mapiranja za migraciju (eng -> hr)
const CLIMATE_TO_HR = {
  tropical: "Tropska",
  temperate: "Umjerena",
  cold: "Hladna",
  desert: "Pustinjska",
};
const SEASON_TO_HR = {
  summer: "Ljeto",
  winter: "Zima",
  shoulder: "Međusezona",
};

// Ako je već na hrvatskom, vrati istu vrijednost; ako je prazno, ostavi prazno (za placeholder)
const normalizeClimate = (val) => {
  if (!val) return "";
  return CLIMATE_TO_HR[val] || val;
};
const normalizeSeason = (val) => {
  if (!val) return "";
  return SEASON_TO_HR[val] || val;
};

const DEFAULT_FORM = {
  destination: "",
  climate: "",   // "" → placeholder "Klima"
  season: "",    // "" → placeholder "Godišnje doba"
  duration: 7,   // broj dana
  travelers: 1,
  withKids: false,
  activities: {
    beach: false,
    hiking: false,
    city: true,
    skiing: false,
    diving: false,
    business: false,
  },
};

// ====== POMOĆNE ======
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const ceil = Math.ceil;

function qtyRulePerDay(days, factor = 1, min = 1) {
  return Math.max(min, ceil(days * factor));
}
function qtyRuleEveryNDays(days, n = 2, min = 1) {
  return Math.max(min, ceil(days / n));
}
function multiplyByTravelers(q, travelers) {
  return Math.max(1, q * Math.max(1, travelers));
}

function itemKey(group, name) {
  return `${group}::${name}`.toLowerCase();
}

function toGroups(list) {
  const map = new Map();
  for (const it of list) {
    const g = it.group || "Ostalo";
    if (!map.has(g)) map.set(g, []);
    map.get(g).push({ name: it.name, qty: it.qty });
  }
  return Array.from(map.entries()).map(([group, items]) => ({ group, items }));
}

export default function PackingList() {
  // ——— STATE ———
  // učitavanje iz localStorage (s migracijom na placeholdere)
  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (!saved) return DEFAULT_FORM;

      const parsed = JSON.parse(saved);
      // Normalizacija (eng -> hr), ali dopusti prazno za placeholder
      let climate = normalizeClimate(parsed.climate);
      let season  = normalizeSeason(parsed.season);

      // 🔁 Jednokratna migracija: ako je stara shema (< v2) i vrijednosti su bile legacy defaulti,
      // resetiraj na "" kako bi se prikazali placeholderi.
      const v = Number(parsed._v || 1);
      if (v < 2) {
        if (climate === "Umjerena") climate = "";
        if (season  === "Ljeto")    season  = "";
      }

      return {
        ...DEFAULT_FORM,
        ...parsed,
        _v: 2, // ✅ nova shema
        climate,
        season,
        activities: { ...DEFAULT_FORM.activities, ...(parsed.activities || {}) },
      };
    } catch {
      return DEFAULT_FORM;
    }
  });

  // označenost stavki (checkboxi)
  const [checked, setChecked] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_CHECKED);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // korisničke stavke (trajna lista)
  const [customItems, setCustomItems] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_CUSTOM);
      return raw ? JSON.parse(raw) : []; // {group, name, qty, perPerson}
    } catch {
      return [];
    }
  });

  // za dodavanje vlastitih stavki
  const [newItem, setNewItem] = useState({
    group: "Moje stavke",
    name: "",
    qty: 1,
    perPerson: false,
  });

  // ——— SPREMANJE ———
  useEffect(() => {
    const payload = { ...form, _v: 2 }; // ✅ snimi verziju
    localStorage.setItem(LS_KEY, JSON.stringify(payload));
  }, [form]);

  useEffect(() => {
    localStorage.setItem(LS_CHECKED, JSON.stringify(checked));
  }, [checked]);

  useEffect(() => {
    localStorage.setItem(LS_CUSTOM, JSON.stringify(customItems));
  }, [customItems]);

  // ——— DEFINICIJE STAVKI (PRAVILA) ———
  // Svaka stavka: { group, name, qty: (days, travelers) => number }
  const ruleBase = useMemo(() => {
    return [
      // Dokumenti
      { group: "Dokumenti", name: "Osobna iskaznica / putovnica", qty: () => 1 },
      { group: "Dokumenti", name: "Vozačka dozvola (ako voziš)", qty: () => 1 },
      { group: "Dokumenti", name: "Kartice / novac", qty: () => 1 },
      { group: "Dokumenti", name: "Putno osiguranje (polica)", qty: () => 1 },
      // Osnovno – per person
      { group: "Osnovno", name: "Majice", qty: (d, t) => multiplyByTravelers(qtyRuleEveryNDays(d, 2, 2), t) },
      { group: "Osnovno", name: "Hlače / kratke hlače", qty: (d, t) => multiplyByTravelers(qtyRuleEveryNDays(d, 3, 1), t) },
      { group: "Osnovno", name: "Donje rublje", qty: (d, t) => multiplyByTravelers(qtyRulePerDay(d, 1, d), t) },
      { group: "Osnovno", name: "Čarape", qty: (d, t) => multiplyByTravelers(qtyRulePerDay(d, 1, d), t) },
      { group: "Osnovno", name: "Pidžama", qty: (d, t) => multiplyByTravelers(1, t) },
      { group: "Osnovno", name: "Cipele / tenisice", qty: (d, t) => multiplyByTravelers(1, t) },
      // Higijena – dijeljeno / per person
      { group: "Higijena", name: "Četkica + pasta za zube", qty: (d, t) => Math.max(1, t) },
      { group: "Higijena", name: "Dezodorans", qty: (d, t) => Math.max(1, t) },
      { group: "Higijena", name: "Gel/šampon (putno pakiranje)", qty: () => 1 },
      { group: "Higijena", name: "Krema / balzam", qty: () => 1 },
      { group: "Higijena", name: "Maramice / papirnate maramice", qty: (d) => Math.max(1, ceil(d / 3)) },
      // Tehnika
      { group: "Tehnika", name: "Mobitel + punjač", qty: (d, t) => Math.max(1, t) },
      { group: "Tehnika", name: "Power bank", qty: () => 1 },
      { group: "Tehnika", name: "Adapter/produžni (po potrebi)", qty: () => 1 },
      // Ljekarna (osnovno)
      { group: "Ljekarna", name: "Osnovni lijekovi (analgetik, probiotik)", qty: () => 1 },
      { group: "Ljekarna", name: "Flasteri / antiseptik", qty: () => 1 },
    ];
  }, []);

  const ruleSeasonClimate = useMemo(() => {
    const out = [];

    // Sezona
    if (form.season === "Ljeto") {
      out.push(
        { group: "Ljeto", name: "Krema za sunčanje (SPF 30+)", qty: () => 1 },
        { group: "Ljeto", name: "Sunčane naočale", qty: (d, t) => Math.max(1, t) },
        { group: "Ljeto", name: "Kapa/šešir", qty: (d, t) => Math.max(1, t) },
        { group: "Ljeto", name: "Lagani šal/marama", qty: () => 1 },
      );
    }
    if (form.season === "Zima") {
      out.push(
        { group: "Zima", name: "Topla jakna", qty: (d, t) => Math.max(1, t) },
        { group: "Zima", name: "Rukavice", qty: (d, t) => Math.max(1, t) },
        { group: "Zima", name: "Kapa / šal", qty: (d, t) => Math.max(1, t) },
        { group: "Zima", name: "Termo donje rublje", qty: (d, t) => multiplyByTravelers(qtyRuleEveryNDays(d, 2, 1), t) },
      );
    }

    // Klima
    if (form.climate === "Tropska") {
      out.push(
        { group: "Tropska klima", name: "Sredstvo protiv komaraca", qty: () => 1 },
        { group: "Tropska klima", name: "Lagana, prozračna odjeća", qty: (d, t) => multiplyByTravelers(qtyRuleEveryNDays(d, 1.5, 2), t) },
        { group: "Tropska klima", name: "Navlaka za kišu / lagana kabanica", qty: () => 1 },
      );
    }
    if (form.climate === "Pustinjska") {
      out.push(
        { group: "Pustinja", name: "Hidratantna krema", qty: () => 1 },
        { group: "Pustinja", name: "Marama za prašinu / buff", qty: (d, t) => Math.max(1, t) },
        { group: "Pustinja", name: "Boca za vodu (višekratna)", qty: (d, t) => Math.max(1, t) },
      );
    }
    if (form.climate === "Hladna") {
      out.push(
        { group: "Hladna klima", name: "Slojevita odjeća (fleece/džemper)", qty: (d, t) => multiplyByTravelers(qtyRuleEveryNDays(d, 2, 1), t) },
        { group: "Hladna klima", name: "Vodonepropusna obuća", qty: (d, t) => Math.max(1, t) },
      );
    }

    // Djeca
    if (form.withKids) {
      out.push(
        { group: "Djeca", name: "Grickalice", qty: (d) => Math.max(1, ceil(d / 2)) },
        { group: "Djeca", name: "Maramice / vlažne maramice", qty: (d) => Math.max(1, ceil(d / 2)) },
        { group: "Djeca", name: "Rezervna odjeća", qty: (d, t) => multiplyByTravelers(qtyRulePerDay(d, 1, d), t) },
        { group: "Djeca", name: "Igračke / zanimacija", qty: () => 1 },
      );
    }

    return out;
  }, [form.season, form.climate, form.withKids]);

  const ruleActivities = useMemo(() => {
    const A = form.activities || {};
    const out = [];

    if (A.beach) {
      out.push(
        { group: "Plaža", name: "Kupaći kostim", qty: (d, t) => multiplyByTravelers(qtyRuleEveryNDays(d, 2, 1), t) },
        { group: "Plaža", name: "Ručnik za plažu (brzosušeći)", qty: (d, t) => Math.max(1, t) },
        { group: "Plaža", name: "Japanke / sandale", qty: (d, t) => Math.max(1, t) },
        { group: "Plaža", name: "Krema poslije sunčanja (after sun)", qty: () => 1 },
      );
    }
    if (A.hiking) {
      out.push(
        { group: "Planinarenje", name: "GoResp cipele / treking tenisice", qty: (d, t) => Math.max(1, t) },
        { group: "Planinarenje", name: "Ruksak (20–30L)", qty: () => 1 },
        { group: "Planinarenje", name: "Prva pomoć (mini set)", qty: () => 1 },
        { group: "Planinarenje", name: "Hidrat. mijeh/boca", qty: (d, t) => Math.max(1, t) },
        { group: "Planinarenje", name: "Slojevita odjeća / kabanica", qty: () => 1 },
      );
    }
    if (A.city) {
      out.push(
        { group: "Grad", name: "Udobne tenisice za hodanje", qty: (d, t) => Math.max(1, t) },
        { group: "Grad", name: "Mala torbica / ruksak", qty: () => 1 },
      );
    }
    if (A.skiing) {
      out.push(
        { group: "Skijanje", name: "Ski jakna + hlače", qty: (d, t) => Math.max(1, t) },
        { group: "Skijanje", name: "Rukavice za skijanje", qty: (d, t) => Math.max(1, t) },
        { group: "Skijanje", name: "Kaciga / naočale", qty: () => 1 },
        { group: "Skijanje", name: "Termo čarape", qty: (d, t) => multiplyByTravelers(qtyRulePerDay(d, 1, d), t) },
      );
    }
    if (A.diving) {
      out.push(
        { group: "Ronjenje", name: "Maska / dihalica (ako nosiš svoju)", qty: () => 1 },
        { group: "Ronjenje", name: "Rash guard / odijelo (ovisno o vodi)", qty: () => 1 },
        { group: "Ronjenje", name: "Vodonepropusna torbica/kućište", qty: () => 1 },
      );
    }
    if (A.business) {
      out.push(
        { group: "Poslovno", name: "Formalna odjeća", qty: (d, t) => multiplyByTravelers(qtyRuleEveryNDays(d, 2, 1), t) },
        { group: "Poslovno", name: "Laptop + punjač", qty: () => 1 },
        { group: "Poslovno", name: "Vizitke / USB stick", qty: () => 1 },
      );
    }

    return out;
  }, [form.activities]);

  // ——— GENERIRANJE LISTE ———
  const generatedList = useMemo(() => {
    const d = clamp(Number(form.duration) || 1, 1, 60);
    const t = clamp(Number(form.travelers) || 1, 1, 12);

    // 1) bazne stavke + (sezona/klima) + aktivnosti
    const rules = [...ruleBase, ...ruleSeasonClimate, ...ruleActivities];

    // 2) dodaj korisničke (custom) – interpretiraj qty i perPerson
    const customExpanded = (customItems || []).map((ci) => {
      let q = Number(ci.qty) || 1;
      if (ci.perPerson) q = multiplyByTravelers(q, t);
      return { group: ci.group || "Moje stavke", name: ci.name.trim(), qty: () => q };
    });

    const all = [...rules, ...customExpanded];

    // 3) izračunaj konkretne količine i spoji duplikate po (group,name)
    const merged = new Map();
    for (const r of all) {
      const key = `${r.group}::${r.name}`;
      const addQty = Math.max(1, Number(r.qty(d, t) || 1));
      if (!merged.has(key)) {
        merged.set(key, { group: r.group, name: r.name, qty: addQty });
      } else {
        merged.get(key).qty += addQty;
      }
    }

    // 4) pretvori u grupe
    const finalList = Array.from(merged.values());
    finalList.sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));
    return toGroups(finalList);
  }, [form, ruleBase, ruleSeasonClimate, ruleActivities, customItems]);

  // ——— POMOĆNE AKCIJE ———
  const toggleChecked = (group, name) => {
    const key = itemKey(group, name);
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const markAllInGroup = (group, value) => {
    const updates = {};
    const g = generatedList.find((x) => x.group === group);
    if (!g) return;
    for (const it of g.items) {
      updates[itemKey(group, it.name)] = !!value;
    }
    setChecked((prev) => ({ ...prev, ...updates }));
  };

  const addCustomItem = () => {
    const name = (newItem.name || "").trim();
    if (!name) return alert("Unesi naziv stavke.");
    const entry = {
      group: newItem.group || "Moje stavke",
      name,
      qty: clamp(Number(newItem.qty) || 1, 1, 999),
      perPerson: !!newItem.perPerson,
    };
    setCustomItems((list) => [...list, entry]);
    setNewItem({ group: newItem.group, name: "", qty: 1, perPerson: newItem.perPerson });
  };

  const removeCustomItem = (group, name) => {
    setCustomItems((list) => list.filter((x) => !(x.group === group && x.name === name)));
    const key = itemKey(group, name);
    setChecked((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  // ====== RENDER ======
  return (
    <div className="packing">
      <h1>Packing lista</h1>
      <p>Pripremi popis stvari za putovanje. Lista se automatski prilagođava klimi, sezoni, aktivnostima, trajanju i broju putnika.</p>

      {/* ——— FORM ——— */}
      <div className="form mt-16">
        <input
          type="text"
          placeholder="Destinacija"
          value={form.destination}
          onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
        />

        {/* Klima s placeholderom */}
        <select
          className={form.climate ? "" : "placeholder"}
          value={form.climate}
          onChange={(e) => setForm((f) => ({ ...f, climate: e.target.value }))}
        >
          <option value="" disabled hidden>Klima</option>
          <option value="Tropska">Tropska</option>
          <option value="Umjerena">Umjerena</option>
          <option value="Hladna">Hladna</option>
          <option value="Pustinjska">Pustinjska</option>
        </select>

        {/* Godišnje doba s placeholderom */}
        <select
          className={form.season ? "" : "placeholder"}
          value={form.season}
          onChange={(e) => setForm((f) => ({ ...f, season: e.target.value }))}
        >
          <option value="" disabled hidden>Godišnje doba</option>
          <option value="Ljeto">Ljeto</option>
          <option value="Zima">Zima</option>
          <option value="Međusezona">Međusezona</option>
        </select>

        <div className="row two">
          <div>
            <label className="label">Trajanje (dana)</label>
            <input
              type="number"
              min={1}
              value={form.duration}
              onChange={(e) =>
                setForm((f) => ({ ...f, duration: clamp(Number(e.target.value || 1), 1, 60) }))
              }
            />
          </div>
          <div>
            <label className="label">Broj putnika</label>
            <input
              type="number"
              min={1}
              value={form.travelers}
              onChange={(e) =>
                setForm((f) => ({ ...f, travelers: clamp(Number(e.target.value || 1), 1, 12) }))
              }
            />
          </div>
        </div>

        <div className="row three">
          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.withKids}
              onChange={(e) => setForm((f) => ({ ...f, withKids: e.target.checked }))}
            />
            Putujem s djecom
          </label>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.activities.beach}
              onChange={(e) => setForm((f) => ({ ...f, activities: { ...f.activities, beach: e.target.checked } }))}
            />
            Plaža
          </label>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.activities.hiking}
              onChange={(e) => setForm((f) => ({ ...f, activities: { ...f.activities, hiking: e.target.checked } }))}
            />
            Planinarenje
          </label>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.activities.city}
              onChange={(e) => setForm((f) => ({ ...f, activities: { ...f.activities, city: e.target.checked } }))}
            />
            Grad
          </label>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.activities.skiing}
              onChange={(e) => setForm((f) => ({ ...f, activities: { ...f.activities, skiing: e.target.checked } }))}
            />
            Skijanje
          </label>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.activities.diving}
              onChange={(e) => setForm((f) => ({ ...f, activities: { ...f.activities, diving: e.target.checked } }))}
            />
            Ronjenje
          </label>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.activities.business}
              onChange={(e) => setForm((f) => ({ ...f, activities: { ...f.activities, business: e.target.checked } }))}
            />
            Poslovno
          </label>
        </div>
      </div>

      <hr className="split" />

      {/* ——— CUSTOM DODAVANJE ——— */}
      <div className="form" style={{ marginTop: 8 }}>
        <h3 style={{ margin: "0 0 8px" }}>Dodaj vlastitu stavku</h3>
        <div className="row three">
          <input
            type="text"
            placeholder="Naziv stavke (npr. knjiga)"
            value={newItem.name}
            onChange={(e) => setNewItem((s) => ({ ...s, name: e.target.value }))}
          />
          <input
            type="text"
            placeholder="Grupa (npr. Moje stavke)"
            value={newItem.group}
            onChange={(e) => setNewItem((s) => ({ ...s, group: e.target.value }))}
          />
          <input
            type="number"
            min={1}
            placeholder="Količina"
            value={newItem.qty}
            onChange={(e) => setNewItem((s) => ({ ...s, qty: clamp(Number(e.target.value || 1), 1, 999) }))}
          />
        </div>
        <label className="checkbox" style={{ marginTop: 6 }}>
          <input
            type="checkbox"
            checked={newItem.perPerson}
            onChange={(e) => setNewItem((s) => ({ ...s, perPerson: e.target.checked }))}
          />
          Pomnoži količinu s brojem putnika
        </label>
        <div className="form-actions" style={{ marginTop: 8 }}>
          <button className="btn primary" onClick={addCustomItem}>Dodaj</button>
        </div>
      </div>

      {/* ——— LISTE ——— */}
      <div className="cards" style={{ marginTop: 16 }}>
        {generatedList.map((g) => {
          const doneCount = g.items.filter((it) => checked[itemKey(g.group, it.name)]).length;
          return (
            <div key={g.group} className="card" data-group={g.group}>
              <div className="card-head">
                <strong>{g.group}</strong>
                <small style={{ color: "var(--muted)" }}>
                  {doneCount}/{g.items.length} označeno
                </small>
              </div>

              <div className="group-actions">
                <button className="btn subtle" onClick={() => markAllInGroup(g.group, true)}>Označi sve</button>
                <button className="btn subtle" onClick={() => markAllInGroup(g.group, false)}>Poništi sve</button>
              </div>

              <ul>
                {g.items.map((it) => {
                  const k = itemKey(g.group, it.name);
                  const isChecked = !!checked[k];
                  return (
                    <li key={it.name} className={isChecked ? "done" : ""}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleChecked(g.group, it.name)}
                      />
                      <span style={{ flex: 1 }}>{it.name}</span>
                      <em>× {it.qty}</em>

                      {/* gumb za brisanje samo za custom stavke */}
                      {customItems.some((c) => c.group === g.group && c.name === it.name) && (
                        <button className="btn subtle danger" onClick={() => removeCustomItem(g.group, it.name)}>Obriši</button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
