import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgeCheck,
  Briefcase,
  Building2,
  Clock3,
  FileText,
  Globe2,
  Link2,
  MapPinned,
  Search,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  useCreateProfessionalProfile,
  useProfessionals,
  type CareerLevel,
  type CreateIFProfessionalDto,
  type IFProfessional,
  type ProfessionalScope,
  type VerificationStatus,
} from "@/hooks/useAdmin";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.45 },
  },
};

const CAREER_LABELS: Record<CareerLevel, string> = {
  "Early career": "Early (0-6 yrs)",
  "Mid career": "Mid (7-14 yrs)",
  Senior: "Senior (15+ yrs)",
};

const LEVEL_COLORS: Record<CareerLevel, string> = {
  "Early career": "bg-blue-50 text-blue-700 border-blue-200",
  "Mid career": "bg-purple-50 text-purple-700 border-purple-200",
  Senior: "bg-amber-50 text-amber-700 border-amber-200",
};

const SCOPE_COLORS: Record<ProfessionalScope, string> = {
  Local: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Global: "bg-cyan-50 text-cyan-700 border-cyan-200",
};

const VERIFICATION_COLORS: Record<VerificationStatus, string> = {
  Verified: "bg-green-50 text-green-700 border-green-200",
  Pending: "bg-orange-50 text-orange-700 border-orange-200",
  Unverified: "bg-gray-50 text-gray-700 border-gray-200",
};

const CAREER_OPTIONS: CareerLevel[] = ["Early career", "Mid career", "Senior"];

type LevelFilter = "All" | CareerLevel;
type ScopeFilter = "All" | ProfessionalScope;
type VerificationFilter = "All" | VerificationStatus;

type FormErrors = Partial<Record<keyof CreateIFProfessionalDto, string>>;

const EMPTY_FORM: CreateIFProfessionalDto = {
  fullName: "",
  role: "",
  organization: "",
  location: "",
  linkedinUrl: "",
  description: "",
  seniority: "Early career",
  scope: "Local",
  profileImageUrl: "",
  resumeUrl: "",
  verificationStatus: "Pending",
};

function getVerificationStatus(profile: IFProfessional): VerificationStatus {
  if (profile.verificationStatus) return profile.verificationStatus;
  if (profile.isVerified === true) return "Verified";
  if (profile.isVerified === false) return "Unverified";
  return "Pending";
}

// Nigerian cities/states — location containing any of these → Local
const NIGERIA_KEYWORDS = [
  "nigeria", "lagos", "abuja", "kano", "ibadan", "port harcourt",
  "kaduna", "enugu", "ogun", "oyo", "rivers", "delta", "anambra",
  "abia", "imo", "calabar", "uyo", "owerri", "benin city", "warri",
  "jos", "maiduguri", "sokoto", "ilorin", "ng",
];

function inferScope(profile: IFProfessional): ProfessionalScope {
  if (profile.scope) return profile.scope;
  const loc = (profile.location ?? "").toLowerCase();
  if (NIGERIA_KEYWORDS.some((kw) => loc.includes(kw))) return "Local";
  return "Global";
}

function linkedInUrlIsValid(url: string): boolean {
  if (!url.trim()) return false;
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes("linkedin.com");
  } catch {
    return false;
  }
}

function ProfileRowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-4 animate-pulse">
      <div className="h-12 w-12 rounded-full bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-40 bg-gray-200 rounded" />
        <div className="h-3 w-56 bg-gray-100 rounded" />
        <div className="h-3 w-32 bg-gray-100 rounded" />
      </div>
      <div className="shrink-0 space-y-2">
        <div className="h-5 w-20 bg-gray-100 rounded-full" />
        <div className="h-5 w-16 bg-gray-100 rounded-full" />
      </div>
    </div>
  );
}

