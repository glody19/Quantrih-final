import React, { useMemo } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';

interface PortfolioResult {
  name: string;
  monthlyReturns: { date: string; value: number }[];
}

interface RollingReturnsTableProps {
  portfolios: PortfolioResult[];
}

export function RollingReturnsTable({ portfolios }: RollingReturnsTableProps) {
  const { t } = useTranslation();

  const periods = [
    { label: t("aa.1yr"), months: 12 },
    { label: t("aa.3yr"), months: 36 },
    { label: t("aa.5yr"), months: 60 },
    { label: t("aa.10yr"), months: 120 }
  ];

  const rollingData = useMemo(() => {
    return portfolios.map(p => {
      const statsByPeriod: Record<number, { avg: number; min: number; max: number } | null> = {};

      periods.forEach(per => {
        const m = per.months;
        if (p.monthlyReturns.length < m) {
          statsByPeriod[m] = null;
          return;
        }

        const rollingCumReturns: number[] = [];
        for (let i = 0; i <= p.monthlyReturns.length - m; i++) {
          let cum = 1;
          for (let j = 0; j < m; j++) {
            cum *= (1 + (p.monthlyReturns[i + j].value / 100));
          }
          const annReturn = (Math.pow(cum, 12 / m) - 1) * 100;
          rollingCumReturns.push(annReturn);
        }

        if (rollingCumReturns.length > 0) {
          const sum = rollingCumReturns.reduce((a, b) => a + b, 0);
          const avg = sum / rollingCumReturns.length;
          const min = Math.min(...rollingCumReturns);
          const max = Math.max(...rollingCumReturns);
          statsByPeriod[m] = { avg, min, max };
        } else {
          statsByPeriod[m] = null;
        }
      });

      return {
        name: p.name,
        statsByPeriod
      };
    });
  }, [portfolios, t]);

  if (!portfolios || portfolios.length === 0) return null;

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
      <h3 className="text-lg font-bold text-text mb-4 text-left">{t("rolling.title")}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-border text-text-3 font-semibold">
              <th className="py-3 px-4">{t("pb.portfolio")}</th>
              <th className="py-3 px-4">{t("rolling.period")}</th>
              <th className="py-3 px-4 text-right">{t("rolling.average")}</th>
              <th className="py-3 px-4 text-right">{t("rolling.best")}</th>
              <th className="py-3 px-4 text-right">{t("rolling.worst")}</th>
            </tr>
          </thead>
          <tbody>
            {rollingData.map((p, pIdx) => (
              <React.Fragment key={pIdx}>
                {periods.map((per, perIdx) => {
                  const stat = p.statsByPeriod[per.months];
                  return (
                    <tr 
                      key={perIdx} 
                      className={`border-b border-border/50 hover:bg-surface-2 transition-colors ${
                        perIdx === periods.length - 1 ? 'border-b-2 border-border' : ''
                      }`}
                    >
                      {perIdx === 0 && (
                        <td 
                          rowSpan={periods.length} 
                          className="py-4 px-4 font-bold text-text align-top border-r border-border/50 bg-surface-2/30"
                        >
                          {p.name}
                        </td>
                      )}
                      <td className="py-2.5 px-4 font-medium text-text">{per.label}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-semibold text-text">
                        {stat ? `${stat.avg > 0 ? '+' : ''}${stat.avg.toFixed(2)}%` : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-emerald-600 font-medium">
                        {stat ? `${stat.max > 0 ? '+' : ''}${stat.max.toFixed(2)}%` : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-rose-600 font-medium">
                        {stat ? `${stat.min > 0 ? '+' : ''}${stat.min.toFixed(2)}%` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
