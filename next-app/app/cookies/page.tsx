import type { Metadata } from "next";
import LegalPage from "../components/LegalPage";
import { LEGAL } from "../../lib/site";

export const metadata: Metadata = {
  title: "Política de cookies",
  description: "Qué cookies usa esta web y cómo cambiar tu elección.",
  alternates: { canonical: "/cookies" },
};

export default function Cookies() {
  return (
    <LegalPage title="Política de cookies">
      <p>Las cookies son pequeños archivos que se guardan en tu dispositivo. Usamos unas pocas estrictamente necesarias y cookies de analítica solo si las aceptas.</p>
      <h2>Cookies que usamos</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Nombre</th><th>Para qué</th><th>Tipo</th><th>Duración</th></tr></thead>
          <tbody>
            <tr><td>[FILL IN: nombres de las cookies de sesión]</td><td>Mantiene tu sesión abierta</td><td>Necesaria, propia</td><td>[FILL IN]</td></tr>
            <tr><td>[FILL IN: nombre de la cookie de alta]</td><td>Lleva la clave de tu asistente justo después del registro</td><td>Necesaria, propia</td><td>[FILL IN]</td></tr>
            <tr><td>cookie-consent-v1 (almacenamiento del navegador)</td><td>Recuerda tu elección sobre cookies</td><td>Necesaria, propia</td><td>Hasta que la borres</td></tr>
            <tr><td>_ga, _ga_*</td><td>Google Analytics: estadísticas de visita anónimas</td><td>Analítica, de terceros (Google)</td><td>Hasta 2 años</td></tr>
          </tbody>
        </table>
      </div>
      <h2>Tu elección</h2>
      <p>Las cookies de analítica solo se cargan cuando aceptas. Puedes cambiar o retirar tu elección cuando quieras desde «Ajustes de cookies», en el pie de página. También puedes borrar las cookies en los ajustes de tu navegador.</p>
      <h2>Más información</h2>
      <p>Consulta la <a href="/privacy">política de privacidad</a> o escribe a <a href={`mailto:${LEGAL.privacyEmail}`}>{LEGAL.privacyEmail}</a>.</p>
    </LegalPage>
  );
}
