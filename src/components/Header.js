// src/components/Header.jsx
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();

  useEffect(() => {
    const header = document.getElementById("siteHeader");
    const hero = document.getElementById("hero");

    if (!hero) header.classList.add("solid");

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) header.classList.remove("solid");
        else {
          header.classList.add("solid");
          header.classList.remove("glass");
        }
      },
      { threshold: 0.4 }
    );

    if (hero) obs.observe(hero);

    const onScroll = () => {
      if (header.classList.contains("solid")) return;
      const y = window.scrollY || document.documentElement.scrollTop;
      if (y > 10) header.classList.add("glass");
      else header.classList.remove("glass");
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      obs.disconnect();
    };
  }, []);

  return (
    <header id="siteHeader" className="site-header">
      <div className="container header-row">
        <nav className="nav-inline">
          <a href="#/" className="brand" aria-label="Tripify početna">
            <svg className="brand-logo" viewBox="0 0 64 64" role="img" aria-label="Tripify logo">
              <defs>
                <linearGradient id="g" x1="0" x2="1">
                  <stop offset="0" stopColor="#2e8b57" />
                  <stop offset="1" stopColor="#206c43" />
                </linearGradient>
              </defs>
              <circle cx="32" cy="32" r="30" fill="url(#g)" />
              <path d="M32 14c7 0 12 5 12 12 0 10-12 24-12 24S20 36 20 26c0-7 5-12 12-12z" fill="#fff" opacity=".9" />
              <circle cx="32" cy="26" r="5" fill="#2e8b57" />
            </svg>
            <span className="brand-text">Tripify</span>
          </a>

          <a href="#/ponuda">Ponuda</a>
          <a href="#/packing">Packing lista</a>
          <a href="#/planer">Planer</a>
          <a href="#/kontakt">Kontakt</a>
        </nav>

        <div className="auth-actions">
          {user ? (
            <>
              {/* ➜ ime korisnika je link na profil */}
              <a
                href="#/profil"
                className="user-link"
                title="Otvori korisnički profil"
                style={{ color: "#fff", fontWeight: 600 }}   // ⬅︎ maknuto textDecoration
            >
                {user.displayName || user.email}
              </a>
              <button className="btn ghost small" onClick={logout}>Odjava</button>
            </>
          ) : (
            <>
              <a className="btn ghost small" href="#/prijava">Prijava</a>
              <a className="btn primary small" href="#/registracija">Registracija</a>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
