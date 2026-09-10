import type { ComponentProps } from "react";

import { marketingPrimaryClassName } from "@/app/(marketing)/components/marketing-primary-class";

export function MarketingPrimaryAnchor({
  className,
  ...props
}: ComponentProps<"a">) {
  return <a className={marketingPrimaryClassName(className)} {...props} />;
}
