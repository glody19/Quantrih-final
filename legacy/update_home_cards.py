with open("src/components/pages/Home.tsx", "r") as f:
    content = f.read()

# Update Hero CTA buttons
old_hero_cta = """            <button 
              onClick={() => onGoPage("backtesting")}
              className="px-8 py-5 bg-[#635BFF] text-white font-semibold rounded-2xl text-lg tracking-wide hover:-translate-y-1 hover:shadow-[0_20px_40px_-10px_rgba(99,91,255,0.4)] transition-all flex items-center gap-3 relative overflow-hidden group"
            >"""
new_hero_cta = """            <button 
              onClick={() => onGoPage("backtesting")}
              className="px-6 py-4 bg-[#635BFF] text-white font-bold rounded-xl text-base tracking-wide hover:-translate-y-1 hover:shadow-[0_10px_20px_-10px_rgba(99,91,255,0.4)] transition-all flex items-center gap-3 relative overflow-hidden group"
            >"""
content = content.replace(old_hero_cta, new_hero_cta)

old_hero_cta2 = """            <button 
              onClick={() => onGoPage("tactical")}
              className="px-8 py-5 bg-transparent border-2 border-slate-700 hover:border-slate-500 text-white font-semibold rounded-2xl text-lg tracking-wide hover:-translate-y-1 transition-all flex items-center gap-3"
            >"""
new_hero_cta2 = """            <button 
              onClick={() => onGoPage("tactical")}
              className="px-6 py-4 bg-transparent border-2 border-slate-700 hover:border-slate-500 text-white font-bold rounded-xl text-base tracking-wide hover:-translate-y-1 transition-all flex items-center gap-3"
            >"""
content = content.replace(old_hero_cta2, new_hero_cta2)


# Update 4 Module Cards
old_card_style = """                  className="group relative bg-[#0F172A] border border-slate-800 hover:border-slate-600 rounded-[2rem] p-8 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10 mb-8">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-500", p.color.replace('text-', 'bg-').replace('500', '500/20'))}>
                      <Activity className={cn("w-7 h-7", p.color)} />
                    </div>
                    <h4 className={cn("text-2xl font-bold tracking-tight mb-4", p.color)}>
                      {p.title}
                    </h4>
                    <p className="text-slate-300 text-base leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                  
                  <div className="relative z-10 mt-auto pt-4 border-t border-white/10">
                    <button 
                      onClick={() => onGoPage(p.id)}
                      className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group-hover:bg-pv-blue group-hover:text-white"
                    >"""
                    
new_card_style = """                  className="group relative bg-[#0B1121] border border-slate-800/80 hover:border-slate-600 rounded-3xl p-8 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 shadow-xl hover:shadow-2xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
                  <div className={cn("absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500", p.color.replace('text-', 'bg-'))} />
                  
                  <div className="relative z-10 mb-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center bg-[#151E32] border border-slate-700/50 shadow-inner group-hover:scale-110 transition-transform duration-500", p.color.replace('text-', 'text-'))}>
                        <Activity className={cn("w-8 h-8", p.color)} />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-500 group-hover:text-white transition-colors">
                        <ArrowRight size={16} className="-rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                      </div>
                    </div>
                    <h4 className="text-2xl font-extrabold tracking-tight mb-3 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all">
                      {p.title}
                    </h4>
                    <p className="text-slate-400 font-medium text-sm leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                  
                  <div className="relative z-10 mt-auto pt-6">
                    <button 
                      onClick={() => onGoPage(p.id)}
                      className="w-full py-3 bg-[#1E293B] hover:bg-[#334155] text-slate-300 hover:text-white font-bold text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >"""
content = content.replace(old_card_style, new_card_style)

with open("src/components/pages/Home.tsx", "w") as f:
    f.write(content)
print("Updated home styling")
