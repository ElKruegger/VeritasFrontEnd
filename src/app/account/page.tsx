import type { Metadata } from "next";

import { AccountOverview } from "@/components/account/account-overview";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false },
};

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-16 md:px-10 md:py-24">
      <AccountOverview />
    </div>
  );
}
