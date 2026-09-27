import { SOURCE_LANGUAGE } from '../data/languages'

const CACHE_PREFIX = 'newsnow_gt_cache::'
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const memoryCache = new Map()

function getLangCache(targetLang) {
  if (memoryCache.has(targetLang)) return memoryCache.get(targetLang)
  let stored = {}
  try {
    stored = JSON.parse(localStorage.getItem(CACHE_PREFIX + targetLang) || '{}')
  } catch {
    stored = {}
  }
  memoryCache.set(targetLang, stored)
  return stored
}

function persistLangCache(targetLang, cache) {
  try {
    localStorage.setItem(CACHE_PREFIX + targetLang, JSON.stringify(cache))
  } catch {}
}

export async function translateBatch(texts, targetLang, sourceLang = SOURCE_LANGUAGE) {
  const result = new Map()
  if (!targetLang || targetLang === sourceLang) {
    texts.forEach((t) => result.set(t, t))
    return result
  }

  const cache = getLangCache(targetLang)
  const unique = [...new Set(texts.filter((t) => typeof t === 'string' && t.trim()))]
  const toFetch = unique.filter((t) => !(t in cache))

  unique.forEach((t) => {
    if (t in cache) result.set(t, cache[t])
  })

  if (toFetch.length === 0) return result

  try {
    const response = await fetch(`${API_BASE_URL}/api/translate/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts: toFetch, target: targetLang, source: sourceLang }),
    })

    if (!response.ok) throw new Error('Batch translation failed')

    const data = await response.json()
    toFetch.forEach((text, index) => {
      const translated = data[index]?.translatedText || text
      cache[text] = translated
      result.set(text, translated)
    })

    persistLangCache(targetLang, cache)
  } catch (err) {
    console.warn('[NewsNow Translation Error]:', err)
    toFetch.forEach((t) => result.set(t, t))
  }

  return result
}