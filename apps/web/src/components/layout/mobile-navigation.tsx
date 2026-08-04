'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/features/auth/auth-provider';
const links = [
  ['PoÃƒâ€žÃ‚Âetna', '/'],
  ['Ponuda', '/proizvodi'],
  ['O nama', '/o-nama'],
  ['Preuzimanje', '/preuzimanje'],
  ['Kontakt', '/kontakt'],
  ['Korpa', '/korpa'],
] as const;
export function MobileNavigation() {
  const auth = useAuth();
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
            <li>
              <Link
                href={auth.status === 'authenticated' ? '/nalog' : '/prijava'}
                onClick={() => setOpen(false)}
              >
                {auth.status === 'authenticated' ? 'Moj nalog' : 'Prijava'}
              </Link>
            </li>{' '}
          </ul>
          <Link
            className="button button-primary"
            href="/proizvodi"
            onClick={() => setOpen(false)}
          >
            Pogledaj ponudu
          </Link>
        </nav>
      )}
    </div>
  );
}
