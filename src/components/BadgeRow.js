const BadgeRow = ({ tags }) => {
  const list = tags || [];
  if (!list.length) return null;
  return (
    <div className="badges">
      {list.map(function (t) {
        return (
          <span key={t} className="badge">
            {t}
          </span>
        );
      })}
    </div>
  );
};

export default BadgeRow;
