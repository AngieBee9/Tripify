// src/components/Hero.jsx
const Hero = () => {
  return (
    <section id="hero" className="hero">
      <div className="overlay">
        <div className="container">
          <h1 className="fade-in" style={{ "--delay": ".05s" }}>
            Putuj radi puta, a ne radi cilja…
          </h1>
          <p className="fade-in" style={{ "--delay": ".2s" }}>
            Otkrij održive destinacije, lokalna iskustva i pametne pakete
            putovanja — planiranje bez stresa, uspomene s razlogom.
          </p>

          {/* ⬇️ CTA Gumb */}
          <div className="hero-cta fade-in" style={{ "--delay": ".35s" }}>
            <a href="#/galerija" className="btn primary">
              📸 Galerija fotografija
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
