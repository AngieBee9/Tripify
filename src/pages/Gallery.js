// src/pages/Gallery.jsx
import React from "react";
import DataService from "../services/DataServices";
import "./Gallery.css";

export default function Gallery() {
  const items = [
    ...(DataService.DESTINACIJE || []),
    ...(DataService.TURE || []),
  ];

  // ⬇️ Ovdje stavi sve URL-ove koje želiš isključiti iz galerije
  const BLOCKED_URLS = new Set([
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=70",
  ]);

  // helper: ukloni duplikate i blokirane URL-ove
  const dedupe = (arr, seenSet) => {
    const localSeen = new Set();
    return arr.filter((u) => {
      const key = String(u || "").trim().toLowerCase();
      if (!key) return false;
      if (BLOCKED_URLS.has(u)) return false; // blokiraj ručno zadane fotke
      if (localSeen.has(key)) return false;  // dupe unutar lokacije
      if (seenSet && seenSet.has(key)) return false; // dupe globalno
      localSeen.add(key);
      if (seenSet) seenSet.add(key);
      return true;
    });
  };

  const globalSeen = new Set();

  return (
    <main className="gallery page">
      <header className="gallery__header">
        <h1>📸 Galerija fotografija</h1>
        <p>Fotografije s različitih lokacija iz naše ponude.</p>
      </header>

      {items.map((item) => {
        const raw = [item.slika, ...(item.gallery || [])].filter(Boolean);

        // izbaci blocked i duplikate
        const photos = dedupe(raw, globalSeen);

        if (photos.length === 0) return null;

        return (
          <section className="gallery__section" key={item.slug}>
            <h2>{item.naziv}</h2>
            <div className="gallery__grid">
              {photos.map((src, i) => (
                <div className="gallery__card" key={`${item.slug}-${i}`}>
                  <img
                    src={src}
                    alt={`${item.naziv} ${i + 1}`}
                    loading="lazy"
                    onError={DataService.imageFallback}
                  />
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
