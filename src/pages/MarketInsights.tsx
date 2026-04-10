import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Building2,
  Briefcase,
  ChevronUp,
  Activity,
  Clock,
  ExternalLink,
  Newspaper,
  RefreshCw,
} from "lucide-react";
import GlobalIslamicMarket from "./GlobalIslamicMarket";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useMarketInsightsDashboard,
  type MarketInsightLocalNews,
  type MarketInsightExternalNews,
} from "@/hooks/useAdmin";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

interface MarketCardProps {
  title: string;
  value: string;
  change: number;
  trend: "up" | "down";
  icon: React.ReactNode;
  color: string;
  delay?: number;
}

function MarketCard({
  title,
  value,
  change,
  trend,
  icon,
  color,
  delay = 0,
}: MarketCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <motion.div
              className={`h-12 w-12 rounded-full ${color} flex items-center justify-center`}
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              {icon}
            </motion.div>
            <Badge
              className={
                trend === "up"
                  ? "bg-green-500/10 text-green-700 border-green-500/20"
                  : "bg-red-500/10 text-red-700 border-red-500/20"
              }
            >
              {trend === "up" ? (
                <ArrowUpRight className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-1" />
              )}
              {Math.abs(change)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <h3 className="text-sm font-medium text-[#737692] mb-1">{title}</h3>
          <motion.p
            className="text-3xl font-bold text-[#000000]"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.2, type: "spring" }}
          >
            {value}
          </motion.p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface IndexCardProps {
  name: string;
  value: string;
  change: number;
  trend: "up" | "down";
  percentage: string;
  delay?: number;
}

function IndexCard({
  name,
  value,
  change,
  trend,
  percentage,
  delay = 0,
}: IndexCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ x: 8, scale: 1.02 }}
      className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <motion.div
          className={`h-10 w-10 rounded-full flex items-center justify-center ${
            trend === "up"
              ? "bg-green-500/10 text-green-600"
              : "bg-red-500/10 text-red-600"
          }`}
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          {trend === "up" ? (
            <TrendingUp className="h-5 w-5" />
          ) : (
            <TrendingDown className="h-5 w-5" />
          )}
        </motion.div>
        <div>
          <h4 className="font-semibold text-[#000000] group-hover:text-primary transition-colors">
            {name}
          </h4>
          <p className="text-sm text-[#737692]">{value}</p>
        </div>
      </div>
      <div className="text-right">
        <p
          className={`text-lg font-bold ${trend === "up" ? "text-green-600" : "text-red-600"}`}
        >
          {trend === "up" ? "+" : ""}
          {percentage}
        </p>
        <p className="text-xs text-[#737692]">{Math.abs(change)} points</p>
      </div>
    </motion.div>
  );
}

function getFearGreedColor(cls: string) {
  switch (cls?.toLowerCase()) {
    case "extreme fear":
      return "text-red-600";
    case "fear":
      return "text-orange-500";
    case "neutral":
      return "text-yellow-500";
    case "greed":
      return "text-teal-600";
    case "extreme greed":
      return "text-green-600";
    default:
      return "text-[#737692]";
  }
}

function getFearGreedBg(cls: string) {
  switch (cls?.toLowerCase()) {
    case "extreme fear":
      return "from-red-50 to-red-100/30 border-red-100";
    case "fear":
      return "from-orange-50 to-orange-100/30 border-orange-100";
    case "neutral":
      return "from-yellow-50 to-yellow-100/30 border-yellow-100";
    case "greed":
      return "from-teal-50 to-teal-100/30 border-teal-100";
    case "extreme greed":
      return "from-green-50 to-green-100/30 border-green-100";
    default:
      return "from-gray-50 to-gray-100/30 border-gray-100";
  }
}

