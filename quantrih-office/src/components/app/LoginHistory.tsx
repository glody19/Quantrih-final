import { deviceLabel, getRecentLogins } from "@/lib/data";
import { dateTime } from "@/lib/format";

export async function LoginHistory({ userId }: { userId: string }) {
  const rows = await getRecentLogins(userId);
  return (
    <ul className="divide-y divide-line text-sm">
      {rows.map((r, i) => (
        <li key={i} className="flex flex-wrap items-center justify-between gap-2 py-3">
          <span>
            <span className={`mr-2 inline-block h-2 w-2 rounded-full ${r.success ? "bg-sage" : "bg-danger"}`} />
            {deviceLabel(r.ua)}
            {r.reason && <span className="text-slate"> · {r.reason}</span>}
          </span>
          <span className="num text-slate">
            {dateTime(r.at)}
            {r.ip ? ` · ${r.ip}` : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}
