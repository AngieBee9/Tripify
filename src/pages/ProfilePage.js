// src/pages/ProfilePage.jsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useUserCounts, useUserDict, useUserReservations } from "../hooks/userData";
import useDestinations from "../hooks/useDestinations";
import useTours from "../hooks/useTours";

const TABS = [
  { key: "pregled", label: "Pregled" },
  { key: "rezervacije", label: "Rezervacije" },
  { key: "spremljeno", label: "Spremljeno" },
  { key: "zelje", label: "Želje" },
  { key: "recenzije", label: "Recenzije" },
];

function getInitials(name = "", email = "") {
  const n = (name || "").trim();
  if (n) {
    const parts = n.split(/\s+/).slice(0, 2);
    return parts.map(p => p[0]?.toUpperCase() || "").join("");
  }
  return (email[0] || "?").toUpperCase();
}

function formatDate(ts) {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleDateString("hr-HR");
  } catch {
    return "—";
  }
}

export default function ProfilePage() {
  const { user } = useAuth();
  const counts = useUserCounts();

  // čitanje “saved” i “wishlist” (dict -> slugs)
  const { data: savedDict, loading: loadingSaved } = useUserDict("saved");
  const { data: wishDict, loading: loadingWish } = useUserDict("wishlist");
  const savedSlugs = Object.keys(savedDict || {});
  const wishSlugs = Object.keys(wishDict || {});

  // dohvat svih tura i destinacija (već imaš hookove)
  const { data: allDest } = useDestinations();
  const { data: allTours } = useTours();

  // mapiraj slugs -> item (prvo tražimo u turama pa u destinacijama)
  const mapSlugsToItems = (slugs) => {
    const bySlug = new Map();
    for (const d of allDest || []) bySlug.set(d.slug, { ...d, tip: "dest" });
    for (const t of allTours || []) bySlug.set(t.slug, { ...t, tip: "ture" });
    return slugs
      .map((s) => bySlug.get(s))
      .filter(Boolean);
  };

  const savedItems = mapSlugsToItems(savedSlugs);
  const wishItems = mapSlugsToItems(wishSlugs);

  // rezervacije
  const { rows: reservations, loading: loadingRes } = useUserReservations();

  // tab iz URL-a
  const initialTab = useMemo(() => {
    const qs = (window.location.hash.split("?")[1] || "");
    const t = new URLSearchParams(qs).get("t");
    return TABS.some(x => x.key === t) ? t : "pregled";
  }, []);
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    const base = "#/profil";
    const params = new URLSearchParams(window.location.hash.split("?")[1] || "");
    params.set("t", tab);
    window.location.hash = `${base}?${params.toString()}`;
  }, [tab]);

  if (!user) {
    return (
      <main className="container" style={{ paddingTop: "calc(var(--header-h) + 24px)", maxWidth: 880 }}>
        <h1>Korisnički profil</h1>
        <p>Za pristup profilu prijavi se ili registriraj.</p>
        <div style={{ display: "flex", gap: 8 }}>
          <a className="btn" href="#/prijava">Prijava</a>
          <a className="btn secondary" href="#/registracija">Registracija</a>
        </div>
      </main>
    );
  }

  const initials = getInitials(user.displayName, user.email);
  const joined = user.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("hr-HR")
    : "—";

  return (
    <main className="container" style={{ paddingTop: "calc(var(--header-h) + 24px)", maxWidth: 1100 }}>
      {/* HERO */}
      <section className="profile-hero card">
        <div className="avatar" aria-hidden="true">{initials}</div>
        <div className="hero-info">
          <h1 className="hero-name">{user.displayName || "Bez imena"}</h1>
          <div className="hero-meta">
            <span>{user.email}</span>
            <span>Član od {joined}</span>
          </div>
        </div>
      </section>

      {/* STATISTIKE */}
      <section className="stats-grid">
        <div className="stat card">
          <div className="stat-num">{counts.reservations}</div>
          <div className="stat-label">Rezervacije</div>
        </div>
        <div className="stat card">
          <div className="stat-num">{counts.saved}</div>
          <div className="stat-label">Spremljeno</div>
        </div>
        <div className="stat card">
          <div className="stat-num">{counts.wishlist}</div>
          <div className="stat-label">Želje</div>
        </div>
        <div className="stat card">
          <div className="stat-num">{counts.reviews}</div>
          <div className="stat-label">Recenzije</div>
        </div>
      </section>

      {/* TABOVI */}
      <nav className="profile-tabs" aria-label="Sekcije profila">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`profile-tab ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* SADRŽAJ TABOVA */}
      {tab === "pregled" && (
        <section className="card pad">
          <h2>Pregled</h2>
          <p className="muted">Brzi pregled aktivnosti na računu.</p>
          <ul>
            <li>Rezervacije: <strong>{counts.reservations}</strong></li>
            <li>Spremljeno: <strong>{counts.saved}</strong></li>
            <li>Lista želja: <strong>{counts.wishlist}</strong></li>
          </ul>
        </section>
      )}

      {tab === "rezervacije" && (
        <section className="card pad">
          <h2>Povijest rezervacija</h2>
          {loadingRes ? (
            <p>Učitavanje…</p>
          ) : reservations.length === 0 ? (
            <p className="muted">Još nemaš rezervacija.</p>
          ) : (
            <div className="table-like">
              <div className="tl-head">
                <div>Datum</div>
                <div>Paket</div>
                <div>Polazak</div>
                <div>Trajanje</div>
                <div>Status</div>
              </div>
              {reservations.map((r) => (
                <a key={r.id} className="tl-row" href={`#/${r.tip === "ture" ? "ture" : "destinacije"}/${r.slug}`}>
                  <div>{formatDate(r.createdAt)}</div>
                  <div>{r.title || r.slug}</div>
                  <div>{r.startDate || "—"}</div>
                  <div>{r.days ? `${r.days} dana` : "—"}</div>
                  <div>{r.status || "—"}</div>
                </a>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === "spremljeno" && (
        <section className="card pad">
          <h2>Spremljeni paketi</h2>
          {loadingSaved ? (
            <p>Učitavanje…</p>
          ) : savedItems.length === 0 ? (
            <p className="muted">Još nema spremljenih paketa.</p>
          ) : (
            <div className="grid">
              {savedItems.map((it) => {
                const link = `#/${it.tip === "ture" ? "ture" : "destinacije"}/${it.slug}`;
                return (
                  <article className="card" key={it.slug}>
                    <a href={link}><img src={it.slika} alt={it.naziv} /></a>
                    <h3><a href={link}>{it.naziv}</a></h3>
                    <p>{it.opis}</p>
                    <p><strong>Od:</strong> {it.price} € · {it.days} dana · {it.kontinent}</p>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {tab === "zelje" && (
        <section className="card pad">
          <h2>Lista želja</h2>
          {loadingWish ? (
            <p>Učitavanje…</p>
          ) : wishItems.length === 0 ? (
            <p className="muted">Još nemaš dodanih želja.</p>
          ) : (
            <div className="grid">
              {wishItems.map((it) => {
                const link = `#/${it.tip === "ture" ? "ture" : "destinacije"}/${it.slug}`;
                return (
                  <article className="card" key={it.slug}>
                    <a href={link}><img src={it.slika} alt={it.naziv} /></a>
                    <h3><a href={link}>{it.naziv}</a></h3>
                    <p>{it.opis}</p>
                    <p><strong>Od:</strong> {it.price} € · {it.days} dana · {it.kontinent}</p>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {tab === "recenzije" && (
        <section className="card pad">
          <h2>Moje recenzije</h2>
          <p className="muted">Uskoro dodajemo formu + listing recenzija.</p>
        </section>
      )}
    </main>
  );
}
