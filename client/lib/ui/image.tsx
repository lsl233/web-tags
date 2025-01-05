import { useState } from "react";
import { cn } from "../utils";

export const Image = ({
  src,
  defaultSrc,
  alt,
  className,
}: {
  src: string;
  defaultSrc: string;
  alt: string;
  className?: string;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  return (
    <>
      <div
        className={cn("bg-cover bg-center", className, isLoaded ? "hidden" : "")}
        style={{ backgroundImage: `url(${defaultSrc})` }}
      ></div>
      <img
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsError(true)}
        className={cn(className, isLoaded ? "block" : "hidden")}
        src={src}
        alt={alt}
      />
    </>
  );
};
