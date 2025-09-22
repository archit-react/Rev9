import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

type Props = {
  placeholder?: string;
  onSearch?: (value: string) => void;
  defaultValue?: string;
  className?: string;
  showShortcutHint?: boolean;
};

export default function HeaderSearch({
  placeholder = "Search",
  onSearch,
  defaultValue = "",
  className = "",
  showShortcutHint = false,
}: Props) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus with "/" (JSR-like)
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

  return (
    <form onSubmit={submit} className={`w-full ${className}`}>
      <label
        className="
          group relative block rounded-md
          h-11 md:h-12
          bg-white/90 dark:bg-[#0b1117]/90
          border border-black/10 dark:border-white/10
          shadow-sm transition
          focus-within:border-black dark:focus-within:border-cyan-500
          focus-within:ring-2 focus-within:ring-black/60 dark:focus-within:ring-cyan-500
        "
      >
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/50 dark:text-white/50"
          aria-hidden
        />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="
            w-full h-full pl-10 pr-10
            bg-transparent
            text-black dark:text-white
            placeholder:text-black/50 dark:placeholder:text-white/50
            outline-none
          "
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
