import React from "react";
import { PortfolioBacktesting } from "./PortfolioBacktesting";

interface PortfolioProps {
 baseCcy: string;
 setBaseCcy?: (c: string) => void;
 onNavigate: (page: string) => void;
 initialTab?: string;
}

export function Portfolio({ baseCcy, setBaseCcy }: PortfolioProps) {
 return (
 <div className="w-full animate-fade-in relative pt-4">
 <PortfolioBacktesting baseCcy={baseCcy} setBaseCcy={setBaseCcy} />
 </div>
 );
}

