"use client";

import * as React from "react";

type PopoverContextValue = {
  open: boolean;
  setOpen: (v: boolean) => void;
};

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

export function Popover({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const ctx = React.useMemo(() => ({ open, setOpen }), [open]);
  return <PopoverContext.Provider value={ctx}>{children}</PopoverContext.Provider>;
}

export function PopoverTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactElement }) {
  const ctx = React.useContext(PopoverContext);
  if (!ctx) return children;
  const originalProps = children.props as any;
  const props = {
    onClick: (e: React.MouseEvent) => {
      ctx.setOpen(!ctx.open);
      originalProps?.onClick?.(e);
    },
    "aria-expanded": ctx.open,
  } as any;
  return asChild ? React.cloneElement(children, props) : <button {...props}>{children}</button>;
}

export function PopoverContent({ className, children }: { className?: string; children: React.ReactNode }) {
  const ctx = React.useContext(PopoverContext);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) ctx?.setOpen(false);
    }
    if (ctx?.open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [ctx?.open]);

  if (!ctx?.open) return null;
  return (
    <div
      ref={ref}
      className={
        "z-50 rounded-md border bg-white p-4 shadow-md focus:outline-none " + (className || "")
      }
      style={{ position: "absolute", top: "72px", right: "24px" }}
      role="dialog"
    >
      {children}
    </div>
  );
}


