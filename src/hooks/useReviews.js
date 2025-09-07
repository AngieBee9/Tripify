import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { ref, onValue } from "firebase/database";

export function useReviews(tip, slug) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tip || !slug) return;
    const r = ref(db, `/reviews/${tip}/${slug}`);
    return onValue(r, snap => {
      const val = snap.val() || {};
      const arr = Object.entries(val).map(([uid, v]) => ({ uid, ...v }));
      arr.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setList(arr);
      setLoading(false);
    });
  }, [tip, slug]);

  return { list, loading };
}

export function useAggregate(tip, slug) {
  const [agg, setAgg] = useState({ ratingCount: 0, avgRating: 0 });
  useEffect(() => {
    if (!tip || !slug) return;
    const r = ref(db, `/aggregates/${tip}/${slug}`);
    return onValue(r, snap => setAgg(snap.val() || { ratingCount: 0, avgRating: 0 }));
  }, [tip, slug]);
  return agg;
}
