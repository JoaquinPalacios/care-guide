import { PRODUCT_ISOLOGO_SRC } from "@/lib/branding/product-assets";

export function ProductMark({ className }: { className?: string }) {
  return (
    <img
      src={PRODUCT_ISOLOGO_SRC}
      alt=""
      width={32}
      height={32}
      className={className}
      decoding="async"
    />
  );
}
