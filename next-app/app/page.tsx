import Link from "next/link";
import type { Metadata } from "next";
import LandingHeader from "./components/LandingHeader";
import ScrollReveal from "./components/ScrollReveal";
import CountUp from "./components/CountUp";

export const metadata: Metadata = {
  title: { absolute: "Citadent — la recepcionista que nunca cierra" },
  description:
    "Citadent responde a tus pacientes en tu propia web, reserva la cita y te deja la agenda lista. Para clínicas dentales pequeñas.",
  alternates: { canonical: "/" },
};

const HERO = ["La", "recepcionista", "que", "nunca", "cierra."];

const stats = [
  { n: 68, prefix: "", label: "de las consultas llegan fuera de horario", sub: "Noches, fines de semana y la hora de comer." },
  { n: 1, prefix: "<", label: "segundo en contestar", sub: "Sin colas, sin música, sin «su llamada es importante»." },
  { n: 3, prefix: "×", label: "citas cerradas fuera del horario de la clínica", sub: "Comparado con no tener nada en la web." },
  { n: 1, prefix: "", label: "tarde para estar en marcha", sub: "Alta, una línea de código y tres respuestas revisadas." },
];

type CalendarEvent = { t: string; h: number; cls: string; title: string; who: string; badge?: string };
type CalendarDay = { day: string; num: string; today?: boolean; events: CalendarEvent[] };

const dense = [
  {
    h: "Contesta",
    items: [
      "Horarios, dirección y aparcamiento",
      "Precios y qué entra en cada tratamiento",
      "Mutuas y formas de pago",
      "«¿Duele?», «¿cuánto dura?»",
      "Qué hacer en una urgencia",
      "Todo lo demás: toma nota y te avisa",
    ],
  },
  {
    h: "Reserva",
    items: [
      "Lee tu agenda en solo lectura",
      "Ofrece dos horas reales, nunca inventadas",
      "Escribe la cita con referencia",
      "Detecta urgencias y las coloca primero",
      "Cancela y reprograma sin llamadas",
      "Aviso de cita por correo al paciente",
    ],
  },
  {
    h: "Controla",
    items: [
      "Transcripción de cada conversación",
      "Panel con estado de cada cita",
      "Precios y normas editables por ti",
      "Cambia el tono en una línea",
      "Exporta todo a CSV cuando quieras",
      "Encargo de tratamiento firmado",
    ],
  },
];

const compare = [
  { what: "Contesta a las 22:00", vm: "No", as: "Por horas", us: "Sí" },
  { what: "Reserva la cita", vm: "No", as: "A veces", us: "Sí" },
  { what: "Se sabe tus precios", vm: "No", as: "Con briefing", us: "De serie" },
  { what: "Coste mensual", vm: "0 € y pacientes perdidos", as: "Por llamada", us: "Desde 49 €" },
  { what: "Puesta en marcha", vm: "Ninguna", as: "Semanas", us: "Una tarde" },
];

const plans = [
  {
    name: "Starter",
    price: "49 €",
    note: "Una clínica, una web y todo lo necesario.",
    featured: false,
  },
  {
    name: "Pro",
    price: "149 €",
    note: "Con transcripciones, informes y soporte prioritario.",
    featured: true,
  },
];

const faqs = [
  {
    q: "¿Qué pasa si se equivoca?",
    a: "Solo responde con los precios, los horarios y las normas que tú le das. Para todo lo demás toma nota y te pasa el aviso. Cada respuesta queda escrita junto a la cita.",
  },
  {
    q: "¿Necesito algo nuevo en la clínica?",
    a: "No. Vive en la web que ya tienes y escribe en el calendario que ya usas. No hay que instalar nada.",
  },
  {
    q: "¿Cuánto se tarda en montarlo?",
    a: "Una tarde. Das de alta la clínica, pegas una línea y revisas tres respuestas. Puedes dejarlo en pruebas hasta que te guste cómo suena.",
  },
  {
    q: "¿Y con los datos de los pacientes?",
    a: "Se guardan por clínica y no se comparten nunca entre ellas. Datos en la UE, exportables y borrables por ti, con contrato de encargo firmado.",
  },
];

function Tick() {
  return (
    <span className="ap-privacy-icon" aria-hidden="true">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3 5 6v5.5c0 4.3 2.9 7.7 7 9.5 4.1-1.8 7-5.2 7-9.5V6l-7-3Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    </span>
  );
}