export default function IFProfessionals() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("All");
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("All");
  const [verificationFilter, setVerificationFilter] =
    useState<VerificationFilter>("All");
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [form, setForm] = useState<CreateIFProfessionalDto>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const { data: professionals = [], isLoading } = useProfessionals();
  const createProfile = useCreateProfessionalProfile();

  const spotlightPool = useMemo(() => {
    const richProfiles = professionals.filter(
      (p) => p.profileImageUrl || p.description || p.organization,
    );
    const source = richProfiles.length >= 3 ? richProfiles : professionals;
    return source.slice(0, 8);
  }, [professionals]);

  useEffect(() => {
    if (spotlightPool.length <= 1) return;
    const timer = window.setInterval(() => {
      setSpotlightIndex((prev) => (prev + 1) % spotlightPool.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [spotlightPool.length]);

  useEffect(() => {
    if (spotlightIndex < spotlightPool.length) return;
    setSpotlightIndex(0);
  }, [spotlightIndex, spotlightPool.length]);

  const spotlightMain =
    spotlightPool.length > 0 ? spotlightPool[spotlightIndex] : undefined;
  const spotlightMinor =
    spotlightPool.length > 1
      ? [
          spotlightPool[(spotlightIndex + 1) % spotlightPool.length],
          spotlightPool[(spotlightIndex + 2) % spotlightPool.length],
        ].filter((p, idx, arr) => arr.findIndex((x) => x.id === p.id) === idx)
      : [];

  const filtered = useMemo(() => {
    let list = professionals;

    if (levelFilter !== "All") {
      list = list.filter((p) => p.seniority === levelFilter);
    }

    if (scopeFilter !== "All") {
      list = list.filter((p) => inferScope(p) === scopeFilter);
    }

    if (verificationFilter !== "All") {
      list = list.filter((p) => getVerificationStatus(p) === verificationFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          p.role?.toLowerCase().includes(q) ||
          p.organization?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q),
      );
    }

    return list;
  }, [professionals, levelFilter, scopeFilter, verificationFilter, search]);

  function validateForm(): boolean {
    const errors: FormErrors = {};

    if (!form.fullName?.trim()) errors.fullName = "Full name is required";
    if (!form.organization?.trim())
      errors.organization = "Organization is required";
    if (!linkedInUrlIsValid(form.linkedinUrl ?? "")) {
      errors.linkedinUrl = "Enter a valid LinkedIn profile URL";
    }
    if (!form.profileImageUrl) errors.profileImageUrl = "Profile picture is required";
    if (!form.resumeUrl) errors.resumeUrl = "Resume is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function submitProfile() {
    if (!validateForm()) return;

    createProfile.mutate(
      {
        ...form,
        verificationStatus: "Pending",
      },
      {
        onSuccess: () => {
          setForm(EMPTY_FORM);
          setFormErrors({});
        },
      },
    );
  }

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
        <p className="mt-2 text-[#737692] max-w-3xl">
          A LinkedIn-style network for Islamic Finance professionals. Discover
          verified experts, filter by local or global focus, and add your own
          profile for community visibility.
        </p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-0 bg-gradient-to-br from-[#FDF4F3] via-white to-[#FFF7F0] shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-[#D52B1E]">
              <Sparkles className="h-5 w-5" />
              <CardTitle className="text-[#111111]">
                Featured Professionals Spotlight
              </CardTitle>
            </div>
            <CardDescription>
              Profiles rotate automatically every few seconds.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid gap-3 md:grid-cols-3 animate-pulse">
                <div className="md:col-span-2 h-[360px] rounded-2xl bg-gray-200" />
                <div className="flex flex-col gap-3">
                  <div className="flex-1 rounded-2xl bg-gray-200 min-h-[170px]" />
                  <div className="flex-1 rounded-2xl bg-gray-200 min-h-[170px]" />
                </div>
              </div>
            ) : !spotlightMain ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-[#737692]">
                Featured spotlight will appear once professionals are added.
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-3">
                {/* ── Main hero card ── */}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={spotlightMain.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.01 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="md:col-span-2 relative rounded-2xl overflow-hidden bg-gray-900 min-h-[420px] flex flex-col justify-end cursor-pointer group"
                  >
                    {/* Full-bleed photo */}
                    {spotlightMain.profileImageUrl ? (
                      <img
                        src={spotlightMain.profileImageUrl}
                        alt={spotlightMain.fullName}
                        className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#D52B1E]/30 via-[#9B1F15]/40 to-gray-900 flex items-center justify-center">
                        <span className="text-white/20 font-bold" style={{ fontSize: "8rem", lineHeight: 1 }}>
                          {spotlightMain.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Gradient overlay — bottom up */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                    {/* Top-right badges */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      {spotlightMain.seniority && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/15 text-white backdrop-blur-sm border border-white/20">
                          {CAREER_LABELS[spotlightMain.seniority]}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#D52B1E]/80 text-white backdrop-blur-sm">
                        <Sparkles className="h-3 w-3" /> Featured
                      </span>
                    </div>

                    {/* Bottom content */}
                    <div className="relative p-6">
                      <h3 className="text-2xl font-bold text-white leading-tight">
                        {spotlightMain.fullName}
                      </h3>
                      <p className="text-white/80 text-sm mt-1">
                        {spotlightMain.role || "Islamic Finance Professional"}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-white/60">
                        {spotlightMain.organization && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {spotlightMain.organization}
                          </span>
                        )}
                        {spotlightMain.location && (
                          <span className="flex items-center gap-1">
                            <MapPinned className="h-3 w-3" />
                            {spotlightMain.location}
                          </span>
                        )}
                      </div>

                      {spotlightMain.description && (
                        <p className="mt-3 text-sm text-white/65 line-clamp-2 max-w-lg">
                          {spotlightMain.description}
                        </p>
                      )}

                      <div className="mt-4 flex items-center flex-wrap gap-3">
                        <Badge className={`text-xs border ${SCOPE_COLORS[inferScope(spotlightMain)]}`}>
                          <Globe2 className="h-3 w-3 mr-1" />
                          {inferScope(spotlightMain)}
                        </Badge>
                        {spotlightMain.linkedinUrl && (
                          <a
                            href={spotlightMain.linkedinUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-white/70 hover:text-white font-medium transition-colors"
                          >
                            <Link2 className="h-3.5 w-3.5" /> LinkedIn
                          </a>
                        )}
                        {spotlightPool.length > 1 && (
                          <div className="ml-auto flex items-center gap-1.5">
                            {spotlightPool.map((_, idx) => (
                              <button
                                key={spotlightPool[idx].id}
                                onClick={() => setSpotlightIndex(idx)}
                                aria-label={`Show spotlight ${idx + 1}`}
                                className={`rounded-full transition-all ${
                                  idx === spotlightIndex
                                    ? "w-5 h-2 bg-white"
                                    : "w-2 h-2 bg-white/40 hover:bg-white/70"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* ── Side cards – full-bleed portrait ── */}
                <div className="flex flex-col gap-3">
                  {spotlightMinor.map((profile) => {
                    const sideScope = inferScope(profile);
                    return (
                      <div
                        key={profile.id}
                        className="flex-1 rounded-2xl overflow-hidden relative min-h-[204px] cursor-pointer group bg-gray-900"
                      >
                        {/* Full-bleed photo */}
                        {profile.profileImageUrl ? (
                          <img
                            src={profile.profileImageUrl}
                            alt={profile.fullName}
                            className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-[#D52B1E]/25 via-[#9B1F15]/30 to-gray-800 flex items-center justify-center">
                            <span className="text-white/20 font-bold" style={{ fontSize: "5rem", lineHeight: 1 }}>
                              {profile.fullName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

                        {/* Scope pill – top left */}
                        <div className="absolute top-3 left-3">
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm border ${
                              sideScope === "Local"
                                ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/30"
                                : "bg-cyan-500/20 text-cyan-200 border-cyan-400/30"
                            }`}
                          >
                            {sideScope}
                          </span>
                        </div>

                        {/* Bottom info */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <p className="font-semibold text-white text-sm leading-snug line-clamp-1">
                            {profile.fullName}
                          </p>
                          <p className="text-xs text-white/75 mt-0.5 line-clamp-1">
                            {profile.role || "Islamic Finance Professional"}
                          </p>
                          {(profile.organization || profile.location) && (
                            <p className="text-xs text-white/55 mt-0.5 flex items-center gap-1 line-clamp-1">
                              {profile.organization ? (
                                <><Building2 className="h-3 w-3 shrink-0" />{profile.organization}</>
                              ) : (
                                <><MapPinned className="h-3 w-3 shrink-0" />{profile.location}</>
                              )}
                            </p>
                          )}
                          {profile.seniority && (
                            <span className="mt-2 inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-white/15 text-white border border-white/20 backdrop-blur-sm">
                              {CAREER_LABELS[profile.seniority]}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#111111]">
              <Users className="h-5 w-5 text-[#D52B1E]" /> Professional Directory
            </CardTitle>
            <CardDescription>
              Search and filter professionals by career level, verification, and
              local/global focus.
            </CardDescription>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737692]" />
                <Input
                  placeholder="Search by name, role, organization, or location"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <div className="min-w-[165px]">
                <Select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value as LevelFilter)}
                >
                  <option value="All">All career levels</option>
                  {CAREER_OPTIONS.map((level) => (
                    <option key={level} value={level}>
                      {CAREER_LABELS[level]}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-100 shrink-0">
                {(["All", "Local", "Global"] as ScopeFilter[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setScopeFilter(s)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                      scopeFilter === s
                        ? s === "Local"
                          ? "bg-white text-emerald-700 shadow-sm"
                          : s === "Global"
                          ? "bg-white text-cyan-700 shadow-sm"
                          : "bg-white text-[#000000] shadow-sm"
                        : "text-[#737692] hover:text-[#000000]"
                    }`}
                  >
                    {s === "All" ? "All" : s === "Local" ? "🇳🇬 Local" : "🌐 Global"}
                  </button>
                ))}
              </div>
              <div className="min-w-[155px]">
                <Select
                  value={verificationFilter}
                  onChange={(e) =>
                    setVerificationFilter(e.target.value as VerificationFilter)
                  }
                >
                  <option value="All">All statuses</option>
                  <option value="Verified">Verified</option>
                  <option value="Pending">Pending</option>
                  <option value="Unverified">Unverified</option>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="divide-y divide-gray-100">
                {Array.from({ length: 5 }).map((_, i) => (
                  <ProfileRowSkeleton key={i} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-gray-400" />
                </div>
                <p className="mt-3 font-semibold text-[#000000]">
                  No professionals found
                </p>
                <p className="text-sm text-[#737692] mt-1">
                  Adjust your filters or be the first to add your profile.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filtered.map((profile) => {
                  const verification = getVerificationStatus(profile);
                  const scope = inferScope(profile);
                  const roleOrg = [profile.role, profile.organization].filter(Boolean).join(" · ");

                  return (
                    <div
                      key={profile.id}
                      className="flex items-center gap-4 py-4 hover:bg-gray-50/60 px-3 -mx-3 rounded-xl transition-colors"
                    >
                      {/* Avatar */}
                      {profile.profileImageUrl ? (
                        <img
                          src={profile.profileImageUrl}
                          alt={profile.fullName}
                          className="h-12 w-12 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-[#D52B1E]/10 flex items-center justify-center text-[#D52B1E] font-bold text-lg shrink-0">
                          {profile.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}

                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-[#000000] text-sm">
                            {profile.fullName}
                          </span>
                          <Badge className={`text-xs border ${VERIFICATION_COLORS[verification]}`}>
                            {verification === "Verified" ? (
                              <BadgeCheck className="h-3 w-3 mr-1" />
                            ) : verification === "Pending" ? (
                              <Clock3 className="h-3 w-3 mr-1" />
                            ) : (
                              <ShieldAlert className="h-3 w-3 mr-1" />
                            )}
                            {verification}
                          </Badge>
                        </div>
                        {roleOrg && (
                          <p className="text-xs text-[#737692] mt-0.5 line-clamp-1">{roleOrg}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-[#737692]">
                          {profile.location && (
                            <span className="flex items-center gap-0.5">
                              <MapPinned className="h-3 w-3 shrink-0" />
                              {profile.location}
                            </span>
                          )}
                          {profile.linkedinUrl && (
                            <a
                              href={profile.linkedinUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-0.5 text-[#0A66C2] hover:underline font-medium"
                            >
                              <Link2 className="h-3 w-3" /> LinkedIn
                            </a>
                          )}
                          {profile.resumeUrl && (
                            <a
                              href={profile.resumeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-0.5 text-[#737692] hover:underline"
                            >
                              <FileText className="h-3 w-3" /> Resume
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Right-side badges */}
                      <div className="shrink-0 flex flex-col items-end gap-1.5">
                        {profile.seniority && (
                          <Badge className={`text-xs border ${LEVEL_COLORS[profile.seniority]}`}>
                            {CAREER_LABELS[profile.seniority]}
                          </Badge>
                        )}
                        <Badge className={`text-xs border ${SCOPE_COLORS[scope]}`}>
                          <Globe2 className="h-3 w-3 mr-1" />
                          {scope}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#111111]">Add Yourself</CardTitle>
            <CardDescription>
              Submit your profile to be listed in the IF Professionals network.
              Verification is handled by admin review.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-600">
                Full name
              </label>
              <Input
                value={form.fullName ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, fullName: e.target.value }))
                }
                placeholder="Your name"
                className="h-9 mt-1"
              />
              {formErrors.fullName && (
                <p className="text-xs text-red-600 mt-1">{formErrors.fullName}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">
                Organization
              </label>
              <Input
                value={form.organization ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, organization: e.target.value }))
                }
                placeholder="Organization or institution"
                className="h-9 mt-1"
              />
              {formErrors.organization && (
                <p className="text-xs text-red-600 mt-1">
                  {formErrors.organization}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">
                LinkedIn profile URL
              </label>
              <Input
                type="url"
                value={form.linkedinUrl ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, linkedinUrl: e.target.value }))
                }
                placeholder="https://www.linkedin.com/in/yourname"
                className="h-9 mt-1"
              />
              {formErrors.linkedinUrl && (
                <p className="text-xs text-red-600 mt-1">
                  {formErrors.linkedinUrl}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600">
                  Career level
                </label>
                <Select
                  value={form.seniority ?? "Early career"}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      seniority: e.target.value as CareerLevel,
                    }))
                  }
                >
                  {CAREER_OPTIONS.map((level) => (
                    <option key={level} value={level}>
                      {CAREER_LABELS[level]}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">
                  Local / Global
                </label>
                <Select
                  value={form.scope ?? "Local"}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      scope: e.target.value as ProfessionalScope,
                    }))
                  }
                >
                  <option value="Local">Local</option>
                  <option value="Global">Global</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">
                Picture
              </label>
              <div className="mt-1">
                <ImageUpload
                  value={form.profileImageUrl ?? ""}
                  onChange={(url) =>
                    setForm((prev) => ({ ...prev, profileImageUrl: url }))
                  }
                  previewHeight="h-24"
                />
              </div>
              {formErrors.profileImageUrl && (
                <p className="text-xs text-red-600 mt-1">
                  {formErrors.profileImageUrl}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">Resume</label>
              <div className="mt-1">
                <ImageUpload
                  mode="document"
                  value={form.resumeUrl ?? ""}
                  onChange={(url) => setForm((prev) => ({ ...prev, resumeUrl: url }))}
                  previewHeight="h-24"
                />
              </div>
              {formErrors.resumeUrl && (
                <p className="text-xs text-red-600 mt-1">{formErrors.resumeUrl}</p>
              )}
            </div>

            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-xs text-orange-700">
              <p className="font-semibold flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5" /> Verification workflow
              </p>
              <p className="mt-1">
                New submissions are marked as Pending and can become Verified
                after admin approval.
              </p>
            </div>

            <Button
              className="w-full bg-[#D52B1E] hover:bg-[#B8241B]"
              onClick={submitProfile}
              disabled={createProfile.isPending}
            >
              {createProfile.isPending ? "Submitting..." : "Submit Profile"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
