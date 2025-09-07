import { db } from "../services/firebase";
import { ref, set, runTransaction, serverTimestamp, get } from "firebase/database";

export async function writeReview({ user, tip, slug, rating, text = "" }) {
  if (!user?.uid) throw new Error("Moraš biti prijavljen/a.");
  const uid = user.uid;

  const rRef = ref(db, `/reviews/${tip}/${slug}/${uid}`);

  // pročitamo staru ocjenu (ako postoji) da ispravno korigiramo agregat
  let prev = null;
  try {
    const snap = await get(rRef);
    prev = snap.exists() ? snap.val() : null;
  } catch {}

  await set(rRef, {
    rating: Number(rating),
    text,
    displayName: user.displayName || user.email || "",
    createdAt: serverTimestamp(),
  });

  // agregat prosjeka i broja ocjena
  const aRef = ref(db, `/aggregates/${tip}/${slug}`);
  await runTransaction(aRef, (cur) => {
    const state = cur || { ratingCount: 0, avgRating: 0 };
    let count = state.ratingCount || 0;
    let total = (state.avgRating || 0) * count;

    if (prev && typeof prev.rating === "number") {
      total = total - prev.rating + Number(rating);
      // count ostaje isti
    } else {
      count += 1;
      total += Number(rating);
    }
    const avg = count ? total / count : 0;
    return { ratingCount: count, avgRating: Math.round(avg * 100) / 100 };
  });
}
