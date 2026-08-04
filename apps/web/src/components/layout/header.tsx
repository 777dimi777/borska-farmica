import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { LinkButton } from '@/components/ui/button';
import { Brand } from './brand';
import { MobileNavigation } from './mobile-navigation';
const links = [
  ['Početna', '/'],
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
          Subotom nas pronađite na{' '}
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
          <LinkButton className="header-cta" href="/proizvodi">
            Pogledaj ponudu
          </LinkButton>
          <MobileNavigation />
        </Container>
      </header>
    </>
  );
}
