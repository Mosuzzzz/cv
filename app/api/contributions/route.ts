import { profile } from "../../profile";

type Day = { date: string; level: number; count: number | null };

export async function GET() {
  try {
    const response = await fetch(
      "https://github.com/users/" + encodeURIComponent(profile.githubUsername) + "/contributions",
      {
        headers: { Accept: "text/html", "User-Agent": "Mozilla/5.0 Portfolio" },
        next: { revalidate: 3600 },
      },
    );
    if (!response.ok) throw new Error("GitHub calendar unavailable");

    const html = await response.text();
    const days: Day[] = [];
    for (const tag of html.matchAll(/<(?:td|rect)\b[^>]*>/g)) {
      const date = tag[0].match(/\bdata-date=["'](\d{4}-\d{2}-\d{2})["']/)?.[1];
      const level = tag[0].match(/\bdata-level=["']([0-4])["']/)?.[1];
      const count = tag[0].match(/\bdata-count=["'](\d+)["']/)?.[1];
      if (date && level) days.push({ date, level: Number(level), count: count ? Number(count) : null });
    }
    if (days.length === 0) throw new Error("GitHub calendar has no activity data");

    const uniqueDays = [...new Map(days.map(day => [day.date, day])).values()]
      .sort((a, b) => a.date.localeCompare(b.date));
    // A partial match would otherwise render a plausible but incorrect calendar.
    const completeYear = uniqueDays.length >= 365 && uniqueDays.length <= 371
      && uniqueDays.every((day, index) => index === 0
        || Date.parse(day.date + "T00:00:00Z") - Date.parse(uniqueDays[index - 1].date + "T00:00:00Z") === 86_400_000);
    if (!completeYear) throw new Error("GitHub calendar is incomplete");
    const headerTotal = html.match(/([\d,]+)\s+contributions?\s+in\s+the\s+last\s+year/i)?.[1];
    const allCountsAvailable = uniqueDays.every(day => day.count !== null);
    const total = headerTotal
      ? Number(headerTotal.replaceAll(",", ""))
      : allCountsAvailable
        ? uniqueDays.reduce((sum, day) => sum + (day.count ?? 0), 0)
        : null;

    const leading = new Date(uniqueDays[0].date + "T00:00:00Z").getUTCDay();
    const calendar: (Day | null)[] = [...Array(leading).fill(null), ...uniqueDays];
    while (calendar.length % 7 !== 0) calendar.push(null);
    const visible = calendar.slice(-371);
    while (visible.length < 371) visible.unshift(null);

    return Response.json({ days: visible, total }, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch {
    return Response.json({ error: "Contribution calendar unavailable" }, { status: 502 });
  }
}
