import OperatorConsole from "../components/OperatorConsole";

export const dynamic = "force-dynamic";

/**
 * /operator — the supplier's console. No practice login: it authorises with the
 * operator code, which the browser never stores (the server keeps it).
 */
export default function OperatorPage() {
  return <OperatorConsole />;
}
