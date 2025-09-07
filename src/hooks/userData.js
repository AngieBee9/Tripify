// src/hooks/userData.js
import { useEffect, useMemo, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../services/firebase";
import { useAuth } from "../contexts/AuthContext";

/**
 * Generic: čita objekt (dict) iz /users/<uid>/<subpath>
 * npr. subpath: "saved", "wishlist"
 */
export function useUserDict(subpath) {
  const { user } = useAuth();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(!!user);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setData({});
      setLoading(false);
      return;
    }
    const r = ref(db, `/users/${user.uid}/${subpath}`);
    const off = onValue(
      r,
      (snap) => {
        setData(snap.val() || {});
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return () => off();
  }, [user, subpath]);

  return { data, loading, error };
}

/**
 * Rezervacije: /users/<uid>/reservations/<bookingId> => objekt
 * pretvaramo u polje sortirano po createdAt silazno
 */
export function useUserReservations() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(!!user);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setRows([]);
      setLoading(false);
      return;
    }
    const r = ref(db, `/users/${user.uid}/reservations`);
    const off = onValue(
      r,
      (snap) => {
        const val = snap.val() || {};
        const arr = Object.entries(val).map(([id, v]) => ({ id, ...v }));
        arr.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setRows(arr);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return () => off();
  }, [user]);

  return { rows, loading, error };
}

/**
 * Brojčane statistike za hero: koliko saved, wishlist, reservations
 */
export function useUserCounts() {
  const { data: saved } = useUserDict("saved");
  const { data: wishlist } = useUserDict("wishlist");
  const { rows: reservations } = useUserReservations();

  const counts = useMemo(
    () => ({
      saved: Object.keys(saved || {}).length,
      wishlist: Object.keys(wishlist || {}).length,
      reservations: (reservations || []).length,
      reviews: 0, // dodamo u koraku s recenzijama
    }),
    [saved, wishlist, reservations]
  );

  return counts;
}
