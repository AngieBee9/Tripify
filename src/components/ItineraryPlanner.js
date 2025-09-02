// src/components/ItineraryPlanner.jsx
import React, { useEffect, useState, useRef } from "react";
import "./ItineraryPlanner.css";
import Timeline from "./Timeline";

const LS_KEY = "tripify.itinerary.v1";

/* KATEGORIJE */
const CATEGORIES = [
  { id: "transfer", label: "Transfer", emoji: "🚐", color: "#4e7ad1" },
  { id: "smjestaj", label: "Smještaj", emoji: "🏨", color: "#8b5cf6" },
  { id: "aktivnost", label: "Aktivnost", emoji: "🎯", color: "#2e8b57" },
  { id: "hrana", label: "Hrana & piće", emoji: "🍴", color: "#d97706" },
  { id: "slobodno", label: "Slobodno", emoji: "🧘", color: "#64748b" },
  { id: "ostalo", label: "Ostalo", emoji: "🗒️", color: "#475569" },
];

/* POMOĆNE */
const DEFAULT_TRIP = {
  title: "Moj plan putovanja",
  destination: "",
  startDate: formatDateInput(new Date()),
  days: 3,
  baseCost: 0, // osnovni trošak (let/smještaj/paket)
};

const EMPTY_ITEMS_FOR = (days) =>
  Array.from({ length: Math.max(1, days) }, () => []);

function uid() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
  ).toUpperCase();
}
function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}
function parseHHMM(s) {
  if (!s) return null;
  const [h, m] = s.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}
