const AboutBox = ({ title, text, facts }) => {
  return (
    <div className="panel">
      <h3>{title}</h3>
      <p style={{ margin: "0 0 .6rem" }}>{text}</p>
      {facts && facts.length > 0 && (
        <ul className="list">
          {facts.map(function (f, i) {
            return <li key={i}>{f}</li>;
          })}
        </ul>
      )}
    </div>
  );
};

export default AboutBox;
