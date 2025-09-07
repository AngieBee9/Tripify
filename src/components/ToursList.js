// src/components/ToursList.jsx
import useTours from "../hooks/useTours";

function imageFallback(e) {
  e.currentTarget.onerror = null;
  e.currentTarget.src =
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=70";
}

export default function ToursList() {
  const { data, loading, error } = useTours();

  if (loading) return <p>Učitavanje...</p>;
  if (error) return <p>Greška: {String(error)}</p>;
  if (!data.length) return <p>Nema tura za prikaz.</p>;

  return (
    <main className="page">
      <h1>Ture</h1>
      <div className="grid">
        {data.map((item) => {
          const link = `#/ture/${item.slug}?back=%2Fture`;
          return (
            <article key={item.slug} className="card">
              <a href={link} aria-label={`Detalji: ${item.naziv}`}>
                <img src={item.slika} alt={item.naziv} onError={imageFallback} />
              </a>
              <h3>
                <a href={link}>{item.naziv}</a>
              </h3>
              <p>{item.opis}</p>
              <p>
                <strong>Od:</strong> {item.price} € · {item.days} dana · {item.kontinent}
              </p>
              <div className="badges">
                {(item.tags || []).map((t) => (
                  <span key={t} className="badge">{t}</span>
                ))}
              </div>
              <div style={{ marginTop: 8 }}>
                <a className="btn" href={link}>Detalji</a>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
