/**
 * Dialling codes for the whole world, so no practice has to fight a +44-shaped
 * form. Spain is listed first because that is the home market; everything else
 * follows in alphabetical order.
 *
 * Stored as "ISO|dial|Name" lines rather than objects: it keeps the data
 * reviewable in one screen, and the flag comes from the ISO code for free
 * (regional indicator symbols), so there is no second thing to keep in sync.
 */
const RAW = `
AD|376|Andorra
AE|971|United Arab Emirates
AF|93|Afghanistan
AG|1268|Antigua and Barbuda
AI|1264|Anguilla
AL|355|Albania
AM|374|Armenia
AO|244|Angola
AR|54|Argentina
AT|43|Austria
AU|61|Australia
AW|297|Aruba
AZ|994|Azerbaijan
BA|387|Bosnia and Herzegovina
BB|1246|Barbados
BD|880|Bangladesh
BE|32|Belgium
BF|226|Burkina Faso
BG|359|Bulgaria
BH|973|Bahrain
BI|257|Burundi
BJ|229|Benin
BM|1441|Bermuda
BN|673|Brunei
BO|591|Bolivia
BR|55|Brazil
BS|1242|Bahamas
BT|975|Bhutan
BW|267|Botswana
BY|375|Belarus
BZ|501|Belize
CA|1|Canada
CD|243|DR Congo
CF|236|Central African Republic
CG|242|Congo
CH|41|Switzerland
CI|225|Côte d'Ivoire
CL|56|Chile
CM|237|Cameroon
CN|86|China
CO|57|Colombia
CR|506|Costa Rica
CU|53|Cuba
CV|238|Cape Verde
CW|599|Curaçao
CY|357|Cyprus
CZ|420|Czechia
DE|49|Germany
DJ|253|Djibouti
DK|45|Denmark
DM|1767|Dominica
DO|1809|Dominican Republic
DZ|213|Algeria
EC|593|Ecuador
EE|372|Estonia
EG|20|Egypt
ER|291|Eritrea
ES|34|Spain
ET|251|Ethiopia
FI|358|Finland
FJ|679|Fiji
FO|298|Faroe Islands
FR|33|France
GA|241|Gabon
GB|44|United Kingdom
GD|1473|Grenada
GE|995|Georgia
GF|594|French Guiana
GH|233|Ghana
GI|350|Gibraltar
GM|220|Gambia
GN|224|Guinea
GP|590|Guadeloupe
GQ|240|Equatorial Guinea
GR|30|Greece
GT|502|Guatemala
GW|245|Guinea-Bissau
GY|592|Guyana
HK|852|Hong Kong
HN|504|Honduras
HR|385|Croatia
HT|509|Haiti
HU|36|Hungary
ID|62|Indonesia
IE|353|Ireland
IL|972|Israel
IN|91|India
IQ|964|Iraq
IR|98|Iran
IS|354|Iceland
IT|39|Italy
JM|1876|Jamaica
JO|962|Jordan
JP|81|Japan
KE|254|Kenya
KG|996|Kyrgyzstan
KH|855|Cambodia
KN|1869|Saint Kitts and Nevis
KP|850|North Korea
KR|82|South Korea
KW|965|Kuwait
KY|1345|Cayman Islands
KZ|7|Kazakhstan
LA|856|Laos
LB|961|Lebanon
LC|1758|Saint Lucia
LI|423|Liechtenstein
LK|94|Sri Lanka
LR|231|Liberia
LS|266|Lesotho
LT|370|Lithuania
LU|352|Luxembourg
LV|371|Latvia
LY|218|Libya
MA|212|Morocco
MC|377|Monaco
MD|373|Moldova
ME|382|Montenegro
MF|590|Saint Martin
MG|261|Madagascar
MK|389|North Macedonia
ML|223|Mali
MM|95|Myanmar
MN|976|Mongolia
MO|853|Macau
MQ|596|Martinique
MR|222|Mauritania
MS|1664|Montserrat
MT|356|Malta
MU|230|Mauritius
MV|960|Maldives
MW|265|Malawi
MX|52|Mexico
MY|60|Malaysia
MZ|258|Mozambique
NA|264|Namibia
NC|687|New Caledonia
NE|227|Niger
NG|234|Nigeria
NI|505|Nicaragua
NL|31|Netherlands
NO|47|Norway
NP|977|Nepal
NZ|64|New Zealand
OM|968|Oman
PA|507|Panama
PE|51|Peru
PF|689|French Polynesia
PG|675|Papua New Guinea
PH|63|Philippines
PK|92|Pakistan
PL|48|Poland
PR|1787|Puerto Rico
PS|970|Palestine
PT|351|Portugal
PY|595|Paraguay
QA|974|Qatar
RE|262|Réunion
RO|40|Romania
RS|381|Serbia
RU|7|Russia
RW|250|Rwanda
SA|966|Saudi Arabia
SB|677|Solomon Islands
SC|248|Seychelles
SD|249|Sudan
SE|46|Sweden
SG|65|Singapore
SI|386|Slovenia
SK|421|Slovakia
SL|232|Sierra Leone
SM|378|San Marino
SN|221|Senegal
SO|252|Somalia
SR|597|Suriname
SS|211|South Sudan
ST|239|São Tomé and Príncipe
SV|503|El Salvador
SY|963|Syria
SZ|268|Eswatini
TC|1649|Turks and Caicos
TD|235|Chad
TG|228|Togo
TH|66|Thailand
TJ|992|Tajikistan
TL|670|Timor-Leste
TM|993|Turkmenistan
TN|216|Tunisia
TO|676|Tonga
TR|90|Türkiye
TT|1868|Trinidad and Tobago
TW|886|Taiwan
TZ|255|Tanzania
UA|380|Ukraine
UG|256|Uganda
US|1|United States
UY|598|Uruguay
UZ|998|Uzbekistan
VA|379|Vatican City
VC|1784|Saint Vincent
VE|58|Venezuela
VG|1284|British Virgin Islands
VN|84|Vietnam
VU|678|Vanuatu
WS|685|Samoa
XK|383|Kosovo
YE|967|Yemen
ZA|27|South Africa
ZM|260|Zambia
ZW|263|Zimbabwe
`;

