import React, { useMemo, useRef, useState, useCallback } from "react";
import "./Timeline.css";

/**
 * Timeline – vizualni raspored za jedan dan (drag & drop)
 *
 * Props:
 * - title: string
 * - categories: [{id,label,emoji,color}]
 * - dayItems: [{ id, title, categoryId, location, start, end, cost, note, done }]
 * - dayStartMin: npr. 360 (06:00)
 * - dayEndMin:   npr. 1440 (24:00)
 * - pxPerMin:    1 => 60px/h; 1.2 => 72px/h; 0.8 => 48px/h
 * - onEditItem:  (id)=>void
 * - onMoveItem:  (id, newStartMin, newEndMin)=>void
 */

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
function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

const SNAP_MIN = 5; // korak snapanja (promijeni po želji)

export default function Timeline({
  title,
  categories = [],
  dayItems = [],
  dayStartMin = 6 * 60,
  dayEndMin = 24 * 60,
  pxPerMin = 1,
  onEditItem,
  onMoveItem,
}) {
  const timelineRef = useRef(null);

  const categoryInfo = (id) => categories.find((c) => c.id === id) || categories[categories.length - 1];

  const hoursCount = Math.floor((dayEndMin - dayStartMin) / 60) + 1;
  const hours = useMemo(
    () => Array.from({ length: hoursCount }, (_, idx) => dayStartMin + idx * 60),
    [hoursCount, dayStartMin]
  );

  // ---- DRAG STATE (ref + render state za preview) ----
  const dragRef = useRef(null);
  // dragRef.current = { id, startMinInit, endMinInit, pointerY0, previewDeltaMin }
  const [dragPreview, setDragPreview] = useState({ id: null, previewDeltaMin: 0 });

  const pxToMin = useCallback((dyPx) => dyPx / pxPerMin, [pxPerMin]);
  const snap = (mins) => Math.round(mins / SNAP_MIN) * SNAP_MIN;

  const onPointerDown = (e, it) => {
    // Samo primarni button (miš) ili pointer tip "touch"/"pen"
    if (e.pointerType === "mouse" && e.button !== 0) return;

    const s = parseHHMM(it.start);
    const en = parseHHMM(it.end);
    if (s == null || en == null) return;

    // Capture pointer na samom elementu
    e.currentTarget.setPointerCapture(e.pointerId);

    dragRef.current = {
      id: it.id,
      startMinInit: s,
      endMinInit: en,
      pointerY0: e.clientY,
      previewDeltaMin: 0,
    };
    setDragPreview({ id: it.id, previewDeltaMin: 0 });
  };

  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d || d.id == null) return;
    const dy = e.clientY - d.pointerY0;
    const deltaMin = pxToMin(dy);
    dragRef.current.previewDeltaMin = deltaMin;
    setDragPreview((prev) => (prev.id === d.id ? { id: d.id, previewDeltaMin: deltaMin } : prev));
    // spriječi scroll dok vučemo
    if (e.cancelable) e.preventDefault();
  };

  const onPointerUp = (e) => {
    const d = dragRef.current;
    if (!d || d.id == null) return;

    const duration = d.endMinInit - d.startMinInit;
    const newStartRaw = d.startMinInit + d.previewDeltaMin;
    let newStart = clamp(snap(newStartRaw), dayStartMin, Math.max(dayStartMin, dayEndMin - duration));
    let newEnd = newStart + duration;

    onMoveItem?.(d.id, newStart, newEnd);

    // cleanup
    dragRef.current = null;
    setDragPreview({ id: null, previewDeltaMin: 0 });
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch {}
  };

  return (
    <div className="timeline-wrap">
      <div className="tl-head">
        <h2 id="timeline-title">{title}</h2>
        <div className="legend" aria-label="Legenda kategorija">
          {categories.map((c) => (
            <span key={c.id} className="legend-item">
              <i style={{ background: c.color }} /> {c.emoji} {c.label}
            </span>
          ))}
        </div>
      </div>

      <div
        className="timeline"
        aria-live="polite"
        ref={timelineRef}
        style={{
          "--day-start-min": dayStartMin,
          "--day-end-min": dayEndMin,
          "--px-per-min": pxPerMin,
        }}
        // Pointer events na KONTEJNERU — hvata kretanje i završetak
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Satne crte */}
        {hours.map((mins, idx) => {
          const topMin = mins - dayStartMin;
          const label = toHHMM(mins);
          return (
            <div key={idx} className="hour-line" style={{ "--line-top-min": topMin }}>
              <span className="hour-label">{label}</span>
            </div>
          );
        })}

        {/* Aktivnosti */}
        {dayItems.map((it) => {
          const s = parseHHMM(it.start);
          const e = parseHHMM(it.end);
          if (s == null || e == null) return null;

          const isDragging = dragPreview.id === it.id;
          let topMin = clamp(s, dayStartMin, dayEndMin) - dayStartMin;
          const heightMin = Math.max(24, Math.min(e, dayEndMin) - Math.max(s, dayStartMin));

          if (isDragging) {
            const duration = e - s;
            const newStartRaw = s + dragPreview.previewDeltaMin;
            const snappedStart = clamp(
              snap(newStartRaw),
              dayStartMin,
              Math.max(dayStartMin, dayEndMin - duration)
            );
            topMin = snappedStart - dayStartMin;
          }

          const cat = categoryInfo(it.categoryId);

          return (
            <div
              key={it.id}
              className={"tl-item" + (it.done ? " done" : "") + (isDragging ? " dragging" : "")}
              style={{
                "--item-top-min": topMin,
                "--item-height-min": heightMin,
                borderLeftColor: cat?.color || "#2e8b57",
              }}
              title={`${it.title} (${it.start} – ${it.end})`}
              onPointerDown={(e) => onPointerDown(e, it)}
              onDoubleClick={() => onEditItem?.(it.id)}
            >
              <div className="tl-time">
                {it.start} – {it.end}
                {isDragging && (
                  <em className="tl-time-preview">
                    {/* mala “ghost” etiketa s novim vremenom */}
                    {toHHMM(Math.max(dayStartMin, Math.min(dayEndMin, s + snap(dragPreview.previewDeltaMin))))}
                    {" – "}
                    {toHHMM(Math.max(dayStartMin, Math.min(dayEndMin, e + snap(dragPreview.previewDeltaMin))))}
                  </em>
                )}
              </div>
              <div className="tl-title">
                <span className="tl-emoji" aria-hidden>{cat?.emoji || "•"}</span>
                <strong>{it.title}</strong>
              </div>
              {(it.location || it.cost) && (
                <div className="tl-sub">
                  {it.location && <span>📍 {it.location}</span>}
                  {it.cost ? (
                    <span>
                      {" "}
                      •{" "}
                      {Intl.NumberFormat("hr-HR", {
                        style: "currency",
                        currency: "EUR",
                        minimumFractionDigits: 0,
                      }).format(it.cost)}
                    </span>
                  ) : null}
                </div>
              )}
              <div className="drag-hint" aria-hidden>⇕ Povuci za promjenu vremena</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
