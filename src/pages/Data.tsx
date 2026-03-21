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
  Search,
  X,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Eye,
  CreditCard,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useDatasets, useDatasetCategories, type Dataset } from "@/hooks/useDatasets";

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
type Geography = string;
type VisualizationType = string;

interface MetricRow {
  name: string;
  geography: string;
  value: string;
  year: string;
  sourceType: string;
  visualization: string;
  premium: boolean;
}

interface SectionDef {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  metrics: MetricRow[];
}

/* ── Section definitions ────────────────────────────────────────────────── */
const SECTIONS: SectionDef[] = [
  {
    id: "market-overview",
    title: "Market Overview",
    icon: Globe,
    description:
      "A quick snapshot of the Islamic finance ecosystem at national, continental, and global levels.",
    metrics: [
      { name: "Total Islamic Finance Assets", geography: "Nigeria", value: "—", year: "2024", sourceType: "Regulatory", visualization: "KPI card", premium: false },
      { name: "Total Islamic Finance Assets", geography: "Africa", value: "—", year: "2023", sourceType: "Regulatory", visualization: "Bar chart", premium: false },
      { name: "Total Islamic Finance Assets", geography: "Global", value: "—", year: "2023", sourceType: "Paid database", visualization: "Heat map", premium: true },
      { name: "Growth Rate (YoY)", geography: "Nigeria", value: "—", year: "2023–2024", sourceType: "Regulatory", visualization: "Line chart", premium: false },
      { name: "Growth Rate (YoY)", geography: "Africa", value: "—", year: "2023", sourceType: "Regulatory", visualization: "Line chart", premium: false },
      { name: "Growth Rate (YoY)", geography: "Global", value: "—", year: "2023", sourceType: "Paid database", visualization: "Line chart", premium: true },
      { name: "Market Share vs Conventional Finance", geography: "Nigeria", value: "—", year: "2023", sourceType: "Regulatory", visualization: "Stacked bar", premium: false },
      { name: "Market Share vs Conventional Finance", geography: "Africa", value: "—", year: "2023", sourceType: "Regulatory", visualization: "Stacked bar", premium: false },
      { name: "Market Share vs Conventional Finance", geography: "Global", value: "—", year: "2023", sourceType: "Paid database", visualization: "Stacked bar", premium: true },
      { name: "Number of Islamic Financial Institutions", geography: "Nigeria", value: "—", year: "2024", sourceType: "Regulatory", visualization: "KPI card", premium: false },
      { name: "Number of Islamic Financial Institutions", geography: "Africa", value: "—", year: "2023", sourceType: "Regulatory", visualization: "Bubble chart", premium: false },
      { name: "Number of Islamic Financial Institutions", geography: "Global", value: "—", year: "2023", sourceType: "Paid database", visualization: "Bubble chart", premium: true },
      { name: "Sukuk Outstanding Value", geography: "Nigeria", value: "—", year: "2017–2024", sourceType: "Regulatory", visualization: "Line chart", premium: false },
      { name: "Sukuk Outstanding Value", geography: "Africa", value: "—", year: "2023", sourceType: "Reports", visualization: "Stacked bar", premium: false },
      { name: "Sukuk Outstanding Value", geography: "Global", value: "—", year: "2023", sourceType: "Paid database", visualization: "Heat map", premium: true },
      { name: "Takaful Contributions", geography: "Nigeria", value: "—", year: "2023", sourceType: "Regulatory", visualization: "Stacked bar", premium: false },
      { name: "Takaful Contributions", geography: "Africa", value: "—", year: "2023", sourceType: "Paid database", visualization: "Line chart", premium: true },
      { name: "Takaful Contributions", geography: "Global", value: "—", year: "2023", sourceType: "Paid database", visualization: "Bar chart", premium: true },
      { name: "Islamic FinTech Count", geography: "Nigeria", value: "—", year: "2024", sourceType: "Research", visualization: "KPI card", premium: false },
      { name: "Islamic FinTech Count", geography: "Africa", value: "—", year: "2024", sourceType: "Research", visualization: "Bar chart", premium: true },
      { name: "Islamic FinTech Count", geography: "Global", value: "—", year: "2024", sourceType: "Research", visualization: "Bar chart", premium: true },
    ],
  },
  {
    id: "islamic-banking",
    title: "Islamic Banking",
    icon: Database,
    description:
      "Track performance of full-fledged Islamic banks and Islamic banking windows.",
    metrics: [
      { name: "Total Islamic Banking Assets", geography: "Nigeria", value: "—", year: "2023", sourceType: "Regulatory", visualization: "Line chart", premium: false },
      { name: "Total Deposits & Financing", geography: "Nigeria", value: "—", year: "2023", sourceType: "Regulatory", visualization: "Stacked bar", premium: false },
      { name: "Non-Performing Financing Ratio", geography: "Nigeria", value: "—", year: "2023", sourceType: "Regulatory", visualization: "Gauge", premium: false },
      { name: "Number of Licensed Banks", geography: "Nigeria", value: "—", year: "2024", sourceType: "Regulatory", visualization: "KPI card", premium: false },
      { name: "Islamic Banking Assets by Country", geography: "Africa", value: "—", year: "2023", sourceType: "Regulatory", visualization: "Heat map", premium: false },
      { name: "Capital Adequacy & Liquidity Ratios", geography: "Africa", value: "—", year: "2023", sourceType: "Regulatory", visualization: "Line chart", premium: false },
      { name: "Number of Islamic Financial Institutions", geography: "Global", value: "—", year: "2023", sourceType: "Paid database", visualization: "Bubble chart", premium: true },
    ],
  },
  {
    id: "sukuk-market",
    title: "Sukuk Market",
    icon: TrendingUp,
    description:
      "Monitor sovereign and corporate Sukuk issuance and performance.",
    metrics: [
      { name: "Sovereign Sukuk Outstanding Value", geography: "Nigeria", value: "—", year: "2017–2024", sourceType: "Regulatory", visualization: "Line chart", premium: false },
      { name: "Sukuk Issuance Trend", geography: "Nigeria", value: "—", year: "2023", sourceType: "Regulatory", visualization: "Area chart", premium: false },
      { name: "Sukuk Outstanding Value", geography: "Africa", value: "—", year: "2023", sourceType: "Reports", visualization: "Stacked bar", premium: false },
      { name: "Sukuk Issuance by Country", geography: "Global", value: "—", year: "2023", sourceType: "Paid database", visualization: "Bar chart", premium: true },
      { name: "Sector Allocation / Maturity", geography: "Global", value: "—", year: "2023", sourceType: "Paid database", visualization: "Pie chart", premium: true },
    ],
  },
  {
    id: "takaful",
    title: "Takaful (Insurance)",
    icon: Shield,
    description: "Track the development of Islamic insurance markets.",
    metrics: [
      { name: "Total Contributions", geography: "Nigeria", value: "—", year: "2023", sourceType: "Regulatory", visualization: "Stacked bar", premium: false },
      { name: "Claims Paid / Ratio", geography: "Nigeria", value: "—", year: "2023", sourceType: "Regulatory", visualization: "Gauge", premium: false },
      { name: "Market Share by Operator", geography: "Nigeria", value: "—", year: "2023", sourceType: "Regulatory", visualization: "Pie chart", premium: false },
    ],
  },
  {
    id: "islamic-microfinance",
    title: "Islamic Micro-Finance",
    icon: Coins,
    description: "Track access to Shariah-compliant micro financial services.",
    metrics: [
      { name: "Non-interest Microfinance Banks", geography: "Nigeria", value: "—", year: "2025", sourceType: "Regulatory", visualization: "Map", premium: false },
      { name: "Financial Inclusion Rate", geography: "Nigeria", value: "—", year: "2023", sourceType: "Regulatory", visualization: "Line chart", premium: false },
      { name: "Islamic Microfinance Institutions", geography: "Africa", value: "—", year: "2023", sourceType: "Regulatory", visualization: "Bar chart", premium: false },
      { name: "Islamic Microfinance Market", geography: "Global", value: "—", year: "2022", sourceType: "Research", visualization: "KPI card", premium: false },
    ],
  },
  {
    id: "islamic-capital-market",
    title: "Islamic Capital Market",
    icon: BarChart3,
    description: "Track Shariah-compliant equities, indices, and funds.",
    metrics: [
      { name: "Shariah-Compliant Stocks Count", geography: "Global", value: "—", year: "2024", sourceType: "API", visualization: "Bar chart", premium: true },
      { name: "Compliance Status of Stocks", geography: "Global", value: "—", year: "2024", sourceType: "API", visualization: "Table", premium: true },
      { name: "Stock Prices & Historical Data", geography: "Global", value: "—", year: "2024", sourceType: "API", visualization: "Line chart", premium: true },
    ],
  },
  {
    id: "halal-economy",
    title: "Halal Economy",
    icon: ShoppingBag,
    description: "Track industries linked to Islamic finance and the broader halal economy.",
    metrics: [
      { name: "Global Halal Economy Size", geography: "Global", value: "—", year: "2023", sourceType: "Research", visualization: "KPI card", premium: false },
      { name: "Halal Food Market", geography: "Global", value: "—", year: "2023", sourceType: "Research", visualization: "Pie chart", premium: false },
      { name: "Halal Pharmaceutical Market", geography: "Global", value: "—", year: "2023", sourceType: "Research", visualization: "Bar chart", premium: false },
      { name: "Halal Economy Market", geography: "Africa", value: "—", year: "2023", sourceType: "Research", visualization: "Map", premium: false },
    ],
  },
  {
    id: "research-insights",
    title: "Research & Insights",
    icon: BookOpen,
    description: "Research indicators, country rankings, and policy insights.",
    metrics: [
      { name: "Islamic Finance Development Indicator Score", geography: "Global", value: "—", year: "2023", sourceType: "Paid database", visualization: "Ranking table", premium: true },
      { name: "Global Islamic Finance Assets", geography: "Global", value: "—", year: "2023", sourceType: "Regulatory", visualization: "Trend line", premium: false },
      { name: "Islamic Finance Country Rankings", geography: "Global", value: "—", year: "2023", sourceType: "Paid database", visualization: "Leaderboard", premium: true },
    ],
  },
];

