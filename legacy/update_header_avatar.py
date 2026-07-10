import re

with open("src/components/layout/Header.tsx", "r") as f:
    content = f.read()

# Replace the avatar rendering logic
old_avatar = """                <div className="w-6 h-6 rounded-[10px] bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] uppercase shadow-inner">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || "?"}
                </div>"""

new_avatar = """                <div className="w-6 h-6 rounded-[10px] bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] uppercase shadow-inner overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user.displayName?.charAt(0) || user.email?.charAt(0) || "?"
                  )}
                </div>"""

content = content.replace(old_avatar, new_avatar)

with open("src/components/layout/Header.tsx", "w") as f:
    f.write(content)
print("Updated Header with Avatar display")
