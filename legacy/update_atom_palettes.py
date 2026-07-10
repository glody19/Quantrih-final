with open("src/components/ui/AtomAnimation.tsx", "r") as f:
    content = f.read()
    
old_palettes = """const palettes = [
    [ [6, 182, 212], [59, 130, 246], [255, 255, 255] ],
    [ [34, 197, 94], [16, 185, 129], [255, 255, 255] ],
    [ [255, 255, 255], [200, 200, 200], [150, 150, 150] ],
    [ [59, 130, 246], [37, 99, 235], [255, 255, 255] ],
    [ [168, 85, 247], [139, 92, 246], [255, 255, 255] ]
  ];"""

new_palettes = """const palettes = [
    [ [6, 182, 212], [59, 130, 246], [168, 85, 247] ], // Cyan, Blue, Purple
    [ [34, 197, 94], [234, 179, 8], [239, 68, 68] ],   // Green, Yellow, Red
    [ [249, 115, 22], [236, 72, 153], [99, 102, 241] ] // Orange, Pink, Indigo
  ];"""

content = content.replace(old_palettes, new_palettes)
with open("src/components/ui/AtomAnimation.tsx", "w") as f:
    f.write(content)
print("Updated palettes")
