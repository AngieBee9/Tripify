import DataService from "../services/DataServices";
import BadgeRow from "./BadgeRow";

const Card = ({ item, href, idx }) => {
  return (
    <article
      className="card fade-in"
      style={{ "--delay": `${0.05 * (idx || 0)}s` }}
      title="Otvori detalje"
    >
      <a href={href} title={"Otvori: " + item.naziv}>
        <img
          src={item.slika}
          alt={item.naziv}
          loading="lazy"
          onError={DataService.imageFallback}
        />
        <div className="pad">
          <h3 style={{ margin: "0 0 .25rem" }}>{item.naziv}</h3>
          <div className="muted">{item.opis}</div>
          <div className="price-line">
            <span className="muted">
              {item.days} dana • {item.kontinent}
            </span>
            <span>od {item.price} €</span>
          </div>
          <BadgeRow tags={item.tags} />
        </div>
      </a>
    </article>
  );
};

export default Card;
