import { useState } from "react";
import NotFound from "./NotFound";
import GlobalTabs from "./GlobalsTabs";
import DataService from "../services/DataServices";

const BookingFlow = ({ tip, slug }) => {
  const source = tip === "dest" ? DataService.DESTINACIJE : DataService.TURE;
  const item = source.find((x) => x.slug === slug);
  const [step, setStep] = useState(0);
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
            <a href="#/">Početna</a> &rsaquo;{" "}
            <a href={`#/${tip === "dest" ? "destinacije" : "ture"}`}>
              {tip === "dest" ? "Destinacije" : "Ture"}
            </a>{" "}
            &rsaquo;{" "}
            <a href={`#/${tip === "dest" ? "destinacije" : "ture"}/${slug}`}>
              {item.naziv}
            </a>{" "}
            &rsaquo; Rezervacija
          </span>
          <a className="btn secondary" href="#" onClick={handleBack}>
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
                >
                  Natrag
                </button>
              )}
              {step < 2 && (
                <button
                  className="btn"
                  onClick={() => setStep(step + 1)}
                  disabled={step === 0 && (!payload.start || !payload.end)}
                >
                  Nastavi
                </button>
              )}
              {step === 2 && (
                <button
                  className="btn"
                  onClick={() =>
                    alert(
                      "Super! Sljedeći korak bit će Stripe naplata i e-mail potvrda (kad spojimo backend)."
                    )
                  }
                  disabled={!payload.name || !payload.email}
                >
                  Pošalji upit
                </button>
              )}
            </div>

            <p className="muted" style={{ marginTop: ".75rem" }}>
              Pregled: {payload.start || "—"} → {payload.end || "—"} •{" "}
              {payload.adults} odraslih, {payload.children} djece
            </p>
          </div>
        </div>
      </main>
    </>
  );
};

export default BookingFlow;
