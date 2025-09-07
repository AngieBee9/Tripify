// src/components/ListPage.jsx
import useDestinations from "../hooks/useDestinations";
import useTours from "../hooks/useTours";

function imageFallback(e) {
  e.currentTarget.onerror = null;
  e.currentTarget.src =
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=70";
}

export default function ListPage({ type }) {
  const isDest = type === "dest";
  const { data, loading, error } = isDest ? useDestinations() : useTours();

  if (loading) return <p>Učitavanje...</p>;
  if (error) return <p>Greška: {String(error)}</p>;
  if (!data.length) return <p>Nema stavki za prikaz.</p>;

  return (
    <main className="page">
      <h1>{isDest ? "Destinacije" : "Ture"}</h1>
      <div className="grid">
        {data.map((item) => (
          <article key={item.slug} className="card">
            <img src={item.slika} alt={item.naziv} onError={imageFallback} />
            <h3>{item.naziv}</h3>
            <p>{item.opis}</p>
            <p>
              <strong>Od:</strong> {item.price} € · {item.days} dana · {item.kontinent}
            </p>
            <a
              className="btn"
              href={isDest ? `#/destinacije/${item.slug}` : `#/ture/${item.slug}`}
            >
              Detalji
            </a>
          </article>
        ))}
      </div>
    </main>
  );
}
