"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Shared by every modal in the app — this one file controls transitions
 * everywhere a Modal is used.
 *
 * Enter transition needs a double requestAnimationFrame, not one: a
 * single rAF often fires before the browser has actually painted the
 * initial opacity-0/scale-95 state, so both style changes get batched
 * into a single paint and the transition has nothing to animate from —
 * it just snaps straight to "open." Nesting two rAFs forces a real paint
 * to happen in between: the first rAF waits for the *next* frame (by
 * which point opacity-0 has painted), and only then does the second rAF
 * flip visible to true.
 *
 * Exit doesn't have this problem — the element is already sitting at a
 * previously-painted opacity-100 state, so there's always a real "before"
 * to transition away from.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const innerFrame = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);

      const outerFrame = requestAnimationFrame(() => {
        innerFrame.current = requestAnimationFrame(() => setVisible(true));
      });

      return () => {
        cancelAnimationFrame(outerFrame);
        if (innerFrame.current !== null) {
          cancelAnimationFrame(innerFrame.current);
        }
      };
    }

    setVisible(false);
    const timeout = setTimeout(() => setMounted(false), 200); // matches duration-200 below
    return () => clearTimeout(timeout);
  }, [open]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-xl bg-white p-6 shadow-lg transition-all duration-200 ${
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}