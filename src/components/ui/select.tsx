import * as React from "react"
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface OptionData {
  value: string;
  label: string;
  disabled?: boolean;
}

function parseOptions(children: React.ReactNode): OptionData[] {
  const options: OptionData[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    // Recurse into fragments so wrapped <option> groups are found
    if (child.type === React.Fragment) {
      options.push(...parseOptions((child.props as { children?: React.ReactNode }).children));
      return;
    }
    if (child.type !== "option") return;
    const p = child.props as {
      value?: string;
      children?: React.ReactNode;
      disabled?: boolean;
    };
    options.push({
      value: String(p.value ?? p.children ?? ""),
      label: String(p.children ?? p.value ?? ""),
      disabled: p.disabled,
    });
  });
  return options;
}

export interface SelectProps {
  id?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  variant?: "admin" | "student";
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export function Select({
  id,
  value,
  onChange,
  variant = "admin",
  className,
  children,
  disabled,
}: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const [triggerRect, setTriggerRect] = React.useState<DOMRect | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const options = parseOptions(children);
  const selectedLabel =
    options.find((o) => o.value === value)?.label ?? options[0]?.label ?? "";

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!triggerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on scroll or resize
  React.useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  function handleToggle() {
    if (disabled) return;
    setTriggerRect(triggerRef.current?.getBoundingClientRect() ?? null);
    setOpen((v) => !v);
  }

  function handleSelect(optValue: string) {
    onChange?.({
      target: { value: optValue },
    } as React.ChangeEvent<HTMLSelectElement>);
    setOpen(false);
  }

  const isAdmin = variant === "admin";

  return (
    <>
      <button
        id={id}
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={cn(
          "relative w-full flex items-center justify-between gap-2 bg-background border rounded-lg px-3 text-left transition-all duration-150 focus:outline-none",
          isAdmin
            ? "h-9 text-sm text-foreground border-gray-200 hover:border-gray-300"
            : "h-10 text-sm text-foreground border-gray-200 hover:border-gray-300",
          open && "border-[#D52B1E] ring-2 ring-[#D52B1E]/10",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          className,
        )}
      >
        <span className="truncate flex-1">
          {selectedLabel || <span className="text-slate-400">Select…</span>}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200",
            open && "rotate-180 text-[#D52B1E]",
          )}
        />
      </button>

      {open &&
        triggerRect &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: triggerRect.bottom + 4,
              left: triggerRect.left,
              width: triggerRect.width,
              zIndex: 9999,
            }}
            className="bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden py-1 animate-in fade-in-0 zoom-in-95 duration-100"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={opt.disabled}
                onMouseDown={() => handleSelect(opt.value)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 text-sm text-left transition-colors",
                  opt.value === value
                    ? "bg-[#FFEFEF] text-[#D52B1E] font-semibold"
                    : "text-foreground hover:bg-slate-50",
                  opt.disabled && "opacity-40 cursor-not-allowed",
                )}
              >
                <span>{opt.label}</span>
                {opt.value === value && (
                  <Check className="h-3.5 w-3.5 text-[#D52B1E] shrink-0 ml-2" />
                )}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
