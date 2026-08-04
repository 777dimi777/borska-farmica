import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { HeaderActions } from './header-actions';
import { Brand } from './brand';
import { MobileNavigation } from './mobile-navigation';
const links = [
  ['PoÃ„Âetna', '/'],
  ['Ponuda', '/proizvodi'],
  ['O nama', '/o-nama'],
  ['Preuzimanje', '/preuzimanje'],
  ['Kontakt', '/kontakt'],
] as const;
export function Header() {
  return (
    <>
      <div className="announcement">
        <Container>
          Subotom nas pronaÃ„â€˜ite na{' '}
          <Link href="/preuzimanje">Gradskoj pijaci u Boru.</Link>
        </Container>
      </div>
      <header className="site-header">
        <Container className="header-inner">
          <Brand />
          <nav className="desktop-nav" aria-label="Glavna navigacija">
            <ul>
              {links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href}>{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <HeaderActions />
          <MobileNavigation />
        </Container>
      </header>
    </>
  );
}
