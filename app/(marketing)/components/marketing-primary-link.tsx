import Link from "next/link";
import type { ComponentProps } from "react";

import { marketingPrimaryClassName } from "@/app/(marketing)/components/marketing-primary-class";

export function MarketingPrimaryLink({
  className,
  ...props
}: ComponentProps<typeof Link>) {
  return <Link className={marketingPrimaryClassName(className)} {...props} />;
}
