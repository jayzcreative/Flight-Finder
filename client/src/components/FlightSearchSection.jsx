import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeftRight, Search, ChevronDown, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

const currencies = ["GBP", "USD", "EUR", "INR", "AUD", "CAD"]

function formatDateTime(value) {
  if (!value || value === "N/A") return ""
  // API sends "YYYY-MM-DD HH:MM" — convert to a friendly, exact date + time
  const d = new Date(value.replace(" ", "T"))
  if (isNaN(d.getTime())) return value
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export default function FlightSearchSection() {
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [tripType, setTripType] = useState("round")
  const [budget, setBudget] = useState("")
  const [currency, setCurrency] = useState("GBP")
  const [email, setEmail] = useState("")
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [adults, setAdults] = useState(1)
  const [travelClass, setTravelClass] = useState("economy")

  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  const [status, setStatus] = useState(null)
  const [statusLoading, setStatusLoading] = useState(false)

  const swap = () => {
    setOrigin(destination)
    setDestination(origin)
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!origin || !destination || !budget || !email) return

    setLoading(true)
    setResults(null)
    setError(null)
    setStatus(null)

    try {
      const res = await fetch("http://localhost:8000/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          destination,
          tripType,
          budget: Number(budget),
          currency,
          email,
          adults: Number(adults),
          travelClass,
        }),
      })
      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        setResults(data)
      }
    } catch (err) {
      setError("Something went wrong reaching the search service. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const checkStatus = async (flightNumber, date) => {
    if (!flightNumber || !date) return
    setStatusLoading(true)
    try {
      const res = await fetch("http://localhost:8000/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flightNumber, date }),
      })
      const data = await res.json()
      setStatus(data.status || "Unavailable")
    } catch {
      setStatus("Unavailable")
    } finally {
      setStatusLoading(false)
    }
  }

  return (
    <section id="search" className="py-20">
      {/* Search card */}
      <form
        onSubmit={handleSearch}
        className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8 space-y-5"
      >
        {/* Trip type toggle */}
        <div className="flex gap-2">
          {[
            { key: "round", label: "Round Trip" },
            { key: "oneway", label: "One Way" },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTripType(t.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tripType === t.key
                  ? "bg-cyan-500 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Origin / swap / destination */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-400 tracking-wide">ORIGIN</label>
            <input
              type="text"
              placeholder="e.g. KJFK or New York"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={swap}
            className="self-center sm:self-end mb-0 sm:mb-0.5 shrink-0 w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center hover:bg-slate-200 transition-colors"
            aria-label="Swap origin and destination"
          >
            <ArrowLeftRight className="w-4 h-4 text-slate-500" />
          </button>

          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-400 tracking-wide">DESTINATION</label>
            <input
              type="text"
              placeholder="e.g. KLAX or Los Angeles"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        {/* Budget + Email */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-400 tracking-wide">BUDGET</label>
            <div className="flex mt-1 rounded-lg border border-slate-200 overflow-hidden">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-slate-100 text-sm px-2 outline-none border-r border-slate-200"
              >
                {currencies.map((c) => (
                  <option key={c} value={c} style={{ color: "#000" }}>{c}</option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                placeholder="Max price"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="flex-1 bg-slate-50 px-3 py-2.5 text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-400 tracking-wide">EMAIL</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        {/* Advanced options */}
        <div>
          <button
            type="button"
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            Advanced options
            <ChevronDown
              className="w-3.5 h-3.5 transition-transform duration-200"
              style={{ transform: advancedOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>

          <AnimatePresence>
            {advancedOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 tracking-wide">ADULTS</label>
                    <input
                      type="number"
                      min="1"
                      value={adults}
                      onChange={(e) => setAdults(e.target.value)}
                      className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 tracking-wide">CABIN CLASS</label>
                    <select
                      value={travelClass}
                      onChange={(e) => setTravelClass(e.target.value)}
                      className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none"
                    >
                      <option value="economy" style={{ color: "#000" }}>Economy</option>
                      <option value="premium" style={{ color: "#000" }}>Premium Economy</option>
                      <option value="business" style={{ color: "#000" }}>Business</option>
                      <option value="first" style={{ color: "#000" }}>First</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white rounded-full py-6 text-base font-medium gap-2"
        >
          <Search className="w-4 h-4" />
          {loading ? "Searching..." : "Search Flights"}
        </Button>
      </form>

      {/* Results */}
      <div className="mt-8">
        {loading && (
          <div className="text-center text-slate-400 py-10 animate-pulse">
            Scanning routes for the cheapest fares...
          </div>
        )}

        {!loading && error && (
          <div className="text-center text-red-500 bg-red-50 border border-red-100 rounded-xl py-4 px-4 text-sm">
            {error}
          </div>
        )}

        {!loading && results?.bestDeal && (
          <FlightResultsTable
            flight={results.bestDeal}
            origin={origin}
            destination={destination}
            status={status}
            statusLoading={statusLoading}
            onCheckStatus={checkStatus}
          />
        )}
      </div>
    </section>
  )
}

function FlightResultsTable({ flight, origin, destination, status, statusLoading, onCheckStatus }) {
  const originLabel = flight.originCode
    ? `(${flight.originCode}) ${origin}`
    : origin

  const destinationLabel = flight.destinationCode
    ? `(${flight.destinationCode}) ${destination}`
    : destination

  return (
    <div className="border border-cyan-500 rounded-lg overflow-hidden">
      <div className="bg-cyan-600 text-white px-4 py-3 font-semibold text-base flex items-center gap-2 flex-wrap">
        <span>Cheapest Flight Results: {originLabel}</span>
        <Play className="w-4 h-4 shrink-0" fill="currentColor" />
        <span>{destinationLabel}</span>
      </div>

      <div className="bg-cyan-50 px-4 py-2.5 text-sm text-slate-600 border-b border-cyan-200">
        Showing 1 of 1 flight
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-orange-500 border-b border-slate-200">
              <th className="px-4 py-2.5 font-medium">Airline</th>
              <th className="px-4 py-2.5 font-medium">Ident</th>
              <th className="px-4 py-2.5 font-medium">Aircraft</th>
              <th className="px-4 py-2.5 font-medium">Connections</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Departure</th>
              <th className="px-4 py-2.5 font-medium">Arrival</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="px-4 py-3 text-slate-700">
                <div className="flex items-center gap-2">
                  {flight.airlineLogo && (
                    <img src={flight.airlineLogo} alt={flight.airline || "airline logo"} className="w-5 h-5 object-contain" />
                  )}
                  <span>{flight.airline || ""}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-cyan-600 underline">{flight.flightNumber || ""}</td>
              <td className="px-4 py-3 text-slate-700">{flight.aircraft || ""}</td>
              <td className="px-4 py-3 text-slate-700">
                {flight.stops === 0
                  ? "Direct"
                  : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}${
                      flight.stopAirports?.length ? ` via ${flight.stopAirports.join(", ")}` : ""
                    }`}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {status ? (
                  <span>{status}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onCheckStatus(flight.flightNumber, flight.departDate)}
                    disabled={statusLoading || !flight.flightNumber}
                    className="text-cyan-600 underline text-xs disabled:text-slate-300 disabled:no-underline"
                  >
                    {statusLoading ? "Checking..." : "Check status"}
                  </button>
                )}
              </td>
              <td className="px-4 py-3 text-slate-700">{formatDateTime(flight.departDate)}</td>
              <td className="px-4 py-3 text-slate-700">{formatDateTime(flight.returnDate)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end text-sm">
        <span className="text-lg font-bold text-cyan-600">
          {flight.currency} {flight.price}
        </span>
      </div>
    </div>
  )
}