// src/components/DetailPage.js
import React from "react";
import GlobalTabs from "./GlobalsTabs";
import Gallery from "./Gallery";
import MapEmbed from "./MapEmbed";
import AboutBox from "./AboutBox";
import Includes from "./Include";
import Itinerary from "./Itinerary";
import AvailabilityWidget from "./AvailabilityWidget";
// import SaveButtons from "./SaveButtons"; // koristi kad želiš

// ⭐ env prekidač: widget uključi kad postaviš REACT_APP_AVAIL_ENABLED=1 u .env.local
const AVAIL_ENABLED = process.env.REACT_APP_AVAIL_ENABLED === "1";

/** Jednostavan error boundary – ako nešto pukne u djetetu, ne ruši cijelu stranicu */
class Safe extends React.Component {
  constructor(props){ super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error){ return { error }; }
  componentDidCatch(err, info){ console.error("[DetailPage Safe]", err, info); }
  render(){
    if (this.state.error) {
      return <div className="alert err" style={{ marginTop: 8 }}>
        Došlo je do greške u prikazu ovog odjeljka.
      </div>;
    }
    return this.props.children;
  }
}

const DetailPage = ({ item, backTo, tip }) => {
  // --- odluči kamo se vraćamo ---
  const hash = (typeof window !== "undefined" ? window.location.hash : "") || "";
  const [, query] = hash.split("?");
  const qs = new URLSearchParams(query || "");
  const backParam = qs.get("back"); // npr. "/ture" ili "/destinacije" ili "/ponuda?t=ture"
  const fromParam = backParam ? `#${backParam.replace(/^#/, "")}` : null;

  const byHash =
    hash.startsWith("#/ture/") ? "#/ture" :
    hash.startsWith("#/destinacije/") ? "#/destinacije" :
    null;

  const hardFallback = tip === "ture" ? "#/ture" : "#/destinacije";
  const backHref = fromParam || backTo || byHash || hardFallback;

  const handleBack = (e) => {
    e?.preventDefault?.();
    const target = backHref.startsWith("#") ? backHref : `#${backHref}`;
    window.location.hash = target.replace(/^#/, "");
  };

  const backLabel = backHref.includes("/ponuda")
    ? "Ponuda"
    : backHref.includes("/ture")
    ? "Ture"
    : "Destinacije";

  const aboutTitle = tip === "dest" ? "O destinaciji" : "O turi";

  return (
    <>
      <GlobalTabs active={tip === "dest" ? "dest" : "ture"} />

      <main className="container" style={{ paddingTop: "1rem" }}>
        <div
          className="banner fade-in"
          style={{
            "--delay": ".05s",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <span>
            <a href="#/">Početna</a> &rsaquo;{" "}
            <a href={backHref} onClick={handleBack}>
              {backLabel}
            </a>{" "}
            &rsaquo; {item.naziv}
          </span>

          <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
            <button type="button" className="btn secondary" onClick={handleBack}>
              ← Natrag
            </button>
            <span className="btn secondary" aria-disabled="true">
              {item.days} dana
            </span>
            <a className="btn" href={`#/rezervacija/${tip}/${item.slug}`}>
              Rezerviraj • od {item.price} €
            </a>
          </div>
        </div>

        <div className="detail-wrap">
          <div className="fade-in" style={{ "--delay": ".1s" }}>
            <Safe>
              <Gallery cover={item.slika} images={item.gallery || []} />
            </Safe>
            <Safe>
              {item.mapQuery && <MapEmbed query={item.mapQuery} />}
            </Safe>
          </div>

          <div className="fade-in" style={{ "--delay": ".15s" }}>
            <h1 style={{ margin: "0.25rem 0 0.2rem" }}>{item.naziv}</h1>
            <div className="muted" style={{ marginBottom: ".25rem" }}>
              {item.opis}
            </div>

            <div className="badges">
              {(item.tags || []).map((t) => (
                <span key={t} className="badge">
                  {t}
                </span>
              ))}
            </div>

            <div style={{ height: ".5rem" }} />

            <AboutBox
              title={aboutTitle}
              text={item.opisDug || "Detalji dostupni uskoro."}
              facts={item.zanimljivosti || []}
            />

            {/* ⭐ Availability – uključi samo kad imaš podatke/pravila (REACT_APP_AVAIL_ENABLED=1) */}
            <Safe>
              {tip === "ture" && item?.slug && AVAIL_ENABLED && (
                <section style={{ marginTop: "1rem" }}>
                  <h2 style={{ margin: "0 0 .5rem" }}>Dostupnost i cijene</h2>
                  <AvailabilityWidget
                    slug={item.slug}
                    reserveHrefBase={`#/rezervacija/${tip}/${item.slug}`}
                  />
                </section>
              )}
            </Safe>

            <div style={{ marginTop: "1rem" }}>
              <Includes items={item.includes || []} />
            </div>

            <div style={{ marginTop: "1rem" }}>
              <Itinerary items={item.itinerary || []} />
            </div>

            {/* {user && <SaveButtons slug={item.slug} tip={tip} />} */}
          </div>
        </div>
      </main>
    </>
  );
};

export default DetailPage;
