'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
const links = [
  ['Početna', '/'],
  ['Ponuda', '/#ponuda'],
  ['O nama', '/o-nama'],
  ['Preuzimanje', '/preuzimanje'],
  ['Kontakt', '/kontakt'],
] as const;
export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.classList.add('menu-open');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('menu-open');
    };
  }, [open]);
  return (
    <div className="mobile-nav">
      <button
        ref={button}
        className="menu-button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? 'Zatvori navigaciju' : 'Otvori navigaciju'}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>
      {open && (
        <nav id="mobile-menu" aria-label="Mobilna navigacija">
          <ul>
            {links.map(([label, href]) => (
              <li key={href}>
                <Link href={href} onClick={() => setOpen(false)}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            className="button button-primary"
            href="/#ponuda"
            onClick={() => setOpen(false)}
          >
            Pogledaj ponudu
          </Link>
        </nav>
      )}
    </div>
  );
}
