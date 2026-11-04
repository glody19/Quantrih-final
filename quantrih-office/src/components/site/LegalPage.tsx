export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <h1 className="text-[2.6rem] leading-tight">{title}</h1>
      <div className="mt-4 rounded-lg bg-sand px-4 py-3 text-sm text-slate">Texte provisoire, à faire valider par un avocat avant la mise en ligne.</div>
      <div className="mt-10 space-y-6 leading-relaxed text-slate [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:text-navy">{children}</div>
    </article>
  );
}
