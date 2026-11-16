import ar from './languages/ar.js';
import en from './languages/en.js';
import sv from './languages/sv.js';
export const langs=['ar','en','sv'];
const translations={ar,en,sv};
export const dictionary=Object.fromEntries(Object.keys(en).map(key=>[key,langs.map(lang=>translations[lang][key])]));
export function tr(key,lang){return translations[lang]?.[key]||en[key]||key}

