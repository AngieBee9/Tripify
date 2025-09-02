import React from "react";

export default function ResponsibleTravelTips() {
  return (
    <div className="container" style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px" }}>
      <h1>Savjeti za odgovorno putovanje</h1>
      <p style={{ color: "var(--muted)" }}>
        Mali izbor praktičnih koraka kako putovati pažljivije – prema ljudima, prirodi i vlastitom budžetu.
      </p>

      <section style={{ marginTop: 24 }}>
        <h2>1) Prijevoz</h2>
        <ul>
          <li>Preferiraj vlak ili autobus na kraćim relacijama; avion koristi kada je to stvarno potrebno.</li>
          <li>Kombiniraj više aktivnosti u jedan put (manje letova – više doživljaja).</li>
          <li>Na licu mjesta – pješice, biciklom ili javnim prijevozom gdje je moguće.</li>
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>2) Smještaj</h2>
        <ul>
          <li>Biraj objekte s eco-praksama (štednja vode/struje, recikliranje, lokalni dobavljači).</li>
          <li>Razumno korištenje klime i ručnika (ponovna upotreba kad je moguće).</li>
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>3) Lokalna zajednica</h2>
        <ul>
          <li>Podrži lokalne vodiče, obrtnike i gastronomiju – novac ostaje u zajednici.</li>
          <li>Poštuj privatnost i pitaj za dopuštenje prije fotografiranja ljudi.</li>
          <li>Nauči par osnovnih fraza lokalnog jezika – zlata vrijedno!</li>
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>4) Priroda i kulture</h2>
        <ul>
          <li>“Leave no trace” – ne ostavljaj otpad, ne uzimaj “suvenire” iz prirode.</li>
          <li>Ne hraniti divlje životinje i ne sudjelovati u eksploatacijskim aktivnostima.</li>
          <li>Poštuj mjesta vjerskog/ kulturnog značaja (odjeća, ponašanje).</li>
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>5) Pametno pakiranje</h2>
        <ul>
          <li>Višekratna boca za vodu, pribor, shopping vrećica.</li>
          <li>Kozmetika i kreme koje ne štete morskim ekosustavima.</li>
        </ul>
      </section>
    </div>
  );
}
