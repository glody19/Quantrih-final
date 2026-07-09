const fs = require('fs');

let content = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');

const oldLanguages = /\{\[\'en\', \'fr\', \'es\'\]\.map\(l => \([\s\S]*?<\/button>\n\s*\)\)\}/m;

const newLanguages = `{[
            { id: 'en', flag: '🇬🇧' },
            { id: 'fr', flag: '🇫🇷' },
            { id: 'nl', flag: '🇳🇱' },
            { id: 'es', flag: '🇪🇸' }
          ].map(l => (
            <button
              key={l.id}
              onClick={() => setLanguage(l.id as any)}
              className={cn(
                "text-[10px] font-black uppercase tracking-widest transition-all px-2.5 py-1 rounded-full flex items-center gap-1",
                language === l.id ? "bg-pv-blue/20 text-pv-blue" : "text-text-4 hover:text-text hover:bg-surface-2"
              )}
            >
              <span className="text-[12px]">{l.flag}</span>
              {l.id}
            </button>
          ))}`;

content = content.replace(oldLanguages, newLanguages);

fs.writeFileSync('src/components/layout/Header.tsx', content);
console.log('Fixed Header languages');
