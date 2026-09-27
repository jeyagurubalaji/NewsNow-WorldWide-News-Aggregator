import { createContext, useContext, useEffect, useState } from 'react'
import { translateBatch } from '../services/googletranslate'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('newsnow_lang') || 'en'
  })

  const changeLanguage = (code) => {
    setLanguage(code)
    localStorage.setItem('newsnow_lang', code)
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}

export function useAutoTranslate(textItems) {
  const { language } = useLanguage()
  const [translatedMap, setTranslatedMap] = useState(new Map())

  useEffect(() => {
    let isMounted = true
    const items = Array.isArray(textItems) ? textItems : [textItems]

    if (language === 'en' || items.length === 0) {
      setTranslatedMap(new Map())
      return
    }

    translateBatch(items, language).then((map) => {
      if (isMounted) {
        setTranslatedMap(map)
      }
    })

    return () => {
      isMounted = false
    }
  }, [language, JSON.stringify(textItems)])

  const t = (text) => {
    if (language === 'en' || !text) return text
    return translatedMap.get(text) || text
  }

  return { t }
}