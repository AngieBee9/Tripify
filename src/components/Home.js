import React, { useMemo, useState } from "react";
import DataService from "../services/DataServices";
import Hero from "./Hero";
import Filters from "./Filters";
import Card from "./Card";

const Home = () => {
  const [q, setQ] = useState({});
  const [activeTab, setActiveTab] = useState("dest");
  const data =
    activeTab === "dest" ? DataService.DESTINACIJE : DataService.TURE;
  const filtered = useMemo(
    () => DataService.applyFilters(data, q),
// obrisan activeTab u liniji 15
    [data, q]
  );

  return (
    <React.Fragment>
      <Hero />



      <div className="global-tabs">
        <div className="inner container">
          <button
            className={"tab" + (activeTab === "dest" ? " active" : "")}
            onClick={() => setActiveTab("dest")}
          >
            Destinacije
          </button>
          <button
            className={"tab" + (activeTab === "ture" ? " active" : "")}
            onClick={() => setActiveTab("ture")}
          >
            Ture
          </button>
        </div>
      </div>

      <main className="container" style={{ paddingTop: "1rem" }}>
        <Filters q={q} setQ={setQ} dataForTags={data} />
        <div className="grid">
          {filtered.map(function (item, i) {
            return (
              <Card
                key={item.slug}
                item={item}
                href={
                  (activeTab === "dest" ? "#/destinacije/" : "#/ture/") +
                  item.slug
                }
                idx={i}
              />
            );
          })}
        </div>
      </main>
    </React.Fragment>
  );
};

export default Home;
