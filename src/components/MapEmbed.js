const MapEmbed = ({ query }) => {
  if (!query) return null;

  const src =
    "https://maps.google.com/maps?q=" +
    encodeURIComponent(query) +
    "&t=&z=8&ie=UTF8&iwloc=&output=embed";

  return (
    <div className="panel">
      <h3>Lokacija</h3>
      <iframe
        className="map-embed"
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Karta"
      ></iframe>
    </div>
  );
};

export default MapEmbed;
