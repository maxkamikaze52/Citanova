/**
 * Analítica de uso del asistente.
 *
 * Todo se calcula en el servidor a partir de los mensajes reales de la clínica
 * (30 días) y de sus citas, así que no hace falta ningún servicio externo.
 *
 * Si la clínica aún no tiene actividad, se enseña una muestra marcada como
 * "ejemplo" en lugar de un panel vacío: un dentista que entra el día uno tiene
 * que entender qué va a ver aquí.
 */

type Event = { created_at: string; role: string };
type Appt = {
  id: string;
  starts_at: string;
  status: string;
  source: string;
  customers: { name: string | null; phone: string | null } | null;
  services: { name: string | null } | null;
};

const HOURS = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11",
               "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];

/** Hora local de la clínica, sin depender del reloj del servidor. */
function localHour(iso: string, tz: string): number {
  const s = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", hour12: false }).format(new Date(iso));
  const n = parseInt(s, 10);
  return Number.isNaN(n) ? 0 : n % 24;
}
function localDay(iso: string, tz: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
}

/** Media de minutos que cuesta atender una consulta por teléfono: responder, mirar la agenda, apuntar. */
const MINUTES_PER_ENQUIRY = 3.5;
/** Minutos de media por reserva hecha a mano (buscar hueco, confirmar, anotar, avisar). */
const MINUTES_PER_BOOKING = 6;

