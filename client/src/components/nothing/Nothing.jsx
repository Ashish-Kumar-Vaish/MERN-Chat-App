import React from "react";
import "./Nothing.css";

const Nothing = ({ text, image }) => {
  return (
    <div className="nothingWrapper">
      <div className="nothingSelected">
        {text ? text : <img src={image} draggable="false" />}
      </div>
    </div>
  );
};

export default Nothing;
