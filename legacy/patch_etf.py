import re

with open('src/components/pages/EtfScreener.tsx', 'r') as f:
    content = f.read()

content = content.replace("  const parseNum = (val: string) => parseFloat(val.replace(/[^0-9,-]/g, '').replace(',', '.')) || 0;", """  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 30;

  const parseNum = (val: string) => parseFloat(val.replace(/[^0-9,-]/g, '').replace(',', '.')) || 0;""")

content = content.replace("  }, [search, selectedCategory, selectedDist, sortField, sortDirection, minAum, maxFee, minYtd]);\n\n  return (", """  }, [search, selectedCategory, selectedDist, sortField, sortDirection, minAum, maxFee, minYtd]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, selectedDist, minAum, maxFee, minYtd]);

  const totalPages = Math.ceil(filteredETFs.length / ITEMS_PER_PAGE);
  const currentETFs = filteredETFs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (""")

content = content.replace("{filteredETFs.map((etf, idx) => {", "{currentETFs.map((etf, idx) => {")

content = content.replace("""<td className="py-3 px-4 font-medium text-text hidden sm:table-cell">{etf.category}</td>""", """<td className="py-3 px-4 font-medium hidden sm:table-cell">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pv-blue/10 text-pv-blue border border-pv-blue/20">{etf.category}</span>
                        </td>""")

content = content.replace("""            </table>
          </div>
        </div>
      </div>
    </div>
  );
}""", """            </table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-surface-2 border-t border-border sticky bottom-0 z-10">
                <span className="text-sm font-medium text-text">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white border border-border rounded-xl text-sm font-bold text-text disabled:opacity-50 hover:bg-surface transition-colors shadow-sm"
                  >
                    Previous
                  </button>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white border border-border rounded-xl text-sm font-bold text-text disabled:opacity-50 hover:bg-surface transition-colors shadow-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}""")

with open('src/components/pages/EtfScreener.tsx', 'w') as f:
    f.write(content)

