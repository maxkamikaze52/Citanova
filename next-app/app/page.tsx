import Link from "next/link";
import type { Metadata } from "next";
import LandingHeader from "./components/LandingHeader";
import ScrollReveal from "./components/ScrollReveal";
import CountUp from "./components/CountUp";

export const metadata: Metadata = {
  title: { absolute: "YourAI – la recepcionista que no pierde ni una consulta" },
  description:
    "YourAI responde a tus pacientes en tu propia web, reserva la cita de verdad y la deja en tu agenda. Pensado para clínicas dentales de un solo titular o de tamaño pequeño.",
  alternates: { canonical: "/" },
};

const HEADLINE = ["Cada consulta,", "respondida. Cada", "hueco, cubierto."];

const stats = [
  { n: 24, sub: "/7", label: "Respondiendo, también las noches en que cierras" },
  { n: 1, sub: "", label: "Línea de código añadida a tu web" },
  { n: 0, sub: "", label: "Centralitas, teléfonos ni hardware nuevo" },
];

const features = [
  {
    icon: "bolt",
    title: "Responde en un segundo",
    body: "Sin colas y sin música de espera. El paciente recibe una respuesta de verdad mientras sigue en tu web.",
  },
  {
    icon: "calendar",
    title: "Reserva la cita, no un aviso",
    body: "Consulta qué hueco está libre de verdad, ofrece dos horas reales y anota la cita con una referencia.",
  },
  {
    icon: "pound",
    title: "Se sabe tus precios",
    body: "Revisión, higiene, blanqueamiento, urgencia: dice lo que cobras tú, no lo que adivina internet.",
  },
  {
    icon: "user",
    title: "Se acuerda del paciente",
    body: "A quien ya ha venido se le recibe con su última visita, así la conversación empieza a medio camino.",
  },
  {
    icon: "bell",
    title: "Te lo pasa con criterio",
    body: "Todo lo clínico, urgente o raro se convierte en un aviso que lees por la mañana. Nunca en una respuesta inventada.",
  },
  {
    icon: "shield",
    title: "Cerrado por defecto",
    body: "Solo responde en la dirección que tú autorizas. Las credenciales van cifradas y la agenda se lee, no se toca.",
  },
];

const compare = [
  { what: "Responde a las 22:00", vm: "no", as: "por horas", us: "sí" },
  { what: "Reserva una cita real", vm: "no", as: "a veces", us: "sí" },
  { what: "Se sabe tu lista de precios", vm: "no", as: "tras un briefing", us: "de serie" },
  { what: "Contesta igual siempre", vm: "no", as: "según quién esté", us: "sí" },
  { what: "Coste mensual", vm: "0 € + pacientes perdidos", as: "por llamada y por hora", us: "desde 49 €" },
  { what: "Puesta en marcha", vm: "ninguna", as: "semanas de guion", us: "una tarde" },
];

const plans = [
  {
    name: "Starter",
    price: "49 €",
    note: "Una clínica, una web y todo lo esencial.",
    href: "/pricing",
    cta: "Ver qué incluye",
  },
  {
    name: "Pro",
    price: "149 €",
    note: "Para quien quiere las transcripciones, los informes y soporte prioritario.",
    href: "/pricing",
    cta: "Ver qué incluye",
    featured: true,
  },
];

const faqs = [
  {
    q: "¿Y si se equivoca?",
    a: "Solo responde con la lista de precios, los horarios y las normas que tú le das. Para cualquier otra cosa toma nota y le dice al paciente que tú le llamarás. No se inventa nada, y cada respuesta queda en la transcripción junto a la cita.",
  },
  {
    q: "¿Necesito teléfonos o programas nuevos?",
    a: "No. Vive en la web que ya tienes, con una línea de código, y escribe en el calendario que ya usas mediante una fuente de solo lectura.",
  },
  {
    q: "¿Cuánto se tarda en montarlo?",
    a: "Una tarde: das de alta la clínica, pegas el fragmento de código y revisas tres respuestas. Puedes dejarlo en modo de prueba hasta que te convenza el tono.",
  },
  {
    q: "¿Es seguro con los datos de los pacientes?",
    a: "Las conversaciones se guardan por clínica y nunca se comparten entre ellas. Los datos están en la UE, puedes exportarlos y borrarlos tú mismo, y firmamos un encargo de tratamiento con cada clínica.",
  },
  {
    q: "¿Y si ya tengo un servicio de atención telefónica?",
    a: "Mantenlo. YourAI cubre la web, que es por donde llegan hoy casi todas las consultas fuera de horario. Algunas clínicas lo cancelan al mes, otras se quedan con los dos: lo decides tú con tus propios números.",
  },
];

