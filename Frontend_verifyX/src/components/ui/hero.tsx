
"use client"
import { useEffect, useRef, useState } from "react"
import { MeshGradient, PulsingBorder } from "@paper-design/shaders-react"
import { motion } from "framer-motion"
import { ShieldCheck, ArrowUpRight, Lock } from "lucide-react"
import Link from "next/link"

export default function ShaderShowcase() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const handleMouseEnter = () => setIsActive(true)
    const handleMouseLeave = () => setIsActive(false)

    const container = containerRef.current
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter)
      container.addEventListener("mouseleave", handleMouseLeave)
    }

    return () => {
      if (container) {
        container.removeEventListener("mouseenter", handleMouseEnter)
        container.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="min-h-screen bg-black relative overflow-hidden flex flex-col">
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
              result="tint"
            />
          </filter>
          <filter id="text-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={["#000000", "#06b6d4", "#0891b2", "#164e63", "#f97316"]}
        speed={0.3}
      />
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-60"
        colors={["#000000", "#ffffff", "#06b6d4", "#f97316"]}
        speed={0.2}
      />

      {/* Fixed Header */}
      <header className="absolute top-0 left-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <motion.div
            className="flex items-center group cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-lg shadow-[0_0_15px_rgba(61,163,255,0.4)]">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <span className="text-white font-bold text-2xl tracking-tight font-headline">VerifyX</span>
            </Link>
          </motion.div>

          <nav className="hidden md:flex items-center gap-10">
            <Link href="/student" className="text-white/70 hover:text-white text-sm font-semibold tracking-wide transition-colors">
              Students
            </Link>
            <Link href="/institution" className="text-white/70 hover:text-white text-sm font-semibold tracking-wide transition-colors">
              Institutions
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/auth">
              <motion.button
                className="px-8 py-3 rounded-full bg-white text-black font-bold text-xs transition-all duration-300 hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
                <ArrowUpRight className="w-3.5 h-3.5" />
              </motion.button>
            </Link>
          </div>
        </div>
      </header>

      {/* Centered Main Content */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 text-center py-32">
        <div className="max-w-4xl mx-auto space-y-10">
          <motion.div
            className="inline-flex items-center px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 mx-auto shadow-2xl"
            style={{ filter: "url(#glass-effect)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="text-white/90 text-sm font-bold tracking-widest flex items-center gap-2 uppercase">
              <Lock className="w-4 h-4 text-cyan-400" />
              Secured by Blockchain Infrastructure
            </span>
          </motion.div>

          <div className="space-y-4">
            <motion.h1
              className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <motion.span
                className="block font-light text-white/90 text-4xl md:text-6xl mb-6 tracking-widest"
                style={{
                  background: "linear-gradient(135deg, #ffffff 0%, #06b6d4 30%, #f97316 70%, #ffffff 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "url(#text-glow)",
                }}
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 8,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                THE TRUST LAYER
              </motion.span>
              <span className="block font-black text-white">Academic</span>
              <span className="block font-light text-white/80 italic">Integrity</span>
            </motion.h1>
          </div>

          <motion.p
            className="text-lg md:text-2xl font-light text-white/70 leading-relaxed max-w-2xl mx-auto px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            VerifyX is the global standard for tamper-proof academic credentials. 
            Universities issue with precision, students own with privacy, 
            and organizations verify with absolute certainty.
          </motion.p>

          <motion.div
            className="flex items-center justify-center gap-8 flex-wrap pt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <Link href="/auth">
              <motion.button
                className="px-12 py-5 rounded-full bg-transparent border-2 border-white/20 text-white font-bold text-sm tracking-widest uppercase transition-all duration-300 hover:bg-white/10 hover:border-cyan-400/50 hover:text-cyan-100 backdrop-blur-md min-w-[220px]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Student Verify
              </motion.button>
            </Link>
            <Link href="/auth">
              <motion.button
                className="px-12 py-5 rounded-full bg-gradient-to-r from-cyan-500 to-orange-500 text-white font-bold text-sm tracking-widest uppercase transition-all duration-300 hover:from-cyan-400 hover:to-orange-400 shadow-[0_0_30px_rgba(6,182,212,0.3)] min-w-[220px]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </main>

      {/* Decorative Rotating Badge */}
      <div className="absolute bottom-12 right-12 z-30 hidden lg:block">
        <div className="relative w-28 h-28 flex items-center justify-center">
          <PulsingBorder
            colors={["#06b6d4", "#0891b2", "#f97316", "#00FF88", "#FFD700", "#FF6B35", "#ffffff"]}
            speed={1.5}
            roundness={1}
            thickness={0.1}
            softness={0.2}
            intensity={5}
            scale={0.65}
            rotation={0}
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
            }}
          />

          <motion.svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            animate={{ rotate: 360 }}
            transition={{
              duration: 25,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            style={{ transform: "scale(1.9)" }}
          >
            <defs>
              <path id="circle" d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
            </defs>
            <text className="text-[5px] fill-white/60 font-black uppercase tracking-[0.2em]">
              <textPath href="#circle" startOffset="0%">
                VerifyX Protocol • Academic Integrity • Blockchain Verified • Trust Distributed •
              </textPath>
            </text>
          </motion.svg>
        </div>
      </div>
    </div>
  )
}