function Spark({ points, height = 44 }: { points: number[]; height?: number }) {
  const max = Math.max(1, ...points);
  const step = points.length > 1 ? 100 / (points.length - 1) : 100;
  const d = points
    .map((v, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(2)},${(height - (v / max) * height).toFixed(2)}`)
    .join(" ");
  return (
    <svg className="u-spark" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={`${d} L100,${height} L0,${height} Z`} className="u-spark-fill" />
      <path d={d} className="u-spark-line" />
    </svg>
  );
}

export default function Usage({
  activity,
  appointments,
  conversations,
  usedThisMonth,
  cap,
  tz,
}: {
  activity: Event[];
  appointments: Appt[];
  conversations: number;
  usedThisMonth: number;
  cap: number | null;
  tz: string;
}) {
  const demo = activity.length === 0;

  // --- datos reales, o una muestra representativa si aún no hay ninguna ---
  const events: Event[] = demo
    ? Array.from({ length: 214 }, (_, i) => {
        const hour = [8, 9, 9, 10, 10, 10, 11, 12, 13, 16, 17, 17, 18, 19, 20, 21, 21, 22][i % 18];
        const day = i % 26;
        return {
          created_at: new Date(Date.UTC(2026, 10, 1 + day, hour, i % 60)).toISOString(),
          role: i % 2 === 0 ? "user" : "assistant",
        };
      })
    : activity;

  const inbound = events.filter((e) => e.role === "user");
  const messages = events.length;

  // Horas punta: cuenta por hora local de la clínica
  const byHour = new Array(24).fill(0) as number[];
  for (const e of inbound) byHour[localHour(e.created_at, tz)] += 1;
  const peak = byHour.reduce((best, v, i) => (v > byHour[best] ? i : best), 0);
  const peakValue = byHour[peak];
  const afterHours = inbound.filter((e) => {
    const h = localHour(e.created_at, tz);
    return h < 9 || h >= 19;
  }).length;

  // Serie diaria (28 días) para el gráfico
  const days: { key: string; n: number }[] = [];
  const dayCount = new Map<string, number>();
  for (const e of inbound) {
    const k = localDay(e.created_at, tz);
    dayCount.set(k, (dayCount.get(k) ?? 0) + 1);
  }
  for (let i = 27; i >= 0; i--) {
    const dt = new Date(Date.now() - i * 864e5);
    const k = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(dt);
    days.push({ key: k, n: dayCount.get(k) ?? 0 });
  }

  // Reservas hechas por el asistente
  const booked = appointments.filter((a) => a.status !== "cancelled" && a.source !== "manual").length;
  const totalBookings = demo ? 34 : booked;

  // Ahorro estimado
  const minutesSaved = Math.round(inbound.length * MINUTES_PER_ENQUIRY + totalBookings * MINUTES_PER_BOOKING);
  const hoursSaved = (minutesSaved / 60);
  const hoursLabel = hoursSaved >= 10 ? Math.round(hoursSaved) : Math.round(hoursSaved * 10) / 10;

  const outbound = events.filter((e) => e.role === "assistant").length;
  const answerRate = inbound.length > 0 ? Math.round((outbound / inbound.length) * 100) : 0;

  const weekBuckets = [0, 0, 0, 0];
  for (const e of inbound) {
    const dayIdx = Math.floor((Date.now() - new Date(e.created_at).getTime()) / (7 * 864e5));
    if (dayIdx >= 0 && dayIdx < 4) weekBuckets[3 - dayIdx] += 1;
  }
  const trend = weekBuckets[2] > 0 ? Math.round(((weekBuckets[3] - weekBuckets[2]) / weekBuckets[2]) * 100) : null;

  return (
    <section className="u" aria-labelledby="usage-h">
      <div className="u-head">
        <div>
          <p className="u-eyebrow">Uso del asistente</p>
          <h2 id="usage-h">Lo que ha hecho por ti</h2>
        </div>
        {demo ? (
          <p className="u-demo">
            <strong>Muestra de ejemplo.</strong> En cuanto tu web reciba mensajes, estos números serán los tuyos.
          </p>
        ) : (
          <p className="u-live"><span aria-hidden="true" />Últimos 30 días</p>
        )}
      </div>

      {/* Cifras principales */}
      <div className="u-kpis">
        <div className="u-kpi u-kpi-hero">
          <p className="u-kpi-n">{hoursLabel}<span>h</span></p>
          <p className="u-kpi-l">de trabajo que te has ahorrado</p>
          <p className="u-kpi-sub">
            {minutesSaved.toLocaleString("es-ES")} minutos: {inbound.length} consultas atendidas y {totalBookings} citas
            reservadas a mano que ya no has hecho.
          </p>
        </div>
        <div className="u-kpi">
          <p className="u-kpi-n">{demo ? 148 : usedThisMonth || inbound.length}</p>
          <p className="u-kpi-l">mensajes recibidos</p>
          <p className="u-kpi-sub">{cap ? `de ${cap} incluidos este mes` : "este mes"}</p>
        </div>
        <div className="u-kpi">
          <p className="u-kpi-n">{totalBookings}</p>
          <p className="u-kpi-l">citas reservadas</p>
          <p className="u-kpi-sub">por el asistente, sin llamadas</p>
        </div>
        <div className="u-kpi">
          <p className="u-kpi-n">{answerRate}<span>%</span></p>
          <p className="u-kpi-l">de consultas contestadas</p>
          <p className="u-kpi-sub">{demo ? convIs(demo, conversations) : `${conversations} conversaciones abiertas`}</p>
        </div>
      </div>

      {/* Serie temporal */}
      <div className="u-card">
        <div className="u-card-head">
          <h3>Mensajes por día</h3>
          <span className="u-card-meta">
            Últimos 28 días
            {trend !== null ? (
              <em className={trend >= 0 ? "is-up" : "is-down"}>
                {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% vs semana anterior
              </em>
            ) : null}
          </span>
        </div>
        <Spark points={days.map((x) => x.n)} />
        <div className="u-axis">
          <span>hace 4 semanas</span>
          <span>hace 2</span>
          <span>esta semana</span>
        </div>
      </div>

      <div className="u-two">
        {/* Horas punta */}
        <div className="u-card">
          <div className="u-card-head">
            <h3>Cuándo te escriben</h3>
            <span className="u-card-meta">hora local de la clínica</span>
          </div>
          <div className="u-bars" role="img" aria-label={`Hora punta: ${HOURS[peak]}:00, con ${peakValue} mensajes`}>
            {byHour.map((v, h) => {
              const max = Math.max(1, ...byHour);
              const pct = Math.round((v / max) * 100);
              const isPeak = h === peak && v > 0;
              const closed = h < 9 || h >= 19;
              return (
                <span key={h} className={`u-bar${isPeak ? " is-peak" : ""}${closed ? " is-closed" : ""}`}>
                  <i style={{ height: `${Math.max(3, pct)}%` }} />
                  <b>{v}</b>
                </span>
              );
            })}
          </div>
          <div className="u-axis u-axis-hours">
            <span>00</span><span>06</span><span>09</span><span>13</span><span>19</span><span>23</span>
          </div>
          <p className="u-note">
            Tu hora punta es a las <strong>{HOURS[peak]}:00</strong>
            {afterHours > 0 ? (
              <> · <strong>{afterHours}</strong> consultas ({Math.round((afterHours / Math.max(1, inbound.length)) * 100)}%) llegaron con la clínica cerrada.</>
            ) : null}
          </p>
        </div>

        {/* Reparto de la semana */}
        <div className="u-card">
          <div className="u-card-head">
            <h3>Últimas cuatro semanas</h3>
            <span className="u-card-meta">{inbound.length} consultas</span>
          </div>
          <ul className="u-weeks">
            {["Esta semana", "Hace 1 semana", "Hace 2", "Hace 3"].map((label, i) => {
              const v = weekBuckets[3 - i];
              const max = Math.max(1, ...weekBuckets);
              return (
                <li key={label}>
                  <span className="u-w-label">{label}</span>
                  <span className="u-w-track"><i style={{ width: `${Math.max(2, (v / max) * 100)}%` }} /></span>
                  <span className="u-w-n">{v}</span>
                </li>
              );
            })}
          </ul>
          <div className="u-split">
            <div>
              <p className="u-split-n">{Math.round((afterHours / Math.max(1, inbound.length)) * 100)}%</p>
              <p className="u-split-l">fuera de horario</p>
            </div>
            <div>
              <p className="u-split-n">{messages > 0 ? Math.round((inbound.length / Math.max(1, messages)) * 100) : 0}%</p>
              <p className="u-split-l">de los mensajes son del paciente</p>
            </div>
          </div>
        </div>
      </div>

      <p className="u-fine">
        El ahorro se estima con 3,5 minutos por consulta atendida y 6 minutos por cita reservada a mano.
        Las llamadas no se cuentan aquí porque el asistente no atiende el teléfono, solo la web.
      </p>
    </section>
  );
}

function convIs(_demo: boolean, conversations: number) {
  return conversations > 0 ? `${conversations} conversaciones` : "una sola conversación por paciente";
}
