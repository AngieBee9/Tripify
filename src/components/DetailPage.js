import React from "react";
import GlobalTabs from "./GlobalsTabs";
import Gallery from "./Gallery";
import MapEmbed from "./MapEmbed";
import AboutBox from "./AboutBox";
import Includes from "./Include";
import Itinerary from "./Itinerary";
import AvailabilityWidget from "./AvailabilityWidget";

const DetailPage = ({ item, backTo, tip }) => {
  const handleBack = function (e) {
    e.preventDefault();
    if (window.history.length > 1) window.history.back();
    else window.location.hash = backTo.replace(/^#/, "");
  };
  const aboutTitle = tip === "dest" ? "O destinaciji" : "O turi";

  return (
    <React.Fragment>
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
            <a href={backTo}>{tip === "dest" ? "Destinacije" : "Ture"}</a>{" "}
            &rsaquo; {item.naziv}
          </span>
          <div
            style={{
              display: "flex",
              gap: ".5rem",
              alignItems: "center",
            }}
          >
            <a className="btn secondary" href={backTo} onClick={handleBack}>
              ← Natrag
            </a>
            <span className="btn secondary" aria-disabled="true">
              {item.days} dana
            </span>
            <a className="btn" href={"#/rezervacija/" + tip + "/" + item.slug}>
              Rezerviraj • od {item.price} €
            </a>
          </div>
        </div>

        <div className="detail-wrap">
          <div className="fade-in" style={{ "--delay": ".1s" }}>
            <Gallery cover={item.slika} images={item.gallery} />
            <MapEmbed query={item.mapQuery} />
          </div>

          <div className="fade-in" style={{ "--delay": ".15s" }}>
            <h1 style={{ margin: "0.25rem 0 0.2rem" }}>{item.naziv}</h1>
            <div className="muted" style={{ marginBottom: ".25rem" }}>
              {item.opis}
            </div>
            <div className="badges">
              {(item.tags || []).map(function (t) {
                return (
                  <span key={t} className="badge">
                    {t}
                  </span>
                );
              })}
            </div>

            <div style={{ height: ".5rem" }}></div>

            <AboutBox
              title={aboutTitle}
              text={item.opisDug || "Detalji dostupni uskoro."}
              facts={item.zanimljivosti || []}
            />

            {/* ⬇️ NOVO: Kalendar dostupnosti + fleksibilne cijene (samo za ture) */}
            {tip === "ture" && item?.slug && (
              <section style={{ marginTop: "1rem" }}>
                <h2 style={{ margin: "0 0 .5rem" }}>Dostupnost i cijene</h2>
                <AvailabilityWidget
                  slug={item.slug}
                  // osiguraj da link "Rezerviraj" ide na tvoju rutu: #/rezervacija/<tip>/<slug>
                  reserveHrefBase={`#/rezervacija/${tip}/${item.slug}`}
                />
              </section>
            )}

            <div style={{ marginTop: "1rem" }}>
              <Includes items={item.includes} />
            </div>

            <div style={{ marginTop: "1rem" }}>
              <Itinerary items={item.itinerary} />
            </div>
          </div>
        </div>
      </main>
    </React.Fragment>
  );
};

export default DetailPage;
