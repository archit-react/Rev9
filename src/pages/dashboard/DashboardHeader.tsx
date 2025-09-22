// src/pages/dashboard/DashboardHeader.tsx
import BrandMark from "@/components/header/BrandMark";
import HeaderActions from "@/components/header/HeaderActions";
import PeriodToggle from "./PeriodToggle";
import type { Period } from "./constants";

type Props = {
  activeTab: Period;
  onChangeTab: (p: Period) => void;
  onExport: () => void;
  onRequestLogout: () => void;
  avatarSrc: string;
};

export default function DashboardHeader({
  activeTab,
  onChangeTab,
  onExport,
  onRequestLogout,
  avatarSrc,
}: Props) {
  return (
    <div className="flex items-center justify-between mb-6 -mt-3">
      {/* Left: brand + period toggle */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <BrandMark />
          <h1 className="font-['General Sans'] text-[28px] sm:text-[30px] md:text-[32px] font-semibold tracking-tight text-gray-900 dark:text-white">
            Rev9
          </h1>
        </div>

        <div className="hidden sm:flex items-center gap-3 sm:gap-4 ml-2">
          <PeriodToggle value={activeTab} onChange={onChangeTab} />
        </div>
      </div>

      {/* Right: Users | Export | Theme | Avatar */}
      <HeaderActions
        avatarSrc={avatarSrc}
        onRequestLogout={onRequestLogout}
        onExport={onExport}
        hideHome
        hideUsers={false}
      />
    </div>
  );
}
