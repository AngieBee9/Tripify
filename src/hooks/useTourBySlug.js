import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { ref, child, get } from "firebase/database";
import toursData from "../data/tours-only.json";

export default function useTourBySlug(slug) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState(null);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        // First attempt to get from Firebase
        try {
          const snap = await get(child(ref(db), `tours/${slug}`));
          if (snap.exists()) {
            setItem(snap.val());
            setLoading(false);
            return;
          }
        } catch (firebaseError) {
          console.log("Firebase error, falling back to local data:", firebaseError);
        }
        
        // Fallback to local JSON data if Firebase fails or item doesn't exist
        if (toursData[slug]) {
          setItem(toursData[slug]);
        } else {
          setErr(new Error(`Tour with slug "${slug}" not found`));
        }
      } catch (e) {
        setErr(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  return { item, loading, error };
}
