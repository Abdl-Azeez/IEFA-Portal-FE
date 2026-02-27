import { useEffect } from "react";
import { motion } from "framer-motion";
import { Database, BarChart3, Download, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

const dataCatalog = [
  {
    name: "Market dashboard snapshot",
    horizon: "Daily",
    description: "Headline indices, FX, and rates for quick morning checks.",
    tags: ["Indices", "FX", "Rates"],
  },
  {
    name: "Nigeria listed equities",
    horizon: "End of day",
    description:
      "Prices, volumes, and basic valuation metrics for listed names.",
    tags: ["Equities", "EOD"],
  },
  {
    name: "Fixed income curve",
    horizon: "Weekly",
    description:
      "Indicative yield curves across government and corporate bonds.",
    tags: ["Bonds", "Curve"],
  },
  {
    name: "FX & macro reference series",
    horizon: "Monthly",
    description: "FX, inflation, policy rates, and key macro indicators.",
    tags: ["FX", "Macro"],
  },
];

export default function Data() {
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
          Data
        </h1>
        <p className="mt-2 text-[#737692]">
          A future home for IEFA&apos;s structured data views – prices, curves,
          volumes, and cross-asset dashboards.
        </p>
      </motion.div>

      {/* Data Overview */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-[#000000]">
              Data Command Centre
            </CardTitle>
            <CardDescription className="text-[#737692]">
              Live dashboards, curves, and reference data will converge here.
              For now, explore the datasets available for download.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg border hover:shadow-md transition-all">
                <div className="h-12 w-12 rounded-full bg-[#D52B1E]/10 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-[#D52B1E]" />
                </div>
                <div>
                  <p className="font-semibold text-[#000000]">Market Pulse</p>
                  <p className="text-sm text-[#737692]">
                    Headline indices, FX and yields
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg border hover:shadow-md transition-all">
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-[#000000]">Liquidity Map</p>
                  <p className="text-sm text-[#737692]">
                    Volume concentration across assets
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Catalog - Downloadable List */}
      <motion.div variants={itemVariants}>
        <Card className="transition-all duration-300 hover:shadow-xl border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-[#000000]">
                  Data Catalog
                </CardTitle>
                <CardDescription className="text-[#737692]">
                  Datasets available for preview and download
                </CardDescription>
              </div>
              <Button className="bg-[#D52B1E] hover:bg-[#B8241B] text-white">
                <Download className="h-4 w-4 mr-2" />
                Export (soon)
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dataCatalog.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[#D52B1E]/10 flex items-center justify-center shrink-0">
                      <Database className="h-5 w-5 text-[#D52B1E]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#000000]">
                        {item.name}
                      </h3>
                      <p className="text-sm text-[#737692] mb-2">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {item.horizon}
                        </Badge>
                        {item.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="border-[#D52B1E] text-[#D52B1E] hover:bg-[#D52B1E] hover:text-white shrink-0"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download sample
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
