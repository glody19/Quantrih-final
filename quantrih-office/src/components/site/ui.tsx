import Link from "next/link";

export function Section({ children, className = "", tone = "ivory" }: { children: React.ReactNode; className?: string; tone?: "ivory" | "paper" | "navy" | "sand" }) {
  const bg = { ivory: "bg-ivory", paper: "bg-paper", navy: "bg-navy text-ivory", sand: "bg-sand/60" }[tone];
  return (
    <section className={`${bg} ${className}`}>
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">{children}</div>
    </section>
  );
}

export function PageHero({ eyebrow, title, lead }: { eyebrow: string; title: string; lead: string }) {
  return (
    <section className="border-b border-line/70 bg-ivory">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-20 sm:px-6 md:pb-20 md:pt-28">
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="mt-5 max-w-3xl text-[2.6rem] leading-[1.05] md:text-[3.8rem]">{title}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate">{lead}</p>
      </div>
    </section>
  );
}

export function CallToAction() {
  return (
    <section className="bg-navy text-ivory">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-4 py-20 sm:px-6 md:flex-row md:items-center">
        <div>
          <div className="eyebrow !text-gold">Premier échange</div>
          <h2 className="mt-4 max-w-xl text-[2.2rem] leading-tight md:text-[2.8rem]">Parlons de votre patrimoine, sans engagement.</h2>
          <p className="mt-4 max-w-xl text-ivory/70">Un rendez-vous découverte de 45 minutes, à Louvain-la-Neuve ou en visioconférence, pour comprendre votre situation et vos priorités.</p>
        </div>
        <Link href="/contact" className="btn btn-gold shrink-0">
          Prendre rendez-vous
        </Link>
      </div>
    </section>
  );
}
