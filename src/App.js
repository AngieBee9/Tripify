// src/App.js
import "./App.css";
import Home from "./components/Home";
import Header from "./components/Header";
import ListPage from "./components/ListPage";
import DetailPage from "./components/DetailPage";
import NotFound from "./components/NotFound";
import BookingFlow from "./components/BookingFlow";
import ContactPage from "./components/ContactPage";
import DataService from "./services/DataServices"; // tvoja datoteka s podacima
import { useHashRoute } from "./services/RouterServices";

// ⬇️ Postojeće
import PackingList from "./components/PackingList";
import ItineraryPlanner from "./components/ItineraryPlanner";

// ⬇️ NOVO
import ResponsibleTravelTips from "./components/ResponsibleTravelTips";
import EtiquettePage from "./components/EtiquettePage";
import Gallery from "./pages/Gallery"; // ⬅️ NOVO

function App() {
  const [route] = useHashRoute();

  return (
    <div>
      <Header route={route} />

      {route.name === "home" && <Home />}

      {route.name === "destList" && <ListPage type="dest" />}

      {route.name === "tourList" && <ListPage type="ture" />}

      {route.name === "destDetail" &&
        (function () {
          const item = DataService.DESTINACIJE.find((d) => d.slug === route.slug);
          return item ? (
            <DetailPage item={item} backTo="#/destinacije" tip="dest" />
          ) : (
            <NotFound />
          );
        })()}

      {route.name === "tourDetail" &&
        (function () {
          const item = DataService.TURE.find((t) => t.slug === route.slug);
          return item ? (
            <DetailPage item={item} backTo="#/ture" tip="ture" />
          ) : (
            <NotFound />
          );
        })()}

      {route.name === "booking" && (
        <BookingFlow tip={route.tip} slug={route.slug} />
      )}

      {route.name === "contact" && <ContactPage />}

      {/* Packing lista */}
      {route.name === "packing" && <PackingList />}

      {/* Planer putovanja */}
      {route.name === "planer" && <ItineraryPlanner />}

      {/* NOVO: Galerija */}
      {route.name === "gallery" && <Gallery />}

      {/* Savjeti za odgovorno putovanje */}
      {route.name === "tips" && <ResponsibleTravelTips />}

      {/* Lokalni običaji & etiketa */}
      {route.name === "etiketa" && <EtiquettePage />}

      {route.name === "notfound" && <NotFound />}

      <footer>
        <div className="container">
          <div>© {new Date().getFullYear()} Tripify</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="#/savjeti-odgovorno">Savjeti za odgovorno putovanje</a>
            <a href="#/etiketa">Lokalni običaji & etiketa</a>
            <a href="#/packing">Pakirna lista</a>
            <a href="#/planer">Planer</a>
            <a href="#/kontakt">Kontakt</a>
            <a href="#/galerija">Galerija</a> {/* ⬅️ možeš ostaviti ili maknuti */}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
