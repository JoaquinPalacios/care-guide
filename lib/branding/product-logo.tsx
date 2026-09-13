import { PRODUCT_LOGO_SRC } from "@/lib/branding/product-assets";

export function ProductLogo({ className }: { className?: string }) {
  return (
    <img
      src={PRODUCT_LOGO_SRC}
      alt=""
      width={820}
      height={180}
      className={className}
      decoding="async"
    />
  );
}
