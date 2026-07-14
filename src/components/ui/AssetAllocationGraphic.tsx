import React from 'react';
import { motion } from 'motion/react';

export function AssetAllocationGraphic() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none z-0 opacity-40">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-[200%] h-[200%] origin-top-left scale-[0.35] md:scale-[0.4] absolute -top-10 -right-20 pointer-events-none"
      >
        <div className="w-[1080px] bg-[#f4f6f9] p-8 rounded-2xl flex flex-col gap-5 shadow-2xl">
          {/* Card 1 */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="bg-white border border-[#e7eaf0] rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2f6fa8]"></span>
              <h2 className="text-[15px] font-semibold text-[#0f2540] m-0">Portfolio Summaries</h2>
            </div>
            <table className="w-full text-left text-[13.5px] border-collapse">
              <thead>
                <tr className="border-b border-[#e7eaf0] text-[#8a94a3]">
                  <th className="pb-2 font-semibold">Portfolio</th>
                  <th className="pb-2 font-semibold">CAGR</th>
                  <th className="pb-2 font-semibold">Max Drawdown</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#e7eaf0]">
                  <td className="py-3 font-bold text-[#1c2836]">Classic (60/40)</td>
                  <td className="py-3 font-bold text-[#0f9d6b]">+7.72%</td>
                  <td className="py-3 font-bold text-[#e11d48]">-32.78%</td>
                </tr>
                <tr>
                  <td className="py-3 font-bold text-[#1c2836]">Dynamic (80/20)</td>
                  <td className="py-3 font-bold text-[#0f9d6b]">+8.66%</td>
                  <td className="py-3 font-bold text-[#e11d48]">-42.42%</td>
                </tr>
              </tbody>
            </table>
          </motion.div>
          
          {/* Card 2 */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="bg-white border border-[#e7eaf0] rounded-2xl p-6 shadow-sm flex gap-4 items-end h-48"
          >
            <div className="w-1/4 bg-[#2f6fa8] rounded-t-sm" style={{ height: '40%' }}></div>
            <div className="w-1/4 bg-[#eab308] rounded-t-sm" style={{ height: '50%' }}></div>
            <div className="w-1/4 bg-[#2f6fa8] rounded-t-sm" style={{ height: '70%' }}></div>
            <div className="w-1/4 bg-[#eab308] rounded-t-sm" style={{ height: '90%' }}></div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
