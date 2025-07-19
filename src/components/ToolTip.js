

import React, { useState, useRef, useEffect } from 'react';
import '../css/components/Tooltip.css';

const ToolTip = ({ title, tooltipText }) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isTooltipClicked, setIsTooltipClicked] = useState(false);
  const tooltipRef = useRef(null);

  const handleClick = () => {
    setIsTooltipClicked(!isTooltipClicked);
    setIsTooltipVisible(!isTooltipClicked);
  };

  const handleMouseEnter = () => {
    if (!isTooltipClicked) setIsTooltipVisible(true);
  };

  const handleMouseLeave = () => {
    if (!isTooltipClicked) setIsTooltipVisible(false);
  };

  const handleClickOutside = (event) => {
    if (
      tooltipRef.current &&
      !tooltipRef.current.contains(event.target)
    ) {
      setIsTooltipClicked(false);
      setIsTooltipVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="header" ref={tooltipRef}>
      <h1>{title}</h1>
      <button
        className="tooltip-button"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        ?
      </button>
      {isTooltipVisible && (
        <div className="tooltip-box">
          <p>{tooltipText.split(',').map((line, idx) => (
              <React.Fragment key={idx}>
                {line.trim()}
                <br />
              </React.Fragment>
          ))}</p>
        </div>
      )}
    </div>
  );
};

export default ToolTip;