export const advisorLocales = ['en', 'it', 'fr', 'es', 'pt-BR'];

const localeDetails = {
 en: { name: 'English', speech: 'en-GB', changed: 'Of course — I’ll continue in English. What would you like to make clearer?' },
 it: { name: 'Italian', speech: 'it-IT', changed: 'Certamente — continuerò in italiano. Cosa desidera chiarire?' },
 fr: { name: 'French', speech: 'fr-FR', changed: 'Bien sûr — je continuerai en français. Que souhaitez-vous clarifier ?' },
 es: { name: 'Spanish', speech: 'es-ES', changed: 'Claro — continuaré en español. ¿Qué le gustaría aclarar?' },
 'pt-BR': { name: 'Brazilian Portuguese', speech: 'pt-BR', changed: 'Claro — continuarei em português do Brasil. O que você gostaria de esclarecer?' },
};

export function advisorLocale(value) {
 const candidate = String(value || '').trim();
 if (advisorLocales.includes(candidate)) return candidate;
 const base = candidate.toLowerCase().split('-')[0];
 return advisorLocales.includes(base) ? base : 'en';
}

export function advisorSpeechLocale(value) {
 return localeDetails[advisorLocale(value)].speech;
}

export function advisorLanguageName(value) {
 return localeDetails[advisorLocale(value)].name;
}

export function advisorLanguageChangedMessage(value) {
 return localeDetails[advisorLocale(value)].changed;
}

const normalise = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const names = {
 en: /\b(?:english|inglese|anglais|ingles|inglés|ingles)\b/,
 it: /\b(?:italian|italiano|italien|italiana)\b/,
 fr: /\b(?:french|francais|francese|frances|francesa)\b/,
 es: /\b(?:spanish|espanol|espanola|spagnolo|espagnol)\b/,
 'pt-BR': /\b(?:brazilian portuguese|portuguese brazilian|portugues brasileiro|portugues do brasil|portugues brasil|portuguese|portugues)\b/,
};
const requestCue = /\b(?:speak|talk|write|answer|respond|continue|switch|change|language|lingua|langue|idioma|parla|parlare|rispondi|continua|cambia|parlez|parler|repondez|continuez|habla|hablar|responde|fale|falar|responda|mude)\b/;

// Language names alone are accepted only in a very short request, avoiding a
// switch when a visitor is discussing a market, sector or customer segment.
export function requestedAdvisorLocale(value) {
 const text = normalise(value);
 if (!text || (text.length > 100 && !requestCue.test(text))) return null;
 for (const locale of advisorLocales) {
  if (names[locale].test(text) && (text.length <= 35 || requestCue.test(text))) return locale;
 }
 return null;
}
