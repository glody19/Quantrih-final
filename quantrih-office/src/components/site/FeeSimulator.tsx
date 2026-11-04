"use client";

import { useState } from "react";
import { computeFees, DEFAULT_FEE_GRID } from "@/lib/fees";
import { eur, percent } from "@/lib/format";

const PRESETS = [2_000_000, 5_000_000, 10_000_000, 20_000_000];

export function FeeSimulator() {
  const [wealth, setWealth] = useState(5_000_000);
  const r = computeFees(wealth, DEFAULT_FEE_GRID);
  return (
    <div className="card p-6 sm:p-8">
      <label htmlFor="wealth" className="eyebrow block">
        Patrimoine coordonné
      </label>
      <div className="num serif mt-3 text-[2.6rem] leading-none">{eur(wealth)}</div>
      <input
        id="wealth"
        type="range"
        min={1_000_000}
        max={30_000_000}
        step={250_000}
        value={wealth}
        onChange={(e) => setWealth(Number(e.target.value))}
        className="mt-6 w-full accent-[#B08D57]"
        aria-valuetext={eur(wealth)}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button key={p} type="button" onClick={() => setWealth(p)} className={`rounded-full border px-3 py-1 text-xs ${wealth === p ? "border-navy bg-navy text-ivory" : "border-line hover:border-navy"}`}>
            {p / 1_000_000} M€
          </button>
        ))}
      </div>
      <table className="num mt-8 w-full text-sm">
        <caption className="sr-only">Détail du calcul par tranche</caption>
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-slate">
            <th className="py-2 font-medium">Tranche</th>
            <th className="py-2 text-right font-medium">Taux</th>
            <th className="py-2 text-right font-medium">Honoraire</th>
          </tr>
        </thead>
        <tbody>
          {r.lines.map((l) => (
            <tr key={l.from} className="border-b border-line/60">
              <td className="py-2.5">
                {eur(l.from)} – {eur(l.to)}
              </td>
              <td className="py-2.5 text-right">{percent(l.rate)}</td>
              <td className="py-2.5 text-right">{eur(l.fee)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="pt-4 font-semibold">Honoraire annuel HTVA</td>
            <td className="pt-4 text-right text-slate">{percent(r.effectiveRate)}</td>
            <td className="pt-4 text-right font-semibold">{eur(r.net)}</td>
          </tr>
          <tr className="text-slate">
            <td className="pt-1.5">TVA ({percent(DEFAULT_FEE_GRID.vatRate).replace(",00", "")})</td>
            <td />
            <td className="pt-1.5 text-right">{eur(r.vat)}</td>
          </tr>
          <tr>
            <td className="pt-1.5 font-semibold">Honoraire annuel TVAC</td>
            <td />
            <td className="pt-1.5 text-right font-semibold">{eur(r.gross)}</td>
          </tr>
        </tfoot>
      </table>
      <p className="mt-6 text-xs leading-relaxed text-slate">Simulation indicative. Le montant définitif figure dans votre lettre de mission.</p>
    </div>
  );
}
