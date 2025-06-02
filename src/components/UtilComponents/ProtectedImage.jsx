import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedImage = ({ src, alt, className, style }) => {
  const [imageSrc, setImageSrc] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Convert public image path to protected route
    const protectedPath = src.replace('/images/', '');
    setImageSrc(`/protected-image/${protectedPath}`);
  }, [src]);

  const handleError = () => {
    // Fallback to a default image or show error state
    setImageSrc('/images/error.png');
  };

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      style={{
        ...style,
        pointerEvents: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitUserDrag: 'none',
      }}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      onError={handleError}
      loading="lazy"
    />
  );
};

export default ProtectedImage; 