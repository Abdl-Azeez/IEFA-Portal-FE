import { useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Calendar, Download } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

const researchCategories = [
  "Macroeconomic outlook",
  "Equity strategy",
  "Fixed income",
  "Commodities",
  "Sustainable investing",
  "Private markets",
];

const sampleReports = [
  {
    id: 1,
    title: "Nigeria Macro & Markets Outlook 2025",
    type: "Macroeconomic outlook",
    date: "Feb 10, 2026",
    author: "IEFA Research",
    summary:
      "A forward-looking view on growth, inflation, FX, and policy with implications for local and foreign investors.",
  },
  {
    id: 2,
    title: "Frontier Equities: Sector Playbook",
    type: "Equity strategy",
    date: "Jan 28, 2026",
    author: "IEFA Strategy Team",
    summary:
      "Sector-by-sector view of opportunities across banks, consumer, industrials, and infrastructure plays.",
  },
  {
    id: 3,
    title: "Fixed Income & Liquidity Radar",
    type: "Fixed income",
    date: "Jan 16, 2026",
    author: "Markets Desk",
    summary:
      "Curve positioning, primary auction calendar, and liquidity considerations for institutional portfolios.",
  },
];

export default function ResearchReports() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight text-[#000000]">
          Research & Reports
        </h1>
        <p className="mt-2 text-[#737692]">
          Structured research to help investment and finance professionals make
          better decisions. Browse macro, strategy, and product-level insights
          curated by IEFA.
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div variants={itemVariants}>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#737692]" />
          <Input
            placeholder="Search reports..."
            className="pl-10 h-12 text-base"
          />
        </div>
      </motion.div>

      {/* Categories */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-[#000000]">Categories</CardTitle>
            <CardDescription className="text-[#737692]">
              Filter research by topic or asset class
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {researchCategories.map((category) => (
                <Badge
                  key={category}
                  variant="outline"
                  className="bg-white text-[#D52B1E] border-[#D52B1E]/20 hover:bg-[#FFEFEF] cursor-pointer"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Latest Publications - Downloadable List */}
      <motion.div variants={itemVariants}>
        <Card className="transition-all duration-300 hover:shadow-xl border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-[#000000]">
                  Latest Publications
                </CardTitle>
                <CardDescription className="text-[#737692]">
                  Research & reports you can download today
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                className="text-[#D52B1E] hover:bg-[#FFEFEF]"
              >
                View archive
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sampleReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-[#000000]">
                        {report.title}
                      </h3>
                      <Badge className="bg-[#D52B1E]/10 text-[#D52B1E] border-[#D52B1E]/20">
                        {report.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-[#737692]">{report.summary}</p>
                    <div className="flex items-center gap-4 text-xs text-[#737692]">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {report.date}
                      </span>
                      <span>{report.author}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="border-[#D52B1E] text-[#D52B1E] hover:bg-[#D52B1E] hover:text-white shrink-0"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
