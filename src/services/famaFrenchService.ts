import Papa from 'papaparse';

export interface FamaFrenchData {
  date: string; // YYYYMM
  mktRf: number;
  smb: number;
  hml: number;
  rf: number;
}

export async function fetchFamaFrenchData(): Promise<FamaFrenchData[]> {
  try {
    const response = await fetch('/data/fama_french.csv');
    if (!response.ok) {
      console.warn("Fama-French CSV not found. Loading fallback data.");
      return getFallbackData();
    }
    
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          const formattedData: FamaFrenchData[] = results.data
            .filter((row: any) => row.Date && !isNaN(row.Date)) // Basic validation
            .map((row: any) => ({
              date: String(row.Date).trim(),
              mktRf: Number(row['Mkt-RF'] || row['Mkt_RF'] || 0),
              smb: Number(row['SMB'] || 0),
              hml: Number(row['HML'] || 0),
              rf: Number(row['RF'] || 0),
            }));
          
          if (formattedData.length > 0) {
            resolve(formattedData);
          } else {
            resolve(getFallbackData());
          }
        },
        error: (error: any) => {
          console.error("Error parsing CSV:", error);
          resolve(getFallbackData()); // fallback on parse error
        }
      });
    });
  } catch (error) {
    console.error("Error fetching Fama-French data:", error);
    return getFallbackData();
  }
}

// Fallback mock data in case the file isn't uploaded yet
function getFallbackData(): FamaFrenchData[] {
  console.log("Using Fama-French fallback data");
  return Array.from({ length: 60 }).map((_, i) => ({
    date: `20${19 + Math.floor(i / 12)}${String((i % 12) + 1).padStart(2, '0')}`,
    mktRf: 0.95 + Math.sin(i / 5) * 0.1 + Math.random() * 0.04,
    smb: -0.2 + Math.cos(i / 4) * 0.05 + Math.random() * 0.02,
    hml: 0.15 + Math.sin(i / 6) * 0.08 + Math.random() * 0.03,
    rf: 0.05 + Math.random() * 0.01,
  }));
}
