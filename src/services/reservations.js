// src/services/reservations.js
import { db } from "../services/firebase";
import { ref, push, set, serverTimestamp } from "firebase/database";

/**
 * Kreira rezervaciju pod /users/<uid>/reservations/<bookingId>
 * @returns {Promise<string>} bookingId
 */
export async function createReservation({
  user,
  tip,        // "ture" | "dest"
  slug,       // npr. "patagonija"
  title,      // npr. "Patagonija"
  price,      // broj (ukupna ili početna cijena)
  startDate,  // ISO string npr. "2025-11-10" ili null
  days,       // broj dana
  pax = 1,    // broj putnika
  status = "confirmed", // ili "pending"/"canceled"
}) {
  if (!user?.uid) throw new Error("Nije prijavljen korisnik.");

  const listRef = ref(db, `/users/${user.uid}/reservations`);
  const newRef = push(listRef);
  const bookingId = newRef.key;

  await set(newRef, {
    tip,
    slug,
    title: title || slug,
    price: Number(price || 0),
    startDate: startDate || null,
    days: Number(days || 0),
    pax: Number(pax || 1),
    status,
    createdAt: serverTimestamp(),
  });

  return bookingId;
}
