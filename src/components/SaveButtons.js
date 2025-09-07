// src/components/SaveButtons.jsx
import { ref, set, remove } from "firebase/database";
import { db } from "../services/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useUserDict } from "../hooks/userData";

/**
 * Prikazuje dva gumba: "Spremi" i "Dodaj na želje".
 * Radi toggle u RTDB na /users/<uid>/{saved|wishlist}/{slug}: true
 */
export default function SaveButtons({ slug }) {
  const { user } = useAuth();
  const { data: saved = {} } = useUserDict("saved");
  const { data: wishlist = {} } = useUserDict("wishlist");

  const isSaved = !!saved[slug];
  const isWished = !!wishlist[slug];

  async function toggle(type) {
    if (!user) {
      // ako nije prijavljen, vodi na prijavu
      window.location.hash = "#/prijava";
      return;
    }
    const r = ref(db, `/users/${user.uid}/${type}/${slug}`);
    if (type === "saved" ? isSaved : isWished) {
      await remove(r);
    } else {
      await set(r, true);
    }
  }

  return (
    <div className="save-actions">
      <button
        type="button"
        className="btn ghost small"
        onClick={() => toggle("saved")}
        aria-pressed={isSaved}
      >
        {isSaved ? "✓ Spremljeno" : "Spremi"}
      </button>

      <button
        type="button"
        className="btn ghost small"
        onClick={() => toggle("wishlist")}
        aria-pressed={isWished}
      >
        {isWished ? "♥ Na listi želja" : "Dodaj na želje"}
      </button>
    </div>
  );
}
