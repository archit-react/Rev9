// src/pages/dashboard/DashboardHeader.tsx
import HeaderActions from "@/components/header/HeaderActions";
import PeriodToggle from "./PeriodToggle";
import type { Period } from "./constants";

type Props = {
  activeTab: Period;
  onChangeTab: (p: Period) => void;
  onExport: () => void;
  onRequestLogout: () => void;
  avatarSrc: string;
  /** Show PeriodToggle inside header; default false to render in chart */
  renderPeriodInHeader?: boolean;
};

export default function DashboardHeader({
  activeTab,
  onChangeTab,
  onExport,
  onRequestLogout,
  avatarSrc,
  renderPeriodInHeader = false,
}: Props) {
  return (
    <header
      className="
        flex items-center justify-between
        mb-6
        min-h-[64px] sm:min-h-[72px]
      "
    >
      {/* Left: brand + optional period toggle */}
      <div className="flex items-center gap-4 sm:gap-5">
        <div className="flex items-center gap-3 shrink-0">
          {/* Rev9 adaptive money/tech gradient */}
          <h1
            className="
    font-['Audiowide'] font-extrabold
    text-[38px] sm:text-[44px] md:text-[52px] -mt-9
    leading-[1.1]            /* tighter line height */
    tracking-[0.05em]
    bg-clip-text text-transparent
    drop-shadow-[0_1px_4px_rgba(0,0,0,0.15)]
    dark:drop-shadow-[0_1px_6px_rgba(56,189,248,0.5)]
    bg-gradient-to-r from-emerald-500 via-lime-400 to-green-600
    dark:from-cyan-400 dark:via-sky-400 dark:to-blue-500
  "
          >
            Rev9
          </h1>
        </div>

        {renderPeriodInHeader && (
          <div className="hidden sm:flex items-center ml-2">
            <PeriodToggle value={activeTab} onChange={onChangeTab} />
          </div>
        )}
      </div>

      {/* Right: Users | Export | Theme | Avatar */}
      <HeaderActions
        avatarSrc={avatarSrc}
        onRequestLogout={onRequestLogout}
        onExport={onExport}
        hideHome
        hideUsers={false}
        className="text-sm sm:text-base -mt-16"
      />
    </header>
  );
}
