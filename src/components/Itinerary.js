import { useState } from "react";

const Itinerary = ({ items }) => {
  const [open, setOpen] = useState(0);
  const list = items || [];
  if (!list.length) return null;

  return (
    <div className="panel">
      <h3>Plan puta</h3>
      {list.map(function (d, i) {
        return (
          <div
            key={i}
            className={"accordion-item" + (open === i ? " open" : "")}
          >
            <div
              className="accordion-head"
              onClick={function () {
                setOpen(open === i ? -1 : i);
              }}
            >
              <span>{"Dan " + d.day + ": " + d.title}</span>
              <span>{open === i ? "–" : "+"}</span>
            </div>
            <div className="accordion-body">
              <p style={{ marginTop: ".8rem" }}>{d.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Itinerary;
