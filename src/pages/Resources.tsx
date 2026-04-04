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
  SlidersHorizontal,
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
import { ImageUpload } from "@/components/ui/image-upload";
import {
  useResources,
  useResourceCategories,
  useResourceRegulatoryBodies,
  useGlossaryTerms,
  useDownloadResource,
  useTrackResourceDownload,
  useSubmitUserResource,
} from "@/hooks/useResources";
import { toast } from "@/hooks/use-toast";
import type { ResourceItem, ResourceType } from "@/types/resources";

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

/* ── Regulatory bodies — API driven, no static fallback ─────────────────── */
interface LocalRegulatoryBody {
  readonly id: string;
  readonly name: string;
  readonly fullName: string;
  readonly logoUrl: string;
  readonly description: string;
}

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
type StatusFilter = "all" | "draft" | "pending_review" | "published" | "archived";
type PremiumFilter = "all" | "premium" | "free";
type RegulatoryFilter = "all" | "yes" | "no";
type ResourceTypeFilter = "all" | ResourceType;

const PAGE_SIZE = 9;

/* ════ ContributeResourceModal ══════════════════════════════════════════════════════════════════ */
interface ContributeResourceModalProps {
  open: boolean;
  onClose: () => void;
  categories: import("@/types/resources").ResourceCategory[];
  regulatoryBodies: LocalRegulatoryBody[];
}

const EMPTY_CONTRIBUTE_FORM = {
  title: "",
  description: "",
  categoryId: "",
  resourceType: "" as ResourceType | "",
  regulatoryBodyId: "",
  authorName: "",
  publisher: "",
  publishedYear: "",
  language: "en",
  pageCount: "",
  externalUrl: "",
  tagsRaw: "",
};

