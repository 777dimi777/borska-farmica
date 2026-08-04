import { LinkButton } from './button';
export function EmptyState() {
  return (
    <div className="state-card">
      <h3>Ponuda se trenutno priprema.</h3>
      <p>Uskoro ćete ovde videti dostupne proizvode Borske Farmice.</p>
    </div>
  );
}
export function ApiUnavailableState() {
  return (
    <div className="state-card">
      <h3>Ponuda trenutno nije dostupna.</h3>
      <p>
        Brend informacije i lokacije ostaju dostupne. Pokušajte ponovo malo
        kasnije.
      </p>
      <LinkButton href="#ponuda" variant="secondary">
        Pokušaj ponovo
      </LinkButton>
    </div>
  );
}
