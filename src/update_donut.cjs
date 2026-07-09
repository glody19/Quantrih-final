const fs = require('fs');

let content = fs.readFileSync('src/components/ui/EliteDonut.tsx', 'utf8');

const target = `{dataList.map((item, idx) => {
            const color = colors[idx % colors.length];
            return (
              <div
                key={item.symbol}
                className="flex items-center justify-between group cursor-default p-2 -mx-2 rounded-2xl hover:bg-surface-2 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="relative flex items-center justify-center">
                    <div
                      className="w-5 h-5 rounded-full shadow-sm ring-4 ring-white group-hover:scale-110 transition-transform z-10"
                      style={{ backgroundColor: color }}
                    />
                    <div
                      className="absolute inset-0 rounded-full blur-sm opacity-50"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span
                      className="text-[16px] font-black tracking-tight group-hover:opacity-80 transition-opacity"
                      style={{ color: color }}
                    >
                      {item.symbol}
                    </span>
                    <span className="text-[10px] text-text-4 font-semibold uppercase tracking-wider">
                      Allocation
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="w-24 md:w-32 h-2.5 bg-surface-3 rounded-full overflow-hidden hidden sm:block shadow-inner">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm relative overflow-hidden"
                      style={{
                        width: \`\${Math.min(100, (item.val / total) * 100)}%\`,
                        backgroundColor: color,
                      }}
                    >
                      <div
                        className="absolute inset-0 bg-white/20 w-full h-full"
                        style={{
                          transform: "skewX(-20deg) translateX(-150%)",
                          animation: "shimmer 2s infinite",
                        }}
                      />
                    </div>
                  </div>
                  <div
                    className="flex flex-col items-end min-w-[75px] px-3 py-1.5 rounded-xl border border-border/60 shadow-sm bg-white group-hover:shadow-md transition-all"
                    style={{ borderLeftWidth: "4px", borderLeftColor: color }}
                  >
                    <span className="text-[15px] font-black text-text tabular-nums leading-none">
                      {Number(item.val).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}`;

const original = `{dataList.map((item, idx) => (
            <div
              key={item.symbol}
              className="flex items-center justify-between group cursor-default"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full shadow-md ring-2 ring-white group-hover:scale-125 transition-transform"
                  style={{ backgroundColor: colors[idx % colors.length] }}
                />
                <span className="text-[15px] font-bold text-text group-hover:text-pv-blue transition-colors">
                  {item.symbol}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 md:w-32 h-2.5 bg-surface-3 rounded-full overflow-hidden hidden sm:block shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                    style={{
                      width: \`\${Math.min(100, (item.val / total) * 100)}%\`,
                      backgroundColor: colors[idx % colors.length],
                    }}
                  />
                </div>
                <span className="text-sm font-black text-text tabular-nums text-right min-w-[70px] px-2.5 py-1.5 bg-surface-2 rounded-xl border border-border/60 shadow-sm group-hover:border-pv-blue/30 group-hover:shadow-md transition-all">
                  {Number(item.val).toFixed(2)}%
                </span>
              </div>
            </div>
          ))}`;

content = content.replace(target, original);

fs.writeFileSync('src/components/ui/EliteDonut.tsx', content);
