import React from "react";
import { motion } from "motion/react";
import { BookOpen, Globe, MapPin, Briefcase, Sparkles, Leaf, Shield, Database, PiggyBank, Search, BarChart3, AlertCircle } from "lucide-react";
import { useTranslation } from "../../contexts/LanguageContext";

export function EtfEducation({ language }: { language: string }) {
  // Translate everything to English as requested
  return (
    <section className="animate-fade-in space-y-16 max-w-4xl mx-auto pb-20">
      
      {/* 1. Introduction */}
      <div className="space-y-6">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-text">
          Introduction to ETFs
        </h2>
        <div className="bg-surface border border-border/80 rounded-3xl p-8 shadow-sm">
          <p className="text-text leading-relaxed mb-4">
            An <strong>ETF (Exchange Traded Fund)</strong> is a basket of securities (stocks, bonds, etc.) that replicates the performance of a benchmark index. In practical terms, when you buy an ETF, you are simultaneously investing in all the companies that make up that index, in a single transaction.
          </p>
          <ul className="space-y-3 text-text">
            <li className="flex items-start gap-3">
              <span className="text-pv-blue mt-1">•</span>
              <span><strong>Simple Diversification:</strong> Immediate access to hundreds or thousands of companies.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-pv-blue mt-1">•</span>
              <span><strong>Low Costs:</strong> Management fees are generally much lower than traditional investment funds.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-pv-blue mt-1">•</span>
              <span><strong>Transparency:</strong> You know exactly what the tracked index contains.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-pv-blue mt-1">•</span>
              <span><strong>Traded on Exchange:</strong> They are bought and sold easily like a traditional stock, throughout the trading day.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 2. & 3. Structure pédagogique */}
      <div className="space-y-10">
        <h2 className="text-2xl font-semibold tracking-tight text-text border-b border-border pb-4">
          Understanding the ETF Universe by Category
        </h2>
        
        {/* Actions par zone géographique */}
        <CategoryCard 
          icon={<Globe className="text-blue-500" />}
          title="Equities by Geographic Area"
          description="This category groups together major global markets (North America, Europe, Asia-Pacific, Emerging Markets, World). It allows for macro-economic investing by betting on the growth of entire geographic blocks. The investor finds maximum diversification but is exposed to global market risk and currency risk if the index includes foreign currencies."
          examples={[
            "iShares Core S&P 500 UCITS ETF (IE0031442068)",
            "Vanguard FTSE All-World UCITS ETF (IE00BK5BQT80)",
            "Amundi Core MSCI Emerging Markets UCITS ETF (LU1737652583)"
          ]}
        />

        {/* Actions par pays */}
        <CategoryCard 
          icon={<MapPin className="text-emerald-500" />}
          title="Equities by Country"
          description="Here, the objective is to target the economic performance of a specific country (USA, France, Japan, Germany, etc.). This allows for overweighting a dynamic or familiar economy. The main risk is concentration (country risk): if the targeted country suffers a political or economic crisis, the ETF will be heavily impacted."
          examples={[
            "Amundi CAC 40 UCITS ETF (FR0007052782)",
            "Vanguard FTSE Japan UCITS ETF (IE00BFMXYX26)",
            "iShares MSCI Brazil UCITS ETF (IE00B0M63516)"
          ]}
        />

        {/* Actions par secteur */}
        <CategoryCard 
          icon={<Briefcase className="text-rose-500" />}
          title="Equities by Sector"
          description="These ETFs target a particular field of activity (Technology, Health, Energy, Financial Services, Automobile...). The investor can thus expose themselves to sectors they judge promising for the future. The inherent risk is sector risk: any regulatory change or technological crisis specifically affecting this industry will lower the ETF, regardless of other markets."
          examples={[
            "iShares STOXX Europe 600 Technology UCITS ETF (DE000A0H08Q4)",
            "iShares STOXX Europe 600 Health Care UCITS ETF (DE000A0Q4R36)",
            "iShares MSCI World Energy Sector UCITS ETF (IE00BJ5JP105)"
          ]}
        />

        {/* Actions par style */}
        <CategoryCard 
          icon={<Sparkles className="text-amber-500" />}
          title="Equities by Management Style"
          description="This category segments the market according to financial criteria: Growth (companies that develop fast), Dividends (companies that redistribute cash), Large Cap (big capitalizations), Small Cap (small companies), or Low Volatility. The investor can adapt the ETF to their horizon and risk tolerance. The risk lies in the underperformance of a style over a given period (e.g., Growth can fall during a rate hike)."
          examples={[
            "VanEck Morningstar Developed Markets Dividend Leaders UCITS ETF (NL0011683594)",
            "iShares EURO STOXX Small UCITS ETF (IE00B02KXM00)",
            "Amundi MSCI Europe Growth UCITS ETF (LU1598688189)"
          ]}
        />

        {/* Actions ESG / Social/durable */}
        <CategoryCard 
          icon={<Leaf className="text-green-500" />}
          title="ESG / Social & Sustainable Equities"
          description="ESG ETFs filter components of a traditional index (North America, Europe, World...) to only retain companies respecting Environmental, Social, and Governance criteria. It is ideal for investing ethically or aligned with the Paris Agreement. The risk is the potential performance gap (tracking error) compared to the classic index if excluded companies (oil, weapons) outperform."
          examples={[
            "iShares MSCI World ESG Enhanced CTB UCITS ETF (IE00BG11HV38)",
            "Amundi CAC 40 ESG UCITS ETF (LU1681047079)",
            "iShares MSCI USA SRI UCITS ETF (IE00BZ173T46)"
          ]}
        />

        {/* Actions thématiques */}
        <CategoryCard 
          icon={<Search className="text-violet-500" />}
          title="Thematic Equities"
          description="They isolate long-term structural trends (Innovation, Aging, Robotics, Cybersecurity, Transition Metals...). These are targeted bets on the future. Although the yield potential is often significant, the volatility risk is high as these themes can inflate quickly (bubble effect) then deflate if the trend slows down."
          examples={[
            "iShares Automation & Robotics UCITS ETF (IE00BYWZ0333)",
            "Amundi MSCI Disruptive Technology UCITS ETF (LU2023678282)",
            "iShares Global Water UCITS ETF (IE00B1TXK627)"
          ]}
        />

        {/* Énergies renouvelables et climatiques */}
        <CategoryCard 
          icon={<Leaf className="text-cyan-500" />}
          title="Renewable Energy & Climate Themes"
          description="A specific branch for global ecological issues (green economy, solar, wind, climate change). These ETFs are for those betting on the energy transition. Besides a concentration risk, these sectors are very sensitive to government regulations, subsidies, and interest rates."
          examples={[
            "iShares Global Clean Energy Transition UCITS ETF (IE00B1XNHC34)",
            "Amundi MSCI EMU ESG Broad Transition UCITS ETF (LU0908501132)"
          ]}
        />

        {/* Obligations */}
        <CategoryCard 
          icon={<Shield className="text-text" />}
          title="Bond ETFs"
          description="These ETFs do not invest in stocks but in debts (government bonds from safe or emerging countries, Corporate bonds). Bonds generally serve as a classic buffer in a stock portfolio. The main risk is interest rate risk: when central banks raise interest rates, the value of existing bonds falls. There is also a default risk on high-yield corporate debts."
          examples={[
            "Amundi Core Euro Government Bond UCITS ETF (LU1737653714)",
            "iShares Core EUR Corporate Bond UCITS ETF (IE00B3F81R35)",
            "Vanguard USD Treasury Bond UCITS ETF (IE00BGYWFS63)"
          ]}
        />

        {/* Matières premières / Métaux précieux */}
        <CategoryCard 
          icon={<PiggyBank className="text-amber-600" />}
          title="Commodities & Precious Metals"
          description="These funds allow for replicating the physical price of a commodity (such as Gold, Silver, or an agricultural/oil basket). They offer protection against inflation and are decorrelated from traditional equity markets. Their risks: these assets pay neither dividends nor interest, and their price depends only on global supply and demand (strong geopolitical risks)."
          examples={[
            "Invesco Physical Gold ETC (IE00B579F325)",
            "WisdomTree Bloomberg WTI Crude Oil (IE00BVFZGC04)",
            "WisdomTree Broad Commodities (GB00B15KY989)"
          ]}
        />
      </div>

      {/* 4. Spécificités des ETF */}
      <div className="bg-surface-2 border border-border rounded-3xl p-8 space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight text-text">
          Understanding ETF Mechanics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-bold text-pv-blue mb-2">Replication: Physical vs. Synthetic</h3>
            <p className="text-sm text-text leading-relaxed mb-4">
              <strong>Physical</strong> replication means the ETF actually buys all (or an optimized sample) of the index's shares. <strong>Synthetic</strong> replication uses contracts (swaps) with a bank to exchange index performance, often allowing access to difficult markets or reducing costs, at the cost of a slight counterparty risk. <strong>Optimized sampling</strong> is used for massive indices: the ETF only buys the most representative shares to avoid excessive transaction fees.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-pv-blue mb-2">Distribution vs. Accumulation</h3>
            <p className="text-sm text-text leading-relaxed mb-4">
              A <strong>Distributing (Dist / 1D)</strong> ETF regularly pays out received dividends to your account. An <strong>Accumulating (Acc / C)</strong> ETF automatically reinvests these dividends within the fund, increasing the price of your share (which is often tax-advantaged depending on the country of residence).
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-pv-blue mb-2">TER, Size, and Liquidity</h3>
            <p className="text-sm text-text leading-relaxed mb-4">
              The <strong>TER (Total Expense Ratio)</strong> represents the annual fees charged by the manager. It is generally between 0.05% and 0.60%. The <strong>Fund Size</strong> (ideally &gt; €100M) and its <strong>liquidity</strong> (daily trading volume) are crucial to ensure you can sell your shares easily without a significant bid-ask spread.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-pv-blue mb-2">Currency and Exchange Risk</h3>
            <p className="text-sm text-text leading-relaxed mb-4">
              The currency in which the ETF is listed (Euro, USD) matters little. What matters is the currency of the stocks contained in the ETF. If you buy an unhedged S&P 500 (USA) ETF, an increase in the Euro against the Dollar will decrease your performance. To avoid this, you can choose a <strong>"Hedged"</strong> ETF (which cancels the impact of currency fluctuations at the cost of slightly higher fees).
            </p>
          </div>
        </div>
      </div>

      {/* 5. Comment choisir un ETF */}
      <div className="bg-surface border border-border/80 rounded-[2rem] p-8 shadow-sm">
        <h2 className="text-2xl font-semibold tracking-tight text-text mb-6">
          Checklist: How to Choose Your ETF?
        </h2>
        <ul className="space-y-4">
          <ChecklistItem title="Category / Targeted Area: " description="Does the index correspond well to the geography or sector you wish to target?" />
          <ChecklistItem title="Fees (TER): " description="Look for the lowest fees possible (ideally under 0.30% for a World or core portfolio ETF)." />
          <ChecklistItem title="Replication Mode: " description="Do you prefer physically owning the securities or do you accept a synthetic contract?" />
          <ChecklistItem title="Dividend Policy: " description="Accumulating (Acc) to grow your capital long-term, or Distributing (Dist) to receive income." />
          <ChecklistItem title="Fund Size: " description="Prioritize ETFs with over 100 million euros under management, ensuring liquidity and reducing the risk of fund closure." />
          <ChecklistItem title="Exchange Risk: " description="Check if the ETF is hedged if you invest outside the Eurozone and currency variations worry you." />
        </ul>
      </div>

      {/* 6. Conclusion */}
      <div className="border border-pv-blue/20 bg-pv-blue/5 rounded-[2rem] p-6 text-center">
        <p className="font-medium text-text">
          ETFs are simple, low-cost, and transparent tools that democratize investment to build a balanced wealth. By mastering their specificities (geography, fees, accumulation), the investor is able to expose themselves effectively, in a single transaction, to the entire global stock market.
        </p>
      </div>

    </section>
  );
}

