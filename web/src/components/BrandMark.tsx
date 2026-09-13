interface BrandMarkProps {
  size?: number;
}

export default function BrandMark({ size = 28 }: BrandMarkProps) {
  return (
    <img
      src="/logo-badge.png"
      alt=""
      className="brand-mark"
      style={{ width: size, height: size }}
    />
  );
}
