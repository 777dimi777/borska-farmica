export function ProductDescription({
  description,
}: {
  description: string | null;
}) {
  if (!description) return null;
  const paragraphs = description
    .split(/\r?\n+/)
    .map((x) => x.trim())
    .filter(Boolean);
  return (
    <section className="product-description">
      <h2>O proizvodu</h2>
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </section>
  );
}
