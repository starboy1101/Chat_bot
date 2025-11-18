import React from 'react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
  className?: string;
}

function Image({
  src,
  alt = "Image Name",
  className = "",
  ...props
}: ImageProps) {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = "/assets/images/no_image.png";
  };

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}

export default Image;