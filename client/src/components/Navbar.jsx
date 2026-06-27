import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import logo from "@/assets/logo.png"

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Search Flights", href: "#search" },
  { label: "About", href: "#about" },
]

const languages = [
  { code: "en", label: "English" },
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
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [selectedLang, setSelectedLang] = useState(languages[0])
  const [searchQuery, setSearchQuery] = useState("")
  const langRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // ← Fix: close dropdown when clicking outside
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
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "shadow-xl" : ""
      }`}
      style={{ background: "var(--color-bg-secondary)" }}
    >
      {/* ── Top Utility Bar ── */}
      <div className="border-b" style={{ borderColor: "var(--color-border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="flex items-center justify-between h-9 text-xs"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <span>Your personal flight deal finder</span>

            {/* Language Dropdown */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 hover:text-white transition-colors py-1"
              >
                <span>{selectedLang.label}</span>
                <ChevronDown
                  className="w-3 h-3 transition-transform duration-200"
                  style={{ transform: langOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                />
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1 w-40 rounded-lg border overflow-hidden shadow-xl z-50"
                    style={{
                      background: "var(--color-bg-secondary)",
                      borderColor: "var(--color-border)",
                    }}
                  >
                    {/* Scrollable list for 12 languages */}
                    <div className="max-h-64 overflow-y-auto">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setSelectedLang(lang)
                            setLangOpen(false)
                          }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 transition-colors flex items-center justify-between"
                          style={{
                            color:
                              lang.code === selectedLang.code
                                ? "var(--color-accent)"
                                : "var(--color-text-secondary)",
                          }}
                        >
                          {lang.label}
                          {lang.code === selectedLang.code && (
                            <span style={{ color: "var(--color-accent)" }}>✓</span>
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
      </div>

      {/* ── Main Bar ── */}
      <div className="border-b" style={{ borderColor: "var(--color-border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">

           {/* Logo */}
            <a href="#home" className="flex items-center gap-2 shrink-0">
              <span
                className="font-bold text-xl tracking-tight"
                style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-display)" }}
              >
                Sky<span style={{ color: "var(--color-accent)" }}>Scout</span>
              </span>
              <img src={logo} alt="SkyScout" className="h-12 w-auto" />
            </a>

            {/* Search Bar */}
            <div
              className="flex-1 max-w-xl mx-auto hidden md:flex items-center gap-2 rounded-full px-4 py-2 border"
              style={{
                background: "rgba(255,255,255,0.05)",
                borderColor: "var(--color-border)",
              }}
            >
              <Search
                className="w-4 h-4 shrink-0"
                style={{ color: "var(--color-text-muted)" }}
              />
              <input
                type="text"
                placeholder="Search flights, airports or cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: "var(--color-text-primary)" }}
              />
            </div>

            {/* CTA + Hamburger */}
            <div className="flex items-center gap-3 ml-auto">
              <Button
                size="sm"
                className="hidden md:flex rounded-full text-sm font-medium text-white px-5"
                style={{ background: "var(--color-accent)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--color-accent-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "var(--color-accent)")
                }
              >
                Find Flights
              </Button>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2"
                style={{ color: "var(--color-text-primary)" }}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Nav Links ── */}
      <div
        className="hidden md:block border-b"
        style={{
          background: "var(--color-bg-primary)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8 h-10">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs font-medium transition-colors hover:text-white"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-b overflow-hidden"
            style={{
              background: "var(--color-bg-secondary)",
              borderColor: "var(--color-border)",
            }}
          >
            {/* Mobile Search */}
            <div className="px-4 pt-4">
              <div
                className="flex items-center gap-2 rounded-full px-4 py-2.5 border"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  borderColor: "var(--color-border)",
                }}
              >
                <Search
                  className="w-4 h-4"
                  style={{ color: "var(--color-text-muted)" }}
                />
                <input
                  type="text"
                  placeholder="Search flights..."
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: "var(--color-text-primary)" }}
                />
              </div>
            </div>

            {/* Mobile Links */}
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-2.5 text-sm font-medium transition-colors hover:text-white"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {link.label}
                </a>
              ))}
              <Button
                className="mt-3 w-full rounded-full text-white font-medium"
                style={{ background: "var(--color-accent)" }}
              >
                Find Flights
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}