export default function Home() {
  return (
    <>
      <LandingHeader />
      <ScrollReveal />

      <main id="main" className="ap">
        {/* Hero */}
        <section className="ap-hero">
          <div className="container">
            <p className="ap-eyebrow">Nuevo · Modo nocturno incluido</p>

            <h1>
              {HERO.map((word, i) => (
                <span key={i} className="ap-word" style={{ ["--wd" as string]: `${180 + i * 90}ms` }}>
                  {word}
                </span>
              ))}
            </h1>

            <p className="ap-sub">
              Responde a tus pacientes, reserva la cita y te deja la agenda lista. En tu web, a
              cualquier hora.
            </p>

            <div className="ap-hero-actions">
              <Link href="/signup" className="ap-buy">Configurar tu asistente</Link>
              <Link href="/pricing" className="ap-textlink">Ver precios ›</Link>
            </div>
            <p className="ap-fine">Desde 49 € al mes. Sin coste de alta.</p>

            <div className="ap-product">
              {/* WhatsApp de verdad: cabecera verde oscura, fondo con textura,
                  burbujas con colita y doble check azul. En España se habla por aquí. */}
              <div className="ap-chat">
                <div className="ap-chat-head">
                  <span className="ap-back" aria-hidden="true">‹</span>
                  {/* Visto desde la clínica: el contacto es la paciente. */}
                  <span className="ap-avatar" aria-hidden="true">MF</span>
                  <div className="ap-chat-who">
                    <strong>Marta Ferrer</strong>
                    <span className="ap-online">en línea</span>
                  </div>
                  <span className="ap-chat-actions" aria-hidden="true">
                    <span className="ap-ico ap-ico-video" />
                    <span className="ap-ico ap-ico-call" />
                  </span>
                </div>

                <div className="ap-chat-body">
                  <p className="ap-day" aria-hidden="true">HOY</p>

                  <div className="ap-row in">
                    <p className="ap-msg in">Hola, ¿tenéis algo para una revisión esta semana?<span className="ap-time">21:46</span></p>
                  </div>

                  <div className="ap-row out">
                    <p className="ap-msg out">
                      ¡Hola! Sí, tenemos el jueves a las 10:40 con el doctor Ellis o el viernes a
                      las 15:20. ¿Qué te viene mejor?<span className="ap-time">21:46 <span className="ap-ticks">✓✓</span></span>
                    </p>
                  </div>

                  <div className="ap-row in">
                    <p className="ap-msg in">El jueves<span className="ap-time">21:47</span></p>
                  </div>

                  <div className="ap-row out">
                    <p className="ap-msg out">
                      Hecho. Revisión el jueves 19 a las 10:40 con el doctor Ellis. Te mando el
                      recordatorio el miércoles.<span className="ap-time">21:47 <span className="ap-ticks">✓✓</span></span>
                    </p>
                  </div>

                  <div className="ap-row out">
                    <div className="ap-card">
                      <span className="ap-card-tag">Cita reservada</span>
                      <strong>Revisión · 45 min</strong>
                      <span>Jue 19 nov · 10:40 · Dr. Ellis</span>
                    </div>
                  </div>
                </div>

                <div className="ap-chat-foot" aria-hidden="true">
                  <span className="ap-input">Escribe un mensaje…</span>
                  <span className="ap-attach" />
                  <span className="ap-send">➤</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cifras. Sustituye estos números por los reales en cuanto tengas
            los primeros diez clientes: ahora son ilustrativos. */}
        <section className="ap-stats" aria-label="En cifras">
          <div className="container">
            <p className="ap-stats-lead" data-reveal>
              Lo que cambia en la primera semana.
            </p>
            <div className="ap-stats-grid">
              {stats.map((st, i) => (
                <div key={st.label} className="ap-stat" data-reveal style={{ ["--d" as string]: `${i * 90}ms` }}>
                  <p className="ap-stat-n">
                    {st.prefix && <span className="ap-stat-affix">{st.prefix}</span>}
                    <CountUp value={st.n} />
                  </p>
                  <p className="ap-stat-l">{st.label}</p>
                  <p className="ap-stat-sub">{st.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Statement + board */}
        <section className="ap-section ap-black ap-hair" aria-labelledby="one">
          <div className="container">
            <p className="ap-label" data-reveal>Tu agenda</p>
            <h2 id="one" className="ap-claim" data-reveal>
              Contesta. Reserva. Recuerda.
            </h2>
            <p className="ap-body" data-reveal>
              Un asistente, tres trabajos. Ninguno de ellos te quita la mañana.
            </p>

            {/* Vista de semana, como Google Calendar: horas a la izquierda,
                columnas de día y eventos con barra de color. */}
            <div className="gcal" data-reveal aria-hidden="true">
              <div className="gcal-bar">
                <span className="gcal-menu" />
                <span className="gcal-logo"><i className="gcal-logo-blue" /><i className="gcal-logo-green" /><i className="gcal-logo-yellow" /><i className="gcal-logo-red" /></span>
                <span className="gcal-title">Calendario</span>
                <span className="gcal-today">Hoy</span>
                <span className="gcal-range">16 – 20 de noviembre</span>
                <span className="gcal-spacer" />
                <span className="gcal-view">Semana</span>
                <span className="gcal-avatar">M</span>
              </div>

              <div className="gcal-grid">
                <div className="gcal-gutter">
                  <span className="gcal-hour" />
                  <span className="gcal-hour">09:00</span>
                  <span className="gcal-hour">10:00</span>
                  <span className="gcal-hour">11:00</span>
                  <span className="gcal-hour">12:00</span>
                  <span className="gcal-hour">13:00</span>
                  <span className="gcal-hour">14:00</span>
                  <span className="gcal-hour">15:00</span>
                  <span className="gcal-hour">16:00</span>
                </div>

                {([
                  { day: "LUN", num: "16", events: [
                    { t: "09:20", h: 1, cls: "blue", title: "Revisión", who: "A. Puig" },
                    { t: "11:00", h: 2, cls: "green", title: "Higiene", who: "M. Costa" },
                    { t: "15:20", h: 1, cls: "blue", title: "Revisión", who: "L. Vidal" },
                  ]},
                  { day: "MAR", num: "17", events: [
                    { t: "09:40", h: 1, cls: "violet", title: "Ortodoncia", who: "J. Serra" },
                    { t: "12:20", h: 1, cls: "blue", title: "Revisión", who: "N. Roca" },
                    { t: "14:40", h: 1, cls: "green", title: "Higiene", who: "P. Mas" },
                  ]},
                  { day: "MIÉ", num: "18", today: true, events: [
                    { t: "09:00", h: 1, cls: "blue", title: "Revisión", who: "C. Font" },
                    { t: "10:40", h: 2, cls: "orange", title: "Urgencia", who: "Sra. Ferrer", badge: "nueva" },
                    { t: "13:00", h: 1, cls: "green", title: "Higiene", who: "R. Pou" },
                    { t: "15:00", h: 2, cls: "violet", title: "Ortodoncia", who: "T. Bosch" },
                  ]},
                  { day: "JUE", num: "19", events: [
                    { t: "10:40", h: 1, cls: "blue", title: "Revisión", who: "Dr. Ellis" },
                    { t: "12:00", h: 2, cls: "green", title: "Higiene", who: "E. Camps" },
                    { t: "16:00", h: 1, cls: "blue", title: "Revisión", who: "G. Solé" },
                  ]},
                  { day: "VIE", num: "20", events: [
                    { t: "09:20", h: 2, cls: "blue", title: "Revisión", who: "A. Marquès" },
                    { t: "12:40", h: 1, cls: "orange", title: "Urgencia", who: "D. Vila" },
                    { t: "15:20", h: 1, cls: "green", title: "Higiene", who: "S. Prat" },
                  ]},
                ] as CalendarDay[]).map((d) => (
                  <div key={d.day} className={`gcal-col${d.today ? " is-today" : ""}`}>
                    <div className="gcal-head">
                      <span>{d.day}</span>
                      <strong>{d.num}</strong>
                    </div>
                    <div className="gcal-slots">
                      {d.events.map((ev) => (
                        <span
                          key={ev.t + ev.who}
                          className={`gcal-ev ${ev.cls}`}
                          style={{ top: `calc(${(parseInt(ev.t.slice(0, 2)) - 9) * 60 + parseInt(ev.t.slice(3))}px)` , height: `${ev.h * 60 - 6}px` }}
                        >
                          <b>{ev.t} {ev.title}</b>
                          <em>{ev.who}</em>
                          {ev.badge && <span className="gcal-badge">{ev.badge}</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="gcal-foot">
                <span><i className="dot blue" /> 3 reservadas por el asistente</span>
                <span><i className="dot orange" /> 2 urgencias de esta noche</span>
              </div>
            </div>
          </div>
        </section>

        {/* Night story */}
        <section className="ap-section" aria-labelledby="two">
          <div className="container">
            <p className="ap-label" data-reveal>21:47</p>
            <h2 id="two" className="ap-claim" data-reveal>
              Son las once de la noche. Y sigues abierto.
            </h2>
            <p className="ap-body" data-reveal>
              La mitad de las consultas llegan con la clínica cerrada. Antes se quedaban sin
              respuesta; ahora son una cita a las 08:20.
            </p>

            <div className="ap-transcript" data-reveal aria-hidden="true">
              <div className="ap-tr-head">
                <span>Sra. Ferrer</span>
                <span className="ap-tr-ref">SM-4821</span>
              </div>
              <p className="ap-tstamp">Ayer · 21:47</p>
              <p className="ap-tmsg">Se me ha caído la corona, ¿es urgente?</p>
              <p className="ap-tstamp">Ayer · 21:47</p>
              <p className="ap-tmsg bot">
                Guárdala y no muerdas de ese lado. Tenemos un hueco de urgencia a las 08:20, ¿te lo
                reservo?
              </p>
              <p className="ap-tstamp">Ayer · 21:48</p>
              <p className="ap-tmsg">Sí, por favor</p>
              <div className="ap-tok">
                <span>Reservada</span> Urgencia · 08:20 · Dr. Ellis
              </div>
            </div>
          </div>
        </section>

        {/* Calendar */}
        <section className="ap-section ap-black" aria-labelledby="three">
          <div className="container">
            <p className="ap-label" data-reveal>Tu calendario</p>
            <h2 id="three" className="ap-claim" data-reveal>
              Tu agenda, intacta.
            </h2>
            <p className="ap-body" data-reveal>
              Se conecta en solo lectura al calendario que ya usas. Nunca mueve una cita tuya, y deja
              de ofrecer un hueco en el momento en que lo ocupas.
            </p>

            <div className="ap-cal" data-reveal aria-hidden="true">
              {["Lun", "Mar", "Mié", "Jue", "Vie"].map((d, i) => (
                <div key={d} className="ap-cal-col">
                  <p className="ap-cal-day">{d}</p>
                  <div className="ap-cal-slot" />
                  <div className={`ap-cal-slot${i === 1 ? " is-booked" : ""}`}>{i === 1 ? "10:40" : ""}</div>
                  <div className="ap-cal-slot" />
                  <div className={`ap-cal-slot${i === 3 ? " is-free" : ""}`}>{i === 3 ? "libre" : ""}</div>
                  <div className="ap-cal-slot" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bloque denso: todo lo que hace, en tres columnas apretadas. */}
        <section className="ap-dense ap-black" aria-labelledby="nine">
          <div className="container">
            <div className="ap-dense-head" data-reveal>
              <h2 id="nine">Todo lo que hace, de un tirón.</h2>
              <p>
                Sin listas de espera ni módulos que nadie usa: esto es el producto entero,
                completo.
              </p>
            </div>

            <div className="ap-dense-grid">
              {dense.map((group, i) => (
                <div key={group.h} className="ap-dense-col" data-reveal style={{ ["--d" as string]: `${i * 80}ms` }}>
                  <h3>{group.h}</h3>
                  <ul>
                    {group.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="ap-dense-strip" data-reveal>
              <span className="ap-dense-strip-l">Se conecta con</span>
              <ul>
                <li>Google Calendar</li>
                <li>Apple Calendar</li>
                <li>Outlook (ICS)</li>
                <li>Stripe</li>
                <li>WhatsApp Business</li>
                <li>Tu web actual</li>
                <li>Supabase</li>
                <li>Exportación CSV</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Compare */}
        <section className="ap-section" aria-labelledby="four">
          <div className="container">
            <p className="ap-label" data-reveal>Comparado</p>
            <h2 id="four" className="ap-claim" data-reveal>
              Con lo que tienes ahora.
            </h2>

            <div className="ap-tablewrap" data-reveal>
              <table className="ap-table">
                <caption className="sr-only">
                  Citadent frente al buzón de voz y a un servicio de atención telefónica
                </caption>
                <thead>
                  <tr>
                    <th scope="col"> </th>
                    <th scope="col">Buzón de voz</th>
                    <th scope="col">Servicio telefónico</th>
                    <th scope="col" className="is-us">Citadent</th>
                  </tr>
                </thead>
                <tbody>
                  {compare.map((r) => (
                    <tr key={r.what}>
                      <th scope="row">{r.what}</th>
                      <td>{r.vm}</td>
                      <td>{r.as}</td>
                      <td className="is-us">{r.us}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section className="ap-section ap-black" aria-labelledby="five">
          <div className="container">
            <div data-reveal><Tick /></div>
            <p className="ap-label" data-reveal>Privacidad</p>
            <h2 id="five" className="ap-claim" data-reveal>
              Privacidad de serie.
            </h2>
            <p className="ap-body" data-reveal>
              Las conversaciones de tus pacientes no son un activo de marketing. No entrenamos
              modelos públicos con ellas y no las vendemos a nadie.
            </p>

            <ul className="ap-privacy-list">
              <li data-reveal>Datos alojados en la UE</li>
              <li data-reveal>Cifrado en tránsito y en reposo</li>
              <li data-reveal>Calendario en solo lectura</li>
              <li data-reveal>Exporta o borra todo cuando quieras</li>
              <li data-reveal>Contrato de encargo con cada clínica</li>
              <li data-reveal>Una clínica, un espacio cerrado</li>
            </ul>
          </div>
        </section>

        {/* Limits */}
        <section className="ap-section-tight" aria-labelledby="six">
          <div className="container">
            <p className="ap-label" data-reveal>Los límites</p>
            <h2 id="six" className="ap-claim ap-claim-wide" data-reveal>
              Lo que no hace, dicho claro.
            </h2>

            <div className="ap-limits">
              <p data-reveal>No diagnostica.</p>
              <p data-reveal>No da presupuestos cerrados.</p>
              <p data-reveal>No pide tarjetas.</p>
              <p data-reveal>No escribe primero al paciente.</p>
              <p data-reveal>No actúa fuera de tu web.</p>
              <p data-reveal>No adivina: toma nota.</p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="ap-section ap-black" aria-labelledby="seven">
          <div className="container">
            <p className="ap-label" data-reveal>Precios</p>
            <h2 id="seven" className="ap-claim" data-reveal>
              Dos planes. Los dos mensuales.
            </h2>

            <div className="ap-plans">
              {plans.map((p, i) => (
                <article
                  key={p.name}
                  className={`ap-plan${p.featured ? " is-featured" : ""}`}
                  data-reveal
                  style={{ ["--d" as string]: `${i * 120}ms` }}
                >
                  {p.featured && <span className="ap-plan-tag">El más elegido</span>}
                  <h3>{p.name}</h3>
                  <p className="ap-plan-price">{p.price}<span> / mes</span></p>
                  <p className="ap-plan-note">{p.note}</p>
                  <Link href="/pricing" className={`ap-plan-cta${p.featured ? "" : " ghost"}`}>
                    Ver qué incluye
                  </Link>
                </article>
              ))}
            </div>
            <p className="ap-plans-fine" data-reveal>
              Precios en euros, IVA incluido. Sin permanencia.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="ap-section" aria-labelledby="eight">
          <div className="container">
            <p className="ap-label" data-reveal>Preguntas</p>
            <h2 id="eight" className="ap-claim" data-reveal>
              Las que harías igual.
            </h2>

            <div className="ap-faq">
              {faqs.map((f, i) => (
                <details key={f.q} className="ap-faq-item" data-reveal style={{ ["--d" as string]: `${i * 70}ms` }}>
                  <summary>
                    <span>{f.q}</span>
                    <span className="ap-plus" aria-hidden="true" />
                  </summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Close */}
        <section className="ap-close" aria-labelledby="close">
          <div className="container">
            <h2 id="close" data-reveal>Ponla a trabajar esta tarde.</h2>
            <p data-reveal>
              Das de alta la clínica, pegas una línea y miras llegar la primera cita.
            </p>
            <div className="ap-close-actions" data-reveal>
              <Link href="/signup" className="ap-buy">Configurar tu asistente</Link>
              <Link href="/contact" className="ap-textlink">Habla con nosotros ›</Link>
            </div>
            <p className="ap-close-fine">Sin permanencia. Sin coste de alta.</p>
          </div>
        </section>
      </main>
    </>
  );
}