function ContributeResourceModal({
  open,
  onClose,
  categories,
  regulatoryBodies,
}: ContributeResourceModalProps) {
  const submitResource = useSubmitUserResource();
  const [form, setForm] = useState({ ...EMPTY_CONTRIBUTE_FORM });
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [fileSizeKb, setFileSizeKb] = useState<number | undefined>(undefined);
  const [attachPending, setAttachPending] = useState(false);
  const [thumbPending, setThumbPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const parentCategories = useMemo(() => categories.filter((c) => !c.parentId), [categories]);

  const clearErr = (key: string) =>
    setErrors((p) => (p[key] ? { ...p, [key]: "" } : p));

  const field = <K extends keyof typeof form>(key: K) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((p) => ({ ...p, [key]: e.target.value }));
      clearErr(key as string);
    },
  });

  const closeAndReset = () => {
    if (submitting) return;
    setForm({ ...EMPTY_CONTRIBUTE_FORM });
    setAttachmentUrl("");
    setThumbnailUrl("");
    setFileSizeKb(undefined);
    setErrors({});
    onClose();
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required.";
    if (!form.resourceType) e.resourceType = "Resource type is required.";
    if (!attachmentUrl && !form.externalUrl.trim())
      e.attachment = "Provide a file upload or an external URL.";
    if (attachPending || thumbPending)
      e.pending = "Please wait for uploads to finish.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const slug = form.title
        .trim()
        .toLowerCase()
        .replaceAll(/[^a-z0-9\s-]/g, "")
        .replaceAll(/\s+/g, "-")
        .slice(0, 80);
      const tags = form.tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      await submitResource.mutateAsync({
        title: form.title.trim(),
        slug,
        description: form.description.trim() || undefined,
        categoryId: form.categoryId || parentCategories[0]?.id || "general",
        resourceType: (form.resourceType as ResourceType) || "guide",
        thumbnailUrl: thumbnailUrl || undefined,
        attachmentUrl: attachmentUrl || undefined,
        externalUrl: form.externalUrl.trim() || undefined,
        fileSizeKb: fileSizeKb,
        pageCount: form.pageCount.trim() ? Number(form.pageCount) : undefined,
        language: form.language.trim() || "en",
        authorName: form.authorName.trim() || undefined,
        publisher: form.publisher.trim() || undefined,
        publishedYear: form.publishedYear.trim() ? Number(form.publishedYear) : undefined,
        isDownloadable: undefined,
        isPremium: undefined,
        isFeatured: false,
        tags: tags.length ? tags : undefined,
        status: "draft",
        regulatoryBodyId: form.regulatoryBodyId || undefined,
      });
      toast({
        title: "Resource submitted!",
        description: "Your resource is pending admin review.",
      });
      closeAndReset();
    } catch {
      /* handled by mutation */
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const sectionLabel = (text: string) => (
    <div className="md:col-span-2 mt-2">
      <p className="text-[11px] font-bold text-[#737692] uppercase tracking-widest mb-1">
        {text}
      </p>
      <hr className="border-gray-100" />
    </div>
  );

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[100] h-[100dvh] w-screen flex items-end sm:items-center justify-center p-0 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 h-[100dvh] w-screen bg-black/50 backdrop-blur-sm"
        onClick={closeAndReset}
      />
      <motion.div
        className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-3xl max-h-[92dvh] overflow-y-auto shadow-2xl"
        initial={{ y: 60, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-6 pt-6 pb-4 border-b border-gray-100">
          <button
            onClick={closeAndReset}
            disabled={submitting}
            className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#D52B1E]/10 flex items-center justify-center">
              <Plus className="h-5 w-5 text-[#D52B1E]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Contribute a Resource</h2>
              <p className="text-sm text-gray-500">
                Submitted as draft — requires admin approval before publishing.
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            <span className="text-red-500 font-semibold">*</span> Required fields
          </p>
        </div>

        {/* Form body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* ─ Basic Information ─ */}
          {sectionLabel("Basic Information")}

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g. Global Economic Outlook 2026"
              {...field("title")}
              className={errors.title ? "border-red-400 focus-visible:ring-red-300" : undefined}
            />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Resource Type <span className="text-red-500">*</span>
            </label>
            <select
              value={form.resourceType}
              onChange={(e) => { setForm((p) => ({ ...p, resourceType: e.target.value as ResourceType | "" })); clearErr("resourceType"); }}
              className={`w-full h-10 rounded-md border px-3 text-sm bg-white text-gray-900 ${
                errors.resourceType ? "border-red-400" : "border-gray-200"
              }`}
            >
              <option value="">Select type…</option>
              <option value="guide">Educational Guide</option>
              <option value="research">Research &amp; Publication</option>
              <option value="standard">Standards &amp; Governance</option>
              <option value="tool">Tools &amp; Practical</option>
            </select>
            {errors.resourceType && <p className="text-xs text-red-600 mt-1">{errors.resourceType}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
              className="w-full h-10 rounded-md border border-gray-200 px-3 text-sm bg-white text-gray-900"
            >
              <option value="">None / General</option>
              {parentCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Regulatory Body</label>
            <select
              value={form.regulatoryBodyId}
              onChange={(e) => setForm((p) => ({ ...p, regulatoryBodyId: e.target.value }))}
              className="w-full h-10 rounded-md border border-gray-200 px-3 text-sm bg-white text-gray-900"
            >
              <option value="">None</option>
              {regulatoryBodies.map((b) => (
                <option key={b.id} value={b.id}>{b.name} — {b.fullName}</option>
              ))}
            </select>
          </div>

          {/* ─ Content ─ */}
          {sectionLabel("Content")}

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Briefly describe what this resource covers…"
              rows={4}
              className="w-full bg-white text-gray-900 text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#D52B1E]/30"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tags <span className="text-gray-400 font-normal">(comma-separated)</span></label>
            <Input placeholder="economics, islamic finance, halal" {...field("tagsRaw")} />
          </div>

          {/* ─ Attribution ─ */}
          {sectionLabel("Attribution")}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Author Name</label>
            <Input placeholder="Dr. Ahmed Hassan" {...field("authorName")} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Publisher</label>
            <Input placeholder="IEFA Research Institute" {...field("publisher")} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Published Year</label>
            <Input
              type="text"
              inputMode="numeric"
              maxLength={4}
              placeholder={String(new Date().getFullYear())}
              value={form.publishedYear}
              onChange={(e) => setForm((p) => ({ ...p, publishedYear: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Language</label>
            <select
              value={form.language}
              onChange={(e) => setForm((p) => ({ ...p, language: e.target.value }))}
              className="w-full h-10 rounded-md border border-gray-200 px-3 text-sm bg-white text-gray-900"
            >
              <option value="en">English</option>
              <option value="ar">Arabic</option>
              <option value="fr">French</option>
              <option value="ms">Malay</option>
              <option value="ur">Urdu</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* ─ Files &amp; Links ─ */}
          {sectionLabel("Files & Links")}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Resource File
              {!form.externalUrl.trim() && <span className="text-red-500 ml-1">*</span>}
            </label>
            <ImageUpload
              value={attachmentUrl}
              onChange={(url) => { setAttachmentUrl(url); clearErr("attachment"); }}
              onUploadPendingChange={setAttachPending}
              onFileSizeKb={setFileSizeKb}
              mode="document"
              label="Click to upload file (PDF, DOCX, XLSX…)"
              accept=".pdf,.doc,.docx,.csv,.xlsx,.xls,.pptx,.ppt"
              previewHeight="h-24"
            />
            {errors.attachment && <p className="text-xs text-red-600 mt-1">{errors.attachment}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Cover / Thumbnail</label>
            <ImageUpload
              value={thumbnailUrl}
              onChange={setThumbnailUrl}
              onUploadPendingChange={setThumbPending}
              mode="image"
              previewHeight="h-24"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              External URL
              {!attachmentUrl && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              type="url"
              placeholder="https://external-publisher.com/resource"
              {...field("externalUrl")}
            />
            <p className="text-[11px] text-gray-400 mt-1">Required only if no file is uploaded above.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Page Count</label>
            <Input type="number" placeholder="42" {...field("pageCount")} />
          </div>

          {errors.pending && (
            <div className="md:col-span-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              {errors.pending}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            Submissions are reviewed before publishing.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={closeAndReset} disabled={submitting}>
              Cancel
            </Button>
            <Button
              className="bg-[#D52B1E] hover:bg-[#B8241B] text-white"
              onClick={handleSubmit}
              disabled={submitting || attachPending || thumbPending}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Submit for Review
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

/* ════════════════════════════════════════════════════════════════════════════ */
export default function Resources() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTopCategory, setActiveTopCategory] = useState<string>("all");
  const [activeSubCategory, setActiveSubCategory] =
    useState<SubCategoryKey>("all");
  const [selectedApiCategory, setSelectedApiCategory] = useState<string>("");

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [order, setOrder] = useState<"ASC" | "DESC">("DESC");
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("published");
  const [typeFilter, setTypeFilter] = useState<ResourceTypeFilter>("all");
  const [premiumFilter, setPremiumFilter] = useState<PremiumFilter>("all");
  const [regulatoryFilter, setRegulatoryFilter] = useState<RegulatoryFilter>("all");
  const [resourceTypesCsv, setResourceTypesCsv] = useState("");
  const [languagesCsv, setLanguagesCsv] = useState("");
  const [publishedYearFrom, setPublishedYearFrom] = useState("");
  const [publishedYearTo, setPublishedYearTo] = useState("");
  const [selectedRegulatoryBodyId, setSelectedRegulatoryBodyId] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [geography, setGeography] = useState<"all" | "local" | "global">("all");

  const [previewResourceId, setPreviewResourceId] = useState("");
  const [downloadResource, setDownloadResource] = useState<ResourceItem | null>(
    null,
  );

  const [contributeOpen, setContributeOpen] = useState(false);

  /* ── Regulatory drill-down state ── */
  const [activeRegBody, setActiveRegBody] = useState<string>(""); // '' = overview
  const [activeDocType, setActiveDocType] = useState<string>("all"); // document type filter

  const { data: categoriesData } = useResourceCategories();
  const { data: regulatoryBodiesData = [] } = useResourceRegulatoryBodies();
  const trackDownload = useTrackResourceDownload();
  const downloadResourceMutation = useDownloadResource();

  /* ── Two fixed top-level categories; all current API data is General ── */
  const TOP_CATEGORIES = [
    { id: "general", name: "General" },
    { id: "regulatory", name: "Regulatory" },
  ] as const;

  const regulatoryBodies = useMemo<LocalRegulatoryBody[]>(
    () =>
      regulatoryBodiesData.map((b) => ({
        id: b.id,
        name: b.name,
        fullName: b.fullName ?? b.name,
        logoUrl: b.logoUrl ?? "",
        description: b.description ?? "",
      })),
    [regulatoryBodiesData],
  );

  /* ── Sub-categories from API (used for General resources) ── */
  const apiCategories = useMemo(
    () => (categoriesData ?? []).sort((a, b) => a.name.localeCompare(b.name)),
    [categoriesData],
  );

  const parentApiCategories = useMemo(
    () => apiCategories.filter((c) => !c.parentId),
    [apiCategories],
  );

  const childApiCategories = useMemo(
    () => apiCategories.filter((c) => !!c.parentId),
    [apiCategories],
  );

  const [selectedParentCategory, setSelectedParentCategory] = useState("");

  /* ── resourceType filter from active built-in sub-category ── */
  const activeResourceType = useMemo(
    () => SUB_CATEGORIES.find((s) => s.key === activeSubCategory)?.resourceType,
    [activeSubCategory],
  );

  const effectiveResourceType =
    activeResourceType ?? (typeFilter === "all" ? undefined : typeFilter);

  const queryCategoryId = selectedApiCategory || selectedParentCategory || undefined;

  const numericYearFrom = publishedYearFrom.trim()
    ? Number(publishedYearFrom)
    : undefined;
  const numericYearTo = publishedYearTo.trim()
    ? Number(publishedYearTo)
    : undefined;

  const statusQuery = statusFilter === "all" ? undefined : statusFilter;

  let isRegulatoryQuery: boolean | undefined;
  if (activeTopCategory === "regulatory" || regulatoryFilter === "yes") {
    isRegulatoryQuery = true;
  } else if (regulatoryFilter === "no") {
    isRegulatoryQuery = false;
  }

  let isPremiumQuery: boolean | undefined;
  if (premiumFilter === "premium") {
    isPremiumQuery = true;
  } else if (premiumFilter === "free") {
    isPremiumQuery = false;
  }

  const resourcesQueryFilters =
    activeSubCategory === "glossary"
      ? { page: 1, perPage: 1, status: "published" as const }
      : {
          ...(effectiveResourceType ? { resourceType: effectiveResourceType } : {}),
          ...(search ? { search } : {}),
          ...(queryCategoryId ? { categoryId: queryCategoryId } : {}),
          ...(statusQuery ? { status: statusQuery } : {}),
          ...(resourceTypesCsv.trim() ? { resourceTypes: resourceTypesCsv.trim() } : {}),
          ...(languagesCsv.trim() ? { languages: languagesCsv.trim() } : {}),
          ...(Number.isFinite(numericYearFrom) ? { publishedYearFrom: numericYearFrom } : {}),
          ...(Number.isFinite(numericYearTo) ? { publishedYearTo: numericYearTo } : {}),
          ...(selectedRegulatoryBodyId ? { regulatoryBodyId: selectedRegulatoryBodyId } : {}),
          ...(typeof isRegulatoryQuery === "boolean" ? { isRegulatory: isRegulatoryQuery } : {}),
          ...(typeof isPremiumQuery === "boolean" ? { isPremium: isPremiumQuery } : {}),
          order,
          page: 1,
          perPage: 100,
        };

  /* ── Resources query ── */
  const { data: resourcesData, isLoading: resourcesLoading } = useResources(resourcesQueryFilters);

  /* ── Unfiltered total query to power top-level counts when isRegulatory filter is off ── */
  const { data: allResourcesData } = useResources({
    page: 1,
    perPage: 100,
    order: "DESC",
    status: "published",
  });

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
    setSelectedParentCategory("");
    setSelectedApiCategory("");
    setSortBy("date");
    setVisibleCount(PAGE_SIZE);
    setSelectedRegulatoryBodyId("");
    if (activeTopCategory !== "regulatory") {
      setActiveRegBody("");
      setActiveDocType("all");
    }
  }, [activeTopCategory, activeSubCategory]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [
    search,
    sortBy,
    selectedApiCategory,
    selectedParentCategory,
    geography,
    statusFilter,
    typeFilter,
    premiumFilter,
    regulatoryFilter,
    resourceTypesCsv,
    languagesCsv,
    publishedYearFrom,
    publishedYearTo,
    selectedRegulatoryBodyId,
    order,
  ]);

  /* ── API-driven counts (prefer response.counts, fall back to local tallying) ── */
  const apiCounts = allResourcesData?.counts;

  const subCategoryCounts = useMemo(() => {
    if (apiCounts?.byCategory) {
      const counts: Record<string, number> = {
        all: apiCounts.total ?? geoPublishedResources.length,
        ...apiCounts.byCategory,
      };
      counts["glossary"] = glossaryData?.length ?? 0;
      return counts;
    }
    // local fallback
    const allItems = geoPublishedResources;
    const counts: Record<string, number> = { all: allItems.length };
    for (const item of allItems) {
      if (item.categoryId) counts[item.categoryId] = (counts[item.categoryId] ?? 0) + 1;
      const parentId = item.category?.parentId;
      if (parentId) counts[parentId] = (counts[parentId] ?? 0) + 1;
    }
    counts["glossary"] = glossaryData?.length ?? 0;
    return counts;
  }, [apiCounts, geoPublishedResources, glossaryData?.length]);

  const topCategoryCounts = useMemo(() => {
    if (apiCounts) {
      return {
        all: apiCounts.total ?? geoPublishedResources.length,
        general: apiCounts.general ?? 0,
        regulatory: apiCounts.regulatory ?? 0,
      };
    }
    const total = geoPublishedResources.length;
    const regulatoryCount = geoPublishedResources.filter((item) =>
      item.isRegulatory === true || !!item.regulatoryBodyId,
    ).length;
    return { all: total, general: total - regulatoryCount, regulatory: regulatoryCount };
  }, [apiCounts, geoPublishedResources]);

  const regulatoryBodyCounts = useMemo(() => {
    if (apiCounts?.byRegulatoryBody) return apiCounts.byRegulatoryBody;
    const counts: Record<string, number> = {};
    for (const item of geoPublishedResources) {
      const bodyId = item.regulatoryBodyId ?? "";
      if (!bodyId) continue;
      counts[bodyId] = (counts[bodyId] ?? 0) + 1;
    }
    return counts;
  }, [apiCounts, geoPublishedResources]);

  const getTagValue = (resource: ResourceItem, prefix: string) =>
    (resource.tags ?? []).find((tag) => tag.startsWith(prefix))?.slice(prefix.length);

  const getResourceRegBody = (resource: ResourceItem) =>
    resource.regulatoryBodyId ?? getTagValue(resource, "reg-body:") ?? "";

  const getResourceDocType = (resource: ResourceItem) =>
    resource.documentType ?? getTagValue(resource, "doc-type:") ?? "";

  /* ── Sorted & filtered resources ── */
  const currentResources = useMemo(() => {
    const items = [...applyGeographyFilter(resourcesData?.data ?? [])];
    const isRegSignal = (item: ResourceItem) =>
      item.isRegulatory === true ||
      !!item.regulatoryBodyId ||
      (item.tags ?? []).some((tag) => tag.startsWith("reg-body:"));

    let scopedItems = items;
    if (activeTopCategory === "regulatory") {
      scopedItems = items.filter(isRegSignal);
    } else if (activeTopCategory === "general") {
      scopedItems = items.filter((item) => !isRegSignal(item));
    }

    const regulatoryFiltered = scopedItems.filter((item) => {
      if (!selectedRegulatoryBodyId) return true;
      return getResourceRegBody(item) === selectedRegulatoryBodyId;
    });

    const docTypeFiltered = regulatoryFiltered.filter((item) => {
      if (activeDocType === "all") return true;
      return getResourceDocType(item) === activeDocType;
    });

    const finalItems = [...docTypeFiltered];
    if (sortBy === "views") finalItems.sort((a, b) => b.viewCount - a.viewCount);
    else if (sortBy === "downloads")
      finalItems.sort((a, b) => b.downloadCount - a.downloadCount);
    else
      finalItems.sort(
        (a, b) =>
          new Date(b.publishedAt ?? b.createdAt).getTime() -
          new Date(a.publishedAt ?? a.createdAt).getTime(),
      );
    return finalItems;
  }, [
    resourcesData?.data,
    sortBy,
    activeTopCategory,
    geography,
    selectedRegulatoryBodyId,
    activeDocType,
  ]);

  const parentCategoryChips = useMemo(
    () => parentApiCategories.map((c) => ({ id: c.id, name: c.name })),
    [parentApiCategories],
  );

  const activeChildCategoryChips = useMemo(() => {
    if (!selectedParentCategory) return childApiCategories;
    return childApiCategories.filter((c) => c.parentId === selectedParentCategory);
  }, [childApiCategories, selectedParentCategory]);



  /* ── Navigation helpers ── */
  function switchTopCategory(catId: string) {
    setActiveTopCategory(catId);
    setActiveSubCategory("all");
    setSelectedParentCategory("");
    setSelectedApiCategory("");
    setSelectedRegulatoryBodyId("");
    const p = new URLSearchParams(searchParams);
    p.set("category", catId);
    p.delete("sub");
    setSearchParams(p);
  }

  function switchSubCategory(key: SubCategoryKey) {
    setActiveSubCategory(key);
    setSelectedParentCategory("");
    setSelectedApiCategory("");
    const p = new URLSearchParams(searchParams);
    p.set("sub", key);
    setSearchParams(p);
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
                    onClick={() => setContributeOpen(true)}
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
          <div className="flex items-center gap-1 px-4 py-2">
            {/* Category tabs — scrollable */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1 py-1">
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

            {/* Search + filter — always visible */}
            <div className="shrink-0 flex items-center gap-2 pl-2 border-l border-gray-100 ml-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-40 sm:w-52 pl-9 pr-7 h-9 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 text-sm focus:outline-none focus:border-[#D52B1E] focus:bg-white transition-colors"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilterDrawer((s) => !s)}
                className={`flex items-center gap-1.5 h-9 px-3 rounded-xl text-sm font-semibold border transition-all ${
                  showFilterDrawer
                    ? "bg-[#D52B1E] text-white border-[#D52B1E]"
                    : "bg-white text-[#737692] border-gray-200 hover:border-[#D52B1E] hover:text-[#D52B1E]"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>
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
                  active={
                    activeSubCategory === "all" &&
                    !selectedParentCategory &&
                    !selectedApiCategory
                  }
                  count={subCategoryCounts["all"] ?? 0}
                  onClick={() => {
                    setActiveSubCategory("all");
                    setSelectedParentCategory("");
                    setSelectedApiCategory("");
                  }}
                />

                {/* Parent category chips */}
                {parentCategoryChips.map((chip) => (
                  <CategoryChip
                    key={chip.id}
                    label={chip.name}
                    active={selectedParentCategory === chip.id && !selectedApiCategory}
                    count={subCategoryCounts[chip.id] ?? 0}
                    onClick={() => {
                      setSelectedParentCategory(chip.id);
                      setSelectedApiCategory("");
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
                    setSelectedParentCategory("");
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

          {activeTopCategory !== "regulatory" &&
            activeSubCategory !== "glossary" &&
            activeChildCategoryChips.length > 0 && (
              <motion.div variants={itemVariants} className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
                <CategoryChip
                  label={selectedParentCategory ? "All in Selected" : "All Sub-categories"}
                  active={!selectedApiCategory}
                  count={
                    selectedParentCategory
                      ? subCategoryCounts[selectedParentCategory] ?? 0
                      : subCategoryCounts["all"] ?? 0
                  }
                  onClick={() => setSelectedApiCategory("")}
                />
                {activeChildCategoryChips.map((chip) => (
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
                    const body = regulatoryBodies.find(
                      (b) => b.id === activeRegBody,
                    )!;
                    return (
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => {
                            setActiveRegBody("");
                            setSelectedRegulatoryBodyId("");
                          }}
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
                            style={{ backgroundColor: "#D52B1E10" }}
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
                                    "reg-abbr-sm text-xs font-black text-[#D52B1E]";
                                  s.style.color = "";
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
                      count={currentResources.length}
                      active={activeDocType === "all"}
                      onClick={() => setActiveDocType("all")}
                    />
                    {DOCUMENT_TYPES.map((dt) => (
                      <CategoryChip
                        key={dt.id}
                        label={dt.label}
                        count={currentResources.filter((r) => getResourceDocType(r) === dt.id).length}
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

                  {currentResources.length === 0 ? (
                    <div className="py-16 text-center bg-white rounded-2xl border border-gray-100">
                      <Shield className="h-12 w-12 mx-auto mb-3 text-gray-200" />
                      <p className="text-gray-500 text-sm font-medium">
                        No publications found
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Try adjusting regulatory body or document type filters.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {currentResources.slice(0, visibleCount).map((resource, idx) => (
                        <ResourceCard
                          key={resource.id}
                          resource={resource}
                          index={idx}
                          onPreview={setPreviewResourceId}
                          onDownload={(r) => setDownloadResource(r)}
                        />
                      ))}
                    </div>
                  )}
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
                    {regulatoryBodies.map((body) => (
                      <button
                        key={body.id}
                        onClick={() => {
                          setActiveRegBody(body.id);
                          setSelectedRegulatoryBodyId(body.id);
                          setActiveDocType("all");
                        }}
                        className="group flex flex-col items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all text-center"
                      >
                        <div
                          className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 bg-white shadow-sm group-hover:scale-105 transition-transform"
                          style={{ backgroundColor: "#D52B1E08" }}
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
                                span.className = "reg-abbr text-2xl font-black text-[#D52B1E]";
                                span.style.color = "";
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
                            backgroundColor: "#D52B1E15",
                            color: "#D52B1E",
                          }}
                        >
                          {(regulatoryBodyCounts[body.id] ?? 0)} publications →
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

      {/* ── Right-side filter drawer ── */}
      {createPortal(
        <AnimatePresence>
          {showFilterDrawer && (
            <>
              {/* Backdrop */}
              <motion.div
                className="fixed inset-0 z-[80] bg-black/30 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFilterDrawer(false)}
              />
              {/* Drawer panel */}
              <motion.div
                className="fixed top-0 right-0 z-[90] h-full w-full max-w-sm bg-white shadow-2xl flex flex-col"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.25, ease: "easeInOut" }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-[#D52B1E]" />
                    Filters
                  </h2>
                  <button
                    onClick={() => setShowFilterDrawer(false)}
                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Scrollable filter body */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-[#737692] mb-1.5">Order</label>
                    <select
                      value={order}
                      onChange={(e) => setOrder(e.target.value as "ASC" | "DESC")}
                      className="w-full h-9 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-[#D52B1E]"
                    >
                      <option value="DESC">Newest first (DESC)</option>
                      <option value="ASC">Oldest first (ASC)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#737692] mb-1.5">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                      className="w-full h-9 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-[#D52B1E]"
                    >
                      <option value="all">All</option>
                      <option value="draft">Draft</option>
                      <option value="pending_review">Pending Review</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#737692] mb-1.5">Resource Type</label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as ResourceTypeFilter)}
                      className="w-full h-9 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-[#D52B1E]"
                    >
                      <option value="all">All</option>
                      <option value="guide">Guide</option>
                      <option value="research">Research</option>
                      <option value="standard">Standard</option>
                      <option value="tool">Tool</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#737692] mb-1.5">Premium</label>
                    <select
                      value={premiumFilter}
                      onChange={(e) => setPremiumFilter(e.target.value as PremiumFilter)}
                      className="w-full h-9 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-[#D52B1E]"
                    >
                      <option value="all">All</option>
                      <option value="premium">Premium only</option>
                      <option value="free">Free only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#737692] mb-1.5">Regulatory</label>
                    <select
                      value={regulatoryFilter}
                      onChange={(e) => setRegulatoryFilter(e.target.value as RegulatoryFilter)}
                      className="w-full h-9 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-[#D52B1E]"
                    >
                      <option value="all">All</option>
                      <option value="yes">Regulatory only</option>
                      <option value="no">Non-regulatory only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#737692] mb-1.5">Regulatory Body</label>
                    <select
                      value={selectedRegulatoryBodyId}
                      onChange={(e) => {
                        setSelectedRegulatoryBodyId(e.target.value);
                        if (e.target.value) setActiveRegBody(e.target.value);
                      }}
                      className="w-full h-9 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-[#D52B1E]"
                    >
                      <option value="">All bodies</option>
                      {regulatoryBodies.map((body) => (
                        <option key={body.id} value={body.id}>{body.name} — {body.fullName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#737692] mb-1.5">Resource Types (comma-separated)</label>
                    <Input
                      value={resourceTypesCsv}
                      onChange={(e) => setResourceTypesCsv(e.target.value)}
                      placeholder="guide,research"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#737692] mb-1.5">Languages (comma-separated)</label>
                    <Input
                      value={languagesCsv}
                      onChange={(e) => setLanguagesCsv(e.target.value)}
                      placeholder="english,arabic"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#737692] mb-1.5">Published From</label>
                      <Input
                        value={publishedYearFrom}
                        onChange={(e) => setPublishedYearFrom(e.target.value)}
                        placeholder="2019"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#737692] mb-1.5">Published To</label>
                      <Input
                        value={publishedYearTo}
                        onChange={(e) => setPublishedYearTo(e.target.value)}
                        placeholder="2026"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    className="w-full border-gray-200 text-gray-500"
                    onClick={() => {
                      setOrder("DESC");
                      setStatusFilter("published");
                      setTypeFilter("all");
                      setPremiumFilter("all");
                      setRegulatoryFilter("all");
                      setSelectedRegulatoryBodyId("");
                      setResourceTypesCsv("");
                      setLanguagesCsv("");
                      setPublishedYearFrom("");
                      setPublishedYearTo("");
                    }}
                  >
                    Reset filters
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}

      {/* ── Download modal ── */}
      {downloadResource && (
        <DownloadEmailModal
          open={!!downloadResource}
          resourceTitle={downloadResource.title}
          onClose={() => setDownloadResource(null)}
          onSubmit={async () => {
            await downloadResourceMutation.mutateAsync({
              id: downloadResource.id,
              fallbackTitle: downloadResource.title,
            });
            trackDownload.mutate(downloadResource.id);
            toast.success("Download started");
          }}
        />
      )}

      {/* ── Contribute Resource modal ── */}
      <ContributeResourceModal
        open={contributeOpen}
        onClose={() => setContributeOpen(false)}
        categories={apiCategories}
        regulatoryBodies={regulatoryBodies}
      />
    </>
  );
}
