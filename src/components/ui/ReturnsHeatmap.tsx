import React, { useMemo } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';

interface ReturnsHeatmapProps {
  monthlyReturns: { date: string, value: number }[]; // value is percentage
}

const MONTH_NAMES: Record<string, string[]> = {
  fr: ['Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'],
  nl: ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'],
  de: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
  es: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
};

export function ReturnsHeatmap({ monthlyReturns }: ReturnsHeatmapProps) {
  const { language, t } = useTranslation();

  const { years, heatmapData } = useMemo(() => {
    const data: Record<number, number[]> = {};
    const yrSet = new Set<number>();

    monthlyReturns.forEach(mr => {
      const d = new Date(mr.date);
      const year = d.getFullYear();
      const month = d.getMonth(); // 0-11
      if (!data[year]) {
        data[year] = Array(12).fill(null);
      }
      data[year][month] = mr.value;
      yrSet.add(year);
    });

    const years = Array.from(yrSet).sort((a,b)=>b-a);
    return { years, heatmapData: data };
  }, [monthlyReturns]);

  // green for gains, burgundy for losses, intensity by size (YTD on a wider scale)
  const tone = (value: number | null, scale = 8) => {
    if (value === null || value === undefined) return { background: "transparent", color: "#CBD5E1" };
    const k = Math.min(Math.abs(value) / scale, 1);
    const bg = value >= 0 ? `rgba(16,150,105,${0.08 + k * 0.72})` : `rgba(159,18,57,${0.08 + k * 0.72})`;
    return { background: bg, color: k > 0.5 ? "#FFFFFF" : value >= 0 ? "#065F46" : "#881337" };
  };
  const fmt = (v: number | null) => (v == null ? "-" : `${v > 0 ? "+" : ""}${v.toFixed(1)}%`);

  const months = MONTH_NAMES[language] || MONTH_NAMES.en;

  return (
    <div className="w-full overflow-x-auto">
      <table className="heat-table w-full min-w-[860px] text-[12.5px] text-center border-separate border-spacing-[3px] tabular-nums">
        <thead>
          <tr className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-slate-500">
            <th className="px-2 pb-2 text-left">{t("heat.year")}</th>
            {months.map((m, idx) => <th key={idx} className="px-1 pb-2">{m}</th>)}
            <th className="px-2 pb-2 text-[#0C2233]">YTD</th>
          </tr>
        </thead>
        <tbody>
          {years.map((year, yi) => {
            const row = heatmapData[year];
            let ytd = 1;
            let hasData = false;
            row.forEach(val => {
              if (val != null) {
                ytd *= (1 + (val/100));
                hasData = true;
              }
            });
            const ytdPercent = hasData ? (ytd - 1) * 100 : null;

            return (
              <tr key={year} className="heat-row" style={{ animationDelay: `${Math.min(yi, 30) * 35}ms` }}>
                <td className="px-2 py-1.5 text-left font-semibold text-slate-700">{year}</td>
                {row.map((val, idx) => (
                  <td key={idx} className="rounded-md px-1 py-1.5 font-semibold transition-transform duration-150 hover:scale-[1.08] hover:relative hover:z-10 hover:shadow-[0_6px_16px_-6px_rgba(6,18,27,0.45)]" style={tone(val)} title={`${months[idx]} ${year}: ${fmt(val)}`}>
                    {fmt(val)}
                  </td>
                ))}
                <td className="rounded-md px-2 py-1.5 font-bold" style={tone(ytdPercent, 25)}>{fmt(ytdPercent)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