export type Country = { iso: string; dial: string; name: string; flag: string };

/** 🇪🇸 from "ES": each letter becomes a regional indicator symbol. */
export function flagFor(iso: string): string {
  if (!/^[A-Z]{2}$/.test(iso)) return "🌍";
  return String.fromCodePoint(
    ...[...iso].map((letter) => 0x1f1e6 + letter.charCodeAt(0) - 65),
  );
}

export const COUNTRIES: Country[] = RAW.split("\n")
  .map((line) => line.trim())
  .filter((line) => /^[A-Z]{2}\|\d+\|/.test(line))
  .map((line) => {
    const [iso, dial, name] = line.split("|");
    return { iso, dial, name, flag: flagFor(iso) };
  })
  .filter((c) => c.iso !== "US" || c.dial === "1")
  .sort((a, b) => {
    if (a.iso === "ES") return -1;
    if (b.iso === "ES") return 1;
    return a.name.localeCompare(b.name, "en-GB");
  });

/** Timezone -> the country a practice there almost certainly dials from. */
const COUNTRY_BY_TIMEZONE: Record<string, string> = {
  "Europe/Madrid": "ES",
  "Europe/London": "GB",
  "Europe/Dublin": "IE",
  "Europe/Paris": "FR",
  "Europe/Rome": "IT",
  "Europe/Berlin": "DE",
  "Europe/Lisbon": "PT",
  "Europe/Amsterdam": "NL",
  "Europe/Brussels": "BE",
  "Europe/Zurich": "CH",
  "Europe/Vienna": "AT",
  "Europe/Stockholm": "SE",
  "Europe/Oslo": "NO",
  "Europe/Copenhagen": "DK",
  "Europe/Helsinki": "FI",
  "Europe/Warsaw": "PL",
  "Europe/Prague": "CZ",
  "Europe/Budapest": "HU",
  "Europe/Athens": "GR",
  "Europe/Bucharest": "RO",
  "Europe/Istanbul": "TR",
  "America/New_York": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Los_Angeles": "US",
  "America/Toronto": "CA",
  "America/Vancouver": "CA",
  "America/Mexico_City": "MX",
  "America/Bogota": "CO",
  "America/Santiago": "CL",
  "America/Argentina/Buenos_Aires": "AR",
  "America/Sao_Paulo": "BR",
  "Asia/Dubai": "AE",
  "Asia/Kolkata": "IN",
  "Asia/Singapore": "SG",
  "Asia/Tokyo": "JP",
  "Asia/Shanghai": "CN",
  "Australia/Sydney": "AU",
  "Australia/Melbourne": "AU",
  "Pacific/Auckland": "NZ",
  "Africa/Johannesburg": "ZA",
  "Africa/Cairo": "EG",
  "Africa/Lagos": "NG",
  "Africa/Nairobi": "KE",
};

export function countryForTimezone(timeZone?: string | null): string {
  return (timeZone && COUNTRY_BY_TIMEZONE[timeZone]) || "ES";
}

