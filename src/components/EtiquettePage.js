import React, { useState } from "react";

const PRESETS = [
  {
    key: "grcka",
    title: "Grčka",
    etiquette: [
      { h: "Pozdrav & bonton", p: "Uobičajen pozdrav je ‘Yasou’/‘Kalimera’. Kultura je srdačna; rukovanje je dovoljno uz osmijeh." },
      { h: "U bogomoljama", p: "Pristojna odjeća (pokrivena ramena/koljena). Tišina i bez bliceva." },
      { h: "Restorani & napojnice", p: "Napojnica 5–10% je cijenjena (ako nije uključeno u račun). Dijeljenje mezea je uobičajeno." },
      { h: "Plaže i okoliš", p: "Ne ostavljaj opuške/otpad, poštuj zaštitu morskih staništa." },
    ],
  },
  {
    key: "italija",
    title: "Italija",
    etiquette: [
      { h: "Pozdrav & bonton", p: "‘Buongiorno’/‘Buonasera’. Rukovanje, kontakt očima, ljubaznost i strpljenje." },
      { h: "Odjeća", p: "U crkvama i formalnim prostorima odjeća koja pokriva ramena i koljena." },
      { h: "Jelo & kava", p: "Jelo u više slijedova; cappuccino se tradicionalno pije ujutro." },
      { h: "Napojnice", p: "Obično nisu obavezne; ‘coperto’/‘servizio’ može biti na računu. Okrugli iznos je ok." },
    ],
  },
  {
    key: "maroko",
    title: "Maroko",
    etiquette: [
      { h: "Pozdrav & bonton", p: "‘Salam aleikum’ uz blagi naklon; poštuj osobni prostor." },
      { h: "Odjeća", p: "Umjereno odijevanje (posebno izvan turističkih zona)." },
      { h: "Tržnice", p: "Cjenkanje je uobičajeno i očekivano; radi to s osmijehom." },
      { h: "Vjera & običaji", p: "Poštuj vrijeme molitve i ramazan (diskrecija u javnoj konzumaciji)." },
    ],
  },
];

export default function EtiquettePage() {
  const [country, setCountry] = useState("");

  const active = PRESETS.find((p) => p.key === country);

  return (
  <div className="container" style={{ maxWidth: 900, margin: "0 auto", padding: "var(--header-h) 16px 0" }}>      <h1>Lokalni običaji & etiketa</h1>
      <p style={{ color: "var(--muted)" }}>
        Kratki bonton po destinacijama. Odaberi zemlju za brze savjete.
      </p>

      <div style={{ display: "grid", gap: 12, maxWidth: 520, marginTop: 16 }}>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className={!country ? "placeholder" : ""}
        >
          <option value="" disabled hidden>Odaberi destinaciju</option>
          {PRESETS.map((p) => (
            <option key={p.key} value={p.key}>{p.title}</option>
          ))}
        </select>

        {!active && (
          <div className="hint" style={{ color: "var(--muted)" }}>
            Nakon odabira, prikazat će se sažetak bontona, napojnica i preporuka odijevanja.
          </div>
        )}

        {active && (
          <div className="cards" style={{ marginTop: 8 }}>
            <div className="card" data-group={active.title}>
              <div className="card-head">
                <strong>{active.title}</strong>
              </div>
              <ul>
                {active.etiquette.map((row) => (
                  <li key={row.h} style={{ display: "block" }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{row.h}</div>
                    <div style={{ color: "var(--text)" }}>{row.p}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <hr className="split" />

      <div style={{ marginTop: 8 }}>
        <h2>Univerzalni savjeti</h2>
        <ul>
          <li>Uvjerenje: osmijeh i ‘hvala’ na lokalnom jeziku otvara vrata.</li>
          <li>Odjeća: poštuj lokalne norme u bogomoljama i institucijama.</li>
          <li>Napojnice: provjeri jesu li uključene u račun; zaokruživanje je često dovoljno.</li>
          <li>Fotografiranje: pitaj prije slikanja ljudi, posebno djece.</li>
          <li>Održivost: izbjegavaj jednokratnu plastiku, poštuj prirodu i javna pravila.</li>
        </ul>
      </div>
    </div>
  );
}
