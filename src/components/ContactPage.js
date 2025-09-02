import React from "react";

const ContactPage = () => {
  /* Tabs uklonjeni – samo čista forma */
  return (
    <React.Fragment>
      <main
        className="container"
        style={{ paddingTop: "calc(var(--header-h) + 1rem)" }}
      >
        <section style={{ margin: "2.5rem 0" }}>
          <h2 className="title fade-in" style={{ "--delay": ".05s" }}>
            Piši nam
          </h2>
          <form
            className="fade-in"
            style={{ "--delay": ".15s" }}
            onSubmit={function (e) {
              e.preventDefault();
              alert("Hvala na poruci!");
            }}
          >
            <div className="form-grid">
              <div className="field">
                <label htmlFor="ime">Ime i prezime</label>
                <input
                  id="ime"
                  className="input"
                  placeholder="Vaše ime i prezime"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  className="input"
                  type="email"
                  placeholder="vaš@email.com"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="tel">Telefon (neobavezno)</label>
                <input
                  id="tel"
                  className="input"
                  type="tel"
                  placeholder="+385 ..."
                />
              </div>
              <div className="field">
                <label htmlFor="predmet">Predmet poruke</label>
                <input
                  id="predmet"
                  className="input"
                  placeholder="Npr. Upit za Petru i Wadi Rum"
                />
              </div>
            </div>
            <div className="field" style={{ marginTop: "1rem" }}>
              <label htmlFor="poruka">Poruka</label>
              <textarea
                id="poruka"
                className="input"
                rows="5"
                placeholder="Napišite poruku…"
                required
              ></textarea>
            </div>
            <div style={{ marginTop: "1rem" }}>
              <button className="btn">Pošalji</button>
            </div>
          </form>
        </section>
      </main>
    </React.Fragment>
  );
};

export default ContactPage;
