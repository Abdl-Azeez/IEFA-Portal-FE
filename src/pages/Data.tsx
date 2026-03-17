import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Database,
  TrendingUp,
  BarChart3,
  Shield,
  Coins,
  PieChart,
  BookOpen,
  Lock,
  Landmark,
  Hash,
  Percent,
  Activity,
  DollarSign,
  Users,
  ShoppingBag,
  Award,
  CheckCircle,
  Search,
  X,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

/* ── Animation variants ─────────────────────────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.45 } },
};

/* ── Types ──────────────────────────────────────────────────────────────── */
interface ScopeTag {
  label: string;
  premium: boolean;
}

interface MetricDef {
  name: string;
  scopes: ScopeTag[];
  icon: React.ElementType;
  chartType: 0 | 1 | 2; // 0 = bar, 1 = line, 2 = donut
}

interface SectionDef {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  metrics: MetricDef[];
}

/* ── Scope parser: "Nigeria, Africa {P} & Global {P}" → ScopeTag[] ──────── */
function parseScope(raw: string): ScopeTag[] {
  return raw.split(/,\s*|\s*&\s*/).map((part) => {
    const premium = part.includes("{P}");
    return { label: part.replaceAll("{P}", "").trim(), premium };
  });
}

/* ── Section definitions ────────────────────────────────────────────────── */
const SECTIONS: SectionDef[] = [
  {
    id: "market-overview",
    title: "Market Overview",
    icon: Globe,
    description:
      "This section provides you with a quick snapshot of the Islamic finance ecosystem at national and global levels.",
    metrics: [
      {
        name: "Total Islamic Finance Assets",
        scopes: parseScope("Nigeria, Africa & Global {P}"),
        icon: DollarSign,
        chartType: 1,
      },
      {
        name: "Growth Rate",
        scopes: parseScope("Nigeria, Africa & Global {P}"),
        icon: TrendingUp,
        chartType: 1,
      },
      {
        name: "Market Share vs Conventional Finance",
        scopes: parseScope("Nigeria, Africa & Global {P}"),
        icon: PieChart,
        chartType: 2,
      },
      {
        name: "Number of Islamic Financial Institutions",
        scopes: parseScope("Nigeria, Africa & Global {P}"),
        icon: Landmark,
        chartType: 0,
      },
      {
        name: "Sukuk Outstanding Value",
        scopes: parseScope("Nigeria, Africa & Global {P}"),
        icon: BarChart3,
        chartType: 0,
      },
      {
        name: "Takaful Contributions",
        scopes: parseScope("Nigeria, Africa {P} & Global {P}"),
        icon: Shield,
        chartType: 0,
      },
      {
        name: "Islamic FinTech Count",
        scopes: parseScope("Nigeria, Africa {P} & Global {P}"),
        icon: Hash,
        chartType: 1,
      },
    ],
  },
  {
    id: "islamic-banking",
    title: "Islamic Banking",
    icon: Database,
    description:
      "Track performance of full-fledged Islamic banks and Islamic banking windows.",
    metrics: [
      {
        name: "Total Islamic Banking Assets",
        scopes: parseScope("Nigeria"),
        icon: DollarSign,
        chartType: 1,
      },
      {
        name: "Total Deposits & Financing",
        scopes: parseScope("Nigeria"),
        icon: BarChart3,
        chartType: 0,
      },
      {
        name: "Non-Performing Financing Ratio",
        scopes: parseScope("Nigeria"),
        icon: Percent,
        chartType: 1,
      },
      {
        name: "Number of Licensed Banks",
        scopes: parseScope("Nigeria"),
        icon: Hash,
        chartType: 0,
      },
      {
        name: "Islamic Banking Assets by Country",
        scopes: parseScope("Africa"),
        icon: Globe,
        chartType: 0,
      },
      {
        name: "Capital Adequacy & Liquidity Ratios",
        scopes: parseScope("Africa"),
        icon: Activity,
        chartType: 1,
      },
      {
        name: "Number of Islamic Financial Institutions",
        scopes: parseScope("Global {P}"),
        icon: Landmark,
        chartType: 2,
      },
    ],
  },
  {
    id: "sukuk-market",
    title: "Sukuk Market",
    icon: TrendingUp,
    description:
      "Monitor sovereign and corporate Sukuk issuance and performance.",
    metrics: [
      {
        name: "Sovereign Sukuk Outstanding Value",
        scopes: parseScope("Nigeria"),
        icon: DollarSign,
        chartType: 0,
      },
      {
        name: "Sukuk Issuance Trend",
        scopes: parseScope("Nigeria"),
        icon: TrendingUp,
        chartType: 1,
      },
      {
        name: "Sukuk Outstanding Value",
        scopes: parseScope("Africa"),
        icon: BarChart3,
        chartType: 0,
      },
      {
        name: "Sukuk Issuance by Country",
        scopes: parseScope("Global {P}"),
        icon: Globe,
        chartType: 0,
      },
      {
        name: "Sector Allocation / Maturity",
        scopes: parseScope("Global {P}"),
        icon: PieChart,
        chartType: 2,
      },
    ],
  },
  {
    id: "islamic-capital-market",
    title: "Islamic Capital Market",
    icon: BarChart3,
    description: "Track Shariah-compliant equities, indices, and funds.",
    metrics: [
      {
        name: "Shariah-Compliant Stocks Count",
        scopes: parseScope("Global {P}"),
        icon: Hash,
        chartType: 0,
      },
      {
        name: "Compliance Status of Stocks",
        scopes: parseScope("Global {P}"),
        icon: CheckCircle,
        chartType: 2,
      },
      {
        name: "Stock Prices & Historical Data",
        scopes: parseScope("Global {P}"),
        icon: TrendingUp,
        chartType: 1,
      },
    ],
  },
  {
    id: "takaful",
    title: "Takaful (Insurance)",
    icon: Shield,
    description: "Track the development of Islamic insurance markets.",
    metrics: [
      {
        name: "Total Contributions",
        scopes: parseScope("Nigeria"),
        icon: DollarSign,
        chartType: 1,
      },
      {
        name: "Claims Paid / Ratio",
        scopes: parseScope("Nigeria"),
        icon: Percent,
        chartType: 1,
      },
      {
        name: "Market Share by Operator",
        scopes: parseScope("Nigeria"),
        icon: PieChart,
        chartType: 2,
      },
    ],
  },
  {
    id: "islamic-microfinance",
    title: "Islamic Micro-Finance",
    icon: Coins,
    description: "Track access to Shariah-compliant micro financial services.",
    metrics: [
      {
        name: "Non-interest Microfinance Banks",
        scopes: parseScope("Nigeria"),
        icon: Landmark,
        chartType: 0,
      },
      {
        name: "Financial Inclusion Rate",
        scopes: parseScope("Nigeria"),
        icon: Users,
        chartType: 1,
      },
      {
        name: "Islamic Microfinance Institutions",
        scopes: parseScope("Africa"),
        icon: Globe,
        chartType: 0,
      },
      {
        name: "Islamic Microfinance Market",
        scopes: parseScope("Global"),
        icon: BarChart3,
        chartType: 0,
      },
    ],
  },
  {
    id: "halal-economy",
    title: "Halal Economy",
    icon: ShoppingBag,
    description: "Track industries linked to Islamic finance.",
    metrics: [
      {
        name: "Halal Food Market",
        scopes: parseScope("Global"),
        icon: ShoppingBag,
        chartType: 0,
      },
      {
        name: "Halal Pharmaceutical Market",
        scopes: parseScope("Global"),
        icon: Activity,
        chartType: 1,
      },
      {
        name: "Halal Economy Market",
        scopes: parseScope("Africa"),
        icon: Globe,
        chartType: 2,
      },
    ],
  },
  {
    id: "research-insights",
    title: "Research & Insights",
    icon: BookOpen,
    description: "Track research and insights linked to Islamic finance.",
    metrics: [
      {
        name: "Global Islamic Finance Assets",
        scopes: parseScope("Global"),
        icon: BarChart3,
        chartType: 1,
      },
      {
        name: "Islamic Finance Country Rankings",
        scopes: parseScope("Global"),
        icon: Award,
        chartType: 0,
      },
    ],
  },
];

