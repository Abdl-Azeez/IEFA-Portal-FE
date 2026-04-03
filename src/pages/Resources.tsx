import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  FileText,
  Shield,
  Wrench,
  BookA,
  Library,
  Calculator,
  Lock,
  TrendingUp,
  Bitcoin,
  Search,
  X,
  Plus,
  Loader2,
} from "lucide-react";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { ResourcePreviewPage } from "@/components/resources/ResourcePreviewPage";
import { DownloadEmailModal } from "@/components/resources/DownloadEmailModal";
import { GlossarySection } from "@/components/resources/GlossarySection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  useResources,
  useResourceCategories,
  useGlossaryTerms,
  useTrackResourceDownload,
  useSubmitUserResource,
} from "@/hooks/useResources";
import { toast } from "@/hooks/use-toast";
import type { ResourceItem } from "@/types/resources";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.45 } },
};

/* ── Sub-category config ──────────────────────────────────────────────────── */
type SubCategoryKey =
  | "all"
  | "educational-guides"
  | "research-publications"
  | "standards-governance"
  | "tools-practical"
  | "glossary";

interface SubCategoryConfig {
  key: SubCategoryKey;
  label: string;
  icon: React.ElementType;
  resourceType?: "guide" | "research" | "standard" | "tool";
}

const SUB_CATEGORIES: SubCategoryConfig[] = [
  { key: "all", label: "All", icon: Library },
  {
    key: "educational-guides",
    label: "Educational Guides",
    icon: BookOpen,
    resourceType: "guide",
  },
  {
    key: "research-publications",
    label: "Research & Publications",
    icon: FileText,
    resourceType: "research",
  },
  {
    key: "standards-governance",
    label: "Standards & Governance",
    icon: Shield,
    resourceType: "standard",
  },
  {
    key: "tools-practical",
    label: "Tools & Practical",
    icon: Wrench,
    resourceType: "tool",
  },
  { key: "glossary", label: "Glossary", icon: BookA },
];

/* ── Regulatory bodies ────────────────────────────────────────────────────── */
interface RegulatoryBody {
  readonly id: string;
  readonly name: string;
  readonly fullName: string;
  readonly logoUrl: string;
  readonly color: string;
  readonly description: string;
}

const REGULATORY_BODIES: RegulatoryBody[] = [
  {
    id: "cbn",
    name: "CBN",
    fullName: "Central Bank of Nigeria",
    logoUrl: "https://www.cbn.gov.ng/images/cbn_logo.png",
    color: "#006847",
    description:
      "Nigeria's apex monetary authority responsible for financial system stability.",
  },
  {
    id: "sec",
    name: "SEC",
    fullName: "Securities & Exchange Commission",
    logoUrl: "https://sec.gov.ng/wp-content/uploads/2021/03/sec-logo.png",
    color: "#003082",
    description:
      "Regulator of the Nigerian capital market and investment activities.",
  },
  {
    id: "naicom",
    name: "NAICOM",
    fullName: "National Insurance Commission",
    logoUrl: "https://naicom.gov.ng/images/logo.png",
    color: "#8B0000",
    description:
      "Supervisory and regulatory authority for the insurance industry.",
  },
  {
    id: "ndic",
    name: "NDIC",
    fullName: "Nigeria Deposit Insurance Corporation",
    logoUrl: "https://ndic.gov.ng/wp-content/uploads/2020/09/NDIC-logo.png",
    color: "#1a4b8c",
    description:
      "Protects depositors and maintains confidence in the banking system.",
  },
];

