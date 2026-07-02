import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

const languages = [
  { code: "en-US", label: "English (US)" },
  { code: "en-GB", label: "English (UK)" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
  { code: "pt", label: "Portuguese" },
  { code: "ar", label: "Arabic" },
  { code: "zh", label: "Chinese" },
  { code: "hi", label: "Hindi" },
  { code: "sw", label: "Swahili" },
  { code: "de", label: "German" },
  { code: "ja", label: "Japanese" },
  { code: "ru", label: "Russian" },
  { code: "it", label: "Italian" },
  { code: "ko", label: "Korean" },
  { code: "nl", label: "Dutch" },
  { code: "tr", label: "Turkish" },
]

export default function Footer() {
  const [langOpen, setLangOpen] = useState(false)
  const [selectedLang, setSelectedLang] = useState(languages[0])
  const langRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <>
      {/* ── Blue section: brand, quick links, legal/trust ── */}
      <footer style={{ background: "var(--color-bg-secondary)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">

            {/* Brand blurb */}
            <div>
              <span
                className="font-bold text-xl tracking-tight"
                style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-display)" }}
              >
                Sky<span style={{ color: "var(--color-accent)" }}>Scout</span>
              </span>
              <p
                className="text-sm mt-3 leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                SkyScout tracks fares around the clock and surfaces the cheapest
                flights on your route, so you don't have to keep checking.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h4
                className="text-xs font-semibold tracking-wide mb-4"
                style={{ color: "var(--color-text-primary)" }}
              >
                QUICK LINKS
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a
                    href="#search"
                    className="transition-colors hover:text-white"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Search Flights
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="transition-colors hover:text-white"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    How It Works
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal & Trust */}
            <div>
              <h4
                className="text-xs font-semibold tracking-wide mb-4"
                style={{ color: "var(--color-text-primary)" }}
              >
                LEGAL & TRUST
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a
                    href="/terms"
                    className="transition-colors hover:text-white"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy"
                    className="transition-colors hover:text-white"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Privacy Policy
                  </a>
                </li>
                <li
                  className="text-xs pt-1"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Flight results powered by Google Flights, via SerpApi.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* ── White strip: language selector + copyright ── */}
      <div className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">

          {/* Copyright */}
          <div className="text-xs text-slate-400 order-2 sm:order-1">
            © 2026 SkyScout. All rights reserved.
          </div>

          {/* Language selector */}
          <div className="relative order-1 sm:order-2" ref={langRef}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors py-1"
            >
              <span>{selectedLang.label}</span>
              <ChevronDown
                className="w-3.5 h-3.5 transition-transform duration-200"
                style={{ transform: langOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>

            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 sm:left-0 bottom-full mb-1 w-40 rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xl z-50"
                >
                  <div className="max-h-64 overflow-y-auto">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setSelectedLang(lang)
                          setLangOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors flex items-center justify-between ${
                          lang.code === selectedLang.code ? "text-cyan-600" : "text-slate-600"
                        }`}
                      >
                        {lang.label}
                        {lang.code === selectedLang.code && (
                          <span className="text-cyan-600">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  )
}