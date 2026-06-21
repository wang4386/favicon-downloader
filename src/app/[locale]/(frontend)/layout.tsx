import type { PropsWithChildren } from "react";
export const runtime = 'edge';

export default function FrontendLayout({ children }: PropsWithChildren) {
  return <>{children}</>;
}
