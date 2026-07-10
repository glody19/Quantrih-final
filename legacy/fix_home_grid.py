with open("src/components/pages/Home.tsx", "r") as f:
    content = f.read()

old_grid = 'className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10 w-full max-w-[90rem] mx-auto px-4"'
new_grid = 'className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 relative z-10 w-full max-w-[90rem] mx-auto px-2 md:px-4"'

content = content.replace(old_grid, new_grid)

with open("src/components/pages/Home.tsx", "w") as f:
    f.write(content)
print("Updated grid in Home.tsx")
