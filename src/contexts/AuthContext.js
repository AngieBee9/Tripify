// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../services/firebase";
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setReady(true);
    });
    return () => unsub();
  }, []);

  const register = async ({ email, password, displayName }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) await updateProfile(cred.user, { displayName });
    return cred.user;
  };

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, ready, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
