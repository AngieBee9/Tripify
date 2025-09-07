// src/App.js
import "./App.css";
import { useEffect } from "react";

import Home from "./components/Home";
import Header from "./components/Header";
import NotFound from "./components/NotFound";
import BookingFlow from "./components/BookingFlow";
import ContactPage from "./components/ContactPage";
import { useHashRoute } from "./services/RouterServices";
import PackingList from "./components/PackingList";
import ItineraryPlanner from "./components/ItineraryPlanner";
import ResponsibleTravelTips from "./components/ResponsibleTravelTips";
import EtiquettePage from "./components/EtiquettePage";
import Gallery from "./pages/Gallery";
import Prijava from "./components/Prijava";
import Registracija from "./components/Registracija";
import ProfilePage from "./pages/ProfilePage";


// Liste iz baze
import DestinationsList from "./components/DestinationsList";
import ToursList from "./components/ToursList";

// Detalji iz baze (odvojene komponente)
import DestinationDetailRoute from "./components/DestinationDetailRoute";
import TourDetailRoute from "./components/TourDetailRoute";

export default function App() {
  const [route] = useHashRoute();

  // Pamćenje "odakle dolazimo" kad idemo na detalj
  useEffect(() => {
    function rememberOrigin(e) {
      const a = e.target?.closest?.('a[href^="#/ture/"], a[href^="#/destinacije/"]');
      if (!a) return;

      const fromPonuda = window.location.hash.startsWith("#/ponuda");
      const nextIsTour = a.getAttribute("href").startsWith("#/ture/");

      if (fromPonuda) {
        const qs = new URLSearchParams(window.location.hash.split("?")[1] || "");
        if (!qs.get("t")) qs.set("t", nextIsTour ? "ture" : "dest");
        sessionStorage.setItem("tripify_prev", `#/ponuda?${qs.toString()}`);
      } else {
        sessionStorage.setItem("tripify_prev", window.location.hash || "#/");
      }
    }

    document.addEventListener("click", rememberOrigin);
    return () => document.removeEventListener("click", rememberOrigin);
  }, []);

  return (
    <div className="app-shell">
      <Header route={route} />

      {/* Sve stranice unutar app-content da footer padne na dno */}
      <div className="app-content">
        {route.name === "home" && <Home />}

        {/* LISTE */}
        {route.name === "destList" && <DestinationsList />}
        {route.name === "tourList" && <ToursList />}

        {/* DETALJI */}
        {route.name === "destDetail" && <DestinationDetailRoute slug={route.slug} />}
        {route.name === "tourDetail" && <TourDetailRoute slug={route.slug} />}

        {route.name === "booking" && (
          <BookingFlow tip={route.tip} slug={route.slug} />
        )}

        {route.name === "contact" && <ContactPage />}

        {/* Packing lista */}
        {route.name === "packing" && <PackingList />}

        {/* Planer putovanja */}
        {route.name === "planer" && <ItineraryPlanner />}

        {route.name === "prijava" && <Prijava />}
        {route.name === "registracija" && <Registracija />}

        {/* Galerija */}
        {route.name === "gallery" && <Gallery />}

        {/* Savjeti za odgovorno putovanje */}
        {route.name === "tips" && <ResponsibleTravelTips />}

        {/* Lokalni običaji & etiketa */}
        {route.name === "etiketa" && <EtiquettePage />}

        {route.name === "notfound" && <NotFound />}
        
        {/* Korisnički profil */}
        {route.name === "profile" && <ProfilePage />}
      </div>

      <footer>
        <div className="container">
          <div>© {new Date().getFullYear()} Tripify</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="#/savjeti-odgovorno">Savjeti za odgovorno putovanje</a>
            <a href="#/etiketa">Lokalni običaji & etiketa</a>
            <a href="#/packing">Pakirna lista</a>
            <a href="#/planer">Planer</a>
            <a href="#/kontakt">Kontakt</a>
            <a href="#/galerija">Galerija</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
