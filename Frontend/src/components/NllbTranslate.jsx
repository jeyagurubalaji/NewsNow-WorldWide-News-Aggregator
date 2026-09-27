import { useEffect } from 'react'

export default function NllbTranslate() {
  useEffect(() => {
    // 1. Avoid duplicate script injections
    if (document.getElementById('google-translate-script')) return

    // 2. Define global callback expected by Google Translate
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          autoDisplay: false,
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        'google_translate_element'
      )
    }

    // 3. Dynamically inject Google Translate script
    const script = document.createElement('script')
    script.id = 'google-translate-script'
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
    script.async = true
    document.body.appendChild(script)
  }, [])

  return (
    <div
      id="google_translate_element"
      style={{ display: 'none', position: 'absolute', top: '-9999px', left: '-9999px' }}
      aria-hidden="true"
    />
  )
}