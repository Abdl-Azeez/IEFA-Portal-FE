import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, MapPin, GraduationCap, Search, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useProfessionals, type CareerLevel } from "@/hooks/useAdmin";

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

const journeySteps = [
  {
    stage: "Early career",
    title: "Analyst & associate years",
    focus:
      "Master the language of markets, build core models and gain breadth.",
  },
  {
    stage: "Mid career",
    title: "Portfolio & product leadership",
    focus: "Translate ideas into portfolios, manage risk and lead teams.",
  },
  {
    stage: "Senior",
    title: "CIO & investment committee",
    focus: "Set frameworks, steward governance and shape institutions.",
  },
];

const LEVEL_COLORS: Record<CareerLevel, string> = {
  "Early career": "bg-blue-50 text-blue-700 border-blue-200",
  "Mid career": "bg-purple-50 text-purple-700 border-purple-200",
  Senior: "bg-amber-50 text-amber-700 border-amber-200",
};

type LevelFilter = "All" | CareerLevel;
const LEVEL_FILTERS: LevelFilter[] = [
  "All",
  "Early career",
  "Mid career",
  "Senior",
];

function ProfileCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
      <div className="flex flex-col items-center gap-3">
        <div className="h-16 w-16 rounded-full bg-gray-200" />
        <div className="h-4 w-28 bg-gray-200 rounded" />
        <div className="h-3 w-20 bg-gray-100 rounded" />
        <div className="h-3 w-24 bg-gray-100 rounded" />
        <div className="h-6 w-16 bg-gray-100 rounded-full" />
      </div>
    </div>
  );
}

export default function IFProfessionals() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("All");

  const { data: professionals = [], isLoading } = useProfessionals();

  const filtered = useMemo(() => {
    let list = professionals;
    if (levelFilter !== "All")
      list = list.filter((p) => p.seniority === levelFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          p.role?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [professionals, levelFilter, search]);

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
          IF Professionals
        </h1>
        <p className="mt-2 text-[#737692]">
          A dedicated workspace for investment and finance professionals –
          curated content, peer learning, and practical tools.
        </p>
      </motion.div>

      {/* Career Journey */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-[#D52B1E]" />
              <CardTitle className="text-[#000000]">Career Journey</CardTitle>
            </div>
            <CardDescription className="text-[#737692]">
              IEFA as a career-long companion for investment & finance
              professionals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {journeySteps.map((step, index) => (
                <motion.div
                  key={step.stage}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-start gap-4 p-4 bg-white rounded-lg border hover:shadow-md transition-all"
                >
                  <div className="h-10 w-10 rounded-full bg-[#D52B1E]/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-[#D52B1E]">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <Badge className="bg-[#D52B1E]/10 text-[#D52B1E] border-[#D52B1E]/20 mb-2">
                      {step.stage}
                    </Badge>
                    <h3 className="font-semibold text-[#000000]">
                      {step.title}
                    </h3>
                    <p className="text-sm text-[#737692] mt-1">{step.focus}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Professional Directory */}
      <motion.div variants={itemVariants}>
        <Card className="transition-all duration-300 hover:shadow-xl border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-[#000000] flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#D52B1E]" />
                  Professional Directory
                </CardTitle>
                <CardDescription className="text-[#737692] mt-1">
                  Browse Islamic Finance professionals across career levels.
                </CardDescription>
              </div>
              {!isLoading && (
                <span className="text-sm text-[#737692] font-medium">
                  {filtered.length}{" "}
                  {filtered.length === 1 ? "profile" : "profiles"}
                </span>
              )}
            </div>

            {/* Search + filter */}
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737692]" />
                <Input
                  placeholder="Search by name, role, or location…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-sm rounded-lg"
                />
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {LEVEL_FILTERS.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLevelFilter(l)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                      levelFilter === l
                        ? "bg-[#D52B1E] text-white border-[#D52B1E]"
                        : "border-gray-200 text-[#737692] hover:border-[#D52B1E] hover:text-[#D52B1E]"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProfileCardSkeleton key={i} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center">
                  <Users className="h-7 w-7 text-gray-400" />
                </div>
                <p className="font-semibold text-[#000000]">
                  No professionals found
                </p>
                <p className="text-sm text-[#737692]">
                  {search || levelFilter !== "All"
                    ? "Try adjusting your search or filter."
                    : "No professional profiles have been added yet."}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((profile, index) => (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-lg transition-all h-full border border-gray-100">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center space-y-3">
                          {profile.profileImageUrl ? (
                            <img
                              src={profile.profileImageUrl}
                              alt={profile.fullName}
                              className="h-16 w-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#D52B1E] to-[#6F1610] flex items-center justify-center text-white text-xl font-bold shrink-0">
                              {profile.fullName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="space-y-1">
                            <h4 className="font-semibold text-[#000000]">
                              {profile.fullName}
                            </h4>
                            {profile.role && (
                              <p className="text-sm text-[#737692]">
                                {profile.role}
                              </p>
                            )}
                            {profile.location && (
                              <p className="text-xs text-[#737692] flex items-center justify-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {profile.location}
                              </p>
                            )}
                            {profile.description && (
                              <p className="text-xs text-[#737692] line-clamp-2 mt-1">
                                {profile.description}
                              </p>
                            )}
                            {profile.seniority && (
                              <Badge
                                className={`mt-1 text-xs px-2.5 border ${LEVEL_COLORS[profile.seniority]}`}
                              >
                                <GraduationCap className="h-3 w-3 mr-1" />
                                {profile.seniority}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
