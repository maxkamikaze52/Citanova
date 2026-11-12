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
  { n: 68, prefix: "", suffix: "%", label: "de las consultas llegan fuera de horario", sub: "Noches, fines de semana y la hora de comer." },
  { n: 1, prefix: "<", suffix: "s", label: "en contestar", sub: "Sin colas ni música de espera." },
  { n: 3, prefix: "×", suffix: "", label: "citas cerradas fuera de horario", sub: "Frente a no tener nada en la web." },
  { n: 1, prefix: "", suffix: "", label: "tarde para estar en marcha", sub: "Alta, una línea y tres respuestas." },
  { n: 0, prefix: "", suffix: "", label: "pacientes perdidos sin avisar", sub: "Todo lo que entra queda escrito." },
  { n: 49, prefix: "", suffix: " €", label: "al mes, sin coste de alta", sub: "IVA incluido. Sin permanencia." },
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

type CompareRow = { what: string; vm: string; vmOk?: boolean; as: string; asOk?: boolean; us: string };

const compare: CompareRow[] = [
  { what: "Contesta a las 22:00", vm: "No", vmOk: false, as: "Solo por horas", asOk: false, us: "Siempre" },
  { what: "Reserva la cita", vm: "No", vmOk: false, as: "A veces", asOk: false, us: "Con referencia" },
  { what: "Se sabe tus precios", vm: "No", vmOk: false, as: "Tras un briefing", asOk: false, us: "De serie" },
  { what: "Contesta igual siempre", vm: "No", vmOk: false, as: "Según quién esté", asOk: false, us: "Sí" },
  { what: "Coste mensual", vm: "0 € y pacientes perdidos", as: "Por llamada y por hora", us: "Desde 49 €" },
  { what: "Puesta en marcha", vm: "Ninguna", as: "Semanas de guion", us: "Una tarde" },
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

const CALENDAR: CalendarDay[] = [
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
];

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
                    {st.suffix && <span className="ap-stat-affix">{st.suffix}</span>}
                  </p>
                  <p className="ap-stat-l">{st.label}</p>
                  <p className="ap-stat-sub">{st.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lo que preguntan de verdad: una lista apretada de tres columnas. */}
        <section className="ap-ask" aria-labelledby="ask">
          <div className="container">
            <div className="ap-ask-head" data-reveal>
              <h2 id="ask">Las doce preguntas que llegan cada semana.</h2>
              <p>
                Todas se contestan solas, con tus palabras y tus precios. Ninguna se queda sin
                respuesta a las once de la noche.
              </p>
            </div>
            <div className="ap-ask-grid">
              {[
                "¿Tenéis hueco esta semana?",
                "¿Cuánto cuesta una revisión?",
                "¿Entráis con Adeslas?",
                "¿Dónde puedo aparcar?",
                "¿Duele la limpieza?",
                "¿Atendéis urgencias?",
                "¿Puedo cambiar mi cita?",
                "¿Cuánto dura una endodoncia?",
                "¿Hacéis ortodoncia invisible?",
                "¿Qué formas de pago aceptáis?",
                "¿A qué hora cerráis en agosto?",
                "¿Puedo venir con mi hijo?",
              ].map((q, i) => (
                <p key={q} data-reveal style={{ ["--d" as string]: `${(i % 3) * 50}ms` }}>
                  <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  {q}
                </p>
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

                {CALENDAR.map((d) => (
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

        {/* Night story — split, no centred stack: texto a la izquierda,
            transcripción a la derecha. Rompe el ritmo de "todo centrado". */}
        <section className="ap-section ap-split" aria-labelledby="two">
          <div className="container ap-split-in">
            <div className="ap-split-copy">
              <p className="ap-label ap-label-left" data-reveal>21:47</p>
              <h2 id="two" data-reveal>
                Son las once de la noche. Y sigues abierto.
              </h2>
              <p className="ap-split-body" data-reveal>
                La mitad de las consultas llegan con la clínica cerrada. Antes se quedaban sin
                respuesta; ahora son una cita a las 08:20.
              </p>
              <ul className="ap-split-points">
                <li data-reveal>Contesta en un segundo, también de madrugada.</li>
                <li data-reveal>Detecta la urgencia y te la pone la primera.</li>
                <li data-reveal>Te la encuentras en la agenda al abrir.</li>
              </ul>
            </div>

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

        {/* Comparado — tablero de tres columnas con marcas, no una tabla sosa. */}
        <section className="ap-section" aria-labelledby="four">
          <div className="container">
            <p className="ap-label" data-reveal>Comparado</p>
            <h2 id="four" className="ap-claim" data-reveal>
              Con lo que tienes ahora.
            </h2>

            <div className="ap-versus" data-reveal>
              <div className="ap-vs-head">
                <span className="ap-vs-blank" />
                <div className="ap-vs-col-head">
                  <strong>Buzón de voz</strong>
                  <span>Lo que hay hoy</span>
                </div>
                <div className="ap-vs-col-head">
                  <strong>Servicio telefónico</strong>
                  <span>Una persona al teléfono</span>
                </div>
                <div className="ap-vs-col-head is-us">
                  <strong>Citadent</strong>
                  <span>La recepcionista de tu web</span>
                </div>
              </div>

              {compare.map((r) => (
                <div key={r.what} className="ap-vs-row">
                  <span className="ap-vs-what">{r.what}</span>
                  <span className="ap-vs-cell">
                    {r.vmOk === false ? <i className="ap-mark-no" aria-label="No" /> : null}
                    <em className={r.vmOk === false ? "is-no" : ""}>{r.vm}</em>
                  </span>
                  <span className="ap-vs-cell">
                    {r.asOk === false ? <i className="ap-mark-no" aria-label="No" /> : null}
                    <em className={r.asOk === false ? "is-no" : ""}>{r.as}</em>
                  </span>
                  <span className="ap-vs-cell is-us">
                    <i className="ap-mark-yes" aria-label="Sí" />
                    <em className="is-yes">{r.us}</em>
                  </span>
                </div>
              ))}

              <div className="ap-vs-foot">
                <span />
                <span />
                <span />
                <span className="ap-vs-cta">
                  <Link href="/signup" className="ap-plan-cta">Configurar tu asistente</Link>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Privacidad — un diagrama del límite, no una lista. */}
        <section className="ap-section ap-black" aria-labelledby="five">
          <div className="container">
            <div className="ap-priv">
              <div className="ap-priv-copy">
                <p className="ap-label ap-label-left" data-reveal>Privacidad</p>
                <h2 id="five" data-reveal>Privacidad de serie.</h2>
                <p data-reveal>
                  Lo que se dice en una consulta se queda en la consulta. El asistente usa la
                  conversación para responder y reservar, y para nada más.
                </p>
                <p className="ap-priv-note" data-reveal>
                  Cuando el paciente habla con tu asistente, el responsable de esos datos eres tú.
                  Nosotros solo los tratamos por tu cuenta y con un contrato firmado.
                </p>
              </div>

              {/* el límite, dibujado */}
              <div className="ap-boundary" data-reveal aria-hidden="true">
                <div className="ap-boundary-top">
                  <span className="ap-boundary-label">Tu clínica</span>
                  <span className="ap-boundary-lock">
                    <span className="ap-lock-shackle" />
                    <span className="ap-lock-body" />
                  </span>
                </div>

                <div className="ap-flow">
                  <div className="ap-node">
                    <strong>Paciente</strong>
                    <span>Escribe en tu web</span>
                  </div>
                  <span className="ap-flow-line"><i /></span>
                  <div className="ap-node is-mid">
                    <strong>Asistente</strong>
                    <span>Responde y reserva</span>
                  </div>
                  <span className="ap-flow-line"><i /></span>
                  <div className="ap-node">
                    <strong>Tu agenda</strong>
                    <span>Solo lectura</span>
                  </div>
                </div>

                <div className="ap-boundary-rows">
                  <div className="ap-boundary-row is-in">
                    <span className="ap-b-dot" />
                    <strong>Nombre, teléfono y cita</strong>
                    <em>pas necesario</em>
                  </div>
                  <div className="ap-boundary-row is-out">
                    <span className="ap-b-dot" />
                    <strong>Entrenar modelos públicos</strong>
                    <em>nunca</em>
                  </div>
                  <div className="ap-boundary-row is-out">
                    <span className="ap-b-dot" />
                    <strong>Vender o compartir conversaciones</strong>
                    <em>nunca</em>
                  </div>
                  <div className="ap-boundary-row is-out">
                    <span className="ap-b-dot" />
                    <strong>Ver datos de otra clínica</strong>
                    <em>imposible</em>
                  </div>
                </div>
              </div>
            </div>

            <div className="ap-priv-big">
              <p data-reveal>No entrenamos con ellos.</p>
              <p data-reveal>No los vendemos.</p>
              <p data-reveal>No los compartimos.</p>
            </div>
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
              <p data-reveal data-n="01">No diagnostica.</p>
              <p data-reveal data-n="02">No da presupuestos cerrados.</p>
              <p data-reveal data-n="03">No pide tarjetas.</p>
              <p data-reveal data-n="04">No escribe primero al paciente.</p>
              <p data-reveal data-n="05">No actúa fuera de tu web.</p>
              <p data-reveal data-n="06">No adivina: toma nota.</p>
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

            <div className="ap-faq ap-faq-two">
              {faqs.map((f, i) => (
                <details key={f.q} className="ap-faq-item" data-reveal style={{ ["--d" as string]: `${i * 50}ms` }}>
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
