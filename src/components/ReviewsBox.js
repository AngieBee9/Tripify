import { useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { writeReview } from "../services/reviews";
import { useReviews, useAggregate } from "../hooks/useReviews";

export default function ReviewsBox({ tip, slug }) {
  const { user } = useAuth();
  const { list, loading } = useReviews(tip, slug);
  const agg = useAggregate(tip, slug);

  const myPrev = useMemo(
    () => (user ? list.find(r => r.uid === user.uid) : null),
    [list, user]
  );

  const [rating, setRating] = useState(myPrev?.rating || 0);
  const [text, setText] = useState(myPrev?.text || "");

  async function onSubmit(e) {
    e.preventDefault();
    if (!user) { window.location.hash = "#/prijava"; return; }
    if (!rating) return;
    try {
      await writeReview({ user, tip, slug, rating, text });
      // hooks će sami osvježiti prikaz
    } catch (err) {
      console.error(err);
      alert("Greška pri spremanju recenzije. Pokušaj ponovno.");
    }
  }

  return (
    <section style={{ marginTop: "1rem" }}>
      <h2>Ocjene i recenzije</h2>

      <div className="review-agg">
        <div className="stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < Math.round(agg.avgRating || 0) ? "star full" : "star"}>★</span>
          ))}
        </div>
        <div className="muted">
          {(agg.avgRating || 0).toFixed(2)} / 5 · {agg.ratingCount || 0} ocjena
        </div>
      </div>

      <form onSubmit={onSubmit} className="review-form">
        <div className="rate">
          {Array.from({ length: 5 }).map((_, i) => {
            const v = i + 1;
            return (
              <button
                key={v}
                type="button"
                className={`star-btn ${v <= rating ? "on" : ""}`}
                onClick={() => setRating(v)}
                aria-label={`${v} zvjezdica`}
              >★</button>
            );
          })}
        </div>
        <textarea
          className="input"
          placeholder="Podijeli svoje iskustvo (opcionalno)"
          value={text}
          onChange={e => setText(e.target.value)}
          rows={4}
          maxLength={1000}
        />
        <div>
          <button className="btn" type="submit">
            {myPrev ? "Ažuriraj recenziju" : "Objavi recenziju"}
          </button>
        </div>
      </form>

      {loading ? (
        <p>Učitavanje…</p>
      ) : list.length === 0 ? (
        <p className="muted">Još nema recenzija.</p>
      ) : (
        <ul className="reviews">
          {list.map((r) => (
            <li key={r.uid} className="card" style={{ padding: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <strong>{r.displayName || "Korisnik"}</strong>
                <span className="stars small">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < (r.rating || 0) ? "star full" : "star"}>★</span>
                  ))}
                </span>
              </div>
              {r.text && <p style={{ margin: "6px 0 0" }}>{r.text}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
