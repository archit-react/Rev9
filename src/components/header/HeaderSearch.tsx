import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

type Props = {
  placeholder?: string;
  onSearch?: (value: string) => void;
  defaultValue?: string;
  className?: string; // wrapper
  /** show the “/” hint on the right; default false for the JSR look */
  showShortcutHint?: boolean;
  /** visual size: "default" (old) or "slim" (JSR-like) */
  size?: "default" | "slim";

  /** NEW: hide the magnifier icon (default = false, so old UIs are unchanged) */
  hideIcon?: boolean;
  /** NEW: extra classes for the <input> (e.g., text size/weight overrides) */
  inputClassName?: string;
};

export default function HeaderSearch({
  placeholder = "Search",
  onSearch,
  defaultValue = "",
  className = "",
  showShortcutHint = false,
  size = "default",
  hideIcon = false, // default keeps the icon everywhere unless you opt out
  inputClassName = "",
}: Props) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when user presses "/" anywhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(value.trim());
  };

  const isSlim = size === "slim";

  return (
    <form onSubmit={submit} className={`w-full ${className}`}>
      <label
        className={`
          group relative block rounded-md transition
          bg-white/90 dark:bg-[#0b1117]/90
          border border-black/10 dark:border-white/10 shadow-sm
          hover:border-black/20 dark:hover:border-white/15
          focus-within:border-black dark:focus-within:border-cyan-500
          focus-within:ring-2 focus-within:ring-black/60 dark:focus-within:ring-cyan-500
          ${isSlim ? "py-1" : "py-2"}
        `}
      >
        {/* Icon (optional) */}
        {!hideIcon && (
          <Search
            className={`
              absolute left-3 top-1/2 -translate-y-1/2
              ${isSlim ? "w-4 h-4" : "w-4 h-4"}
              text-black/50 dark:text-white/50
            `}
            aria-hidden
          />
        )}

        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className={`
            w-full bg-transparent outline-none
            ${hideIcon ? "pl-4" : "pl-10"} pr-10
            ${isSlim ? "py-1.5 text-sm" : "py-2.5"}
            text-black dark:text-white
            placeholder:text-black/50 dark:placeholder:text-white/50
            ${inputClassName}
          `}
          aria-label={placeholder}
        />

        {showShortcutHint && (
          <span
            className="
              absolute right-2 top-1/2 -translate-y-1/2
              px-2 py-[2px] text-[11px] rounded-md
              bg-black/5 dark:bg-white/10
              text-black/60 dark:text-white/60
              border border-black/10 dark:border-white/10
            "
          >
            /
          </span>
        )}
      </label>
    </form>
  );
}