function toHHMM(mins) {
  const h = Math.floor(mins / 60).toString().padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function formatDateInput(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function dateFromInput(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function toCurrency(n) {
  try {
    return new Intl.NumberFormat("hr-HR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(n || 0);
  } catch {
    return `${n} €`;
  }
}
function sortByStartThenTitle(a, b) {
  const as = parseHHMM(a.start) ?? 0;
  const bs = parseHHMM(b.start) ?? 0;
  if (as !== bs) return as - bs;
  return (a.title || "").localeCompare(b.title || "");
}

export default function ItineraryPlanner() {
  const [trip, setTrip] = useState(DEFAULT_TRIP);
  const [items, setItems] = useState(EMPTY_ITEMS_FOR(DEFAULT_TRIP.days));
  const [activeDay, setActiveDay] = useState(0);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "",
    categoryId: "aktivnost",
    location: "",
    start: "09:00",
    end: "10:00",
    cost: "",
    note: "",
  });
  const [showMenu, setShowMenu] = useState(false);

  const fileInputRef = useRef(null);

  const DAY_START = 6 * 60;
  const DAY_END = 24 * 60;

  // Load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.trip && parsed.items) {
          setTrip({
            ...DEFAULT_TRIP,
            ...parsed.trip,
            baseCost: Number(parsed.trip.baseCost) || 0,
          });
          const days = Math.max(
            1,
            parsed.trip?.days || DEFAULT_TRIP.days
          );
          const normalized = Array.from({ length: days }, (_, i) =>
            Array.isArray(parsed.items[i]) ? parsed.items[i] : []
          );
          setItems(normalized);
          setActiveDay(0);
          return;
        }
      }
      setItems(EMPTY_ITEMS_FOR(DEFAULT_TRIP.days));
    } catch (e) {
      console.warn("LS read error", e);
      setItems(EMPTY_ITEMS_FOR(DEFAULT_TRIP.days));
    }
  }, []);

  // Save
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ trip, items }));
    } catch (e) {
      console.warn("LS write error", e);
    }
  }, [trip, items]);

  // Sinkronizacija broja dana
  useEffect(() => {
    setItems((prev) => {
      const copy = [...prev];
      if (trip.days > copy.length) {
        for (let i = copy.length; i < trip.days; i++) copy.push([]);
      } else if (trip.days < copy.length) {
        copy.length = trip.days;
      }
      return copy;
    });
    setActiveDay((d) => clamp(d, 0, Math.max(0, trip.days - 1)));
  }, [trip.days]);

  const dayItems = items[activeDay] || [];
  const dayDate = (index) => addDays(dateFromInput(trip.startDate), index);

  function resetForm() {
    setForm({
      title: "",
      categoryId: "aktivnost",
      location: "",
      start: "09:00",
      end: "10:00",
      cost: "",
      note: "",
    });
    setEditing(null);
  }
  function validateForm(f) {
    const errs = [];
    if (!f.title.trim()) errs.push("Unesi naziv aktivnosti.");
    const s = parseHHMM(f.start);
    const e = parseHHMM(f.end);
    if (s == null || e == null) errs.push("Vrijeme mora biti u formatu HH:MM.");
    if (s != null && e != null && e < s)
      errs.push("Završetak ne može biti prije početka.");
    return errs;
  }

  function addOrUpdateItem() {
    const errors = validateForm(form);
    if (errors.length) return window.alert("Provjeri:\n" + errors.join("\n"));
    if (editing) {
      setItems((prev) => {
        const copy = prev.map((d) => [...d]);
        const idx = copy[editing.dayIndex].findIndex(
          (x) => x.id === editing.id
        );
        if (idx !== -1) {
          copy[editing.dayIndex][idx] = {
            ...copy[editing.dayIndex][idx],
            title: form.title.trim(),
            categoryId: form.categoryId,
            location: form.location.trim(),
            start: form.start,
            end: form.end,
            cost: Number(form.cost) || 0,
            note: form.note,
          };
          copy[editing.dayIndex].sort(sortByStartThenTitle);
        }
        return copy;
      });
      resetForm();
    } else {
      const newItem = {
        id: uid(),
        title: form.title.trim(),
        categoryId: form.categoryId,
        location: form.location.trim(),
        start: form.start,
        end: form.end,
        cost: Number(form.cost) || 0,
        note: form.note,
        done: false,
      };
      setItems((prev) => {
        const copy = prev.map((d) => [...d]);
        copy[activeDay].push(newItem);
        copy[activeDay].sort(sortByStartThenTitle);
        return copy;
      });
      resetForm();
    }
  }

  function editItem(dayIndex, id) {
    const it = items[dayIndex].find((x) => x.id === id);
    if (!it) return;
    setEditing({ dayIndex, id });
    setForm({
      title: it.title,
      categoryId: it.categoryId,
      location: it.location || "",
      start: it.start || "09:00",
      end: it.end || "10:00",
      cost: String(it.cost ?? ""),
      note: it.note || "",
    });
  }

  function deleteItem(dayIndex, id) {
    if (!window.confirm("Obrisati ovu aktivnost?")) return;
    setItems((prev) =>
      prev.map((d, i) => (i === dayIndex ? d.filter((x) => x.id !== id) : d))
    );
    if (editing?.id === id && editing?.dayIndex === dayIndex) resetForm();
  }

  function duplicateItem(dayIndex, id) {
    const it = items[dayIndex].find((x) => x.id === id);
    if (!it) return;
    const clone = { ...it, id: uid(), title: it.title + " (kopija)" };
    setItems((prev) => {
      const copy = prev.map((d) => [...d]);
      copy[dayIndex].push(clone);
      copy[dayIndex].sort(sortByStartThenTitle);
      return copy;
    });
  }

  function nudgeItem(dayIndex, id, deltaMinutes) {
    setItems((prev) => {
      const copy = prev.map((d) => [...d]);
      const idx = copy[dayIndex].findIndex((x) => x.id === id);
      if (idx === -1) return prev;
      const it = { ...copy[dayIndex][idx] };
      const s = parseHHMM(it.start);
      const e = parseHHMM(it.end);
      if (s == null || e == null) return prev;
      let ns = clamp(s + deltaMinutes, 0, 24 * 60);
      let ne = clamp(e + deltaMinutes, 0, 24 * 60);
      if (ne < ns) ne = ns;
      it.start = toHHMM(ns);
      it.end = toHHMM(ne);
      copy[dayIndex][idx] = it;
      copy[dayIndex].sort(sortByStartThenTitle);
      return copy;
    });
  }

  function toggleDone(dayIndex, id) {
    setItems((prev) => {
      const copy = prev.map((d) => [...d]);
      const idx = copy[dayIndex].findIndex((x) => x.id === id);
      if (idx === -1) return prev;
      copy[dayIndex][idx] = {
        ...copy[dayIndex][idx],
        done: !copy[dayIndex][idx].done,
      };
      return copy;
    });
  }

  function moveItemToTime(id, newStartMin, newEndMin) {
    setItems((prev) => {
      const copy = prev.map((d) => [...d]);
      const idx = copy[activeDay].findIndex((x) => x.id === id);
      if (idx === -1) return prev;
      const it = { ...copy[activeDay][idx] };
      it.start = toHHMM(newStartMin);
      it.end = toHHMM(newEndMin);
      copy[activeDay][idx] = it;
      copy[activeDay].sort(sortByStartThenTitle);
      return copy;
    });
  }

  function clearDay(dayIndex) {
    if (!window.confirm("Obrisati SVE aktivnosti za ovaj dan?")) return;
    setItems((prev) => prev.map((d, i) => (i === dayIndex ? [] : d)));
    resetForm();
  }
  function resetAll() {
    if (!window.confirm("Resetirati cijeli planer (sve dane)?")) return;
    setTrip(DEFAULT_TRIP);
    setItems(EMPTY_ITEMS_FOR(DEFAULT_TRIP.days));
    setActiveDay(0);
    resetForm();
  }

  // JSON Export/Import
  function exportJSON() {
    try {
      const payload = { trip, items, version: 1 };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safeName = (trip.title || "Tripify").replace(/[^a-z0-9-_]+/gi, "_");
      a.href = url;
      a.download = `${safeName}.tripify.json`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(url);
        a.remove();
      }, 0);
    } catch (e) {
      console.error(e);
      window.alert("Neuspješno spremanje JSON-a.");
    }
  }

  async function importJSONFromFile(file) {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== "object")
        throw new Error("Neispravan format.");
      if (!parsed.trip || !parsed.items)
        throw new Error("Nedostaju polja trip/items.");

      const newTrip = {
        title: String(parsed.trip.title || "Moj plan putovanja"),
        destination: String(parsed.trip.destination || ""),
        startDate: parsed.trip.startDate || formatDateInput(new Date()),
        days: clamp(parseInt(parsed.trip.days || 1), 1, 60),
        baseCost: Number(parsed.trip.baseCost) || 0,
      };

      const days = Math.max(1, newTrip.days);
      const newItems = Array.from({ length: days }, (_, i) => {
        const dayArr = Array.isArray(parsed.items[i]) ? parsed.items[i] : [];
        return dayArr
          .map((it) => ({
            id: String(it.id || uid()),
            title: String(it.title || "Aktivnost"),
            categoryId: String(it.categoryId || "aktivnost"),
            location: String(it.location || ""),
            start: String(it.start || "09:00"),
            end: String(it.end || "10:00"),
            cost: Number(it.cost) || 0,
            note: String(it.note || ""),
            done: Boolean(it.done),
          }))
          .sort(sortByStartThenTitle);
      });

      setTrip(newTrip);
      setItems(newItems);
      setActiveDay(0);
      resetForm();
      window.alert("Plan uspješno učitan iz JSON-a.");
    } catch (e) {
      console.error(e);
      window.alert("Ne mogu učitati JSON. Provjeri datoteku.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const totalAll =
    (Number(trip.baseCost) || 0) +
    items.reduce(
      (acc, day) =>
        acc +
        day.reduce((s, it) => s + (Number(it.cost) || 0), 0),
      0
    );

  const totalDay = (idx) =>
    (items[idx] || []).reduce((s, it) => s + (Number(it.cost) || 0), 0);

  // klik izvan menija zatvara menu
  useEffect(() => {
    function onDocClick(e) {
      const menu = document.getElementById("save-load-menu");
      const btn = document.getElementById("save-load-btn");
      if (
        showMenu &&
        menu &&
        btn &&
        !menu.contains(e.target) &&
        !btn.contains(e.target)
      ) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [showMenu]);

  return (
    <div className="itp-wrap">
      <div className="itp-top-spacer" aria-hidden />

      <header className="itp-header" role="banner">
        <div className="itp-title">
          <h1>Planer putovanja</h1>
          <p>Dinamični plan, program putovanja i vizualni raspored po danima.</p>
        </div>
      </header>

      {/* Osnovne informacije o putovanju */}
      <section className="itp-card itp-trip" aria-labelledby="trip-info-title">
        <h2 id="trip-info-title" className="sr-only">
          Osnovne informacije o putovanju
        </h2>
        <div className="row">
          <label>
            Naslov putovanja
            <input
              value={trip.title}
              onChange={(e) =>
                setTrip({ ...trip, title: e.target.value })
              }
              placeholder="npr. Toskana – proljeće"
            />
          </label>
          <label>
            Destinacija
            <input
              value={trip.destination}
              onChange={(e) =>
                setTrip({ ...trip, destination: e.target.value })
              }
              placeholder="grad/država"
            />
          </label>
          <label>
            Datum početka
            <input
              type="date"
              value={trip.startDate}
              onChange={(e) =>
                setTrip({ ...trip, startDate: e.target.value })
              }
            />
          </label>
          <label>
            Broj dana
            <input
              type="number"
              min={1}
              max={60}
              value={trip.days}
              onChange={(e) =>
                setTrip({
                  ...trip,
                  days: clamp(parseInt(e.target.value || "1"), 1, 60),
                })
              }
            />
          </label>
          <label>
            Osnovni trošak (EUR)
            <input
              type="number"
              min={0}
              step="1"
              value={trip.baseCost}
              onChange={(e) =>
                setTrip({ ...trip, baseCost: e.target.value })
              }
              placeholder="npr. paket/smještaj/let"
            />
          </label>
        </div>
        <div className="trip-summary">
          <div>
            <strong>Ukupno troškova:</strong> {toCurrency(totalAll)}
          </div>
          {trip.destination && (
            <div>
              <strong>Destinacija:</strong> {trip.destination}
            </div>
          )}
        </div>
      </section>

      {/* Tabs za dane */}
      <nav
        className="itp-days"
        role="tablist"
        aria-label="Dani putovanja"
      >
        {Array.from({ length: trip.days }).map((_, i) => {
          const d = dayDate(i);
          const label = d.toLocaleDateString("hr-HR", {
            weekday: "short",
            day: "2-digit",
            month: "2-digit",
          });
          const active = i === activeDay;
          return (
            <button
              key={i}
              role="tab"
              aria-selected={active}
              className={"day-tab" + (active ? " active" : "")}
              onClick={() => setActiveDay(i)}
            >
              <span>Dan {i + 1}</span>
              <small>{label}</small>
              <em>{toCurrency(totalDay(i))}</em>
            </button>
          );
        })}
      </nav>

      <main className="itp-main">
        {/* Timeline */}
        <section className="itp-card" aria-labelledby="timeline-title">
          <Timeline
            title={`Raspored – ${trip.title || "Putovanje"} – Dan ${
              activeDay + 1
            }`}
            categories={CATEGORIES}
            dayItems={dayItems}
            dayStartMin={DAY_START}
            dayEndMin={DAY_END}
            pxPerMin={1}
            onEditItem={(id) => editItem(activeDay, id)}
            onMoveItem={(id, newStartMin, newEndMin) =>
              moveItemToTime(id, newStartMin, newEndMin)
            }
          />
        </section>

        {/* Side form */}
        <section
          className="itp-card itp-side"
          aria-labelledby="side-form-title"
        >
          <h3 id="side-form-title">
            {editing ? "Uredi aktivnost" : "Dodaj aktivnost"}
          </h3>
          <div className="form">
            <label>
              Naziv
              <input
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                placeholder="npr. Posjet muzeju"
              />
            </label>

            <label>
              Kategorija
              <select
                value={form.categoryId}
                onChange={(e) =>
                  setForm({ ...form, categoryId: e.target.value })
                }
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Lokacija (opcionalno)
              <input
                value={form.location}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
                placeholder="npr. Galerija Moderni"
              />
            </label>

            <div className="row">
              <label>
                Početak
                <input
                  type="time"
                  value={form.start}
                  onChange={(e) =>
                    setForm({ ...form, start: e.target.value })
                  }
                />
              </label>
              <label>
                Kraj
                <input
                  type="time"
                  value={form.end}
                  onChange={(e) =>
                    setForm({ ...form, end: e.target.value })
                  }
                />
              </label>
            </div>

            <label>
              Trošak (EUR)
              <input
                type="number"
                min="0"
                step="1"
                value={form.cost}
                onChange={(e) =>
                  setForm({ ...form, cost: e.target.value })
                }
                placeholder="npr. 25"
              />
            </label>

            <label>
              Bilješka
              <textarea
                rows={3}
                value={form.note}
                onChange={(e) =>
                  setForm({ ...form, note: e.target.value })
                }
                placeholder="Dodatne informacije..."
              />
            </label>

            <div className="form-actions">
              <button className="btn primary" onClick={addOrUpdateItem}>
                {editing ? "Spremi promjene" : "Dodaj aktivnost"}
              </button>
              {editing && (
                <button className="btn" onClick={resetForm}>
                  Odustani
                </button>
              )}
            </div>
          </div>

          <div className="side-sep" />

          <h3>Aktivnosti – Dan {activeDay + 1}</h3>
          <ul className="list">
            {dayItems.length === 0 && (
              <li className="empty">Još nema aktivnosti za ovaj dan.</li>
            )}
            {dayItems.map((it) => {
              const cat =
                CATEGORIES.find((c) => c.id === it.categoryId) ||
                CATEGORIES[CATEGORIES.length - 1];
              return (
                <li
                  key={it.id}
                  className={"li" + (it.done ? " done" : "")}
                >
                  <div className="li-main">
                    <span
                      className="cat"
                      style={{ background: cat.color }}
                      title={cat.label}
                    >
                      {cat.emoji}
                    </span>
                    <div className="li-txt">
                      <div className="li-title">
                        <strong>{it.title}</strong>
                        <span className="li-time">
                          {it.start} – {it.end}
                        </span>
                      </div>
                      <div className="li-sub">
                        {it.location && <span>📍 {it.location}</span>}
                        {it.cost ? (
                          <span> • {toCurrency(it.cost)}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="li-actions">
                    <button
                      className="icon"
                      title="Označi dovršeno"
                      onClick={() => toggleDone(activeDay, it.id)}
                    >
                      ✅
                    </button>
                    <button
                      className="icon"
                      title="-15 min"
                      onClick={() =>
                        nudgeItem(activeDay, it.id, -15)
                      }
                    >
                      ⏪15
                    </button>
                    <button
                      className="icon"
                      title="+15 min"
                      onClick={() =>
                        nudgeItem(activeDay, it.id, +15)
                      }
                    >
                      ⏩15
                    </button>
                    <button
                      className="icon"
                      title="Uredi"
                      onClick={() => editItem(activeDay, it.id)}
                    >
                      ✏️
                    </button>
                    <button
                      className="icon"
                      title="Dupliciraj"
                      onClick={() =>
                        duplicateItem(activeDay, it.id)
                      }
                    >
                      🧬
                    </button>
                    <button
                      className="icon danger"
                      title="Obriši"
                      onClick={() => deleteItem(activeDay, it.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div
            className="bulk-actions"
            style={{ gap: 8, marginTop: 12, flexWrap: "wrap" }}
          >
            <button
              className="btn subtle"
              onClick={() => clearDay(activeDay)}
            >
              Obriši sve aktivnosti (ovaj dan)
            </button>
            <button
              className="btn subtle danger"
              onClick={resetAll}
            >
              Resetiraj cijeli plan
            </button>

            <span
              style={{ flexBasis: "100%", height: 0 }}
              aria-hidden
            />

            <div
              id="save-load-menu"
              style={{ position: "relative", display: "inline-block" }}
            >
              <button
                id="save-load-btn"
                className="btn"
                style={{ background: "#e6f0ea", color: "#222" }}
                onClick={() => setShowMenu((m) => !m)}
              >
                Spremi i učitaj
              </button>
              {showMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    padding: 6,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    zIndex: 10,
                    minWidth: 200,
                  }}
                >
                  <button
                    className="btn subtle"
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      color: "#222",
                    }}
                    onClick={() => {
                      exportJSON();
                      setShowMenu(false);
                    }}
                  >
                    💾 Spremi plan (.json)
                  </button>
                  <button
                    className="btn subtle"
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      color: "#222",
                    }}
                    onClick={() => {
                      fileInputRef.current?.click();
                      setShowMenu(false);
                    }}
                  >
                    📂 Učitaj plan (.json)
                  </button>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              style={{ display: "none" }}
              onChange={(e) =>
                importJSONFromFile(e.target.files?.[0])
              }
            />
          </div>
        </section>
      </main>
    </div>
  );
}
