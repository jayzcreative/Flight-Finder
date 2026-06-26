import { motion } from "framer-motion"
import { Plane, ArrowRight, Bell, Search, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/Navbar"

const features = [
  {
    icon: Search,
    title: "Smart Search",
    description: "Search any route from any city worldwide. We find the cheapest options automatically.",
  },
  {
    icon: Bell,
    title: "Price Alerts",
    description: "Get notified by email the moment a flight drops within your budget.",
  },
  {
    icon: Shield,
    title: "Budget Aware",
    description: "Set your budget and currency. We only alert you when prices actually match.",
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <Navbar />

      {/* Hero */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">

        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0F1E] via-[#0F1A35] to-[#0A0F1E]" />

        {/* Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6"
          >
            <Plane className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">Your personal flight deal finder</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-tight mb-6"
          >
            Stop Overpaying
            <br />
            <span className="text-blue-400">for Flights.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Search any route, set your budget, and get notified the moment prices drop.
            We monitor flights so you don't have to.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-8 text-base font-medium gap-2"
            >
              Search Flights <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 rounded-full px-8 text-base"
            >
              How it Works
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How it Works</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Three simple steps to never overpay for a flight again.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/[0.08] transition-colors"
              >
                <div className="bg-blue-500/10 border border-blue-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-5">
                  <feature.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}