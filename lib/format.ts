/**
 * Date and number formatting shared by the dashboards (Arabic month names, Latin digits).
 *
 * Dates use one fixed time zone so server-rendered and hydrated markup match
 * regardless of where the server runs or which browser views the page.
 */

export const TIME_ZONE = process.env.NEXT_PUBLIC_TIME_ZONE ?? "Africa/Cairo";

const dateFmt = new Intl.DateTimeFormat("ar", { day: "numeric", month: "short", year: "numeric", numberingSystem: "latn", timeZone: TIME_ZONE });
const timeFmt = new Intl.DateTimeFormat("ar", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  numberingSystem: "latn",
  timeZone: TIME_ZONE,
});
const partsFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: TIME_ZONE,
});
const numberFmt = new Intl.NumberFormat("en-US");

export const formatDate = (iso: string) => dateFmt.format(new Date(iso));
export const formatDateTime = (iso: string) => timeFmt.format(new Date(iso));
export const formatNumber = (n: number) => numberFmt.format(n);

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} د`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} س ${m} د` : `${h} س`;
}

export function formatFileSize(kb: number) {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

/* ------------------------------------------------------------------ */
/* <input type="datetime-local"> in TIME_ZONE                          */
/* ------------------------------------------------------------------ */

function zonedParts(t: number) {
  const p = Object.fromEntries(partsFmt.formatToParts(new Date(t)).map((x) => [x.type, x.value]));
  return { y: +p.year, mo: +p.month, d: +p.day, h: +p.hour, mi: +p.minute };
}

/** ISO → "YYYY-MM-DDTHH:mm" as seen in TIME_ZONE. */
export function toZonedInput(iso?: string) {
  if (!iso) return "";
  const { y, mo, d, h, mi } = zonedParts(Date.parse(iso));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${y}-${pad(mo)}-${pad(d)}T${pad(h)}:${pad(mi)}`;
}

/** "YYYY-MM-DDTHH:mm" in TIME_ZONE → ISO. */
export function fromZonedInput(value: string) {
  if (!value) return undefined;
  const [date, time] = value.split("T");
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const asUtc = Date.UTC(y, mo - 1, d, h, mi);
  const p = zonedParts(asUtc);
  const offset = Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi) - asUtc;
  return new Date(asUtc - offset).toISOString();
}
