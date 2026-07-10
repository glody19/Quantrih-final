with open("src/components/layout/Header.tsx", "r") as f:
    content = f.read()

old_dropdown = """              <div className="absolute right-0 top-full pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all">
                <div className="w-[200px] bg-surface border border-border rounded-[1.5rem] p-1.5 flex flex-col gap-0.5">
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="text-[11px] font-bold text-text truncate">{user.displayName || user.email}</p>
                    <p className="text-[9px] text-text-3 font-medium uppercase tracking-widest mt-0.5">Connected</p>
                  </div>
                  <button onClick={() => onPageChange("profile")} className="w-full text-left px-3 py-2 text-[11px] font-bold uppercase text-text hover:bg-surface-2 rounded-2xl transition-colors flex items-center gap-2">
                    <User size={12} /> My Profile
                  </button>
                  <button onClick={() => onPageChange("donate")} className="w-full text-left px-3 py-2 text-[11px] font-bold uppercase text-text hover:bg-surface-2 rounded-2xl transition-colors flex items-center gap-2">
                    <Heart size={12} className="text-red-500" /> Donate
                  </button>
                  <button onClick={() => logout()} className="w-full text-left px-3 py-2 text-[11px] font-bold uppercase text-red hover:bg-red/10 rounded-2xl transition-colors flex items-center gap-2">
                    <LogOut size={12} /> {t("header.signout")}
                  </button>
                </div>
              </div>"""

new_dropdown = """              <div className="absolute right-0 top-full pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all">
                <div className="w-[200px] bg-white border border-slate-200 shadow-xl rounded-[1.5rem] p-1.5 flex flex-col gap-0.5">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-[11px] font-bold text-slate-900 truncate">{user.displayName || user.email}</p>
                    <p className="text-[9px] text-slate-500 font-medium uppercase tracking-widest mt-0.5">Connected</p>
                  </div>
                  <button onClick={() => onPageChange("profile")} className="w-full text-left px-3 py-2 text-[11px] font-bold uppercase text-slate-900 hover:bg-slate-50 rounded-2xl transition-colors flex items-center gap-2">
                    <User size={12} /> Gestion du compte
                  </button>
                  <button onClick={() => onPageChange("donate")} className="w-full text-left px-3 py-2 text-[11px] font-bold uppercase text-slate-900 hover:bg-slate-50 rounded-2xl transition-colors flex items-center gap-2">
                    <Heart size={12} className="text-red-500" /> Donation
                  </button>
                  <button onClick={() => logout()} className="w-full text-left px-3 py-2 text-[11px] font-bold uppercase text-slate-900 hover:bg-slate-50 rounded-2xl transition-colors flex items-center gap-2">
                    <LogOut size={12} /> Logout
                  </button>
                </div>
              </div>"""

content = content.replace(old_dropdown, new_dropdown)

with open("src/components/layout/Header.tsx", "w") as f:
    f.write(content)
print("Updated Header.tsx dropdown")
