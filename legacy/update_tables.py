import os

files = [
    "src/components/pages/AssetAllocations.tsx",
    "src/components/pages/PortfolioBacktesting.tsx",
    "src/components/pages/MonteCarlo.tsx"
]

for filepath in files:
    with open(filepath, "r") as f:
        content = f.read()

    # We need to add conditional classes based on `i >= 2 ? "hidden lg:table-cell" : ""`
    # Let's replace the `<th>` class:
    # <th key={pn.id} className="p-3 text-base font-semibold min-w-[140px] text-center group">
    content = content.replace(
        '<th\n                        key={pn.id}\n                        className="p-3 text-base font-semibold min-w-[140px] text-center group"\n                      >',
        '<th\n                        key={pn.id}\n                        className={`p-3 text-base font-semibold min-w-[140px] text-center group ${i >= 2 ? "hidden lg:table-cell" : ""}`}\n                      >'
    )
    content = content.replace(
        '<th key={pn.id} className="p-3 text-base font-semibold min-w-[140px] text-center group">',
        '<th key={pn.id} className={`p-3 text-base font-semibold min-w-[140px] text-center group ${i >= 2 ? "hidden lg:table-cell" : ""}`}>'
    )
    
    # Let's replace the `<td>` class for the inputs
    # <td key={pn.id} className="p-1 lg:p-3">
    content = content.replace(
        '<td key={pn.id} className="p-1 lg:p-3">',
        '<td key={pn.id} className={`p-1 lg:p-3 ${i >= 2 ? "hidden lg:table-cell" : ""}`}>'
    )
    
    # And the totals <td>
    # <td key={pn.id} className="p-3 font-semibold text-center text-text text-base">
    content = content.replace(
        '<td key={pn.id} className="p-3 font-semibold text-center text-text text-base">',
        '<td key={pn.id} className={`p-3 font-semibold text-center text-text text-base ${i >= 2 ? "hidden lg:table-cell" : ""}`}>'
    )

    with open(filepath, "w") as f:
        f.write(content)
    print(f"Updated {filepath}")
