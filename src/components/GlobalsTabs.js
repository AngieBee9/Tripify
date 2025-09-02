import { useEffect } from "react";

const GlobalTabs = ({ active }) => {
  useEffect(() => {
    // kad se komponenta prikaže → dodajemo klasu
    document.body.classList.add("with-tabs");
    // kad se makne sa stranice → uklanjamo klasu
    return () => {
      document.body.classList.remove("with-tabs");
    };
  }, []);

  return (
    <div className="global-tabs">
      <div className="inner container">
        <a
          className={"tab" + (active === "dest" ? " active" : "")}
          href="#/destinacije"
          title="Prikaži destinacije"
        >
          Destinacije
        </a>
        <a
          className={"tab" + (active === "ture" ? " active" : "")}
          href="#/ture"
          title="Prikaži ture"
        >
          Ture
        </a>
      </div>
    </div>
  );
};

export default GlobalTabs;
