import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function Directory() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const institutions = [
    {
      name: "International Ethical Finance Academy (IEFA)",
      logo: "🏛️",
      description:
        "Academic and professional institution contributing to Islamic finance education and research",
      categories: ["Education", "Research"],
    },
    {
      name: "Islamic Finance Chamber",
      logo: "🏢",
      description:
        "A collaborative platform dedicated to promoting sustainable finance practices and education",
      categories: ["Education", "Research"],
    },
    {
      name: "University Center for Islamic Economics",
      logo: "🎓",
      description:
        "An organization focused on increasing the scale and effectiveness of impact investment",
      categories: ["Education", "Research"],
    },
  ];

  const companiesByLetter = {
    A: ["Amana Advisors", "Al-Baraka Banking Group", "Arbift", "Aseel Finance"],
    B: ["Bank Islam", "Boubyan Bank", "Bahrain Islamic Bank"],
    C: ["CIMB Islamic", "Citi Islamic Investment"],
    D: ["Dubai Islamic Bank", "Dallah Al Baraka"],
  };

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight text-[#000000]">
          Directory
        </h1>
        <p className="text-[#737692] mt-2">
          A curated reference hub of institutions, professionals, scholars, and
          organizations within the Islamic and ethical finance ecosystem.
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search Institutions, Experts and Organizations"
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="border-gray-300">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filter
        </Button>
        <Button variant="outline" className="border-gray-300">
          <ArrowUpDown className="h-4 w-4 mr-2" />
          Sort
        </Button>
      </motion.div>

      {/* Main Tabs */}
      <Tabs defaultValue="institutions" className="w-full">
        <TabsList className="bg-transparent h-auto p-0 mb-6 gap-2 border-b-0 w-full justify-start overflow-x-auto scrollbar-hide -mx-2 px-2 flex-nowrap md:flex-wrap md:overflow-visible md:px-0">
          <TabsTrigger
            value="institutions"
            className="bg-white px-6 py-2 text-sm font-medium data-[state=active]:bg-[#D52B1E] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-full text-[#000000] border border-gray-200 data-[state=active]:border-[#D52B1E] shrink-0"
          >
            Institutions
          </TabsTrigger>
          <TabsTrigger
            value="scholars"
            className="bg-white px-6 py-2 text-sm font-medium data-[state=active]:bg-[#D52B1E] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-full text-[#000000] border border-gray-200 data-[state=active]:border-[#D52B1E] shrink-0"
          >
            Scholars & Experts
          </TabsTrigger>
          <TabsTrigger
            value="firms"
            className="bg-white px-6 py-2 text-sm font-medium data-[state=active]:bg-[#D52B1E] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-full text-[#000000] border border-gray-200 data-[state=active]:border-[#D52B1E] shrink-0"
          >
            Firms & Service Providers
          </TabsTrigger>
          <TabsTrigger
            value="regulatory"
            className="bg-white px-6 py-2 text-sm font-medium data-[state=active]:bg-[#D52B1E] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-full text-[#000000] border border-gray-200 data-[state=active]:border-[#D52B1E] shrink-0"
          >
            Regulatory Bodies
          </TabsTrigger>
        </TabsList>

        {/* Institutions Tab */}
        <TabsContent value="institutions" className="mt-6">
          <div className="space-y-8">
            {/* Featured Institutions */}
            <div className="grid gap-6 md:grid-cols-3">
              {institutions.map((institution, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-xl transition-all h-full">
                    <CardHeader>
                      <div className="space-y-4">
                        <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-[#D52B1E] to-[#6F1610] flex items-center justify-center text-3xl">
                          {institution.logo}
                        </div>
                        <div>
                          <CardTitle className="text-[#000000] mb-2">
                            {institution.name}
                          </CardTitle>
                          <CardDescription className="text-[#737692]">
                            {institution.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {institution.categories.map((category, idx) => (
                            <Badge
                              key={idx}
                              className="bg-[#D52B1E]/10 text-[#D52B1E] border-[#D52B1E]/20 hover:bg-[#D52B1E]/20"
                            >
                              {category}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          variant="ghost"
                          className="w-full justify-between text-[#D52B1E] hover:text-[#B8241B] hover:bg-[#D52B1E]/10"
                        >
                          View Profile
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Other Institutions */}
            <div>
              <h2 className="text-xl font-bold text-[#000000] mb-6">
                Other Institutions
              </h2>

              {/* Alphabetical Listing */}
              <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
                <CardHeader>
                  <CardTitle className="text-[#000000]">
                    Other Companies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-8">
                    {Object.entries(companiesByLetter).map(
                      ([letter, companies]) => (
                        <div key={letter}>
                          <h3 className="text-2xl font-bold text-[#000000] mb-4">
                            {letter}
                          </h3>
                          <ul className="space-y-2">
                            {companies.map((company, index) => (
                              <li key={index}>
                                <button className="flex items-center justify-between w-full text-left text-[#737692] hover:text-[#D52B1E] transition-colors group">
                                  <div className="flex items-center gap-2">
                                    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span>{company}</span>
                                  </div>
                                  <ChevronRight className="h-4 w-4" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Scholars & Experts Tab */}
        <TabsContent value="scholars" className="mt-6">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Dr. Muhammad Al-Amin",
                role: "Shariah Scholar",
                organization: "AAOIFI",
                expertise: ["Shariah Compliance", "Islamic Banking"],
              },
              {
                name: "Prof. Fatima Hassan",
                role: "Islamic Finance Expert",
                organization: "University of Oxford",
                expertise: ["ESG Finance", "Research"],
              },
              {
                name: "Sheikh Omar Farooq",
                role: "Shariah Advisor",
                organization: "IFSB",
                expertise: ["Sukuk", "Takaful"],
              },
              {
                name: "Dr. Aisha Rahman",
                role: "Islamic Economist",
                organization: "Islamic Development Bank",
                expertise: ["Economics", "Policy"],
              },
              {
                name: "Dr. Yusuf Ibrahim",
                role: "Finance Professor",
                organization: "Harvard University",
                expertise: ["Investment", "Markets"],
              },
              {
                name: "Sheikh Ahmed Al-Qaradawi",
                role: "Shariah Board Member",
                organization: "Multiple Institutions",
                expertise: ["Fiqh", "Finance"],
              },
            ].map((scholar, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-2xl font-bold">
                        {scholar.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#000000]">
                          {scholar.name}
                        </h4>
                        <p className="text-sm text-[#737692]">{scholar.role}</p>
                        <p className="text-xs text-[#737692]">
                          {scholar.organization}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {scholar.expertise.map((exp, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs"
                          >
                            {exp}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        className="w-full border-[#D52B1E] text-[#D52B1E] hover:bg-[#D52B1E] hover:text-white"
                      >
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Firms & Service Providers Tab */}
        <TabsContent value="firms" className="mt-6">
          <div className="grid gap-4">
            {[
              {
                name: "Islamic Finance Advisory Group",
                type: "Consulting",
                services: ["Advisory", "Structuring", "Compliance"],
              },
              {
                name: "Shariah Audit Solutions",
                type: "Auditing",
                services: ["Shariah Audit", "Risk Management"],
              },
              {
                name: "Halal Investment Managers",
                type: "Asset Management",
                services: ["Portfolio Management", "ESG Investing"],
              },
              {
                name: "Islamic Legal Services",
                type: "Legal",
                services: ["Contract Review", "Regulatory Compliance"],
              },
            ].map((firm, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white text-lg font-bold">
                          {firm.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#000000]">
                            {firm.name}
                          </h4>
                          <p className="text-sm text-[#737692]">{firm.type}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {firm.services.map((service, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs"
                              >
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" className="text-[#D52B1E]">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Regulatory Bodies Tab */}
        <TabsContent value="regulatory" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                name: "AAOIFI",
                fullName:
                  "Accounting and Auditing Organization for Islamic Financial Institutions",
                location: "Bahrain",
                focus: "Standards Development",
              },
              {
                name: "IFSB",
                fullName: "Islamic Financial Services Board",
                location: "Malaysia",
                focus: "Regulatory Standards",
              },
              {
                name: "IIFM",
                fullName: "International Islamic Financial Market",
                location: "Bahrain",
                focus: "Market Infrastructure",
              },
              {
                name: "CIBAFI",
                fullName:
                  "General Council for Islamic Banks and Financial Institutions",
                location: "Bahrain",
                focus: "Industry Representation",
              },
            ].map((body, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-xl transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-[#000000] text-xl mb-1">
                          {body.name}
                        </CardTitle>
                        <CardDescription className="text-[#737692]">
                          {body.fullName}
                        </CardDescription>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                        Regulatory
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-[#737692]">Location:</span>
                        <span className="font-medium text-[#000000]">
                          {body.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-[#737692]">Focus Area:</span>
                        <span className="font-medium text-[#000000]">
                          {body.focus}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full border-[#D52B1E] text-[#D52B1E] hover:bg-[#D52B1E] hover:text-white"
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
