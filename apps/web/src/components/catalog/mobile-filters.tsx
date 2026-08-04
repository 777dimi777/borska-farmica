'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
export function MobileFilters({
  children,
  count,
}: {
  children: ReactNode;
  count: number;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const d = dialog.current;
    if (open && !d?.open) d?.showModal();
    if (!open && d?.open) d.close();
  }, [open]);
  return (
    <div className="mobile-filters">
      <button className="button button-secondary" onClick={() => setOpen(true)}>
        Filteri {count > 0 && `(${count})`}
      </button>
      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        aria-labelledby="filter-title"
      >
        <div className="filter-dialog-head">
          <h2 id="filter-title">Filteri</h2>
          <button aria-label="Zatvori filtere" onClick={() => setOpen(false)}>
            ×
          </button>
        </div>
        {children}
        <button
          className="button button-primary"
          onClick={() => setOpen(false)}
        >
          Primeni i zatvori
        </button>
      </dialog>
    </div>
  );
}
