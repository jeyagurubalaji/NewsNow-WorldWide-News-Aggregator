const axios = require('axios');

/**
 * The 133 languages Google Translate supported following its May 2022 expansion
 * (109 -> 133 languages) — the widely-referenced "133 languages" list. Codes are
 * Google's own (mostly ISO 639-1; a few like zh-CN/zh-TW/iw/jw are Google-specific).
 */
const SUPPORTED_LANGUAGES = {
  af: 'Afrikaans', sq: 'Albanian', am: 'Amharic', ar: 'Arabic', hy: 'Armenian',
  as: 'Assamese', ay: 'Aymara', az: 'Azerbaijani', bm: 'Bambara', eu: 'Basque',
  be: 'Belarusian', bn: 'Bengali', bho: 'Bhojpuri', bs: 'Bosnian', bg: 'Bulgarian',
  ca: 'Catalan', ceb: 'Cebuano', ny: 'Chichewa', 'zh-CN': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)', co: 'Corsican', hr: 'Croatian', cs: 'Czech',
  da: 'Danish', dv: 'Dhivehi', doi: 'Dogri', nl: 'Dutch', en: 'English',
  eo: 'Esperanto', et: 'Estonian', ee: 'Ewe', tl: 'Filipino', fi: 'Finnish',
  fr: 'French', fy: 'Frisian', gl: 'Galician', ka: 'Georgian', de: 'German',
  el: 'Greek', gn: 'Guarani', gu: 'Gujarati', ht: 'Haitian Creole', ha: 'Hausa',
  haw: 'Hawaiian', iw: 'Hebrew', hi: 'Hindi', hmn: 'Hmong', hu: 'Hungarian',
  is: 'Icelandic', ig: 'Igbo', ilo: 'Ilocano', id: 'Indonesian', ga: 'Irish',
  it: 'Italian', ja: 'Japanese', jw: 'Javanese', kn: 'Kannada', kk: 'Kazakh',
  km: 'Khmer', rw: 'Kinyarwanda', gom: 'Konkani', ko: 'Korean', kri: 'Krio',
  ku: 'Kurdish', ckb: 'Kurdish (Sorani)', ky: 'Kyrgyz', lo: 'Lao', la: 'Latin',
  lv: 'Latvian', ln: 'Lingala', lt: 'Lithuanian', lg: 'Luganda', lb: 'Luxembourgish',
  mk: 'Macedonian', mai: 'Maithili', mg: 'Malagasy', ms: 'Malay', ml: 'Malayalam',
  mt: 'Maltese', mi: 'Maori', mr: 'Marathi', 'mni-Mtei': 'Meiteilon (Manipuri)',
  lus: 'Mizo', mn: 'Mongolian', my: 'Myanmar (Burmese)', ne: 'Nepali', no: 'Norwegian',
  or: 'Odia (Oriya)', om: 'Oromo', ps: 'Pashto', fa: 'Persian', pl: 'Polish',
  pt: 'Portuguese', pa: 'Punjabi', qu: 'Quechua', ro: 'Romanian', ru: 'Russian',
  sm: 'Samoan', sa: 'Sanskrit', gd: 'Scots Gaelic', nso: 'Sepedi', sr: 'Serbian',
  st: 'Sesotho', sn: 'Shona', sd: 'Sindhi', si: 'Sinhala', sk: 'Slovak',
  sl: 'Slovenian', so: 'Somali', es: 'Spanish', su: 'Sundanese', sw: 'Swahili',
  sv: 'Swedish', tg: 'Tajik', ta: 'Tamil', tt: 'Tatar', te: 'Telugu',
  th: 'Thai', ti: 'Tigrinya', ts: 'Tsonga', tr: 'Turkish', tk: 'Turkmen',
  ak: 'Twi', uk: 'Ukrainian', ur: 'Urdu', ug: 'Uyghur', uz: 'Uzbek',
  vi: 'Vietnamese', cy: 'Welsh', xh: 'Xhosa', yi: 'Yiddish', yo: 'Yoruba',
  zu: 'Zulu',
};

/**
 * Translates text using Google Translate's unofficial "GTX" endpoint — the same
 * public, keyless endpoint the Google Translate website itself calls. No API key,
 * no billing account, no request quota tied to your Google Cloud project.
 *
 * sourceLang defaults to 'auto' (Google detects the source language itself).
 * Returns { translatedText, detectedSourceLanguage }.
 */
async function translateText(text, targetLang, sourceLang = 'auto') {
  if (!text || !text.trim()) {
    return { translatedText: '', detectedSourceLanguage: sourceLang };
  }
  if (!SUPPORTED_LANGUAGES[targetLang]) {
    throw new Error(`Unsupported target language: ${targetLang}`);
  }

  const response = await axios.get('https://translate.googleapis.com/translate_a/single', {
    params: {
      client: 'gtx',
      sl: sourceLang,
      tl: targetLang,
      dt: 't',
      q: text,
    },
    timeout: 5000,
  });

  // Response shape: [ [ [translatedChunk, originalChunk, ...], ... ], null, sourceLang, ... ]
  const data = response.data;
  const translatedText = (data?.[0] || [])
    .map((segment) => segment?.[0] || '')
    .join('');
  const detectedSourceLanguage = data?.[2] || sourceLang;

  return { translatedText, detectedSourceLanguage };
}

module.exports = { translateText, SUPPORTED_LANGUAGES };
