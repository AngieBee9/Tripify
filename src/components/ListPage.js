import React, { useMemo, useState } from "react";
import DataService from "../services/DataServices";
import Filters from "./Filters";
import Card from "./Card";
import GlobalTabs from "./GlobalsTabs";

const ListPage = ({ type }) => {
  const [q, setQ] = useState({});
  const list = type === "dest" ? DataService.DESTINACIJE : DataService.TURE;
  const filtered = useMemo(() => DataService.applyFilters(list, q), [list, q]);
  return (
    <React.Fragment>
      <GlobalTabs active={type === "dest" ? "dest" : "ture"} />
      <main className="container" style={{ paddingTop: "1rem" }}>
        <Filters q={q} setQ={setQ} dataForTags={list} />
        <div className="grid">
          {filtered.map(function (item, i) {
            return (
              <Card
                key={item.slug}
                item={item}
                href={
                  (type === "dest" ? "#/destinacije/" : "#/ture/") + item.slug
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

export default ListPage;
