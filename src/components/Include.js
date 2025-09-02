const Includes = ({ items }) => {
  const list = items || [];
  if (!list.length) return null;

  return (
    <div className="panel">
      <h3>Što je uključeno</h3>
      <ul className="list">
        {list.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    </div>
  );
};

export default Includes;
