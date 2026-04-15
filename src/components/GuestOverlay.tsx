import { motion } from 'framer-motion';
import {
  BookOpen,
  Briefcase,
  Database,
  FolderOpen,
  LogIn,
  Mic,
  ShieldCheck,
  UserPlus,
  Wrench,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const FEATURES = [
  { icon: FolderOpen, label: "Islamic Finance Directory" },
  { icon: BookOpen, label: "Academy" },
  { icon: Database, label: "Market Data & Datasets" },
  { icon: Mic, label: "Expert Podcasts" },
  { icon: Briefcase, label: "IF Professionals Network" },
  { icon: Wrench, label: "Finance Tools" },
];

const BG_RINGS = [320, 520, 720, 920];

export function GuestOverlay() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden">

      {/* ── Rich layered backdrop ────────────────────────────────────────── */}
      {/* Base gradient: dark red-tinted navy */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0a0a] via-[#1a0a0a] to-[#2d0c0c]" />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: '200px 200px',
        }}
      />

      {/* Glowing epicentre – subtle red orb */}
      <div
        className="absolute rounded-full opacity-25 blur-[120px]"
        style={{
          width: 640,
          height: 640,
          background: 'radial-gradient(circle, #D52B1E 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Animated concentric rings */}
      {BG_RINGS.map((size, i) => (
        <motion.div
          key={size}
          className="absolute rounded-full border border-white/[0.04]"
          style={{ width: size, height: size }}
          animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{
            duration: 6 + i * 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.8,
          }}
        />
      ))}

      {/* ── Main content panel ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-xl mx-4 flex flex-col items-center text-center gap-8"
      >
        {/* Logo */}
        <motion.img
          src="/Logo.svg"
          alt="IEFA"
          className="h-12 brightness-0 invert"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        />

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-[#D52B1E]" />
          <span className="text-xs font-semibold uppercase tracking-widest text-white/60">
            Members Only
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
          className="space-y-3"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Your Gateway to{' '}
            <span className="bg-gradient-to-r from-[#E8453A] to-[#FF6B5B] bg-clip-text text-transparent">
              Islamic Finance
            </span>
          </h1>
          <p className="text-white/50 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            Sign in to unlock exclusive access to tools, data, professionals, and
            resources that power the global Islamic economy.
          </p>
        </motion.div>

        {/* Feature chip grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex flex-wrap justify-center gap-2"
        >
          {FEATURES.map(({ icon: Icon, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.32 + i * 0.07, duration: 0.3 }}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 backdrop-blur-sm"
            >
              <Icon className="h-3.5 w-3.5 text-[#E05A50]" />
              <span className="text-xs font-medium text-white/70">{label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 w-full max-w-sm"
        >
          <Button
            onClick={() => navigate('/login', { state: { from: location.pathname } })}
            className="flex-1 h-12 bg-[#D52B1E] hover:bg-[#B8241B] text-white font-semibold text-sm rounded-xl shadow-lg shadow-red-900/40 transition-all gap-2"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Button>
          <Button
            onClick={() => navigate('/signup')}
            variant="outline"
            className="flex-1 h-12 border-white/15 bg-white/5 text-white/90 hover:bg-white/10 hover:border-white/25 hover:text-white font-semibold text-sm rounded-xl backdrop-blur-sm transition-all gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Create Account
          </Button>
        </motion.div>

        <p className="text-white/25 text-[11px] pb-2">
          Free to join · No credit card required
        </p>
      </motion.div>
    </div>
  );
}
