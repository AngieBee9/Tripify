function NotFound() {
  return (
    <main
      className="container"
      style={{
        paddingTop: "calc(var(--header-h) + 2rem)",
        textAlign: "center",
      }}
    >
      <h1 className="title">404 — Stranica nije pronađena</h1>
      <p>
        Ups! Pokušaj se vratiti na <a href="#/">početnu</a>.
      </p>
    </main>
  );
}

export default NotFound;
