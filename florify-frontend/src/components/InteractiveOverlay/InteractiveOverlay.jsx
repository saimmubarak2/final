// src/components/InteractiveOverlay/InteractiveOverlay.jsx
/**
 * Interactive Overlay Component
 * Displays clickable/hoverable markers on top of an image
 * Shows symbol properties on hover
 */

import React, { useState, useRef, useEffect } from 'react';
import { getCategoryColor, parseClassNameLocal } from '../../api/aiProcessing';
import './InteractiveOverlay.css';

const InteractiveOverlay = ({ 
  imageBase64,
  markers = [],
  imageWidth = 512,
  // imageHeight is passed but we use auto height based on aspect ratio
  onMarkerClick = null
}) => {
  const containerRef = useRef(null);
  const [hoveredMarker, setHoveredMarker] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  // Calculate scale when container resizes
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        setScale(containerWidth / imageWidth);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [imageWidth]);

  const handleMarkerHover = (marker, event) => {
    setHoveredMarker(marker);
    
    // Position tooltip near the marker but within viewport
    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setTooltipPosition({ x, y });
  };

  const handleMarkerLeave = () => {
    setHoveredMarker(null);
  };

  const handleMarkerClick = (marker) => {
    if (onMarkerClick) {
      onMarkerClick(marker);
    }
  };

  const renderMarker = (marker) => {
    const props = marker.properties || parseClassNameLocal(marker.class_name);
    const color = marker.color || getCategoryColor(props.category);
    
    // Scale marker position
    const x = marker.x * scale;
    const y = marker.y * scale;
    const size = Math.max(12, Math.min(marker.width, marker.height) * scale * 0.5);

    return (
      <div
        key={marker.id}
        className={`overlay-marker ${props.flowering ? 'flowering' : ''}`}
        style={{
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          backgroundColor: color,
          borderColor: props.flowering ? '#FF69B4' : color
        }}
        onMouseEnter={(e) => handleMarkerHover(marker, e)}
        onMouseLeave={handleMarkerLeave}
        onClick={() => handleMarkerClick(marker)}
        title={props.displayName}
      >
        {props.flowering && <span className="flower-indicator">🌸</span>}
      </div>
    );
  };

  const renderTooltip = () => {
    if (!hoveredMarker) return null;

    const props = hoveredMarker.properties || parseClassNameLocal(hoveredMarker.class_name);
    const color = hoveredMarker.color || getCategoryColor(props.category);

    // Adjust tooltip position to stay in viewport
    let tooltipX = tooltipPosition.x + 15;
    let tooltipY = tooltipPosition.y - 10;
    
    // Check if tooltip would overflow right
    if (tooltipX + 250 > containerRef.current?.clientWidth) {
      tooltipX = tooltipPosition.x - 265;
    }
    
    // Check if tooltip would overflow bottom
    if (tooltipY + 200 > containerRef.current?.clientHeight) {
      tooltipY = tooltipPosition.y - 200;
    }

    return (
      <div 
        className="overlay-tooltip"
        style={{
          left: tooltipX,
          top: tooltipY,
          borderLeftColor: color
        }}
      >
        <div className="tooltip-header" style={{ backgroundColor: color }}>
          <span className="tooltip-category">{props.category}</span>
          {props.flowering && <span className="tooltip-badge flowering">🌸 Flowering</span>}
          {props.isFruiting && <span className="tooltip-badge fruiting">🍎 Fruiting</span>}
        </div>
        
        <div className="tooltip-body">
          <div className="tooltip-row">
            <span className="tooltip-label">Class:</span>
            <span className="tooltip-value">{hoveredMarker.class_name}</span>
          </div>
          
          <div className="tooltip-row">
            <span className="tooltip-label">Size:</span>
            <span className={`tooltip-value size-${props.size}`}>
              {props.size.charAt(0).toUpperCase() + props.size.slice(1)}
            </span>
          </div>
          
          {props.leafType && (
            <div className="tooltip-row">
              <span className="tooltip-label">Leaf Type:</span>
              <span className="tooltip-value">{props.leafType}</span>
            </div>
          )}
          
          {props.growthType && (
            <div className="tooltip-row">
              <span className="tooltip-label">Growth:</span>
              <span className="tooltip-value">{props.growthType}</span>
            </div>
          )}
          
          <div className="tooltip-row">
            <span className="tooltip-label">Confidence:</span>
            <span className="tooltip-value">
              {(hoveredMarker.confidence * 100).toFixed(1)}%
            </span>
          </div>
          
          <div className="tooltip-row">
            <span className="tooltip-label">Position:</span>
            <span className="tooltip-value">
              ({hoveredMarker.x.toFixed(0)}, {hoveredMarker.y.toFixed(0)})
            </span>
          </div>
        </div>
      </div>
    );
  };

  const imageSrc = imageBase64?.startsWith('data:') 
    ? imageBase64 
    : `data:image/png;base64,${imageBase64}`;

  return (
    <div className="interactive-overlay-container" ref={containerRef}>
      <div className="overlay-image-wrapper">
        <img 
          src={imageSrc}
          alt="Garden Blueprint"
          className="overlay-base-image"
          style={{ width: '100%', height: 'auto' }}
        />
        
        <div className="overlay-markers-layer">
          {markers.map(renderMarker)}
        </div>
        
        {renderTooltip()}
      </div>
      
      {/* Legend */}
      <div className="overlay-legend">
        <h4>Legend</h4>
        <div className="legend-items">
          {['Tree', 'Shrub', 'Perennial', 'Annual', 'Climber', 'Rock', 'FlowerPot', 'Object'].map(cat => (
            <div key={cat} className="legend-item">
              <span 
                className="legend-color"
                style={{ backgroundColor: getCategoryColor(cat) }}
              />
              <span className="legend-label">{cat}</span>
            </div>
          ))}
        </div>
        <div className="legend-note">
          <span className="flower-indicator">🌸</span> = Flowering
        </div>
      </div>
    </div>
  );
};

export default InteractiveOverlay;
