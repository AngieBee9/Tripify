import { useState } from "react";
import DataService from "../services/DataServices";

const Gallery = ({ cover, images }) => {
  const all = [cover].concat(images || []).filter(Boolean);
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="hero-media">
        <img
          src={all[active]}
          alt="Galerija"
          onError={DataService.imageFallback}
        />
      </div>
      {all.length > 1 && (
        <div className="thumbs">
          {all.map(function (src, i) {
            return (
              <img
                key={i}
                src={src}
                alt={"Thumb " + (i + 1)}
                className={i === active ? "active" : ""}
                onClick={function () {
                  setActive(i);
                }}
                onError={DataService.imageFallback}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Gallery;