/** One default per shared dial code, so the flag shown matches the expectation. */
const PREFERRED_SHARED: Record<string, string> = {
  "1": "US",
  "7": "RU",
  "590": "GP",
  "262": "RE",
};

export function countryByIso(iso: string): Country | undefined {
  return COUNTRIES.find((c) => c.iso === iso);
}

/**
 * Countries whose national numbers KEEP their leading zero. Italy is the famous
 * one (+39 06 …); stripping it produces a number that never connects.
 */
const KEEPS_TRUNK_ZERO = new Set(["39", "378", "379", "225"]);

export function keepsTrunkZero(dial: string): boolean {
  return KEEPS_TRUNK_ZERO.has(dial);
}

/** Parse anything a person might type or paste into a country + national part. */
export function splitNumber(
  raw: string | null | undefined,
  fallbackIso = "ES",
): { iso: string; dial: string; national: string } {
  const value = (raw ?? "").trim();
  const fallback = countryByIso(fallbackIso) ?? COUNTRIES[0];

  if (!value) return { iso: fallback.iso, dial: fallback.dial, national: "" };

  // "+34 612 345 678" or "0034 612 345 678" — the dial code is longest-prefix.
  const international = value.startsWith("+")
    ? value.replace(/[^\d]/g, "")
    : value.startsWith("00")
      ? value.slice(2).replace(/[^\d]/g, "")
      : null;

  if (international !== null) {
    const candidates = COUNTRIES.filter((c) => international.startsWith(c.dial)).sort((a, b) => {
      if (a.dial.length !== b.dial.length) return b.dial.length - a.dial.length;
      // Shared codes (+1, +7, +590 …): prefer the country people actually mean.
      return (PREFERRED_SHARED[a.dial] === a.iso ? 0 : 1) - (PREFERRED_SHARED[b.dial] === b.iso ? 0 : 1);
    });
    const match = candidates[0];
    if (match) {
      return { iso: match.iso, dial: match.dial, national: international.slice(match.dial.length) };
    }
    return { iso: fallback.iso, dial: fallback.dial, national: international };
  }

  return { iso: fallback.iso, dial: fallback.dial, national: value.replace(/[^\d]/g, "") };
}

/**
 * Country + national part -> E.164 ("+34612345678"), or "" when there is
 * nothing worth storing. The trunk zero is dropped where the country uses one.
 */
export function toE164(dial: string, national: string, iso: string): string {
  let digits = (national ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0") && !keepsTrunkZero(dial)) digits = digits.replace(/^0+/, "");
  if (!digits) return "";
  const full = `${dial}${digits}`;
  // E.164 caps a full number at 15 digits; shorter than 8 is a typo, not a number.
  return full.length >= 8 && full.length <= 15 ? `+${full}` : "";
}

/** "+34 612 345 678" for display; the stored value stays E.164. */
export function formatNumber(dial: string, national: string): string {
  // Group from the RIGHT in threes: "+44 7700 900123" reads "770 090 012 3"
  // left-grouped, which looks like a typo. "+44 7 700 900 123" does not.
  const digits = (national ?? "").replace(/\D/g, "");
  const groups: string[] = [];
  for (let end = digits.length; end > 0; end -= 3) groups.unshift(digits.slice(Math.max(0, end - 3), end));
  return groups.length ? `+${dial} ${groups.join(" ")}` : `+${dial}`;
}

/** Human placeholder per country, so the example digits look right. */
const PLACEHOLDER: Record<string, string> = {
  ES: "612 345 678",
  GB: "7700 900123",
  IE: "85 123 4567",
  US: "201 555 0123",
  CA: "416 555 0123",
  FR: "6 12 34 56 78",
  DE: "1512 3456789",
  IT: "312 345 6789",
  PT: "912 345 678",
  NL: "6 12345678",
  BE: "470 12 34 56",
  CH: "78 123 45 67",
  AT: "664 123456",
  SE: "70 123 45 67",
  NO: "412 34 567",
  DK: "20 12 34 56",
  FI: "40 123 4567",
  PL: "512 345 678",
  MX: "55 1234 5678",
  AR: "11 2345 6789",
  BR: "11 91234 5678",
  AU: "412 345 678",
  NZ: "21 123 4567",
  JP: "90 1234 5678",
  CN: "131 2345 6789",
  IN: "98765 43210",
  AE: "50 123 4567",
  ZA: "82 123 4567",
};

export function placeholderFor(iso: string): string {
  return PLACEHOLDER[iso] ?? "123 456 789";
}