function Icon({ name }: { name: string }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "bolt":
      return <svg {...common}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" /></svg>;
    case "calendar":
      return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>;
    case "pound":
      return <svg {...common}><path d="M17 6a5 5 0 0 0-9 3v9m-3 0h10M6 13h7" /></svg>;
    case "user":
      return <svg {...common}><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></svg>;
    case "bell":
      return <svg {...common}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" /><path d="M10 19a2 2 0 0 0 4 0" /></svg>;
    default:
      return <svg {...common}><path d="M12 3 5 6v5.5c0 4.2 2.9 7.6 7 9.5 4.1-1.9 7-5.3 7-9.5V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></svg>;
  }
}

export default function Home() {
  return (
    <>
      <LandingHeader />
      <ScrollReveal />

      <main id="main" className="lp">
        {/* Announcement strip */}
        <div className="lp-announce">
          <div className="container lp-announce-in">
            <span className="lp-announce-dot" aria-hidden="true" />
            <p>
              Responde en un segundo · Sin hardware nuevo · Desde 49 € al mes
              <Link href="/pricing"> Ver planes</Link>
            </p>
          </div>
        </div>

        {/* Hero */}
        <section className="lp-hero">
          <div className="lp-hero-bg" aria-hidden="true" />
          <div className="container lp-hero-grid">
            <div className="lp-hero-copy">
              <p className="lp-badge" data-reveal style={{ ["--d" as string]: "0ms" }}>
                <span className="lp-pulse" aria-hidden="true" />
                Para clínicas dentales
              </p>

              <h1 className="serif lp-h1">
                {HEADLINE.map((line, li) => (
                  <span key={li} className="lp-line">
                    {line.split(" ").map((word, wi) => (
                      <span
                        key={wi}
                        className="lp-word"
                        style={{ ["--wd" as string]: `${(li * 3 + wi) * 55}ms` }}
                      >
                        {word}
                      </span>
                    ))}
                  </span>
                ))}
              </h1>

              <p className="lp-lead" data-reveal style={{ ["--d" as string]: "420ms" }}>
                YourAI es la recepcionista de tu web. Contesta a tus pacientes a las 2 de la
                mañana, reserva la cita como hay que reservarla y te deja la agenda lista por la
                mañana.
              </p>

              <div className="lp-actions" data-reveal style={{ ["--d" as string]: "520ms" }}>
                <Link href="/signup" className="btn btn-primary lp-btn">Configurar tu asistente</Link>
                <Link href="/pricing" className="btn btn-secondary lp-btn">Ver precios</Link>
              </div>

              <p className="lp-fine" data-reveal style={{ ["--d" as string]: "600ms" }}>
                Una línea de código · listo en una tarde · sin permanencia
              </p>
            </div>

            <div className="lp-chat-wrap" data-reveal style={{ ["--d" as string]: "300ms" }}>
              <aside className="lp-chat" aria-label="Ejemplo de conversación con el asistente">
                <div className="lp-chat-head">
                  <span className="lp-chat-avatar" aria-hidden="true">CD</span>
                  <div className="lp-chat-who">
                    <strong>Clínica Dental Sol</strong>
                    <span className="lp-online"><i aria-hidden="true" />En línea</span>
                  </div>
                  <span className="lp-chat-x" aria-hidden="true">×</span>
                </div>

                <div className="lp-chat-body">
                  <p className="lp-msg in">Hola, ¿tenéis algo para una revisión esta semana?</p>
                  <p className="lp-msg out">
                    Tenemos el jueves a las 10:40 con el doctor Ellis, o el viernes a las 15:20.
                    ¿Qué te viene mejor?
                  </p>
                  <p className="lp-msg in">El jueves me va bien</p>

                  <div className="lp-booked">
                    <span className="lp-booked-tag">Reservada</span>
                    <strong>Revisión · 45 min</strong>
                    <span>Jue 19 nov · 10:40 · Dr. Ellis</span>
                  </div>
                </div>

                <div className="lp-chat-foot" aria-hidden="true">
                  <span>Escribe un mensaje…</span>
                  <span className="lp-send">↑</span>
                </div>
              </aside>

              <div className="lp-mini" aria-hidden="true">
                <p className="lp-mini-head">Hoy · 4 citas</p>
                <p className="lp-mini-row"><span>08:20</span> Urgencia · corona</p>
                <p className="lp-mini-row"><span>10:40</span> Revisión · paciente nuevo</p>
                <p className="lp-mini-row"><span>15:20</span> Higiene · 30 min</p>
              </div>
            </div>
          </div>
        </section>

        {/* Numbers (Skiper #37) */}
        <section className="lp-band" aria-label="De un vistazo">
          <div className="container lp-band-grid">
            {stats.map((s, i) => (
              <div key={s.label} className="lp-stat" data-reveal style={{ ["--d" as string]: `${i * 90}ms` }}>
                <p className="lp-stat-n">
                  <CountUp value={s.n} />
                  {s.sub && <span className="lp-stat-sub">{s.sub}</span>}
                </p>
                <p className="lp-stat-l">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Showcase */}
        <section className="lp-showcase" aria-labelledby="showcase-h">
          <div className="container">
            <div className="lp-showcase-head" data-reveal>
              <p className="lp-eyebrow">Un asistente, tres trabajos</p>
              <h2 id="showcase-h" className="serif">Contesta. Reserva. Se acuerda.</h2>
            </div>

            <div className="lp-showcase-grid">
              <div className="lp-showcase-visual" aria-hidden="true">
                <div className="lp-board">
                  <div className="lp-board-head">
                    <span>Hoy</span>
                    <span className="lp-board-live">En directo</span>
                  </div>
                  <div className="lp-board-row is-new">
                    <span className="lp-board-time">08:20</span>
                    <span className="lp-board-what">Urgencia · Sra. Ferrer</span>
                    <span className="lp-board-tag">nueva</span>
                  </div>
                  <div className="lp-board-row">
                    <span className="lp-board-time">10:40</span>
                    <span className="lp-board-what">Revisión · Dr. Ellis</span>
                  </div>
                  <div className="lp-board-row">
                    <span className="lp-board-time">12:15</span>
                    <span className="lp-board-what">Higiene · 30 min</span>
                  </div>
                  <div className="lp-board-row">
                    <span className="lp-board-time">15:20</span>
                    <span className="lp-board-what">Revisión · 45 min</span>
                  </div>
                  <div className="lp-board-row lp-board-dim">
                    <span className="lp-board-time">17:00</span>
                    <span className="lp-board-what">Cerrado</span>
                  </div>
                  <p className="lp-board-foot">3 de 4 citas reservadas por el asistente</p>
                </div>
              </div>

              <ol className="lp-showcase-steps">
                <li data-reveal>
                  <span className="lp-step-n serif">01</span>
                  <h3>Contesta la pregunta que respondes cuarenta veces al día</h3>
                  <p>
                    Horarios, aparcamiento, mutuas, «¿duele?», cuánto cuesta una corona. Respondido
                    con tus palabras, a cualquier hora, en un segundo.
                  </p>
                </li>
                <li data-reveal>
                  <span className="lp-step-n serif">02</span>
                  <h3>Reserva en el hueco que está libre de verdad</h3>
                  <p>
                    Lee tu agenda, ofrece dos horas reales y anota la cita con una referencia que el
                    paciente puede citarte después.
                  </p>
                </li>
                <li data-reveal>
                  <span className="lp-step-n serif">03</span>
                  <h3>Se acuerda, para que no tengas que acordarte tú</h3>
                  <p>
                    Cada conversación y cada cita se archiva junto al paciente, en orden. Vuelve un
                    mes atrás y verás exactamente qué se acordó.
                  </p>
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* Feature grid */}
        <section className="lp-section" aria-labelledby="what">
          <div className="container">
            <div className="lp-section-head" data-reveal>
              <p className="lp-eyebrow">Qué hace</p>
              <h2 id="what" className="serif">Hace la mitad aburrida de tu día.</h2>
            </div>

            <div className="lp-features">
              {features.map((f, i) => (
                <article key={f.title} className="lp-feature" data-reveal style={{ ["--d" as string]: `${(i % 3) * 80}ms` }}>
                  <span className="lp-feature-icon"><Icon name={f.icon} /></span>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Split: transcripts */}
        <section className="lp-section lp-section-soft" aria-labelledby="records">
          <div className="container lp-split">
            <div className="lp-split-copy">
              <p className="lp-eyebrow" data-reveal>Todo por escrito</p>
              <h2 id="records" className="serif" data-reveal>Cada respuesta, apuntada.</h2>
              <p data-reveal>
                Aquí no hay nada fuera de acta. Cada conversación se guarda junto a la cita que
                generó, así que un mes después sigues pudiendo ver qué se le dijo al paciente y
                cuándo.
              </p>
              <p data-reveal>
                Si un paciente discute un precio, abres la transcripción. Si quieres cambiar cómo se
                dice algo, editas una línea y cambia desde el mensaje siguiente.
              </p>
              <ul className="lp-checks">
                <li data-reveal>Transcripción de cada conversación</li>
                <li data-reveal>Historial de citas, cancelaciones y ausencias</li>
                <li data-reveal>Exportación a CSV cuando quieras</li>
              </ul>
            </div>

            <div className="lp-transcript" data-reveal aria-hidden="true">
              <div className="lp-transcript-head">
                <span>Sra. Ferrer</span>
                <span className="lp-transcript-ref">SM-4821</span>
              </div>
              <p className="lp-tstamp">Ayer · 21:47</p>
              <p className="lp-tmsg">Se me ha caído la corona esta noche, ¿es una urgencia?</p>
              <p className="lp-tstamp">Ayer · 21:47</p>
              <p className="lp-tmsg bot">
                Guarda la corona y evita masticar de ese lado. Tenemos un hueco de urgencia a las
                08:20, ¿te lo reservo?
              </p>
              <p className="lp-tstamp">Ayer · 21:48</p>
              <p className="lp-tmsg">Sí, por favor</p>
              <div className="lp-tok">
                <span>Reservada</span> Urgencia · 08:20 · Dr. Ellis
              </div>
            </div>
          </div>
        </section>

        {/* Split: calendar */}
        <section className="lp-section" aria-labelledby="diary">
          <div className="container lp-split lp-split-flip">
            <div className="lp-split-copy">
              <p className="lp-eyebrow" data-reveal>Tu agenda</p>
              <h2 id="diary" className="serif" data-reveal>Escribe en el calendario que ya usas.</h2>
              <p data-reveal>
                Una fuente de solo lectura hacia el calendario que usas hoy. El asistente nunca mueve
                tus citas, nunca pone dos pacientes en el mismo sillón y deja de ofrecer un hueco en
                el momento en que lo ocupas.
              </p>
              <ul className="lp-chips" aria-label="Compatible con">
                <li>Google Calendar</li>
                <li>Apple Calendar</li>
                <li>Outlook (ICS)</li>
                <li>Cobros con Stripe</li>
              </ul>
              <p className="lp-note" data-reveal>
                ¿No tienes calendario que conectar? El panel trae su propia agenda y puedes funcionar
                solo con ella.
              </p>
            </div>

            <div className="lp-cal" data-reveal aria-hidden="true">
              {["Lun", "Mar", "Mié", "Jue", "Vie"].map((d, i) => (
                <div key={d} className="lp-cal-col">
                  <p className="lp-cal-day">{d}</p>
                  <div className="lp-cal-slot" />
                  <div className={`lp-cal-slot${i === 1 ? " is-booked" : ""}`}>{i === 1 ? "10:40" : ""}</div>
                  <div className="lp-cal-slot" />
                  <div className={`lp-cal-slot${i === 3 ? " is-free" : ""}`}>{i === 3 ? "libre" : ""}</div>
                  <div className="lp-cal-slot" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="lp-section lp-section-soft" aria-labelledby="compare">
          <div className="container">
            <div className="lp-section-head" data-reveal>
              <p className="lp-eyebrow">Comparado</p>
              <h2 id="compare" className="serif">Con lo que tienes ahora.</h2>
            </div>

            <div className="table-wrap lp-compare-wrap" data-reveal>
              <table className="lp-compare">
                <caption className="sr-only">
                  YourAI comparado con el buzón de voz y con un servicio de atención telefónica
                </caption>
                <thead>
                  <tr>
                    <th scope="col"> </th>
                    <th scope="col">Buzón de voz</th>
                    <th scope="col">Servicio telefónico</th>
                    <th scope="col" className="is-us">YourAI</th>
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
        <section className="lp-privacy" aria-labelledby="privacy">
          <div className="container lp-privacy-grid">
            <div>
              <p className="lp-eyebrow" data-reveal>Privacidad</p>
              <h2 id="privacy" className="serif" data-reveal>Las conversaciones con pacientes no son un activo de marketing.</h2>
              <p data-reveal>
                No entrenamos modelos públicos con tus pacientes, no revendemos transcripciones y no
                te enseñamos la clínica de al lado. Una clínica, un jardín cerrado.
              </p>
              <ul className="lp-privacy-list">
                <li data-reveal>Datos alojados en la UE, cifrados en tránsito y en reposo</li>
                <li data-reveal>Credenciales cifradas antes de guardarse</li>
                <li data-reveal>Acceso de solo lectura al calendario: no podemos tocar tu agenda</li>
                <li data-reveal>Exporta o borra todo, tú mismo, cuando quieras</li>
                <li data-reveal>Encargo de tratamiento firmado con cada clínica</li>
              </ul>
            </div>
            <div className="lp-privacy-art" data-reveal aria-hidden="true">
              <div className="lp-lock">
                <div className="lp-lock-body" />
                <div className="lp-lock-shackle" />
              </div>
              <p>Tus datos. Tu clínica. Tu salida.</p>
            </div>
          </div>
        </section>

        {/* Honesty */}
        <section className="lp-section" aria-labelledby="wont">
          <div className="container">
            <div className="lp-section-head" data-reveal>
              <p className="lp-eyebrow">Los límites</p>
              <h2 id="wont" className="serif">Lo que no hace.</h2>
            </div>
            <div className="lp-wont">
              <p data-reveal>No diagnostica ni le dice a un paciente qué tratamiento necesita.</p>
              <p data-reveal>No da presupuestos cerrados ni totales de trabajos complejos.</p>
              <p data-reveal>No pide datos de tarjeta, ni los acepta si se los dan.</p>
              <p data-reveal>No escribe a los pacientes por su cuenta.</p>
              <p data-reveal>No responde en una web que tú no hayas autorizado.</p>
              <p data-reveal>No adivina. Cuando no lo sabe, toma nota.</p>
            </div>
          </div>
        </section>

        {/* Pricing preview */}
        <section className="lp-section lp-section-soft" aria-labelledby="plans">
          <div className="container">
            <div className="lp-section-head" data-reveal>
              <p className="lp-eyebrow">Precios</p>
              <h2 id="plans" className="serif">Dos planes. Sin coste de alta.</h2>
            </div>

            <div className="lp-plans">
              {plans.map((p, i) => (
                <article
                  key={p.name}
                  className={`lp-plan${p.featured ? " is-featured" : ""}`}
                  data-reveal
                  style={{ ["--d" as string]: `${i * 90}ms` }}
                >
                  {p.featured && <span className="lp-plan-tag">La opción de la mayoría</span>}
                  <h3>{p.name}</h3>
                  <p className="lp-plan-price">{p.price}<span> / mes</span></p>
                  <p className="lp-plan-note">{p.note}</p>
                  <Link href={p.href} className={`btn lp-btn ${p.featured ? "btn-primary" : "btn-secondary"}`}>
                    {p.cta}
                  </Link>
                </article>
              ))}
            </div>
            <p className="lp-plans-fine" data-reveal>
              Precios en euros, por clínica. Sin permanencia: tus datos se van contigo.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="lp-section" aria-labelledby="faq">
          <div className="container lp-faq">
            <div className="lp-faq-head" data-reveal>
              <p className="lp-eyebrow">Respuestas claras</p>
              <h2 id="faq" className="serif">Las preguntas que harías igual.</h2>
              <p className="lp-faq-note">
                ¿Sigues con dudas? <Link href="/contact">Escríbenos</Link> y te contesta una persona.
              </p>
            </div>
            <div className="lp-faq-list">
              {faqs.map((f, i) => (
                <details key={f.q} className="lp-faq-item" data-reveal style={{ ["--d" as string]: `${i * 60}ms` }}>
                  <summary>
                    <span>{f.q}</span>
                    <span className="lp-faq-plus" aria-hidden="true" />
                  </summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="lp-cta-band" aria-labelledby="cta">
          <div className="container">
            <div className="lp-cta-panel" data-reveal>
              <h2 id="cta" className="serif">Ponlo en tu web hoy mismo.</h2>
              <p>
                Da de alta tu clínica, pega el fragmento de código y mira llegar la primera cita
                antes de irte a casa.
              </p>
              <div className="lp-actions">
                <Link href="/signup" className="btn btn-primary lp-btn">Configurar tu asistente</Link>
                <Link href="/pricing" className="btn lp-btn lp-btn-ghost">Ver precios</Link>
              </div>
              <p className="lp-cta-fine">Sin permanencia. Sin coste de alta. Tus datos se van contigo.</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