function CategoryCard({ icon, title, description, examples }: { icon: React.ReactNode, title: string, description: string, examples: string[] }) {
 return (
 <div className="bg-surface border border-border/80 rounded-[2rem] p-6 md:p-8 hover:border-border transition-colors">
 <div className="flex items-center gap-4 mb-4">
 <div className="w-12 h-12 rounded-[1.5rem] bg-surface-2 flex items-center justify-center">
 {icon}
 </div>
 <h3 className="text-xl font-bold tracking-tight text-text">{title}</h3>
 </div>
 <p className="text-sm font-medium text-text leading-relaxed mb-6">
 {description}
 </p>
 <div className="bg-surface-2 rounded-[1.5rem] p-4">
 <div className="text-xs font-bold text-text mb-3">Exemples d'ETF (Tirés du marché)</div>
 <ul className="space-y-2">
 {examples.map((ex, i) => (
 <li key={i} className="text-xs md:text-sm font-medium text-text flex items-start gap-2">
 <span className="text-pv-blue mt-0.5 opacity-50">#</span>
 {ex}
 </li>
 ))}
 </ul>
 </div>
 </div>
 );
}

function ChecklistItem({ title, description }: { title: string, description: string }) {
 return (
 <li className="flex items-start gap-4 bg-surface-2 rounded-[1.5rem] p-4">
 <AlertCircle className="w-5 h-5 text-pv-blue shrink-0 mt-0.5" />
 <div>
 <span className="font-bold text-text">{title}</span>
 <span className="text-sm text-text font-medium">{description}</span>
 </div>
 </li>
 );
}
