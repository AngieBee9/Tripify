// src/components/BookingFlow.jsx
import { useState } from "react";
import NotFound from "./NotFound";
import GlobalTabs from "./GlobalsTabs";
import DataService from "../services/DataServices";
import { useAuth } from "../contexts/AuthContext";
import { createReservation } from "../services/reservations";

const BookingFlow = ({ tip, slug }) => {
  const { user } = useAuth();

  const source = tip === "dest" ? DataService.DESTINACIJE : DataService.TURE;
  const item = source.find((x) => x.slug === slug);

  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [payload, setPayload] = useState({
    start: "",
    end: "",
    adults: 2,
    children: 0,
    name: "",
    email: "",
  });

  if (!item) return <NotFound />;

  const handleBack = (e) => {
    e.preventDefault();
    if (window.history.length > 1) window.history.back();
    else
      window.location.hash =
        "/" + (tip === "dest" ? "destinacije" : "ture") + "/" + slug;
  };

  const totalPax = Number(payload.adults || 0) + Number(payload.children || 0);
  const quotedPrice = Number(item.price || 0) * (totalPax || 1); // naivno: cijena * broj putnika

  async function handleSubmit() {
    // validacija
    if (!payload.name?.trim() || !payload.email?.trim()) return;
    if (!payload.start || !payload.end) return;

    if (!user) {
      alert("Za slanje upita/rezervacije potrebno je prijaviti se.");
      window.location.hash = "#/prijava";
      return;
    }

    try {
      setBusy(true);

      await createReservation({
        user,
        tip: tip === "dest" ? "dest" : "ture",
        slug,
        title: item.naziv || slug,
        price: quotedPrice,
        startDate: payload.start,
        days: Number(item.days || 0),
        pax: totalPax || 1,
        status: "pending", // ili "confirmed" kad spojiš naplatu
      });

      // sve gotovo – vodi na profil → rezervacije
      window.location.hash = "#/profil?t=rezervacije";
    } catch (err) {
      console.error("[Booking] createReservation error:", err);
      alert("Nažalost, došlo je do pogreške pri slanju. Pokušaj ponovno.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <GlobalTabs active={tip === "dest" ? "dest" : "ture"} />
      <main className="container" style={{ paddingTop: "1rem" }}>
        <div
          className="banner"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <span>
            <a href="#/">Početna</a> &rsaquo{" "}
            <a href={`#/${tip === "dest" ? "destinacije" : "ture"}`}>
              {tip === "dest" ? "Destinacije" : "Ture"}
            </a>{" "}
            &rsaquo{" "}
            <a href={`#/${tip === "dest" ? "destinacije" : "ture"}/${slug}`}>
              {item.naziv}
            </a>{" "}
            &rsaquo; Rezervacija
          </span>
          <a className="btn secondary" href="/" onClick={handleBack}>
            ← Natrag
          </a>
        </div>

        <h1 className="title" style={{ marginTop: 0 }}>
          Rezervacija
        </h1>

        <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
          <div className="panel">
            <div
              className="grid"
              style={{
                gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                gap: ".75rem",
              }}
            >
              {step === 0 && (
                <>
                  <div>
                    <h3>Datum početka</h3>
                    <input
                      className="input"
                      type="date"
                      value={payload.start}
                      onChange={(e) =>
                        setPayload({ ...payload, start: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <h3>Datum završetka</h3>
                    <input
                      className="input"
                      type="date"
                      value={payload.end}
                      onChange={(e) =>
                        setPayload({ ...payload, end: e.target.value })
                      }
                    />
                  </div>
                </>
              )}
              {step === 1 && (
                <>
                  <div>
                    <h3>Odrasli</h3>
                    <input
                      className="input"
                      type="number"
                      min="1"
                      value={payload.adults}
                      onChange={(e) =>
                        setPayload({ ...payload, adults: +e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <h3>Djeca</h3>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      value={payload.children}
                      onChange={(e) =>
                        setPayload({ ...payload, children: +e.target.value })
                      }
                    />
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <div>
                    <h3>Ime i prezime</h3>
                    <input
                      className="input"
                      value={payload.name}
                      onChange={(e) =>
                        setPayload({ ...payload, name: e.target.value })
                      }
                      placeholder="Ime i prezime"
                    />
                  </div>
                  <div>
                    <h3>Email</h3>
                    <input
                      className="input"
                      type="email"
                      value={payload.email}
                      onChange={(e) =>
                        setPayload({ ...payload, email: e.target.value })
                      }
                      placeholder="Email"
                    />
                  </div>
                </>
              )}
            </div>

            <div style={{ marginTop: "1rem", display: "flex", gap: ".5rem" }}>
              {step > 0 && (
                <button
                  className="btn secondary"
                  onClick={() => setStep(step - 1)}
                  disabled={busy}
                >
                  Natrag
                </button>
              )}
              {step < 2 && (
                <button
                  className="btn"
                  onClick={() => setStep(step + 1)}
                  disabled={busy || (step === 0 && (!payload.start || !payload.end))}
                >
                  Nastavi
                </button>
              )}
              {step === 2 && (
                <button
                  className="btn"
                  onClick={handleSubmit}
                  disabled={
                    busy ||
                    !payload.name?.trim() ||
                    !payload.email?.trim()
                  }
                >
                  {busy ? "Slanje…" : "Pošalji upit"}
                </button>
              )}
            </div>

            <p className="muted" style={{ marginTop: ".75rem" }}>
              Pregled: {payload.start || "—"} → {payload.end || "—"} •{" "}
              {payload.adults} odraslih, {payload.children} djece • Procijenjena cijena:{" "}
              {quotedPrice.toLocaleString("hr-HR")} €
            </p>
          </div>
        </div>
      </main>
    </>
  );
};

export default BookingFlow;
