import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  // Tagline sudah menjadi bagian dari gambar logo; prop ini dibiarkan agar pemanggil lama tetap jalan.
  showTagline?: boolean;
}

export function Logo({ size = "md" }: LogoProps) {
  const height = size === "sm" ? "h-9" : size === "lg" ? "h-14" : "h-11";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-sepakatin.png"
      alt="Sepakatin"
      width={1803}
      height={591}
      className={`${height} w-auto flex-shrink-0 select-none`}
      draggable={false}
    />
  );
}
