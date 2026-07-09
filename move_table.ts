import fs from 'fs';

const file = 'src/components/pages/FinancialModeling.tsx';
let content = fs.readFileSync(file, 'utf8');

// The blocks we want to identify
const newsStart = content.indexOf('{/* Market News Column */}');
const tableStart = content.indexOf('{/* WATCHLIST COMPARISON TABLE */}');
const tablesSection = content.indexOf('{/* TABLES SECTION: ASSET CLASSES & ETFs */}');

if (newsStart === -1 || tableStart === -1 || tablesSection === -1) {
  console.log("Could not find markers.");
  process.exit(1);
}

// Find the end of table section
const endOfTable = content.lastIndexOf('</div>', tablesSection);
const startOfNews = content.lastIndexOf('                  </div>', newsStart);

const tableContent = content.substring(tableStart, tablesSection);

// We want to extract the table content, and move it to just before the News column starts.
// But wait, the News Column starts right after the Chart column ends.
// Let's refine the markers:
const chartColEndMatch = '                    </div>\n                  </div>\n\n                  {/* Market News Column */}';
const chartColEndIdx = content.indexOf(chartColEndMatch);

if (chartColEndIdx !== -1) {
    // 1. Remove table text from its original place
    const beforeTable = content.substring(0, tableStart);
    // remove some closing divs before tablesSection:
    // the original structure had:
    //                   </table>
    //                 </div>
    //               </div>
    //             </div>
    //           </div>
    //
    //                               {/* TABLES SECTION: ASSET CLASSES & ETFs */}
    
    // We'll use a regex to carefully swap the two blocks, but it's simpler:
    // The grid is defined as `grid-cols-1 xl:grid-cols-12`.
    // Chart is `xl:col-span-7`. News is `xl:col-span-5`.
    // Table is after the grid.
    
    // We want Table inside Chart.
    // Insert Table right before `                  </div>\n\n                  {/* Market News Column */}`
    
    const tableText = content.substring(tableStart, tablesSection).replace(/[\s\n]+<\/div>[\s\n]+<\/div>[\s\n]+<\/div>[\s\n]+$/, '\n          </div>\n');
    let part1 = content.substring(0, chartColEndIdx);
    let part2 = '                    </div>\n\n' + tableText + '                  </div>\n\n                  {/* Market News Column */}';
    let part3 = content.substring(chartColEndIdx + chartColEndMatch.length, tableStart);
    let part4 = content.substring(tablesSection);
    
    const finalContent = part1 + part2 + part3.replace(/[\n\s]*$/, '') + '\n            </div>\n\n' + part4;
    fs.writeFileSync(file, finalContent);
    console.log("Successfully moved table");
} else {
    console.log("Could not find chartColEndMatch");
}
