with open("src/components/ui/AtomAnimation.tsx", "r") as f:
    content = f.read()

# Make canvas bigger
old_canvas = """className={"w-full h-full cursor-crosshair z-10 " + (fullScreen ? "" : "lg:max-w-[500px] lg:max-h-[500px] lg:min-h-[400px] lg:ml-12 lg:mt-24 max-w-[450px] max-h-[450px] min-h-[280px]")}"""
new_canvas = """className={"w-full h-full cursor-crosshair z-10 " + (fullScreen ? "" : "lg:max-w-[700px] lg:max-h-[700px] lg:min-h-[600px] max-w-[450px] max-h-[450px] min-h-[400px]")}"""
content = content.replace(old_canvas, new_canvas)

old_grav = """ const isPositive = Math.random() > 0.1;
 const randNum = Math.random();
 const baseNum = (Math.random() * 15).toFixed(2);
 let numberStr = baseNum;
 if (isPositive) {
 if (randNum < 0.1) numberStr = (30 + Math.random() * 9.99).toFixed(2);
 else if (randNum < 0.3) numberStr = (20 + Math.random() * 9.99).toFixed(2);
 }
 p.val = isPositive ? `+${numberStr}%` : `-${numberStr}%`;
 p.color = isPositive ? 'rgba(34, 197, 94, ' : 'rgba(239, 68, 68, ';"""

new_grav = """ const randType = Math.random();
 const randNum = Math.random();
 const baseNum = (Math.random() * 15).toFixed(2);
 let numberStr = baseNum;
 if (randType < 0.33) {
   p.val = `+${numberStr}%`;
   p.color = 'rgba(6, 182, 212, '; // Cyan
 } else if (randType < 0.66) {
   p.val = `+${(Math.random() * 5).toFixed(2)}%`;
   p.color = 'rgba(168, 85, 247, '; // Purple
 } else {
   p.val = `-${numberStr}%`;
   p.color = 'rgba(239, 68, 68, '; // Red
 }"""
content = content.replace(old_grav, new_grav)

with open("src/components/ui/AtomAnimation.tsx", "w") as f:
    f.write(content)
print("Updated AtomAnimation")