/* ── Chart placeholders ─────────────────────────────────────────────────── */
function BarChartPlaceholder({ color }: Readonly<{ color: string }>) {
  const heights = [38, 62, 50, 80, 55, 88, 70, 45, 75, 60];
  return (
    <div className="flex items-end gap-[3px] h-full w-full">
      {heights.map((h, idx) => (
        <div
          key={`bar-${h}`}
          className="flex-1 rounded-t-[3px] transition-all duration-500 group-hover:opacity-90"
          style={{
            height: `${h}%`,
            background: `linear-gradient(to top, ${color}40, ${color}15)`,
            transitionDelay: `${idx * 30}ms`,
          }}
        />
      ))}
    </div>
  );
}

function LineChartPlaceholder({ color }: Readonly<{ color: string }>) {
  const gradId = `lg-${color.replaceAll("#", "")}`;
  return (
    <svg
      className="w-full h-full"
      viewBox="0 0 160 64"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path
        d="M0,52 C12,48 24,38 36,42 C48,46 56,18 72,22 C88,26 96,12 112,15 C128,18 140,8 160,4"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
      <path
        d="M0,52 C12,48 24,38 36,42 C48,46 56,18 72,22 C88,26 96,12 112,15 C128,18 140,8 160,4 L160,64 L0,64Z"
        fill={`url(#${gradId})`}
      />
      <circle cx="160" cy="4" r="3" fill={color} opacity="0.7" />
    </svg>
  );
}

