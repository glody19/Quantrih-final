with open("src/components/pages/Profile.tsx", "r") as f:
    content = f.read()

old_avatar = """        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md border-4 border-white mb-6 relative z-20">
          <div className="w-full h-full rounded-full bg-[#635BFF]/10 flex items-center justify-center text-[#635BFF] font-bold text-3xl uppercase">
            {displayName.charAt(0) || email.charAt(0) || "?"}
          </div>
        </div>"""

new_avatar = """        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md border-4 border-white mb-6 relative z-20 overflow-hidden">
          {user.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full rounded-full bg-[#635BFF]/10 flex items-center justify-center text-[#635BFF] font-bold text-3xl uppercase">
              {displayName.charAt(0) || email.charAt(0) || "?"}
            </div>
          )}
        </div>"""

content = content.replace(old_avatar, new_avatar)
with open("src/components/pages/Profile.tsx", "w") as f:
    f.write(content)
print("Profile avatar updated")
