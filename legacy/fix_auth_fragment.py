import re

with open("src/components/pages/Auth.tsx", "r") as f:
    content = f.read()

old_code = """                {!isLogin && (
                  <div className="flex justify-center mb-4">"""

new_code = """                {!isLogin && (
                  <>
                  <div className="flex justify-center mb-4">"""

content = content.replace(old_code, new_code)

old_code_end = """                      <input 
                        type="text" required value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe"
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none focus:border-[#635BFF] focus:ring-4 focus:ring-[#635BFF]/10 transition-all text-slate-900 shadow-sm placeholder:text-slate-400" 
                      />
                    </div>
                  </div>
                )}"""

new_code_end = """                      <input 
                        type="text" required value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe"
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none focus:border-[#635BFF] focus:ring-4 focus:ring-[#635BFF]/10 transition-all text-slate-900 shadow-sm placeholder:text-slate-400" 
                      />
                    </div>
                  </div>
                  </>
                )}"""

content = content.replace(old_code_end, new_code_end)

with open("src/components/pages/Auth.tsx", "w") as f:
    f.write(content)
print("Added fragment to Auth.tsx")