interface DocumentTypeConfig {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

const DOCUMENT_TYPES: DocumentTypeConfig[] = [
  {
    id: "circulars-directives",
    label: "Circulars & Directives",
    description:
      "Actionable, binding instructions with immediate compliance deadlines.",
  },
  {
    id: "guidelines-frameworks",
    label: "Guidelines & Frameworks",
    description:
      "Comprehensive operational manuals (e.g., Basel III, Open Banking framework).",
  },
  {
    id: "notices-press-releases",
    label: "Notices & Press Releases",
    description: "General market updates or administrative announcements.",
  },
  {
    id: "data-statistical-bulletins",
    label: "Data & Statistical Bulletins",
    description: "Macroeconomic reports, inflation stats, and PMI data.",
  },
  {
    id: "communiques",
    label: "Communiques",
    description:
      "Outcomes of meetings (e.g., Monetary Policy Committee decisions).",
  },
];

/* ── Category chip component ──────────────────────────────────────────────── */
interface CategoryChipProps {
  readonly label: string;
  readonly count: number;
  readonly active: boolean;
  readonly onClick: () => void;
}
function CategoryChip({ label, count, active, onClick }: CategoryChipProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 border shrink-0 ${
        active
          ? "bg-[#D52B1E] text-white border-[#D52B1E] shadow-sm"
          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-800"
      }`}
    >
      {label}
      <span
        className={`text-xs px-2 py-0.5 rounded-full ${
          active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

type SortBy = "date" | "views" | "downloads";

interface UploadForm {
  title: string;
  briefIntro: string;
  categoryId: string;
  resourceType: string;
  subCategoryId: string;
  customSubCategory: string;
  docTypeId: string;
  customDocType: string;
  authorName: string;
}

const EMPTY_UPLOAD_FORM: UploadForm = {
  title: "",
  briefIntro: "",
  categoryId: "",
  resourceType: "",
  subCategoryId: "",
  customSubCategory: "",
  docTypeId: "",
  customDocType: "",
  authorName: "",
};

const PAGE_SIZE = 9;

/* ════════════════════════════════════════════════════════════════════════════ */
export default function Resources() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTopCategory, setActiveTopCategory] = useState<string>("all");
  const [activeSubCategory, setActiveSubCategory] =
    useState<SubCategoryKey>("all");
  const [selectedApiCategory, setSelectedApiCategory] = useState<string>("");

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [geography, setGeography] = useState<"all" | "local" | "global">("all");

  const [previewResourceId, setPreviewResourceId] = useState("");
  const [downloadResource, setDownloadResource] = useState<ResourceItem | null>(
    null,
  );

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState<UploadForm>(EMPTY_UPLOAD_FORM);
  const [resourceFileUrl, setResourceFileUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [resourceUploadPending, setResourceUploadPending] = useState(false);
  const [coverUploadPending, setCoverUploadPending] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);

  /* ── Regulatory drill-down state ── */
  const [activeRegBody, setActiveRegBody] = useState<string>(""); // '' = overview
  const [activeDocType, setActiveDocType] = useState<string>("all"); // document type filter

  const { data: categoriesData } = useResourceCategories();
  const trackDownload = useTrackResourceDownload();
  const submitResource = useSubmitUserResource();

  /* ── Two fixed top-level categories; all current API data is General ── */
  const TOP_CATEGORIES = [
    { id: "general", name: "General" },
    { id: "regulatory", name: "Regulatory" },
  ] as const;

  /* ── Sub-categories from API (used for General resources) ── */
  const apiSubCategories = useMemo(
    () => (categoriesData ?? []).sort((a, b) => a.name.localeCompare(b.name)),
    [categoriesData],
  );

  /* ── resourceType filter from active built-in sub-category ── */
  const activeResourceType = useMemo(
    () => SUB_CATEGORIES.find((s) => s.key === activeSubCategory)?.resourceType,
    [activeSubCategory],
  );

  /* ── Resources query ── */
  const { data: resourcesData, isLoading: resourcesLoading } = useResources(
    activeSubCategory === "glossary"
      ? { page: 1, perPage: 1, status: "published" }
      : {
          ...(activeResourceType ? { resourceType: activeResourceType } : {}),
          ...(search ? { search } : {}),
          ...(selectedApiCategory ? { categoryId: selectedApiCategory } : {}),
          order: "DESC",
        },
  );

  const { data: allResourcesData } = useResources({
    page: 1,
    perPage: 100,
    order: "DESC",
  });

  // Use all returned resources — status filtering is not yet functional on this API
  const publishedResources = useMemo(
    () => allResourcesData?.data ?? [],
    [allResourcesData?.data],
  );

  const isLocalResource = (item: ResourceItem) => {
    const haystack = [
      item.title,
      item.briefIntro ?? "",
      item.authorName ?? "",
      ...(item.tags ?? []),
    ]
      .join(" ")
      .toLowerCase();

    return (
      haystack.includes("nigeria") ||
      haystack.includes("nigerian") ||
      haystack.includes("naira") ||
      haystack.includes("cbn") ||
      haystack.includes("naicom") ||
      haystack.includes("ndic") ||
      haystack.includes("sec nigeria")
    );
  };

  const applyGeographyFilter = (items: ResourceItem[]) => {
    if (geography === "local") return items.filter(isLocalResource);
    if (geography === "global")
      return items.filter((item) => !isLocalResource(item));
    return items;
  };

  const geoPublishedResources = useMemo(
    () => applyGeographyFilter(publishedResources),
    [publishedResources, geography],
  );

  const { data: glossaryData, isLoading: glossaryLoading } = useGlossaryTerms({
    status: "published",
  });

  /* ── Sync URL → state ── */
  useEffect(() => {
    const cat = searchParams.get("category") ?? "all";
    const sub = searchParams.get("sub") as SubCategoryKey | null;
    setActiveTopCategory(cat);
    if (
      sub &&
      (
        [
          "all",
          "educational-guides",
          "research-publications",
          "standards-governance",
          "tools-practical",
          "glossary",
        ] as string[]
      ).includes(sub)
    ) {
      setActiveSubCategory(sub);
    }
  }, [searchParams]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /* ── Reset on category change ── */
  useEffect(() => {
    setSearch("");
    setSelectedApiCategory("");
    setSortBy("date");
    setVisibleCount(PAGE_SIZE);
    if (activeTopCategory !== "regulatory") {
      setActiveRegBody("");
      setActiveDocType("all");
    }
  }, [activeTopCategory, activeSubCategory]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, sortBy, selectedApiCategory, geography]);

  /* ── Sub-category counts — per API category + glossary ── */
  const subCategoryCounts = useMemo(() => {
    const isRegulatory = activeTopCategory === "regulatory";
    const allItems = isRegulatory ? [] : geoPublishedResources;
    const counts: Record<string, number> = { all: allItems.length };
    for (const item of allItems) {
      if (item.categoryId)
        counts[item.categoryId] = (counts[item.categoryId] ?? 0) + 1;
    }
    counts["glossary"] = isRegulatory ? 0 : (glossaryData?.length ?? 0);
    return counts;
  }, [geoPublishedResources, glossaryData?.length, activeTopCategory]);

  /* ── Top-level category counts ── */
  const topCategoryCounts = useMemo(() => {
    const total = geoPublishedResources.length;
    return {
      all: total,
      general: total, // all current API data belongs to General
      regulatory: 0, // no regulatory data yet
    };
  }, [geoPublishedResources.length]);

  /* ── Sorted & filtered resources ── */
  const currentResources = useMemo(() => {
    // Regulatory has no API data yet — return empty
    if (activeTopCategory === "regulatory") return [];
    const items = [...applyGeographyFilter(resourcesData?.data ?? [])];
    if (sortBy === "views") items.sort((a, b) => b.viewCount - a.viewCount);
    else if (sortBy === "downloads")
      items.sort((a, b) => b.downloadCount - a.downloadCount);
    else
      items.sort(
        (a, b) =>
          new Date(b.publishedAt ?? b.createdAt).getTime() -
          new Date(a.publishedAt ?? a.createdAt).getTime(),
      );
    return items;
  }, [resourcesData?.data, sortBy, activeTopCategory, geography]);

  const apiCategoryChips = useMemo(
    () =>
      apiSubCategories
        .map((c) => ({ id: c.id, name: c.name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [apiSubCategories],
  );

  /* ── Navigation helpers ── */
  function switchTopCategory(catId: string) {
    setActiveTopCategory(catId);
    setActiveSubCategory("all");
    setSelectedApiCategory("");
    const p = new URLSearchParams(searchParams);
    p.set("category", catId);
    p.delete("sub");
    setSearchParams(p);
  }

  function switchSubCategory(key: SubCategoryKey) {
    setActiveSubCategory(key);
    setSelectedApiCategory("");
    const p = new URLSearchParams(searchParams);
    p.set("sub", key);
    setSearchParams(p);
  }

  /* ── Submit handler ── */
  async function handleSubmitResource() {
    const nextErrors: Record<string, string> = {};
    if (!uploadForm.title.trim()) nextErrors.title = "Title is required.";
    if (!uploadForm.categoryId) nextErrors.categoryId = "Category is required.";
    if (!resourceFileUrl)
      nextErrors.resourceFileUrl = "Resource file is required.";
    if (resourceUploadPending || coverUploadPending)
      nextErrors.uploadPending = "Please wait for uploads to finish.";
    if (Object.keys(nextErrors).length > 0) {
      setUploadErrors(nextErrors);
      toast.error("Please complete required fields before submitting.");
      return;
    }
    setUploadErrors({});
    try {
      setUploading(true);
      const isCustomSub = uploadForm.subCategoryId === "__custom__";
      const isCustomDoc = uploadForm.docTypeId === "__custom__";
      await submitResource.mutateAsync({
        title: uploadForm.title.trim(),
        briefIntro: uploadForm.briefIntro || undefined,
        categoryId: uploadForm.categoryId,
        resourceType:
          (uploadForm.resourceType as import("@/types/resources").ResourceType) ||
          undefined,
        subCategoryId: isCustomSub
          ? undefined
          : uploadForm.subCategoryId || undefined,
        suggestedSubCategoryName: isCustomSub
          ? uploadForm.customSubCategory.trim() || undefined
          : undefined,
        suggestedDocTypeName: isCustomDoc
          ? uploadForm.customDocType.trim() || undefined
          : undefined,
        fileUrl: resourceFileUrl,
        coverImageUrl: coverImageUrl || undefined,
        authorName: uploadForm.authorName || undefined,
      });
      toast({
        title: "Resource submitted!",
        description: "Your resource is pending admin review.",
      });
      setUploadOpen(false);
      setUploadForm(EMPTY_UPLOAD_FORM);
      setResourceFileUrl("");
      setCoverImageUrl("");
      setUploadErrors({});
    } catch {
      // handled by mutation
    } finally {
      setUploading(false);
    }
  }

  if (previewResourceId) {
    return (
      <ResourcePreviewPage
        resourceId={previewResourceId}
        onBack={() => setPreviewResourceId("")}
      />
    );
  }

  const isLoading =
    activeSubCategory === "glossary" ? glossaryLoading : resourcesLoading;
  const totalCount = publishedResources.length + (glossaryData?.length ?? 0);

  const uploadSubCats =
    uploadForm.categoryId === "general" ? apiSubCategories : [];

  return (
    <>
      <motion.div
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* ── Hero ── */}
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-950 via-[#1c0505] to-gray-900 p-8 md:p-12 min-h-[220px] flex items-center">
            <div className="pointer-events-none absolute -top-16 -right-16 h-72 w-72 rounded-full bg-[#D52B1E]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-[#D52B1E]/10 blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8 w-full">
              <div className="flex-1 space-y-4">
                <span className="inline-flex items-center gap-1.5 bg-[#D52B1E]/20 text-[#D52B1E] text-xs font-bold px-3 py-1.5 rounded-full border border-[#D52B1E]/30 tracking-widest uppercase">
                  <Library className="h-3 w-3" /> IEFA Resources
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                  Your gateway to{" "}
                  <span className="text-[#D52B1E]">Islamic Finance</span>{" "}
                  knowledge
                </h1>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl">
                  Curated guides, research publications, regulatory standards,
                  and practical tools designed to help you learn about Islamic
                  finance.
                </p>

                <div className="flex gap-3 pt-1 flex-wrap">
                  {[
                    { label: "Total Resources", value: totalCount },
                    { label: "Categories", value: 2 },
                    {
                      label: "Glossary Terms",
                      value: glossaryData?.length ?? 0,
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-center"
                    >
                      <p className="text-xl font-bold text-white">
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => setUploadOpen(true)}
                    className="bg-[#D52B1E] hover:bg-[#B8241B] text-white rounded-xl gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Contribute Listing
                  </Button>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Contributions are submitted as drafts and published only
                    after admin approval.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-widest mr-1">
                    View:
                  </span>
                  {(
                    [
                      {
                        id: "all" as const,
                        label: "🌐 All",
                        desc: "All resources",
                      },
                      {
                        id: "local" as const,
                        label: "🇳🇬 Local",
                        desc: "Nigeria-focused resources",
                      },
                      {
                        id: "global" as const,
                        label: "🌍 Global",
                        desc: "International resources",
                      },
                    ] as const
                  ).map((g) => (
                    <button
                      key={g.id}
                      onClick={() => {
                        setGeography(g.id);
                        setVisibleCount(PAGE_SIZE);
                      }}
                      title={g.desc}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                        geography === g.id
                          ? "bg-[#D52B1E] text-white border-[#D52B1E] shadow-lg shadow-[#D52B1E]/25"
                          : "bg-white/10 text-gray-300 border-white/20 hover:bg-white/20 hover:text-white"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search */}
              <div className="shrink-0 w-full md:w-72">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search resources..."
                    className="w-full pl-12 pr-10 h-12 rounded-2xl bg-white border-0 shadow-xl text-gray-800 placeholder:text-gray-400 text-sm focus:outline-none"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute right-8 bottom-4 opacity-5 text-white select-none hidden md:block">
              <Library className="h-52 w-52" />
            </div>
          </div>
        </motion.div>

        {/* ── Top-level category tabs (sticky) ── */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-gray-100 rounded-xl shadow-sm sticky top-16 z-20 overflow-hidden"
        >
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3 px-4">
            {/* All */}
            <button
              onClick={() => switchTopCategory("all")}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTopCategory === "all"
                  ? "bg-[#D52B1E] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <Library className="h-4 w-4" />
              All Resources
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTopCategory === "all"
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {topCategoryCounts["all"] ?? 0}
              </span>
            </button>

            {TOP_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => switchTopCategory(cat.id)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  activeTopCategory === cat.id
                    ? "bg-[#D52B1E] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                {cat.name}
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTopCategory === cat.id
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {topCategoryCounts[cat.id] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Content area ── */}
        <div className="space-y-5">
          {/* Sub-category chips + sort — only shown for General / All */}
          {activeTopCategory !== "regulatory" && (
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-3"
            >
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 flex-1">
                {/* All chip */}
                <CategoryChip
                  label="All"
                  active={activeSubCategory === "all" && !selectedApiCategory}
                  count={subCategoryCounts["all"] ?? 0}
                  onClick={() => {
                    setActiveSubCategory("all");
                    setSelectedApiCategory("");
                  }}
                />

                {/* API category chips */}
                {apiCategoryChips.map((chip) => (
                  <CategoryChip
                    key={chip.id}
                    label={chip.name}
                    active={selectedApiCategory === chip.id}
                    count={subCategoryCounts[chip.id] ?? 0}
                    onClick={() => {
                      setSelectedApiCategory(chip.id);
                      setActiveSubCategory("all");
                    }}
                  />
                ))}

                {/* Glossary chip */}
                <div className="h-6 w-px bg-gray-200 shrink-0 mx-1" />
                <CategoryChip
                  label="Glossary"
                  active={activeSubCategory === "glossary"}
                  count={subCategoryCounts["glossary"] ?? 0}
                  onClick={() => {
                    switchSubCategory("glossary");
                    setSelectedApiCategory("");
                  }}
                />
              </div>

              {/* Sort selector */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="shrink-0 h-9 px-3 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D52B1E] cursor-pointer"
              >
                <option value="date">Newest</option>
                <option value="views">Most Viewed</option>
                <option value="downloads">Most Downloaded</option>
              </select>
            </motion.div>
          )}
          {/* ── Regulatory content ── */}
          {activeTopCategory === "regulatory" && (
            <AnimatePresence mode="wait">
              {activeRegBody ? (
                /* Body drill-down: document type chips + content */
                <motion.div
                  key={`reg-${activeRegBody}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  {/* Back + body header */}
                  {(() => {
                    const body = REGULATORY_BODIES.find(
                      (b) => b.id === activeRegBody,
                    )!;
                    return (
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setActiveRegBody("")}
                          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                          All Bodies
                        </button>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-100 bg-white shadow-sm overflow-hidden"
                            style={{ backgroundColor: `${body.color}10` }}
                          >
                            <img
                              src={body.logoUrl}
                              alt={body.name}
                              className="w-8 h-8 object-contain"
                              onError={(e) => {
                                const t = e.currentTarget;
                                t.style.display = "none";
                                const p = t.parentElement;
                                if (p && !p.querySelector(".reg-abbr-sm")) {
                                  const s = document.createElement("span");
                                  s.className =
                                    "reg-abbr-sm text-xs font-black";
                                  s.style.color = body.color;
                                  s.textContent = body.name;
                                  p.appendChild(s);
                                }
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">
                              {body.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {body.fullName}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Document type chips */}
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
                    <CategoryChip
                      label="All"
                      count={0}
                      active={activeDocType === "all"}
                      onClick={() => setActiveDocType("all")}
                    />
                    {DOCUMENT_TYPES.map((dt) => (
                      <CategoryChip
                        key={dt.id}
                        label={dt.label}
                        count={0}
                        active={activeDocType === dt.id}
                        onClick={() => setActiveDocType(dt.id)}
                      />
                    ))}
                  </div>

                  {/* Document type description */}
                  {activeDocType !== "all" &&
                    (() => {
                      const dt = DOCUMENT_TYPES.find(
                        (d) => d.id === activeDocType,
                      );
                      return dt ? (
                        <p className="text-xs text-gray-500 italic">
                          {dt.description}
                        </p>
                      ) : null;
                    })()}

                  {/* Empty state — no API data wired yet */}
                  <div className="py-16 text-center bg-white rounded-2xl border border-gray-100">
                    <Shield className="h-12 w-12 mx-auto mb-3 text-gray-200" />
                    <p className="text-gray-500 text-sm font-medium">
                      No publications yet
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {
                        REGULATORY_BODIES.find((b) => b.id === activeRegBody)
                          ?.name
                      }{" "}
                      publications will appear here once uploaded.
                    </p>
                  </div>
                </motion.div>
              ) : (
                /* Body selector overview grid */
                <motion.div
                  key="reg-overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-sm text-gray-500 mb-4">
                    Select a regulatory body to browse its publications.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {REGULATORY_BODIES.map((body) => (
                      <button
                        key={body.id}
                        onClick={() => {
                          setActiveRegBody(body.id);
                          setActiveDocType("all");
                        }}
                        className="group flex flex-col items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all text-center"
                      >
                        <div
                          className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 bg-white shadow-sm group-hover:scale-105 transition-transform"
                          style={{ backgroundColor: `${body.color}08` }}
                        >
                          <img
                            src={body.logoUrl}
                            alt={`${body.name} logo`}
                            className="w-16 h-16 object-contain"
                            onError={(e) => {
                              const t = e.currentTarget;
                              t.style.display = "none";
                              const parent = t.parentElement;
                              if (
                                parent &&
                                !parent.querySelector(".reg-abbr")
                              ) {
                                const span = document.createElement("span");
                                span.className = "reg-abbr text-2xl font-black";
                                span.style.color = body.color;
                                span.textContent = body.name;
                                parent.appendChild(span);
                              }
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-base">
                            {body.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                            {body.fullName}
                          </p>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {body.description}
                        </p>
                        <span
                          className="mt-auto text-xs font-semibold px-3 py-1 rounded-full"
                          style={{
                            backgroundColor: `${body.color}15`,
                            color: body.color,
                          }}
                        >
                          Browse publications →
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          {/* ── General / All content ── */}
          {activeTopCategory !== "regulatory" && (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTopCategory}-${activeSubCategory}-${selectedApiCategory}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {activeSubCategory === "glossary" && !selectedApiCategory ? (
                  <GlossarySection terms={glossaryData ?? []} />
                ) : (
                  <>
                    {/* Tools: Coming soon section */}
                    {activeSubCategory === "tools-practical" && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-800">
                            Calculators &amp; Screeners
                          </span>
                          <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full font-semibold border border-amber-200">
                            Coming Soon
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            {
                              icon: Calculator,
                              title: "Zakat Calculator",
                              desc: "Calculate your Zakat obligation accurately across asset categories.",
                              action: null,
                            },
                            {
                              icon: TrendingUp,
                              title: "Halal Stock Screener",
                              desc: "Screen stocks for Shariah compliance based on business activity and ratios.",
                              action: null,
                            },
                            {
                              icon: Bitcoin,
                              title: "Halal Crypto Screener",
                              desc: "Filter cryptocurrencies against Shariah compliance criteria.",
                              action: "/tools/halal-crypto",
                            },
                          ].map((tool) => (
                            <div
                              key={tool.title}
                              className="relative overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-white/70 p-6 flex flex-col items-center text-center gap-3 hover:border-[#D52B1E]/40 transition-colors"
                            >
                              <div className="h-14 w-14 rounded-2xl bg-[#D52B1E]/10 flex items-center justify-center">
                                <tool.icon className="h-7 w-7 text-[#D52B1E]" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-800 mb-1">
                                  {tool.title}
                                </h3>
                                <p className="text-xs text-[#737692] leading-relaxed">
                                  {tool.desc}
                                </p>
                              </div>
                              {tool.action ? (
                                <a
                                  href={tool.action}
                                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D52B1E] text-white text-sm font-medium hover:bg-[#B82318] transition-colors border border-[#D52B1E]"
                                >
                                  Launch Screener
                                </a>
                              ) : (
                                <button
                                  disabled
                                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed border border-gray-200"
                                >
                                  <Lock className="h-3.5 w-3.5" /> Coming Soon
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resource cards */}
                    {isLoading && (
                      <div className="py-16 text-center">
                        <Loader2 className="h-8 w-8 mx-auto mb-3 text-gray-300 animate-spin" />
                        <p className="text-[#737692] text-sm">
                          Loading resources...
                        </p>
                      </div>
                    )}
                    {!isLoading && currentResources.length === 0 && (
                      <div className="py-16 text-center">
                        <Library className="h-12 w-12 mx-auto mb-3 text-gray-200" />
                        <p className="text-[#737692] text-sm">
                          No resources found.
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Try adjusting your filters or search terms.
                        </p>
                      </div>
                    )}
                    {!isLoading && currentResources.length > 0 && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          {currentResources
                            .slice(0, visibleCount)
                            .map((resource, idx) => (
                              <ResourceCard
                                key={resource.id}
                                resource={resource}
                                index={idx}
                                onPreview={setPreviewResourceId}
                                onDownload={(r) => {
                                  trackDownload.mutate(r.id);
                                  setDownloadResource(r);
                                }}
                              />
                            ))}
                        </div>
                        {visibleCount < currentResources.length && (
                          <div className="mt-8 flex flex-col items-center gap-2">
                            <button
                              onClick={() =>
                                setVisibleCount((c) => c + PAGE_SIZE)
                              }
                              className="px-8 py-2.5 rounded-full border-2 border-[#D52B1E] text-[#D52B1E] text-sm font-semibold hover:bg-[#FFEFEF] transition-colors"
                            >
                              Load More
                            </button>
                            <p className="text-xs text-gray-400">
                              Showing{" "}
                              {Math.min(visibleCount, currentResources.length)}{" "}
                              of {currentResources.length}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          )}{" "}
          {/* end activeTopCategory !== 'regulatory' */}
        </div>
      </motion.div>

      {/* ── Download modal ── */}
      {downloadResource && (
        <DownloadEmailModal
          open={!!downloadResource}
          resourceTitle={downloadResource.title}
          onClose={() => setDownloadResource(null)}
        />
      )}

      {/* ── Submit Resource modal ── */}
      <AnimatePresence>
        {uploadOpen &&
          createPortal(
            <motion.div
              className="fixed inset-0 z-[100] h-[100dvh] w-screen flex items-end sm:items-center justify-center p-0 sm:p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="absolute inset-0 h-[100dvh] w-screen bg-black/50 backdrop-blur-sm"
                onClick={() => {
                  if (uploading) return;
                  setUploadOpen(false);
                  setUploadForm(EMPTY_UPLOAD_FORM);
                  setResourceFileUrl("");
                  setCoverImageUrl("");
                  setUploadErrors({});
                }}
              />
              <motion.div
                className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-3xl max-h-[92dvh] overflow-y-auto shadow-2xl"
                initial={{ y: 60, opacity: 0, scale: 0.97 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 60, opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className="p-6 border-b border-gray-100">
                  <button
                    onClick={() => {
                      if (uploading) return;
                      setUploadOpen(false);
                      setUploadForm(EMPTY_UPLOAD_FORM);
                      setResourceFileUrl("");
                      setCoverImageUrl("");
                      setUploadErrors({});
                    }}
                    disabled={uploading}
                    className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <h2 className="text-xl font-bold text-gray-900">
                    Submit a Resource
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    All submissions are reviewed by admin before publishing.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    <span className="text-red-500 font-semibold">*</span>{" "}
                    Required fields
                  </p>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={uploadForm.title}
                      onChange={(e) => {
                        setUploadForm((f) => ({ ...f, title: e.target.value }));
                        if (uploadErrors.title)
                          setUploadErrors((p) => ({ ...p, title: "" }));
                      }}
                      placeholder="Resource title"
                      className={
                        uploadErrors.title
                          ? "border-red-400 focus-visible:ring-red-300"
                          : undefined
                      }
                    />
                    {uploadErrors.title && (
                      <p className="text-xs text-red-600 mt-1">
                        {uploadErrors.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={uploadForm.categoryId}
                      onChange={(e) => {
                        setUploadForm((f) => ({
                          ...f,
                          categoryId: e.target.value,
                          resourceType: "",
                          subCategoryId: "",
                          docTypeId: "",
                        }));
                        if (uploadErrors.categoryId)
                          setUploadErrors((p) => ({ ...p, categoryId: "" }));
                      }}
                      className={`w-full h-10 rounded-md border px-3 text-sm bg-white text-gray-900 ${uploadErrors.categoryId ? "border-red-400" : "border-gray-200"}`}
                    >
                      <option value="">- Select category -</option>
                      <option value="general">General</option>
                      <option value="regulatory">Regulatory</option>
                    </select>
                    {uploadErrors.categoryId && (
                      <p className="text-xs text-red-600 mt-1">
                        {uploadErrors.categoryId}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Sub-Category
                    </label>
                    <Select
                      value={uploadForm.subCategoryId}
                      onChange={(e) =>
                        setUploadForm((f) => ({
                          ...f,
                          subCategoryId: e.target.value,
                          customSubCategory: "",
                          docTypeId: "",
                        }))
                      }
                      disabled={!uploadForm.categoryId}
                    >
                      <option value="">- Select sub-category -</option>
                      {uploadForm.categoryId === "regulatory" ? (
                        REGULATORY_BODIES.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} - {b.fullName}
                          </option>
                        ))
                      ) : (
                        <>
                          {uploadSubCats.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                          <option value="__custom__">
                            Other / Not listed...
                          </option>
                        </>
                      )}
                    </Select>
                    {uploadForm.categoryId !== "regulatory" &&
                      uploadForm.subCategoryId === "__custom__" && (
                        <div className="mt-2">
                          <Input
                            value={uploadForm.customSubCategory}
                            onChange={(e) =>
                              setUploadForm((f) => ({
                                ...f,
                                customSubCategory: e.target.value,
                              }))
                            }
                            placeholder="Enter your sub-category name..."
                            className="h-9 text-sm"
                          />
                        </div>
                      )}
                  </div>

                  {uploadForm.categoryId === "general" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Resource Type
                      </label>
                      <Select
                        value={uploadForm.resourceType}
                        onChange={(e) =>
                          setUploadForm((f) => ({
                            ...f,
                            resourceType: e.target.value,
                          }))
                        }
                      >
                        <option value="">- Select type (optional) -</option>
                        <option value="guide">Educational Guide</option>
                        <option value="research">
                          Research &amp; Publication
                        </option>
                        <option value="standard">
                          Standards &amp; Governance
                        </option>
                        <option value="tool">Tools &amp; Practical</option>
                      </Select>
                    </div>
                  )}

                  {uploadForm.categoryId === "regulatory" &&
                    uploadForm.subCategoryId && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Document Type
                        </label>
                        <Select
                          value={uploadForm.docTypeId}
                          onChange={(e) =>
                            setUploadForm((f) => ({
                              ...f,
                              docTypeId: e.target.value,
                              customDocType: "",
                            }))
                          }
                        >
                          <option value="">- Select document type -</option>
                          {DOCUMENT_TYPES.map((dt) => (
                            <option key={dt.id} value={dt.id}>
                              {dt.label}
                            </option>
                          ))}
                          <option value="__custom__">
                            Other / Not listed...
                          </option>
                        </Select>
                        {uploadForm.docTypeId === "__custom__" && (
                          <div className="mt-2">
                            <Input
                              value={uploadForm.customDocType}
                              onChange={(e) =>
                                setUploadForm((f) => ({
                                  ...f,
                                  customDocType: e.target.value,
                                }))
                              }
                              placeholder="Enter document type name..."
                              className="h-9 text-sm"
                            />
                          </div>
                        )}
                      </div>
                    )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Your Name / Organisation
                    </label>
                    <Input
                      value={uploadForm.authorName}
                      onChange={(e) =>
                        setUploadForm((f) => ({
                          ...f,
                          authorName: e.target.value,
                        }))
                      }
                      placeholder="Author or organisation name"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Brief Description
                    </label>
                    <textarea
                      value={uploadForm.briefIntro}
                      onChange={(e) =>
                        setUploadForm((f) => ({
                          ...f,
                          briefIntro: e.target.value,
                        }))
                      }
                      placeholder="Briefly describe what this resource covers..."
                      rows={3}
                      className="w-full bg-white text-gray-900 text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#D52B1E]/30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Resource File Upload{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <ImageUpload
                      value={resourceFileUrl}
                      onChange={(url) => {
                        setResourceFileUrl(url);
                        if (uploadErrors.resourceFileUrl)
                          setUploadErrors((p) => ({
                            ...p,
                            resourceFileUrl: "",
                          }));
                      }}
                      onUploadPendingChange={setResourceUploadPending}
                      mode="document"
                      label="Click to upload resource file"
                      accept=".pdf,.doc,.docx,.csv,.xlsx,.xls"
                      previewHeight="h-24"
                    />
                    {uploadErrors.resourceFileUrl && (
                      <p className="text-xs text-red-600 mt-1">
                        {uploadErrors.resourceFileUrl}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Cover Image Upload
                    </label>
                    <ImageUpload
                      value={coverImageUrl}
                      onChange={setCoverImageUrl}
                      onUploadPendingChange={setCoverUploadPending}
                      mode="image"
                      previewHeight="h-24"
                    />
                  </div>

                  {uploadErrors.uploadPending && (
                    <div className="md:col-span-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      {uploadErrors.uploadPending}
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (uploading) return;
                      setUploadOpen(false);
                      setUploadForm(EMPTY_UPLOAD_FORM);
                      setResourceFileUrl("");
                      setCoverImageUrl("");
                      setUploadErrors({});
                    }}
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-[#D52B1E] hover:bg-[#B8241B] text-white"
                    disabled={
                      uploading || resourceUploadPending || coverUploadPending
                    }
                    onClick={handleSubmitResource}
                  >
                    {uploading && (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    )}
                    Submit for Review
                  </Button>
                </div>
              </motion.div>
            </motion.div>,
            document.body,
          )}
      </AnimatePresence>
    </>
  );
}
