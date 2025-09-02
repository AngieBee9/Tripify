// src/services/RouterServices.js
import { useState, useEffect } from "react";

function norm(s) {
  return decodeURIComponent((s || "")).trim().toLowerCase();
}

export function parseRoute() {
  const rawHash = (window.location.hash || "#/").replace(/^#/, ""); // npr. "/rezervacija/ture/slug?date=2025-09-01&pax=2"
  const [path, qs] = rawHash.split("?");
  const parts = (path || "/").split("/").filter(Boolean).map(norm);
  const query = Object.fromEntries(new URLSearchParams(qs || ""));

  // Početna
  if (parts.length === 0) return { name: "home", query };

  const seg0 = parts[0];
  const seg1 = parts[1];
  const seg2 = parts[2];

  // Liste
  if (seg0 === "destinacije" && parts.length === 1) return { name: "destList", query };
  if (seg0 === "ture" && parts.length === 1)        return { name: "tourList", query };

  // Detalji
  if (seg0 === "destinacije" && seg1) return { name: "destDetail", slug: seg1, query };
  if (seg0 === "ture" && seg1)        return { name: "tourDetail", slug: seg1, query };

  // Kontakt
  if (seg0 === "kontakt") return { name: "contact", query };

  // Rezervacija: #/rezervacija/<tip>/<slug>?date=...&pax=...
  if (seg0 === "rezervacija" && seg1 && seg2)
    return { name: "booking", tip: seg1, slug: seg2, query };

  // Početna s fokusom
  if (seg0 === "ponuda") return { name: "home", focus: "ponuda", query };

  // Packing
  if (seg0 === "packing" && parts.length === 1) return { name: "packing", query };

  // Planer
  if (seg0 === "planer") return { name: "planer", query };

  // ✅ NOVO: Galerija
  if (seg0 === "galerija") return { name: "gallery", query };

  // Savjeti za odgovorno putovanje
  if (seg0 === "savjeti-odgovorno") return { name: "tips", query };

  // Lokalni običaji & etiketa
  if (seg0 === "etiketa") return { name: "etiketa", query };

  // Fallback
  return { name: "notfound", query };
}

export function useHashRoute() {
  const [route, setRoute] = useState(parseRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(parseRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = (to) => {
    window.location.hash = to.startsWith("#") ? to : "#" + to;
  };

  return [route, navigate];
}
