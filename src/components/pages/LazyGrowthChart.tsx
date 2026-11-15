import React from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

/** Growth-of-100 area chart of a lazy portfolio. Separate file so the chart library loads only when a detail opens. */
export default function LazyGrowthChart({ data, name }: { data: { m: string; v: number }[]; name: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -18 }}>
        <defs><linearGradient id="lzg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2A5591" stopOpacity={0.35} /><stop offset="100%" stopColor="#2A5591" stopOpacity={0} /></linearGradient></defs>
        <XAxis dataKey="m" tick={{ fontSize: 11, fill: "#858899" }} axisLine={false} tickLine={false} interval={11} />
        <YAxis tick={{ fontSize: 11, fill: "#858899" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
        <Tooltip contentStyle={{ borderRadius: 12, fontSize: 13 }} />
        <Area type="monotone" dataKey="v" stroke="#2A5591" strokeWidth={2.5} fill="url(#lzg)" animationDuration={1400} name={name} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