function DonutChartPlaceholder({ color }: Readonly<{ color: string }>) {
  return (
    <div className="flex justify-center items-center h-full">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle
          cx="36"
          cy="36"
          r="26"
          fill="none"
          stroke="#f3f4f6"
          strokeWidth="7"
        />
        <circle
          cx="36"
          cy="36"
          r="26"
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeDasharray="95 68"
          strokeDashoffset="12"
          strokeLinecap="round"
          opacity="0.55"
        />
        <circle
          cx="36"
          cy="36"
          r="26"
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeDasharray="32 131"
          strokeDashoffset="-83"
          strokeLinecap="round"
          opacity="0.28"
        />
        <text
          x="36"
          y="38"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={color}
          opacity="0.65"
        >
          —
        </text>
      </svg>
    </div>
  );
}

/* ── Scope styles ────────────────────────────────────────────────────────── */
const SCOPE_STYLES: Record<
  string,
  { bg: string; text: string; border: string; dot: string }
> = {
  Nigeria: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
  },
  Africa: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-400",
  },
  Global: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    dot: "bg-violet-400",
  },
};

const CHART_COLORS = [
  "#D52B1E",
  "#0891b2",
  "#7c3aed",
  "#059669",
  "#d97706",
  "#dc2626",
  "#2563eb",
  "#9333ea",
  "#047857",
  "#b45309",
];

const CHART_TYPE_LABELS: Record<number, string> = {
  0: "Distribution",
  1: "Trend",
  2: "Composition",
};

const SCOPE_DOT_COLORS: Record<string, string> = {
  Nigeria: "#10b981",
  Africa: "#3b82f6",
  Global: "#8b5cf6",
};

