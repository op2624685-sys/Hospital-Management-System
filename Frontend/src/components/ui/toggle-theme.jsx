import { useId, useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { MoonIcon, SunIcon } from "lucide-react";

const SwitchToggleThemeDemo = () => {
  const id = useId();
  // Initialize from document class or localStorage
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") || 
             localStorage.getItem("theme") === "dark";
    }
    return true;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--card)]/80 p-0.5 shadow-sm backdrop-blur"
      role="group"
      aria-label="Theme mode"
    >
      <button
        id={`${id}-light`}
        type="button"
        className={cn(
          "inline-flex size-7 items-center justify-center rounded-full transition-all duration-200",
          !isDark
            ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
            : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
        )}
        aria-controls={id}
        aria-label="Use light mode"
        title="Light mode"
        onClick={() => setIsDark(false)}
      >
        <SunIcon className="size-3.5" aria-hidden="true" />
      </button>

      <Switch
        id={id}
        checked={isDark}
        onCheckedChange={setIsDark}
        aria-labelledby={`${id}-light ${id}-dark`}
        aria-label="Toggle between dark and light mode"
        className="sr-only"
      />

      <button
        id={`${id}-dark`}
        type="button"
        className={cn(
          "inline-flex size-7 items-center justify-center rounded-full transition-all duration-200",
          isDark
            ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
            : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
        )}
        aria-controls={id}
        aria-label="Use dark mode"
        title="Dark mode"
        onClick={() => setIsDark(true)}
      >
        <MoonIcon className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
};

export default SwitchToggleThemeDemo;
