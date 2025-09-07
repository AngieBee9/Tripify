// src/services/RouterServices.js
import { useState, useEffect } from "react";

function norm(s) {
  return decodeURIComponent((s || "")).trim().toLowerCase();
}

function normalizeHash(h) {
  let v = (h || "").trim();
  if (!v || v === "#") return "#/";
  if (!v.startsWith("#")) v = "#" + v;
  if (!v.startsWith("#/")) v = "#/" + v.replace(/^#*/, "").replace(/^\/*/, "");
  // makni višestruke / na kraju
  return v.replace(/\/+$/, "");
}

export function parseRoute() {
  const current = normalizeHash(window.location.hash);
  const raw = current.replace(/^#/, ""); // bez #
  const [path, qs] = raw.split("?");
  const parts = (path || "/").split("/").filter(Boolean).map(norm);
  const query = Object.fromEntries(new URLSearchParams(qs || ""));

  // Početna
  if (parts.length === 0) return { name: "home", query };

  const seg0 = parts[0];
  const seg1 = parts[1];
  const seg2 = parts[2];

  // ✅ Profil
  if (seg0 === "profil") return { name: "profile", query };

  // Liste
  if (seg0 === "destinacije" && parts.length === 1) return { name: "destList", query };
  if (seg0 === "ture" && parts.length === 1)        return { name: "tourList", query };

  // Detalji
  if (seg0 === "destinacije" && seg1) return { name: "destDetail", slug: seg1, query };
  if (seg0 === "ture" && seg1)        return { name: "tourDetail", slug: seg1, query };

  // Kontakt
  if (seg0 === "kontakt") return { name: "contact", query };

  // ✅ AUTH
  if (seg0 === "prijava")       return { name: "prijava", query };
  if (seg0 === "registracija")  return { name: "registracija", query };

  // Rezervacija: #/rezervacija/<tip>/<slug>?date=...&pax=...
  if (seg0 === "rezervacija" && seg1 && seg2)
    return { name: "booking", tip: seg1, slug: seg2, query };

  // Početna s fokusom (Ponuda)
  if (seg0 === "ponuda") return { name: "home", focus: "ponuda", query };

  // Packing
  if (seg0 === "packing" && parts.length === 1) return { name: "packing", query };

  // Planer
  if (seg0 === "planer") return { name: "planer", query };

  // Galerija
  if (seg0 === "galerija") return { name: "gallery", query };

  // Savjeti za odgovorno putovanje
  if (seg0 === "savjeti-odgovorno") return { name: "tips", query };

  // Lokalni običaji & etiketa
  if (seg0 === "etiketa") return { name: "etiketa", query };

  // Fallback
  return { name: "notfound", query };
}

export function useHashRoute() {
  const [route, setRoute] = useState(() => parseRoute());

  useEffect(() => {
    // 1) Inicijalno uskladi hash (npr. "" -> "#/")
    const normalized = normalizeHash(window.location.hash);
    if (normalized !== window.location.hash) {
      window.location.hash = normalized;
      // nakon promjene hasha, hashchange će okinuti parseRoute
    } else {
      // ako je već ok, eksplicitno parsiraj
      setRoute(parseRoute());
    }

    // 2) Slušaj promjene
    const onHashChange = () => setRoute(parseRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = (to) => {
    const next = normalizeHash(to.startsWith("#") ? to : "#" + to);
    if (next !== window.location.hash) window.location.hash = next;
  };

  return [route, navigate];
}
