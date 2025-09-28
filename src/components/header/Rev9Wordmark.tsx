type Props = { className?: string };

export default function Rev9Wordmark({ className = "" }: Props) {
  return (
    <h1
      className={[
        // same styling as your dashboard screenshot
        "font-['Audiowide'] font-extrabold",
        "bg-clip-text text-transparent",
        "text-[38px] sm:text-[44px] md:text-[52px] leading-[1.1] tracking-[0.05em]",
        // light + dark gradient (no animation)
        "bg-gradient-to-r from-emerald-500 via-lime-400 to-green-600",
        "dark:from-cyan-400 dark:via-sky-400 dark:to-blue-500",
        // subtle glow
        "drop-shadow-[0_1px_4px_rgba(0,0,0,0.15)]",
        "dark:drop-shadow-[0_1px_6px_rgba(56,189,248,0.5)]",
        className,
      ].join(" ")}
    >
      Rev9
    </h1>
  );
}
