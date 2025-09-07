import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { ref, child, get } from "firebase/database";
import toursData from "../data/tours-only.json";

export default function useTours() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // First attempt to get from Firebase
        try {
          const snap = await get(child(ref(db), "tours"));
          if (snap.exists()) {
            setData(Object.values(snap.val()));
            setLoading(false);
            return;
          }
        } catch (firebaseError) {
          console.log("Firebase error, falling back to local data:", firebaseError);
        }
        
        // Fallback to local JSON data if Firebase fails
        setData(Object.values(toursData));
      } catch (e) {
        setErr(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { data, loading, error };
}
