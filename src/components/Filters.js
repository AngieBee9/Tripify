import DataService from "../services/DataServices";

const Filters = ({ q, setQ, dataForTags }) => {
  const set = (k, v) => setQ(Object.assign({}, q, { [k]: v }));
  const tags = DataService.uniqueTags(dataForTags || []);
  return (
    <div className="banner" style={{ margin: "1rem 0" }}>
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
        }}
      >
        <input
          className="input"
          placeholder="Traži po nazivu/opisu…"
          value={q.text || ""}
          onChange={(e) => set("text", e.target.value)}
        />
        <select
          className="input"
          value={q.kontinent || ""}
          onChange={(e) => set("kontinent", e.target.value || undefined)}
        >
          <option value="">Svi kontinenti</option>
          {DataService.CONTINENTS.map(function (c) {
            return (
              <option key={c} value={c}>
                {c}
              </option>
            );
          })}
        </select>
        <select
          className="input"
          value={q.tag || ""}
          onChange={(e) => set("tag", e.target.value || undefined)}
        >
          <option value="">Svi tagovi</option>
          {tags.map(function (t) {
            return (
              <option key={t} value={t}>
                {t}
              </option>
            );
          })}
        </select>
        <select
          className="input"
          value={q.sort || ""}
          onChange={(e) => set("sort", e.target.value || undefined)}
        >
          <option value="">Bez sortiranja</option>
          <option value="priceAsc">Cijena ↑</option>
          <option value="priceDesc">Cijena ↓</option>
          <option value="daysAsc">Trajanje ↑</option>
          <option value="daysDesc">Trajanje ↓</option>
          <option value="nameAsc">Naziv A–Ž</option>
        </select>
        <input
          className="input"
          type="number"
          min="0"
          placeholder="Cijena do (€)"
          value={q.maxPrice !== undefined ? q.maxPrice : ""}
          onChange={(e) =>
            set("maxPrice", e.target.value ? +e.target.value : undefined)
          }
        />
        <input
          className="input"
          type="number"
          min="0"
          placeholder="Minimalno dana"
          value={q.minDays !== undefined ? q.minDays : ""}
          onChange={(e) =>
            set("minDays", e.target.value ? +e.target.value : undefined)
          }
        />
        <button className="btn secondary" onClick={() => setQ({})}>
          Poništi filtre
        </button>
      </div>
    </div>
  );
};

export default Filters;
