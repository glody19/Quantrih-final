with open("src/components/pages/Home.tsx", "r") as f:
    content = f.read()

old_text = """                <p className="text-slate-200 font-medium text-2xl leading-relaxed border-l-2 border-border-2 pl-6 py-2">
                  {"Advanced analysis platform and backtesting tools designed to optimize and build your investment strategies."}
                </p>"""

new_text = """                <p className="text-slate-200 font-medium text-2xl leading-relaxed border-l-2 border-border-2 pl-6 py-2">
                  {Array.from("Advanced analysis platform and backtesting tools designed to optimize and build your investment strategies.").map((char, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 + index * 0.03, duration: 0.1 }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </p>"""

if old_text in content:
    content = content.replace(old_text, new_text)
    with open("src/components/pages/Home.tsx", "w") as f:
        f.write(content)
    print("Typewriter effect added to Home.tsx")
else:
    print("Could not find text to replace")
