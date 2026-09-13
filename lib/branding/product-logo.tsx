import { PRODUCT_LOGO_SRC } from "@/lib/branding/product-assets";

export function ProductLogo({ className }: { className?: string }) {
  return (
    // Brand SVG; native img keeps this a Server Component with no next/image runtime.
    // eslint-disable-next-line @next/next/no-img-element
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
