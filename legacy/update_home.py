import re

with open("src/components/pages/Home.tsx", "r") as f:
    content = f.read()

# Define the new 4 modules section
new_tools_section = """        {/* Feature Tools System Flow */}
        <div className="w-full relative py-20 lg:py-40 overflow-hidden">
          {/* Background Data Center Image */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-[0.15] mix-blend-luminosity"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/80 to-bg/90"></div>
          </div>
          
          <div className="w-full px-6 lg:px-24 z-20 relative">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-16 text-center"
            >
              <h3 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6 transition-colors duration-300">
                {'Tools & Strategies'}
              </h3>
              <p className="text-slate-300 text-xl max-w-3xl mx-auto leading-relaxed">
                {"Discover our 4 simplified analysis tools to design, test, and secure your investment portfolio."}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10 w-full max-w-[90rem] mx-auto px-4">
              {ObjectPages.map((p, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
                  key={i} 
                  className="group relative bg-white/5 backdrop-blur-2xl border border-white/10 hover:border-white/20 rounded-[2rem] p-8 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
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
                    >
                      {p.cta}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>"""

# Replace between {/* Feature Tools System Flow */} and {/* Support Section */}
start_marker = "{/* Feature Tools System Flow */}"
end_marker = "{/* Support Section */}"

if start_marker in content and end_marker in content:
    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker)
    
    new_content = content[:start_idx] + new_tools_section + "\n\n        " + content[end_idx:]
    with open("src/components/pages/Home.tsx", "w") as f:
        f.write(new_content)
    print("Successfully updated Home.tsx 4 modules section")
else:
    print("Markers not found")