function fmtDate(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ── Coming-soon placeholder for non-global market tabs ─────────────────── */
function MarketComingSoon({
  market,
  description,
  icon,
  comingSoon,
}: {
  market: string;
  description: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="mb-6 flex items-center justify-center w-24 h-24 rounded-3xl bg-[#D52B1E]/5 border border-[#D52B1E]/10">
        {icon}
      </div>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-2xl font-bold text-[#000000]">{market}</h2>
        {comingSoon && (
          <Badge className="bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold">
            Coming Soon
          </Badge>
        )}
      </div>
      <p className="text-[#737692] max-w-md leading-relaxed mb-6">
        {description}
      </p>
      {!comingSoon && (
        <div className="flex items-center gap-2 text-sm text-[#D52B1E] font-medium bg-[#D52B1E]/5 border border-[#D52B1E]/20 rounded-full px-5 py-2">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          Data integration in progress
        </div>
      )}
      {comingSoon && (
        <div className="flex items-center gap-2 text-sm text-amber-700 font-medium bg-amber-50 border border-amber-200 rounded-full px-5 py-2">
          <Clock className="h-3.5 w-3.5" />
          This market view is coming soon
        </div>
      )}
    </motion.div>
  );
}

export function MarketInsights() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabOptions = useMemo(
    () => new Set(["global-islamic", "global", "ngx", "ngx-islamic", "crypto", "halal-crypto"]),
    [],
  );
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get("tab");
    return tab && tabOptions.has(tab) ? tab : "global-islamic";
  });

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tabOptions.has(tab)) {
      if (tab !== activeTab) setActiveTab(tab);
      return;
    }
    if (activeTab !== "global-islamic") {
      setActiveTab("global-islamic");
    }
  }, [activeTab, searchParams, tabOptions]);

  const {
    data: dashboard,
    isLoading: dashLoading,
    dataUpdatedAt,
  } = useMarketInsightsDashboard();

  const fearGreed = dashboard?.fearAndGreed;
  const localNews = dashboard?.localNews ?? [];
  const externalNews = dashboard?.externalNews ?? [];

  const stockData = {
    topGainers: [
      {
        symbol: "DANGOTE",
        company: "Dangote Cement Ltd",
        price: "1,7888.29",
        change: "+5.2%",
        trend: "up" as const,
      },
      {
        symbol: "BUA",
        company: "Bua Cement Ltd",
        price: "1,7888.29",
        change: "+4.8%",
        trend: "up" as const,
      },
      {
        symbol: "MTNN",
        company: "MTN Nigeria comm",
        price: "1,7888.29",
        change: "+3.9%",
        trend: "up" as const,
      },
      {
        symbol: "GTCO",
        company: "Guaranty Trust Holding",
        price: "45.50",
        change: "+3.5%",
        trend: "up" as const,
      },
    ],
    topLosers: [
      {
        symbol: "NESTLE",
        company: "Nestle Nigeria Plc",
        price: "1,2500.00",
        change: "-2.1%",
        trend: "down" as const,
      },
      {
        symbol: "GUINNESS",
        company: "Guinness Nigeria Plc",
        price: "890.50",
        change: "-1.8%",
        trend: "down" as const,
      },
      {
        symbol: "UNILEVER",
        company: "Unilever Nigeria Plc",
        price: "450.00",
        change: "-1.5%",
        trend: "down" as const,
      },
      {
        symbol: "SEPLAT",
        company: "Seplat Energy Plc",
        price: "320.30",
        change: "-1.2%",
        trend: "down" as const,
      },
    ],
    mostActive: [
      {
        symbol: "ZENITH",
        company: "Zenith Bank Plc",
        price: "38.90",
        change: "+2.8%",
        trend: "up" as const,
      },
      {
        symbol: "ACCESS",
        company: "Access Holdings Plc",
        price: "22.30",
        change: "+2.3%",
        trend: "up" as const,
      },
      {
        symbol: "FBNH",
        company: "FBN Holdings Plc",
        price: "15.75",
        change: "+1.9%",
        trend: "up" as const,
      },
      {
        symbol: "STANBIC",
        company: "Stanbic IBTC Plc",
        price: "42.50",
        change: "+1.6%",
        trend: "up" as const,
      },
    ],
  };

  const PerformanceCard = ({ stock, index }: { stock: any; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.1)" }}
      className={`p-4 rounded-lg border transition-all cursor-pointer ${
        stock.trend === "up"
          ? "bg-gradient-to-br from-green-50 to-green-100/50 border-green-200"
          : "bg-gradient-to-br from-red-50 to-red-100/50 border-red-200"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-[#000000] text-base">{stock.symbol}</h4>
          <p className="text-xs text-[#737692]">{stock.company}</p>
        </div>
        <motion.div
          className={`h-8 w-8 rounded-full flex items-center justify-center ${
            stock.trend === "up" ? "bg-green-600/20" : "bg-red-600/20"
          }`}
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.6 }}
        >
          <ChevronUp
            className={`h-4 w-4 ${stock.trend === "up" ? "text-green-600" : "text-red-600 rotate-180"}`}
          />
        </motion.div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#737692]">Price</span>
          <span className="font-semibold text-[#000000]">{stock.price}</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-current border-opacity-10">
          <span className="text-xs text-[#737692]">Change</span>
          <span
            className={`text-lg font-bold ${stock.trend === "up" ? "text-green-600" : "text-red-600"}`}
          >
            {stock.change}
          </span>
        </div>
      </div>
    </motion.div>
  );

  const performanceData = [
    { title: "Top Gainers", data: stockData.topGainers },
    { title: "Top Losers", data: stockData.topLosers },
    { title: "Most Active", data: stockData.mostActive },
  ];
  const marketOverview = [
    {
      title: "Total Market Cap",
      value: "$3.5T",
      change: 12.5,
      trend: "up" as const,
      icon: <Globe className="h-6 w-6 text-blue-600" />,
      color: "bg-blue-500/10",
    },
    {
      title: "Sukuk Issuance",
      value: "$145B",
      change: 8.3,
      trend: "up" as const,
      icon: <Building2 className="h-6 w-6 text-green-600" />,
      color: "bg-green-500/10",
    },
    {
      title: "Active Institutions",
      value: "1,234",
      change: 5.7,
      trend: "up" as const,
      icon: <Briefcase className="h-6 w-6 text-purple-600" />,
      color: "bg-purple-500/10",
    },
    {
      title: "Trading Volume",
      value: "$89B",
      change: -2.4,
      trend: "down" as const,
      icon: <BarChart3 className="h-6 w-6 text-orange-600" />,
      color: "bg-orange-500/10",
    },
  ];

  const indices = [
    {
      name: "DJIM World",
      value: "3,456.78",
      change: 45.23,
      trend: "up" as const,
      percentage: "+1.32%",
    },
    {
      name: "S&P 500 Shariah",
      value: "2,345.67",
      change: 23.45,
      trend: "up" as const,
      percentage: "+1.01%",
    },
    {
      name: "FTSE Shariah All-World",
      value: "1,234.56",
      change: 12.34,
      trend: "up" as const,
      percentage: "+1.00%",
    },
    {
      name: "MSCI Islamic",
      value: "987.65",
      change: -5.43,
      trend: "down" as const,
      percentage: "-0.55%",
    },
  ];

  const topPerformers = [
    {
      name: "Al Rajhi Bank",
      sector: "Banking",
      change: "+5.4%",
      trend: "up" as const,
    },
    {
      name: "Dubai Islamic Bank",
      sector: "Banking",
      change: "+4.8%",
      trend: "up" as const,
    },
    {
      name: "Qatar Islamic Bank",
      sector: "Banking",
      change: "+4.2%",
      trend: "up" as const,
    },
    {
      name: "Emirates NBD",
      sector: "Financial Services",
      change: "+3.9%",
      trend: "up" as const,
    },
  ];

  const sectors = [
    { name: "Banking", percentage: 35, color: "bg-blue-500" },
    { name: "Real Estate", percentage: 25, color: "bg-green-500" },
    { name: "Technology", percentage: 20, color: "bg-purple-500" },
    { name: "Healthcare", percentage: 12, color: "bg-orange-500" },
    { name: "Other", percentage: 8, color: "bg-gray-500" },
  ];

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#000000]">
              Market Insights
            </h1>
            <p className="mt-2 text-[#737692]">
              Real-time data and analysis of Islamic finance markets
            </p>
          </div>
          {(dashboard?.lastUpdated || dataUpdatedAt > 0) && (
            <div className="flex items-center gap-1.5 text-xs text-[#737692] bg-white border border-gray-100 rounded-full px-3 py-1.5 shadow-sm mt-1">
              <RefreshCw
                className={`h-3 w-3 ${dashLoading ? "animate-spin" : ""}`}
              />
              Updated{" "}
              {fmtDate(
                dashboard?.lastUpdated ?? new Date(dataUpdatedAt).toISOString(),
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Market Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          if (!tabOptions.has(value)) return;
          setActiveTab(value);
          const next = new URLSearchParams(searchParams);
          next.set("tab", value);
          setSearchParams(next, { replace: true });
        }}
        className="space-y-6"
      >
        <TabsList className="bg-white border border-gray-100 rounded-xl p-1.5 h-auto shadow-sm flex flex-wrap gap-1">
          <TabsTrigger
            value="global-islamic"
            className="rounded-xl px-4 py-2 text-sm font-medium data-[state=active]:bg-[#D52B1E] data-[state=active]:text-white data-[state=active]:shadow-sm text-[#737692] hover:text-gray-800 transition-all"
          >
            Global Islamic Market
          </TabsTrigger>
          <TabsTrigger
            value="global"
            className="rounded-xl px-4 py-2 text-sm font-medium data-[state=active]:bg-[#D52B1E] data-[state=active]:text-white data-[state=active]:shadow-sm text-[#737692] hover:text-gray-800 transition-all"
          >
            Global Market
          </TabsTrigger>
          <TabsTrigger
            value="ngx"
            className="rounded-xl px-4 py-2 text-sm font-medium data-[state=active]:bg-[#D52B1E] data-[state=active]:text-white data-[state=active]:shadow-sm text-[#737692] hover:text-gray-800 transition-all"
          >
            NGX Market
          </TabsTrigger>
          <TabsTrigger
            value="ngx-islamic"
            className="rounded-xl px-4 py-2 text-sm font-medium data-[state=active]:bg-[#D52B1E] data-[state=active]:text-white data-[state=active]:shadow-sm text-[#737692] hover:text-gray-800 transition-all"
          >
            NGX Islamic
          </TabsTrigger>
          <TabsTrigger
            value="crypto"
            className="rounded-xl px-4 py-2 text-sm font-medium data-[state=active]:bg-[#D52B1E] data-[state=active]:text-white data-[state=active]:shadow-sm text-[#737692] hover:text-gray-800 transition-all"
          >
            Crypto Market
          </TabsTrigger>
          <TabsTrigger
            value="halal-crypto"
            className="rounded-xl px-4 py-2 text-sm font-medium data-[state=active]:bg-[#D52B1E] data-[state=active]:text-white data-[state=active]:shadow-sm text-[#737692] hover:text-gray-800 transition-all flex items-center gap-1.5"
          >
            Halal Crypto
            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full leading-none">
              Soon
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Global Islamic Market Tab */}
        <TabsContent value="global-islamic" className="mt-0">
          <GlobalIslamicMarket />
        </TabsContent>

        <TabsContent value="global" className="space-y-6 mt-0">
          {/* Market Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {marketOverview.map((market, index) => (
              <MarketCard key={market.title} {...market} delay={index * 0.1} />
            ))}
          </div>

          {/* Stock Performance Section */}
          <motion.div variants={itemVariants}>
            <Card className="transition-all duration-300 hover:shadow-xl border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-[#000000]">
                      Stock Performance
                    </CardTitle>
                    <CardDescription className="text-[#737692]">
                      Real-time market performance by category
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="Top Gainers" className="w-full">
                  <TabsList className="bg-transparent h-auto p-0 mb-6 gap-0">
                    {["Top Gainers", "Top Losers", "Most Active"].map((tab) => (
                      <TabsTrigger
                        key={tab}
                        value={tab}
                        className="bg-transparent px-0 mr-8 pb-2 text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:text-[#D52B1E] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#D52B1E] rounded-none text-[#737692] hover:bg-transparent"
                      >
                        {tab}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {performanceData.map((perf) => (
                    <TabsContent
                      key={perf.title}
                      value={perf.title}
                      className="mt-0"
                    >
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {perf.data.map((stock, index) => (
                          <PerformanceCard
                            key={stock.symbol}
                            stock={stock}
                            index={index}
                          />
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Major Indices */}
            <motion.div className="lg:col-span-2" variants={itemVariants}>
              <Card className="transition-all duration-300 hover:shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-[#000000]">
                        Major Indices
                      </CardTitle>
                      <CardDescription className="text-[#737692]">
                        Shariah-compliant market indices
                      </CardDescription>
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <PieChart className="h-8 w-8 text-primary" />
                    </motion.div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {indices.map((index, idx) => (
                      <IndexCard
                        key={index.name}
                        {...index}
                        delay={0.4 + idx * 0.1}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Market Chart Placeholder */}
            <motion.div variants={itemVariants}>
              <Card className="transition-all duration-300 hover:shadow-xl h-full">
                <CardHeader>
                  <CardTitle className="text-[#000000]">Market Trend</CardTitle>
                  <CardDescription className="text-[#737692]">
                    30-day performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px] flex items-center justify-center bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-lg relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{
                        repeat: Infinity,
                        duration: 3,
                        ease: "linear",
                      }}
                    />
                    <div className="relative z-10 text-center">
                      <motion.div
                        animate={{
                          y: [0, -10, 0],
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                      >
                        <TrendingUp className="h-16 w-16 mx-auto text-primary mb-3" />
                      </motion.div>
                      <p className="text-sm text-[#737692] font-medium">
                        Chart Visualization
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Top Performers and Sector Distribution */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Performers */}
            <motion.div variants={itemVariants}>
              <Card className="transition-all duration-300 hover:shadow-xl">
                <CardHeader>
                  <CardTitle className="text-[#000000]">
                    Top Performers
                  </CardTitle>
                  <CardDescription className="text-[#737692]">
                    Best performing stocks today
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topPerformers.map((stock, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        whileHover={{ x: 8, scale: 1.02 }}
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-transparent rounded-lg border border-green-100 hover:border-green-200 transition-all duration-200 cursor-pointer"
                      >
                        <div>
                          <h4 className="font-semibold text-[#000000]">
                            {stock.name}
                          </h4>
                          <p className="text-sm text-[#737692]">
                            {stock.sector}
                          </p>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="flex items-center gap-2"
                        >
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-lg font-bold text-green-600">
                            {stock.change}
                          </span>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sector Distribution */}
            <motion.div variants={itemVariants}>
              <Card className="transition-all duration-300 hover:shadow-xl">
                <CardHeader>
                  <CardTitle className="text-[#000000]">
                    Sector Distribution
                  </CardTitle>
                  <CardDescription className="text-[#737692]">
                    Market composition by sector
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sectors.map((sector, index) => (
                      <div key={sector.name} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-[#000000]">
                            {sector.name}
                          </span>
                          <span className="text-[#737692]">
                            {sector.percentage}%
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${sector.color} rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${sector.percentage}%` }}
                            transition={{
                              delay: 0.9 + index * 0.1,
                              duration: 1,
                              ease: "easeOut",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pie Chart Visualization */}
                  <div className="mt-6 flex items-center justify-center">
                    <div className="relative w-40 h-40">
                      <motion.div
                        className="absolute inset-0 rounded-full border-8 border-primary/20"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 60,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.2, type: "spring" }}
                      >
                        <div className="text-center">
                          <p className="text-2xl font-bold text-[#000000]">
                            100%
                          </p>
                          <p className="text-xs text-[#737692]">Total</p>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Market Summary */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-[#000000]">Market Summary</CardTitle>
                <CardDescription className="text-[#737692]">
                  Key highlights and analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Fear & Greed — live */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3 }}
                    whileHover={{ y: -4 }}
                    className={`p-4 bg-gradient-to-br ${fearGreed ? getFearGreedBg(fearGreed.value_classification) : "from-gray-50 to-gray-100/30 border-gray-100"} border rounded-lg text-center hover:shadow-md transition-all duration-200`}
                  >
                    <div className="flex items-center justify-center gap-1.5 text-xs text-[#737692] mb-1">
                      <Activity className="h-3.5 w-3.5" />
                      Fear & Greed Index
                    </div>
                    {dashLoading || !fearGreed ? (
                      <div className="h-7 w-20 bg-gray-200 animate-pulse rounded mx-auto" />
                    ) : (
                      <>
                        <p
                          className={`text-2xl font-bold ${getFearGreedColor(fearGreed.value_classification)}`}
                        >
                          {fearGreed.value}
                        </p>
                        <p
                          className={`text-sm font-semibold ${getFearGreedColor(fearGreed.value_classification)}`}
                        >
                          {fearGreed.value_classification}
                        </p>
                      </>
                    )}
                  </motion.div>

                  {[
                    {
                      label: "Volatility Index",
                      value: "Low",
                      color: "text-blue-600",
                    },
                    {
                      label: "Volume Trend",
                      value: "Increasing",
                      color: "text-purple-600",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.4 + index * 0.1 }}
                      whileHover={{ y: -4 }}
                      className="p-4 bg-white rounded-lg text-center hover:shadow-md transition-all duration-200"
                    >
                      <p className="text-sm text-[#737692] mb-1">
                        {item.label}
                      </p>
                      <p className={`text-xl font-bold ${item.color}`}>
                        {item.value}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Local News from IEFA */}
          {(dashLoading || localNews.length > 0) && (
            <motion.div variants={itemVariants}>
              <Card className="transition-all duration-300 hover:shadow-xl border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Newspaper className="h-5 w-5 text-[#D52B1E]" />
                    <div>
                      <CardTitle className="text-[#000000]">
                        Latest Local News
                      </CardTitle>
                      <CardDescription className="text-[#737692]">
                        Recent local market articles
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {dashLoading ? (
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="animate-pulse flex gap-4 p-4 rounded-xl border border-gray-100"
                        >
                          <div className="h-16 w-16 rounded-lg bg-gray-200 shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                            <div className="h-3 bg-gray-100 rounded w-full" />
                            <div className="h-3 bg-gray-100 rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {localNews.map(
                        (article: MarketInsightLocalNews, idx: number) => (
                          <motion.div
                            key={article.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            whileHover={{ x: 4 }}
                            className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-[#D52B1E]/30 hover:bg-[#D52B1E]/[0.02] transition-all duration-200 cursor-pointer"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                                {article.isFeatured && (
                                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                                    Featured
                                  </span>
                                )}
                                {article.tags?.slice(0, 2).map((t) => (
                                  <span
                                    key={t.id}
                                    className="text-[10px] font-medium text-[#D52B1E] bg-[#D52B1E]/10 px-1.5 py-0.5 rounded-full"
                                  >
                                    {t.name}
                                  </span>
                                ))}
                              </div>
                              <h4 className="font-semibold text-[#000000] text-sm leading-snug mb-1 line-clamp-2">
                                {article.title}
                              </h4>
                              {article.excerpt && (
                                <p className="text-xs text-[#737692] line-clamp-2">
                                  {article.excerpt}
                                </p>
                              )}
                              <div className="flex items-center gap-1 mt-2 text-[10px] text-[#737692]">
                                <Clock className="h-3 w-3" />
                                {fmtDate(
                                  article.publishedAt ?? article.createdAt,
                                )}
                                {typeof article.viewCount === "number" && (
                                  <span className="ml-2">
                                    {article.viewCount} views
                                  </span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ),
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* External Market News Feed */}
          {(dashLoading || externalNews.length > 0) && (
            <motion.div variants={itemVariants}>
              <Card className="transition-all duration-300 hover:shadow-xl border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-[#D52B1E]" />
                    <div>
                      <CardTitle className="text-[#000000]">
                        Market News Feed
                      </CardTitle>
                      <CardDescription className="text-[#737692]">
                        Latest market news from external sources
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {dashLoading ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="animate-pulse p-4 rounded-xl border border-gray-100 space-y-2"
                        >
                          <div className="h-3 bg-gray-200 rounded w-1/3" />
                          <div className="h-4 bg-gray-200 rounded w-full" />
                          <div className="h-3 bg-gray-100 rounded w-3/4" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {externalNews.map(
                        (article: MarketInsightExternalNews, idx: number) => (
                          <motion.a
                            key={article.id + idx}
                            href={article.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.06 }}
                            whileHover={{
                              y: -3,
                              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                            }}
                            className="p-4 rounded-xl border border-gray-100 hover:border-green-200 bg-white hover:bg-green-50/30 transition-all duration-200 flex flex-col gap-2 group"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full truncate max-w-[70%]">
                                {article.source}
                              </span>
                              <ExternalLink className="h-3.5 w-3.5 text-gray-400 group-hover:text-green-600 transition-colors shrink-0" />
                            </div>
                            <p className="text-sm font-semibold text-[#000000] leading-snug line-clamp-3">
                              {article.title}
                            </p>
                            {article.pubDate && (
                              <div className="flex items-center gap-1 text-[10px] text-[#737692] mt-auto">
                                <Clock className="h-3 w-3" />
                                {fmtDate(article.pubDate)}
                              </div>
                            )}
                          </motion.a>
                        ),
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>

        {/* NGX Market Tab */}
        <TabsContent value="ngx" className="mt-0">
          <MarketComingSoon
            market="NGX Market"
            description="Nigerian Exchange Group (NGX) market data, Shariah-screened equity listings, and Islamic investment vehicles on the Nigerian capital market."
            icon={<Building2 className="h-12 w-12 text-[#D52B1E]/40" />}
          />
        </TabsContent>

        {/* NGX Islamic Tab */}
        <TabsContent value="ngx-islamic" className="mt-0">
          <MarketComingSoon
            market="NGX Islamic Index"
            description="Track the NGX Lotus Islamic Index (LII) — a benchmark of Shariah-compliant equities listed on the Nigerian Exchange."
            icon={<BarChart3 className="h-12 w-12 text-[#D52B1E]/40" />}
          />
        </TabsContent>

        {/* Crypto Market Tab */}
        <TabsContent value="crypto" className="mt-0">
          <MarketComingSoon
            market="Crypto Market"
            description="Global cryptocurrency market overview — top assets by market cap, trending coins, and digital asset analytics."
            icon={<Activity className="h-12 w-12 text-[#D52B1E]/40" />}
          />
        </TabsContent>

        {/* Halal Crypto Tab */}
        <TabsContent value="halal-crypto" className="mt-0">
          <MarketComingSoon
            market="Halal Crypto Market"
            description="Shariah-screened digital assets, halal DeFi protocols, and Islamic finance-compliant blockchain projects. Data integrations are currently in progress."
            comingSoon
            icon={<Activity className="h-12 w-12 text-[#D52B1E]/40" />}
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