/* ── Geography badge styles ──────────────────────────────────────────────── */
const GEO_STYLES: Record<string, { bg: string; text: string; dot: string; flag: string }> = {
  Nigeria: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-400", flag: "🇳🇬" },
  Africa:  { bg: "bg-blue-50 border-blue-200",    text: "text-blue-700",    dot: "bg-blue-400",    flag: "🌍" },
  Global:  { bg: "bg-violet-50 border-violet-200",  text: "text-violet-700",  dot: "bg-violet-400",  flag: "🌐" },
};

const VIZ_ICONS: Record<string, React.ElementType> = {
  "KPI card": BarChart3,
  "Line chart": TrendingUp,
  "Bar chart": BarChart3,
  "Stacked bar": BarChart3,
  "Pie chart": PieChart,
  "Gauge": PieChart,
  "Map": Globe,
  "Bubble chart": Globe,
  "Heat map": Globe,
  "Ranking table": BarChart3,
  "Trend line": TrendingUp,
  "Leaderboard": BarChart3,
  "Area chart": TrendingUp,
  "Timeline chart": TrendingUp,
  "Table": BarChart3,
};

/* ── Visualization preview placeholders ───────────────────────────────────── */
function PreviewBarChart() {
  const data = [
    { label: "2019", value: 35 },
    { label: "2020", value: 48 },
    { label: "2021", value: 55 },
    { label: "2022", value: 68 },
    { label: "2023", value: 82 },
    { label: "2024", value: 90 },
  ];
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="space-y-2">
      <div className="flex items-end gap-3 h-40">
        {data.map((d) => (
          <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-[#D52B1E] to-[#D52B1E]/60 transition-all duration-500"
              style={{ height: `${(d.value / max) * 100}%` }}
            />
            <span className="text-[10px] text-gray-400">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewLineChart() {
  return (
    <svg className="w-full h-40" viewBox="0 0 300 120" preserveAspectRatio="none">
      <defs>
        <linearGradient id="preview-line-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D52B1E" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#D52B1E" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path
        d="M0,100 C30,90 50,70 80,75 C110,80 130,35 160,40 C190,45 210,20 240,25 C270,30 290,10 300,5"
        fill="none" stroke="#D52B1E" strokeWidth="2.5" strokeLinecap="round"
      />
      <path
        d="M0,100 C30,90 50,70 80,75 C110,80 130,35 160,40 C190,45 210,20 240,25 C270,30 290,10 300,5 L300,120 L0,120Z"
        fill="url(#preview-line-grad)"
      />
      {[[0, 100], [80, 75], [160, 40], [240, 25], [300, 5]].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" fill="#D52B1E" opacity="0.7" />
      ))}
    </svg>
  );
}

function PreviewPieChart() {
  const segments = [
    { pct: 45, color: "#D52B1E", label: "Segment A" },
    { pct: 25, color: "#0891b2", label: "Segment B" },
    { pct: 18, color: "#7c3aed", label: "Segment C" },
    { pct: 12, color: "#059669", label: "Segment D" },
  ];
  let cumulative = 0;
  return (
    <div className="flex items-center gap-6">
      <svg width="140" height="140" viewBox="0 0 140 140">
        {segments.map((seg) => {
          const start = cumulative;
          cumulative += seg.pct;
          const startAngle = (start / 100) * 360 - 90;
          const endAngle = (cumulative / 100) * 360 - 90;
          const largeArc = seg.pct > 50 ? 1 : 0;
          const r = 55;
          const cx = 70, cy = 70;
          const x1 = cx + r * Math.cos((startAngle * Math.PI) / 180);
          const y1 = cy + r * Math.sin((startAngle * Math.PI) / 180);
          const x2 = cx + r * Math.cos((endAngle * Math.PI) / 180);
          const y2 = cy + r * Math.sin((endAngle * Math.PI) / 180);
          return (
            <path
              key={seg.label}
              d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`}
              fill={seg.color} opacity="0.75"
            />
          );
        })}
        <circle cx="70" cy="70" r="30" fill="white" />
      </svg>
      <div className="space-y-1.5">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2 text-xs text-gray-600">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
            {seg.label} ({seg.pct}%)
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewStackedBar() {
  const rows = [
    { label: "2021", a: 60, b: 40 },
    { label: "2022", a: 55, b: 45 },
    { label: "2023", a: 48, b: 52 },
    { label: "2024", a: 42, b: 58 },
  ];
  return (
    <div className="space-y-2.5">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 w-8 text-right shrink-0">{r.label}</span>
          <div className="flex-1 flex h-6 rounded-md overflow-hidden">
            <div className="bg-[#D52B1E]/70 transition-all" style={{ width: `${r.a}%` }} />
            <div className="bg-blue-400/70 transition-all" style={{ width: `${r.b}%` }} />
          </div>
        </div>
      ))}
      <div className="flex items-center gap-4 pt-1">
        <span className="flex items-center gap-1.5 text-[10px] text-gray-500"><span className="w-2 h-2 rounded-sm bg-[#D52B1E]/70" /> Conventional</span>
        <span className="flex items-center gap-1.5 text-[10px] text-gray-500"><span className="w-2 h-2 rounded-sm bg-blue-400/70" /> Islamic</span>
      </div>
    </div>
  );
}

function PreviewKPI() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {[
        { label: "Total Value", value: "—", sub: "Awaiting data" },
        { label: "YoY Growth", value: "—", sub: "Awaiting data" },
        { label: "Market Share", value: "—", sub: "Awaiting data" },
        { label: "Institutions", value: "—", sub: "Awaiting data" },
      ].map((kpi) => (
        <div key={kpi.label} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
          <p className="text-2xl font-bold text-gray-300">{kpi.value}</p>
          <p className="text-xs font-medium text-gray-700 mt-1">{kpi.label}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{kpi.sub}</p>
        </div>
      ))}
    </div>
  );
}

function PreviewMap() {
  return (
    <div className="flex flex-col items-center justify-center h-40 bg-gray-50 rounded-xl border border-gray-100">
      <Globe className="h-12 w-12 text-gray-200 mb-2" />
      <p className="text-sm text-gray-400 font-medium">Interactive Map</p>
      <p className="text-[10px] text-gray-300 mt-0.5">Geographic data visualization</p>
    </div>
  );
}

function PreviewGauge() {
  return (
    <div className="flex justify-center items-center py-4">
      <svg width="180" height="100" viewBox="0 0 180 100">
        <path d="M20,90 A70,70 0 0,1 160,90" fill="none" stroke="#f3f4f6" strokeWidth="14" strokeLinecap="round" />
        <path d="M20,90 A70,70 0 0,1 110,23" fill="none" stroke="#D52B1E" strokeWidth="14" strokeLinecap="round" opacity="0.6" />
        <text x="90" y="80" textAnchor="middle" fontSize="20" fontWeight="700" fill="#374151">—</text>
        <text x="90" y="95" textAnchor="middle" fontSize="9" fill="#9ca3af">Awaiting data</text>
      </svg>
    </div>
  );
}

function PreviewTable() {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full text-xs">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left text-gray-500 font-semibold">Rank</th>
            <th className="px-3 py-2 text-left text-gray-500 font-semibold">Country</th>
            <th className="px-3 py-2 text-right text-gray-500 font-semibold">Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((rank) => (
            <tr key={rank} className="hover:bg-gray-50/50">
              <td className="px-3 py-2 text-gray-400">#{rank}</td>
              <td className="px-3 py-2"><span className="bg-gray-100 rounded h-3 w-24 inline-block" /></td>
              <td className="px-3 py-2 text-right text-gray-300">—</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getVisualizationPreview(type: VisualizationType) {
  switch (type) {
    case "Bar chart": return <PreviewBarChart />;
    case "Line chart": case "Trend line": case "Area chart": case "Timeline chart": return <PreviewLineChart />;
    case "Pie chart": return <PreviewPieChart />;
    case "Stacked bar": return <PreviewStackedBar />;
    case "KPI card": return <PreviewKPI />;
    case "Map": case "Heat map": case "Bubble chart": return <PreviewMap />;
    case "Gauge": return <PreviewGauge />;
    case "Ranking table": case "Leaderboard": case "Table": return <PreviewTable />;
    default: return <PreviewBarChart />;
  }
}

/* ── Preview modal ───────────────────────────────────────────────────────── */
function MetricPreviewModal({
  metric,
  open,
  onClose,
}: Readonly<{ metric: MetricRow | null; open: boolean; onClose: () => void }>) {
  if (!metric) return null;
  const geo = GEO_STYLES[metric.geography] ?? GEO_STYLES.Global;

  return (
    <Dialog open={open} onClose={onClose} title="" maxWidth="max-w-2xl">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">{metric.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${geo.bg} ${geo.text}`}>
                {geo.flag} {metric.geography}
              </span>
              <span className="text-xs text-gray-400">{metric.year}</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">{metric.sourceType}</span>
            </div>
          </div>
          {metric.premium ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              <Lock className="w-2.5 h-2.5" /> Premium
            </span>
          ) : (
            <span className="inline-flex items-center text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              Free
            </span>
          )}
        </div>

        {/* Visualization type badge */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Visualization type:</span>
          <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
            {metric.visualization}
          </span>
        </div>

        {/* Preview area */}
        {metric.premium ? (
          <div className="relative rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/30 p-8">
            <div className="absolute inset-0 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center gap-3 z-10">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3 rounded-full shadow-lg">
                <Lock className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-gray-800">Premium Data</p>
              <p className="text-xs text-gray-500 text-center max-w-xs">
                This metric requires a premium subscription. Upgrade your plan to access the full visualization and data.
              </p>
              <Button
                size="sm"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full gap-1.5 mt-1 shadow-md"
              >
                <CreditCard className="w-3.5 h-3.5" /> Upgrade to Premium
              </Button>
            </div>
            {/* Blurred preview behind the overlay */}
            <div className="opacity-20 blur-sm pointer-events-none">
              {getVisualizationPreview(metric.visualization)}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Preview — {metric.visualization}
              </span>
              <span className="text-[10px] text-gray-300 italic">Sample visualization</span>
            </div>
            {getVisualizationPreview(metric.visualization)}
            <p className="text-[10px] text-gray-400 mt-4 text-center italic">
              Actual data will be displayed once available from the backend.
            </p>
          </div>
        )}
      </div>
    </Dialog>
  );
}

/* ── Metric table row component ──────────────────────────────────────────── */
function MetricTableRow({
  metric,
  index,
  onPreview,
}: Readonly<{ metric: MetricRow; index: number; onPreview: (m: MetricRow) => void }>) {
  const geo = GEO_STYLES[metric.geography];
  const VizIcon = VIZ_ICONS[metric.visualization] || BarChart3;

  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className={`group border-b border-gray-100 last:border-b-0 transition-colors duration-150 cursor-pointer ${
        metric.premium
          ? "bg-amber-50/30 hover:bg-amber-50/60"
          : "hover:bg-gray-50/80"
      }`}
      onClick={() => onPreview(metric)}
    >
      {/* S/N */}
      <td className="py-3.5 px-4 text-xs text-gray-400 font-medium tabular-nums w-12">
        {index + 1}
      </td>

      {/* Metric Name */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-800 leading-snug">
            {metric.name}
          </span>
          {metric.premium && (
            <span className="inline-flex items-center gap-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-[2px] rounded-full shrink-0">
              <Lock className="w-2 h-2" /> Pro
            </span>
          )}
        </div>
      </td>

      {/* Geography */}
      <td className="py-3.5 px-4">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${geo.bg} ${geo.text}`}>
          <span>{geo.flag}</span>
          {metric.geography}
        </span>
      </td>

      {/* Value */}
      <td className="py-3.5 px-4">
        <span className={`text-sm tabular-nums ${
          metric.value === "—"
            ? "text-gray-300 italic"
            : "font-semibold text-gray-800"
        }`}>
          {metric.premium && metric.value === "—" ? (
            <span className="inline-flex items-center gap-1 text-amber-400">
              <Lock className="w-3 h-3" /> Locked
            </span>
          ) : (
            metric.value
          )}
        </span>
      </td>

      {/* Year */}
      <td className="py-3.5 px-4 text-sm text-gray-500 tabular-nums whitespace-nowrap">
        {metric.year}
      </td>

      {/* Source Type */}
      <td className="py-3.5 px-4">
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md border ${
          metric.sourceType === "Regulatory"
            ? "bg-green-50 text-green-700 border-green-200"
            : metric.sourceType === "Paid database" || metric.sourceType === "API"
            ? "bg-amber-50 text-amber-700 border-amber-200"
            : metric.sourceType === "Research"
            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
            : "bg-gray-50 text-gray-600 border-gray-200"
        }`}>
          {metric.sourceType}
        </span>
      </td>

      {/* Visualization */}
      <td className="py-3.5 px-4">
        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
          <VizIcon className="w-3.5 h-3.5 text-gray-400" />
          {metric.visualization}
        </span>
      </td>

      {/* Access */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-2">
          {metric.premium ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              <Lock className="w-2.5 h-2.5" /> Paid
            </span>
          ) : (
            <span className="inline-flex items-center text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Free
            </span>
          )}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onPreview(metric); }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-[#D52B1E]"
            title="Preview visualization"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

/* ── Section summary stats ───────────────────────────────────────────────── */
function SectionSummary({ metrics }: Readonly<{ metrics: MetricRow[] }>) {
  const freeCount = metrics.filter((m) => !m.premium).length;
  const paidCount = metrics.filter((m) => m.premium).length;
  const geos = [...new Set(metrics.map((m) => m.geography))];

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <span className="text-xs text-gray-500">
        <span className="font-semibold text-gray-700">{metrics.length}</span> metrics
      </span>
      <span className="w-px h-3.5 bg-gray-200" />
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        {freeCount} free
      </span>
      {paidCount > 0 && (
        <span className="inline-flex items-center gap-1 text-xs text-amber-600">
          <Lock className="w-2.5 h-2.5" />
          {paidCount} premium
        </span>
      )}
      <span className="w-px h-3.5 bg-gray-200" />
      {geos.map((g) => {
        const style = GEO_STYLES[g] ?? GEO_STYLES.Global;
        return (
          <span key={g} className="inline-flex items-center gap-1 text-xs text-gray-500">
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {g}
          </span>
        );
      })}
    </div>
  );
}

/* ── Data table component ────────────────────────────────────────────────── */
function DataTable({
  metrics,
}: Readonly<{ metrics: MetricRow[] }>) {
  const [sortField, setSortField] = useState<"name" | "geography" | "year" | "premium" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [geoFilter, setGeoFilter] = useState<Geography | "all">("all");
  const [previewMetric, setPreviewMetric] = useState<MetricRow | null>(null);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    let result = [...metrics];
    if (geoFilter !== "all") {
      result = result.filter((m) => m.geography === geoFilter);
    }
    if (sortField) {
      result.sort((a, b) => {
        const valA = String(a[sortField]);
        const valB = String(b[sortField]);
        return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }
    return result;
  }, [metrics, geoFilter, sortField, sortDir]);

  const geos = [...new Set(metrics.map((m) => m.geography))];
  const SortIcon = sortDir === "asc" ? ChevronUp : ChevronDown;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Filter bar */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50/50">
        <span className="text-xs text-gray-400 font-medium mr-1">Filter:</span>
        <button
          type="button"
          onClick={() => setGeoFilter("all")}
          className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
            geoFilter === "all"
              ? "bg-[#D52B1E] text-white border-[#D52B1E]"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
          }`}
        >
          All
        </button>
        {geos.map((g) => {
          const style = GEO_STYLES[g];
          return (
            <button
              key={g}
              type="button"
              onClick={() => setGeoFilter(g)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors inline-flex items-center gap-1 ${
                geoFilter === g
                  ? `${style.bg} ${style.text} font-semibold`
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {style.flag} {g}
            </button>
          );
        })}
        <span className="ml-auto text-[11px] text-gray-400">
          {filtered.length} of {metrics.length} rows
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/80">
              <th className="py-3 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-12">
                #
              </th>
              <th
                className="py-3 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
                onClick={() => handleSort("name")}
              >
                <span className="inline-flex items-center gap-1">
                  Metric
                  {sortField === "name" && <SortIcon className="w-3 h-3" />}
                </span>
              </th>
              <th
                className="py-3 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
                onClick={() => handleSort("geography")}
              >
                <span className="inline-flex items-center gap-1">
                  Geography
                  {sortField === "geography" && <SortIcon className="w-3 h-3" />}
                </span>
              </th>
              <th className="py-3 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th
                className="py-3 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
                onClick={() => handleSort("year")}
              >
                <span className="inline-flex items-center gap-1">
                  Year
                  {sortField === "year" && <SortIcon className="w-3 h-3" />}
                </span>
              </th>
              <th className="py-3 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="py-3 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Visualization
              </th>
              <th
                className="py-3 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
                onClick={() => handleSort("premium")}
              >
                <span className="inline-flex items-center gap-1">
                  Access
                  {sortField === "premium" && <SortIcon className="w-3 h-3" />}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((metric, idx) => (
              <MetricTableRow
                key={`${metric.name}-${metric.geography}`}
                metric={metric}
                index={idx}
                onPreview={setPreviewMetric}
              />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <p className="text-sm text-gray-400">No metrics match the current filter.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Preview modal */}
      <MetricPreviewModal
        metric={previewMetric}
        open={previewMetric !== null}
        onClose={() => setPreviewMetric(null)}
      />
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────── */
function getCategoryIcon(name: string, iconKey?: string | null): React.ElementType {
  const key = `${iconKey ?? ""} ${name}`.toLowerCase();
  if (key.includes("bank")) return Database;
  if (key.includes("sukuk") || key.includes("market")) return TrendingUp;
  if (key.includes("takaful") || key.includes("insurance")) return Shield;
  if (key.includes("fund") || key.includes("asset")) return Coins;
  if (key.includes("equity") || key.includes("stock")) return PieChart;
  if (key.includes("consumer") || key.includes("retail")) return ShoppingBag;
  if (key.includes("credit") || key.includes("financ")) return CreditCard;
  if (key.includes("govern") || key.includes("standard") || key.includes("shariah")) return BookOpen;
  return Globe;
}

function mapDatasetToMetric(dataset: Dataset): MetricRow {
  const from = dataset.timePeriodFrom ?? "";
  const to = dataset.timePeriodTo ?? "";
  const legacyYear = from && to
    ? from === to
      ? from
      : `${from}-${to}`
    : from || to || "N/A";

  return {
    name: dataset.title,
    geography: dataset.geography ?? "Global",
    value: dataset.value ?? "--",
    year: dataset.year ?? legacyYear,
    sourceType: dataset.source ?? "Unknown",
    visualization: dataset.visualizationType ?? "KPI card",
    premium: dataset.isPremium,
  };
}

export default function Data() {
  const { data: categoriesData } = useDatasetCategories();
  const { data: datasetsData, isLoading: datasetsLoading } = useDatasets({
    page: 1,
    perPage: 100,
    status: "published",
    order: "DESC",
  });

  const sections = useMemo<SectionDef[]>(() => {
    const categories = categoriesData ?? [];
    const datasets = datasetsData?.data ?? [];
    if (categories.length === 0 && datasets.length === 0) return SECTIONS;

    return categories.map((category) => ({
      id: category.slug || category.id,
      title: category.name,
      icon: getCategoryIcon(category.name, category.icon),
      description: category.description || `Explore metrics and datasets for ${category.name}.`,
      metrics: datasets
        .filter((dataset) => dataset.category?.id === category.id)
        .map(mapDatasetToMetric),
    }));
  }, [categoriesData, datasetsData?.data]);

  const [activeTab, setActiveTab] = useState((SECTIONS[0]?.id ?? ""));
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!sections.length) return;
    if (!sections.some((section) => section.id === activeTab)) {
      setActiveTab(sections[0].id);
    }
  }, [sections, activeTab]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const totalMetrics = sections.reduce((sum, s) => sum + s.metrics.length, 0);
  const totalFree = sections.reduce((sum, s) => sum + s.metrics.filter((m) => !m.premium).length, 0);

  // Global search across all sections
  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    return sections.map((section) => ({
      section,
      matches: section.metrics.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          section.title.toLowerCase().includes(q) ||
          m.geography.toLowerCase().includes(q) ||
          m.sourceType.toLowerCase().includes(q) ||
          m.visualization.toLowerCase().includes(q),
      ),
    })).filter((r) => r.matches.length > 0);
  }, [search, sections]);

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
                <p className="text-2xl font-bold text-white">{sections.length}</p>
                <p className="text-xs text-gray-500">Sections</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-center">
                <p className="text-2xl font-bold text-[#D52B1E]">{totalMetrics}</p>
                <p className="text-xs text-gray-500">Metrics</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-center">
                <p className="text-2xl font-bold text-emerald-400">{totalFree}</p>
                <p className="text-xs text-gray-500">Free</p>
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

      {/* ── Search Results (cross-section tables) ────────────────────── */}
      {datasetsLoading ? (
        <motion.div variants={itemVariants} className="py-16 text-center">
          <p className="text-[#737692] text-sm">Loading datasets...</p>
        </motion.div>
      ) : searchResults ? (
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

          {/* Grouped results as tables */}
          {searchResults.map(({ section, matches }) => {
            const SectionIcon = section.icon;
            return (
              <div key={section.id}>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-[#D52B1E]/10">
                    <SectionIcon className="h-4 w-4 text-[#D52B1E]" />
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
                <DataTable metrics={matches} />
              </div>
            );
          })}
        </motion.div>
      ) : (
        /* ── Tab Navigation (default, no search) ────────────────────── */
        <motion.div variants={itemVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Arrow-shaped tabs */}
            <TabsList className="flex flex-nowrap overflow-x-auto scrollbar-hide w-full justify-start bg-transparent border-0 rounded-none p-0 h-auto shadow-none">
              {sections.map((section, idx) => {
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
                      zIndex: sections.length - idx,
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
            {sections.map((section) => (
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
                    <div className="bg-gradient-to-r from-[#D52B1E]/5 via-[#D52B1E]/3 to-transparent rounded-xl p-4 mb-5 border-l-4 border-[#D52B1E]">
                      <p className="text-sm text-[#737692]">
                        {section.description}
                      </p>
                    </div>

                    {/* Summary stats */}
                    <SectionSummary metrics={section.metrics} />

                    {/* Data table */}
                    <DataTable metrics={section.metrics} />
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
