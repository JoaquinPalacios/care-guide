import { PRODUCT_ISOLOGO_SRC } from "@/lib/branding/product-assets";

export function ProductMark({ className }: { className?: string }) {
  return (
    // Brand SVG; native img keeps this a Server Component with no next/image runtime.
    // eslint-disable-next-line @next/next/no-img-element
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