/* ── Metric card ─────────────────────────────────────────────────────────── */
function MetricCard({
  metric,
  index,
  sectionColor,
}: Readonly<{ metric: MetricDef; index: number; sectionColor: string }>) {
  const anyPremium = metric.scopes.some((s) => s.premium);
  const allPremium = metric.scopes.every((s) => s.premium);
  const IconComp = metric.icon;
  const chartColor = anyPremium ? "#d97706" : sectionColor;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.07,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={`group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col ${
        anyPremium
          ? "bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40 border border-amber-200/60 hover:shadow-[0_8px_30px_-8px_rgba(217,119,6,0.18)] hover:border-amber-300/80"
          : "bg-white border border-gray-200/80 hover:shadow-[0_8px_30px_-8px_rgba(213,43,30,0.12)] hover:border-gray-300"
      }`}
    >
      {/* Background decorative elements */}
      <div
        className="pointer-events-none absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500"
        style={{ backgroundColor: chartColor }}
      />
      <div
        className="pointer-events-none absolute -bottom-6 -left-6 w-20 h-20 rounded-full opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500"
        style={{ backgroundColor: chartColor }}
      />

      {/* ── Top section: icon badge + metric name ── */}
      <div className="relative px-5 pt-5 pb-3 flex items-start gap-3">
        {/* Floating icon with glow */}
        <div className="relative">
          <div
            className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-105"
            style={{
              background: anyPremium
                ? "linear-gradient(135deg, #fef3c7, #fde68a)"
                : `linear-gradient(135deg, ${chartColor}15, ${chartColor}25)`,
            }}
          >
            <IconComp
              className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
              style={{ color: anyPremium ? "#b45309" : chartColor }}
            />
          </div>
          {/* Live pulse dot */}
          <span
            className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white"
            style={{
              backgroundColor: anyPremium ? "#f59e0b" : "#22c55e",
            }}
          />
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          <h3 className="text-[13px] font-bold text-gray-800 leading-tight line-clamp-2">
            {metric.name}
          </h3>
          {/* Scope mini-tags inline */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {metric.scopes.map((scope) => {
              const style = SCOPE_STYLES[scope.label] || SCOPE_STYLES.Global;
              return (
                <span
                  key={scope.label}
                  className={`inline-flex items-center gap-1 text-[9px] font-semibold tracking-wide uppercase px-1.5 py-[1px] rounded-md border ${
                    scope.premium
                      ? "bg-amber-50 text-amber-600 border-amber-200/80"
                      : `${style.bg} ${style.text} ${style.border}`
                  }`}
                >
                  {scope.premium ? (
                    <Lock className="w-[7px] h-[7px]" />
                  ) : (
                    <span className={`w-1 h-1 rounded-full ${style.dot}`} />
                  )}
                  {scope.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Premium / Free indicator */}
        {allPremium && (
          <span className="absolute top-3 right-3 flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] font-bold uppercase tracking-wider px-2 py-[3px] rounded-full shadow-sm">
            <Lock className="w-2 h-2" /> Pro
          </span>
        )}
      </div>

      {/* ── Chart area ── */}
      <div className="relative px-5 pb-1 flex-1 min-h-[80px]">
        <div className="h-[72px] relative">
          {metric.chartType === 0 && <BarChartPlaceholder color={chartColor} />}
          {metric.chartType === 1 && (
            <LineChartPlaceholder color={chartColor} />
          )}
          {metric.chartType === 2 && (
            <DonutChartPlaceholder color={chartColor} />
          )}

          {/* Glass overlay with status */}
          <div className="absolute inset-0 rounded-lg flex items-center justify-center bg-white/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {anyPremium && (
              <span className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-3.5 py-1.5 rounded-full shadow-lg">
                <Lock className="w-3 h-3" /> Unlock with Premium
              </span>
            )}
            {!anyPremium && (
              <span className="flex items-center gap-1.5 bg-gray-900 text-white text-[10px] font-bold px-3.5 py-1.5 rounded-full shadow-lg">
                <Activity className="w-3 h-3" /> Coming Soon
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom bar: type label + visual indicator ── */}
      <div className="px-5 pb-4 pt-2 flex items-center justify-between">
        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
          {CHART_TYPE_LABELS[metric.chartType]}
        </span>
        <div className="flex items-center gap-1">
          {metric.scopes.map((scope) => {
            const dotColor = scope.premium
              ? "#f59e0b"
              : SCOPE_DOT_COLORS[scope.label] || "#8b5cf6";
            return (
              <span
                key={scope.label}
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: dotColor }}
              />
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function Data() {
  const [activeTab, setActiveTab] = useState(SECTIONS[0].id);
  const [search, setSearch] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Global search across all sections
  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    return SECTIONS.map((section) => ({
      section,
      matches: section.metrics.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          section.title.toLowerCase().includes(q) ||
          m.scopes.some((s) => s.label.toLowerCase().includes(q)),
      ),
    })).filter((r) => r.matches.length > 0);
  }, [search]);

  const totalMatches = searchResults
    ? searchResults.reduce((sum, r) => sum + r.matches.length, 0)
    : 0;

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* ── Hero Banner ─────────────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-950 via-[#1c0505] to-gray-900 p-8 md:p-12 min-h-[220px] flex items-center">
          <div className="pointer-events-none absolute -top-16 -right-16 h-72 w-72 rounded-full bg-[#D52B1E]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-[#D52B1E]/10 blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8 w-full">
            <div className="flex-1 space-y-4">
              <span className="inline-flex items-center gap-1.5 bg-[#D52B1E]/20 text-[#D52B1E] text-xs font-bold px-3 py-1.5 rounded-full border border-[#D52B1E]/30 tracking-widest uppercase">
                <Database className="h-3 w-3" /> IEFA Data
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                Explore the{" "}
                <span className="text-[#D52B1E]">Islamic Finance</span>{" "}
                ecosystem in numbers
              </h1>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl">
                Comprehensive and structured data views tracking the Islamic
                finance ecosystem at national and global levels. Choose a
                category below to explore the latest metrics, dashboards, and
                reports.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />{" "}
                  {"Nigeria"}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />{" "}
                  {"Africa"}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-violet-400" />{" "}
                  {"Global"}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-amber-500">
                  <Lock className="w-3 h-3" /> {"Premium"}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex md:flex-col gap-3 shrink-0">
              <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-center">
                <p className="text-2xl font-bold text-white">8</p>
                <p className="text-xs text-gray-500">Sections</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-center">
                <p className="text-2xl font-bold text-[#D52B1E]">34</p>
                <p className="text-xs text-gray-500">Metrics</p>
              </div>
            </div>
          </div>

          {/* Watermark */}
          <div className="pointer-events-none absolute right-8 bottom-4 opacity-5 text-white select-none hidden md:block">
            <BarChart3 className="h-52 w-52" />
          </div>
        </div>
      </motion.div>

      {/* ── Search Bar ───────────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Search across all data categories — e.g. Sukuk, Nigeria, FinTech…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-10 h-11 rounded-xl border-gray-200 bg-white shadow-sm focus-visible:ring-[#D52B1E]/30 text-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </motion.div>

      {/* ── Search Results (cross-section) ──────────────────────────── */}
      {searchResults ? (
        <motion.div
          variants={itemVariants}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Results header */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#737692]">
              <span className="font-semibold text-gray-800">
                {totalMatches}
              </span>{" "}
              {totalMatches === 1 ? "metric" : "metrics"} found across{" "}
              <span className="font-semibold text-gray-800">
                {searchResults.length}
              </span>{" "}
              {searchResults.length === 1 ? "category" : "categories"}
            </p>
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-xs text-[#D52B1E] hover:text-[#B8241B] font-medium transition-colors"
            >
              Clear search
            </button>
          </div>

          {searchResults.length === 0 && (
            <div className="text-center py-16">
              <Search className="h-12 w-12 mx-auto mb-3 text-gray-200" />
              <p className="text-[#737692] text-sm">No metrics found.</p>
              <p className="text-xs text-gray-400 mt-1">
                Try a different keyword like &ldquo;Sukuk&rdquo;,
                &ldquo;Nigeria&rdquo;, or &ldquo;FinTech&rdquo;.
              </p>
            </div>
          )}

          {/* Grouped results */}
          {searchResults.map(({ section, matches }) => {
            const SectionIcon = section.icon;
            const sectionColor =
              CHART_COLORS[SECTIONS.indexOf(section) % CHART_COLORS.length];
            return (
              <div key={section.id}>
                {/* Section header */}
                <div className="flex items-center gap-2.5 mb-4">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${sectionColor}15` }}
                  >
                    <SectionIcon
                      className="h-4 w-4"
                      style={{ color: sectionColor }}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">
                      {section.title}
                    </h3>
                    <p className="text-[11px] text-[#737692]">
                      {matches.length} of {section.metrics.length} metrics
                    </p>
                  </div>
                </div>

                {/* Matched metric cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {matches.map((metric, idx) => (
                    <MetricCard
                      key={metric.name}
                      metric={metric}
                      index={idx}
                      sectionColor={sectionColor}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </motion.div>
      ) : (
        /* ── Tab Navigation (default, no search) ────────────────────── */
        <motion.div variants={itemVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Arrow-shaped tabs — matches Resources page */}
            <TabsList className="flex flex-nowrap overflow-x-auto scrollbar-hide w-full justify-start bg-transparent border-0 rounded-none p-0 h-auto shadow-none">
              {SECTIONS.map((section, idx) => {
                const Icon = section.icon;
                return (
                  <TabsTrigger
                    key={section.id}
                    value={section.id}
                    className="group relative flex items-center gap-1.5 bg-gray-100 data-[state=active]:bg-[#D52B1E] text-gray-600 data-[state=active]:text-white pl-6 pr-10 py-3 text-sm font-medium rounded-none shadow-none transition-colors duration-200 border-0 shrink-0 whitespace-nowrap"
                    style={{
                      marginLeft: idx === 0 ? 0 : -18,
                      clipPath:
                        idx === 0
                          ? "polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 100%)"
                          : "polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 100%, 18px 50%)",
                      zIndex: SECTIONS.length - idx,
                    }}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="hidden sm:inline">{section.title}</span>
                    <span className="hidden sm:inline shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-black/15 group-data-[state=active]:bg-white/20 tabular-nums">
                      {section.metrics.length}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* ── Tab Content ──────────────────────────────────────────── */}
            {SECTIONS.map((section) => (
              <TabsContent key={section.id} value={section.id} className="mt-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Section description */}
                    <div className="bg-gradient-to-r from-[#D52B1E]/5 via-[#D52B1E]/3 to-transparent rounded-xl p-4 mb-6 border-l-4 border-[#D52B1E]">
                      <p className="text-sm text-[#737692]">
                        {section.description}
                      </p>
                    </div>

                    {/* Metrics grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {section.metrics.map((metric, idx) => (
                        <MetricCard
                          key={metric.name}
                          metric={metric}
                          index={idx}
                          sectionColor={
                            CHART_COLORS[
                              SECTIONS.indexOf(section) % CHART_COLORS.length
                            ]
                          }
                        />
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      )}
    </motion.div>
  );
}
