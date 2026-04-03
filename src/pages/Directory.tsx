import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  directoryService,
  type DirectoryListingAPI,
  type DirectoryCategoryAPI,
  type ContributeDirectoryListingDto,
} from "@/lib/directoryService";
import type { DirectoryListingsParams } from "@/lib/directoryService";
import {
  Search,
  SlidersHorizontal,
  X,
  Globe,
  MapPin,
  Calendar,
  ExternalLink,
  Mail,
  ChevronRight,
  Building2,
  Shield,
  TrendingUp,
  Landmark,
  Cpu,
  BookOpen,
  Scale,
  GraduationCap,
  Users,
  CheckCircle,
  Phone,
  ChevronDown,
  ChevronUp,
  Plus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "@/hooks/use-toast";

/* -- Types ----------------------------------------------------------------- */
interface DirectoryEntry {
  id: string;
  name: string;
  sector: "financial" | "non-financial";
  categories: string[];
  overview: string;
  yearEstablished: number | null;
  headquarters: string;
  country: string;
  keyServices: string[];
  tags: string[];
  listingType: string;
  website: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
}

interface SubmissionReceipt {
  name: string;
  submittedAt: string;
  expectedTimeline: string;
}

/* -- Category config ------------------------------------------------------- */
const CATEGORY_CONFIG: Record<
  string,
  { color: string; bg: string; icon: React.ElementType }
> = {
  "Islamic Banks": { color: "#D52B1E", bg: "#FEF2F2", icon: Building2 },
  "Takaful Providers": { color: "#2563eb", bg: "#EFF6FF", icon: Shield },
  "Asset Management": { color: "#7c3aed", bg: "#F5F3FF", icon: TrendingUp },
  "Capital Markets": { color: "#0891b2", bg: "#ECFEFF", icon: Landmark },
  "Islamic Fintech": { color: "#059669", bg: "#ECFDF5", icon: Cpu },
  "Shariah Advisory": { color: "#d97706", bg: "#FFFBEB", icon: CheckCircle },
  "Research Institutions": { color: "#1d4ed8", bg: "#EFF6FF", icon: BookOpen },
  "Legal Services": { color: "#6d28d9", bg: "#F5F3FF", icon: Scale },
  "Education & Training": {
    color: "#0d9488",
    bg: "#F0FDFA",
    icon: GraduationCap,
  },
  "Scholars & Experts": { color: "#0891b2", bg: "#ECFEFF", icon: Users },
  "Regulatory Bodies": { color: "#dc2626", bg: "#FEF2F2", icon: Shield },
};

/** Colour palette used for categories not in CATEGORY_CONFIG. */
const DYNAMIC_PALETTE: Array<{
  color: string;
  bg: string;
  icon: React.ElementType;
}> = [
  { color: "#D52B1E", bg: "#FEF2F2", icon: Building2 },
  { color: "#2563eb", bg: "#EFF6FF", icon: Shield },
  { color: "#7c3aed", bg: "#F5F3FF", icon: TrendingUp },
  { color: "#0891b2", bg: "#ECFEFF", icon: Landmark },
  { color: "#059669", bg: "#ECFDF5", icon: Cpu },
  { color: "#d97706", bg: "#FFFBEB", icon: CheckCircle },
  { color: "#1d4ed8", bg: "#EFF6FF", icon: BookOpen },
  { color: "#6d28d9", bg: "#F5F3FF", icon: Scale },
  { color: "#0d9488", bg: "#F0FDFA", icon: GraduationCap },
  { color: "#dc2626", bg: "#FEF2F2", icon: Users },
];

function getCategoryConfig(name: string) {
  if (CATEGORY_CONFIG[name]) return CATEGORY_CONFIG[name];
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = (hash * 31 + name.charCodeAt(i)) & 0xffff;
  return DYNAMIC_PALETTE[hash % DYNAMIC_PALETTE.length];
}

/* -- API mapping ----------------------------------------------------------- */
function apiListingToEntry(a: DirectoryListingAPI): DirectoryEntry {
  return {
    id: a.id,
    name: a.name,
    sector: a.isFinancial ? "financial" : "non-financial",
    categories: a.category ? [a.category.name] : [],
    overview: a.description ?? "",
    yearEstablished: a.yearFounded ?? null,
    headquarters: a.city ?? "",
    country: a.country ?? "",
    keyServices: a.services ?? [],
    tags: a.tags ?? [],
    listingType: a.listingType ?? "",
    website: a.websiteUrl ?? "",
    email: a.email ?? undefined,
    phone: a.phone ?? undefined,
    linkedinUrl: a.socialLinks?.linkedin ?? undefined,
    twitterUrl: a.socialLinks?.twitter ?? undefined,
  };
}

/* -- Animation variants ---------------------------------------------------- */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { y: 18, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
};
const gridVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

/* -- Helpers --------------------------------------------------------------- */
function getInitials(name: string) {
  return name
    .split(" ")
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

/* -- Sub-components -------------------------------------------------------- */
function CategoryChip({
  label,
  active,
  count,
  onClick,
}: Readonly<{
  label: string;
  active: boolean;
  count: number;
  onClick: () => void;
}>) {
  const cfg = label === "All" ? null : getCategoryConfig(label);
  const Icon = cfg?.icon;
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all duration-200 ${
        active
          ? "border-transparent text-white shadow-sm"
          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
      }`}
      style={
        active
          ? {
              backgroundColor: cfg?.color ?? "#D52B1E",
              borderColor: cfg?.color ?? "#D52B1E",
            }
          : {}
      }
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
      <span
        className={`text-xs rounded-full px-1.5 py-0.5 font-semibold ${active ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"}`}
      >
        {count}
      </span>
    </button>
  );
}

function OrgCard({
  entry,
  onView,
}: Readonly<{ entry: DirectoryEntry; onView: (e: DirectoryEntry) => void }>) {
  const primaryCat = entry.categories[0];
  const cfg = getCategoryConfig(primaryCat ?? "");
  const Icon = cfg.icon;
  const initials = getInitials(entry.name);

  return (
    <motion.div variants={itemVariants} className="group">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full">
        <div className="h-1 w-full" style={{ backgroundColor: cfg.color }} />
        <div className="p-5 flex flex-col flex-1">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
              style={{ backgroundColor: cfg.bg, color: cfg.color }}
            >
              {initials || <Icon className="h-5 w-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-[#D52B1E] transition-colors">
                {entry.name}
              </h3>
              <div className="flex flex-wrap gap-1 mt-1">
                {entry.categories.slice(0, 2).map((cat) => (
                  <span
                    key={cat}
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: getCategoryConfig(cat).bg,
                      color: getCategoryConfig(cat).color,
                    }}
                  >
                    {cat}
                  </span>
                ))}
                {entry.categories.length > 2 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                    +{entry.categories.length - 2}
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* Overview */}
          <p className="text-gray-500 text-xs leading-relaxed line-clamp-3 mb-3 flex-1">
            {entry.overview}
          </p>
          {/* Metadata */}
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
            {entry.yearEstablished && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Est. {entry.yearEstablished}
              </span>
            )}
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {entry.headquarters}, {entry.country}
            </span>
          </div>
          {/* Services */}
          <div className="flex flex-wrap gap-1 mb-4">
            {entry.keyServices.slice(0, 3).map((svc) => (
              <span
                key={svc}
                className="text-xs bg-gray-50 border border-gray-100 text-gray-600 px-2 py-0.5 rounded-md"
              >
                {svc}
              </span>
            ))}
            {entry.keyServices.length > 3 && (
              <span className="text-xs bg-gray-50 border border-gray-100 text-gray-500 px-2 py-0.5 rounded-md">
                +{entry.keyServices.length - 3}
              </span>
            )}
          </div>
          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
            <a
              href={`https://${entry.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#D52B1E] transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Globe className="h-3 w-3" />
              {entry.website}
            </a>
            <button
              onClick={() => onView(entry)}
              className="flex items-center gap-1 text-xs font-semibold text-[#D52B1E] hover:gap-2 transition-all"
            >
              View Profile <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DetailModal({
  entry,
  onClose,
}: Readonly<{ entry: DirectoryEntry; onClose: () => void }>) {
  const primaryCat = entry.categories[0];
  const cfg = getCategoryConfig(primaryCat ?? "");
  const Icon = cfg.icon;
  const initials = getInitials(entry.name);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />
      <motion.div
        className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl"
        initial={{ y: 60, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div
          className="h-2 rounded-t-3xl"
          style={{ backgroundColor: cfg.color }}
        />
        <div className="p-6">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
          >
            <X className="h-5 w-5" />
          </button>
          {/* Org header */}
          <div className="flex items-start gap-4 mb-5">
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0"
              style={{ backgroundColor: cfg.bg, color: cfg.color }}
            >
              {initials || <Icon className="h-7 w-7" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 pr-8">
                {entry.name}
              </h2>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {entry.categories.map((cat) => (
                  <span
                    key={cat}
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor: getCategoryConfig(cat).bg,
                      color: getCategoryConfig(cat).color,
                    }}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed mb-5">
            {entry.overview}
          </p>
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {entry.yearEstablished && (
              <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Year Established</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {entry.yearEstablished}
                  </p>
                </div>
              </div>
            )}
            <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Headquarters</p>
                <p className="text-sm font-semibold text-gray-800">
                  {entry.headquarters}
                </p>
              </div>
            </div>
            <div
              className={`bg-gray-50 rounded-xl p-3 flex items-center gap-2 ${entry.yearEstablished ? "" : "col-span-2"}`}
            >
              <Globe className="h-4 w-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Country / Region</p>
                <p className="text-sm font-semibold text-gray-800">
                  {entry.country}
                </p>
              </div>
            </div>
          </div>
          {/* Key Services */}
          <div className="mb-5">
            <h4 className="text-sm font-semibold text-gray-800 mb-2.5">
              Key Services
            </h4>
            <div className="flex flex-wrap gap-2">
              {entry.keyServices.map((svc) => (
                <span
                  key={svc}
                  className="text-sm px-3 py-1.5 rounded-lg font-medium"
                  style={{ backgroundColor: cfg.bg, color: cfg.color }}
                >
                  {svc}
                </span>
              ))}
            </div>
          </div>
          {/* Contact & Links */}
          <div className="border-t border-gray-100 pt-4 space-y-2.5">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">
              Contact & Links
            </h4>
            <a
              href={`https://${entry.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-[#D52B1E]/40 hover:bg-[#FEF2F2] transition-all group"
            >
              <Globe className="h-4 w-4 text-gray-400 group-hover:text-[#D52B1E]" />
              <span className="text-sm text-gray-600 group-hover:text-[#D52B1E]">
                {entry.website}
              </span>
              <ExternalLink className="h-3.5 w-3.5 text-gray-300 ml-auto group-hover:text-[#D52B1E]" />
            </a>
            {entry.email && (
              <a
                href={`mailto:${entry.email}`}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
              >
                <Mail className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                <span className="text-sm text-gray-600 group-hover:text-blue-600">
                  {entry.email}
                </span>
              </a>
            )}
            {entry.phone && (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{entry.phone}</span>
              </div>
            )}
            <div className="flex gap-2 pt-1">
              {entry.linkedinUrl && (
                <a
                  href={entry.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> LinkedIn
                </a>
              )}
              {entry.twitterUrl && (
                <a
                  href={entry.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> X / Twitter
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ContributeListingModal({
  open,
  onClose,
  categories,
  onSubmitted,
}: Readonly<{
  open: boolean;
  onClose: () => void;
  categories: DirectoryCategoryAPI[];
  onSubmitted: (data: {
    name: string;
    submittedAt: string;
  }) => void | Promise<void>;
}>) {
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    listingType: "institution",
    categoryId: "",
    isFinancial: true,
    tagline: "",
    description: "",
    logoUrl: "",
    bannerUrl: "",
    websiteUrl: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    address: "",
    yearFounded: "",
    employeeRange: "",
    shariahCertified: false,
    certifyingBody: "",
    aumUsdMillions: "",
    linkedin: "",
    twitter: "",
    services: "",
    tags: "",
  });

  const availableCategories = useMemo(
    () => categories.filter((c) => c.isFinancial === form.isFinancial),
    [categories, form.isFinancial],
  );

  useEffect(() => {
    if (!open) return;
    if (!availableCategories.some((c) => c.id === form.categoryId)) {
      setForm((p) => ({ ...p, categoryId: availableCategories[0]?.id ?? "" }));
    }
  }, [open, availableCategories, form.categoryId]);

  if (!open) return null;

  const closeAndReset = () => {
    if (submitting) return;
    setErrors({});
    setForm({
      name: "",
      listingType: "institution",
      categoryId: "",
      isFinancial: true,
      tagline: "",
      description: "",
      logoUrl: "",
      bannerUrl: "",
      websiteUrl: "",
      email: "",
      phone: "",
      country: "",
      city: "",
      address: "",
      yearFounded: "",
      employeeRange: "",
      shariahCertified: false,
      certifyingBody: "",
      aumUsdMillions: "",
      linkedin: "",
      twitter: "",
      services: "",
      tags: "",
    });
    onClose();
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.categoryId.trim())
      nextErrors.categoryId = "Category is required.";
    if (!form.listingType.trim())
      nextErrors.listingType = "Listing type is required.";
    if (!form.description.trim())
      nextErrors.description = "Description is required.";
    if (!form.country.trim()) nextErrors.country = "Country is required.";
    if (form.yearFounded && !/^\d{4}$/.test(form.yearFounded)) {
      nextErrors.yearFounded =
        "Year Founded must be exactly 4 digits (e.g. 1940).";
    }
    return nextErrors;
  };

  const submit = async () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Please complete all required fields.");
      return;
    }
    setErrors({});

    const slug = form.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const socialLinks: Record<string, string> = {};
    if (form.linkedin.trim()) socialLinks.linkedin = form.linkedin.trim();
    if (form.twitter.trim()) socialLinks.twitter = form.twitter.trim();

    const payload: ContributeDirectoryListingDto = {
      name: form.name.trim(),
      slug,
      categoryId: form.categoryId,
      listingType: form.listingType,
      tagline: form.tagline.trim() || undefined,
      description: form.description.trim(),
      logoUrl: form.logoUrl.trim() || undefined,
      bannerUrl: form.bannerUrl.trim() || undefined,
      websiteUrl: form.websiteUrl.trim() || undefined,
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      country: form.country.trim(),
      city: form.city.trim() || undefined,
      address: form.address.trim() || undefined,
      yearFounded: form.yearFounded
        ? Number.parseInt(form.yearFounded, 10)
        : undefined,
      employeeRange: form.employeeRange.trim() || undefined,
      shariahCertified: form.shariahCertified,
      certifyingBody: form.certifyingBody.trim() || undefined,
      aumUsdMillions: form.aumUsdMillions
        ? Number.parseFloat(form.aumUsdMillions)
        : undefined,
      socialLinks:
        Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
      services: form.services
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      isFinancial: form.isFinancial,
      status: "draft",
    };

    setSubmitting(true);
    try {
      await directoryService.contributeListing(payload);
      toast.success("Contribution submitted for admin review.");
      await onSubmitted({
        name: payload.name,
        submittedAt: new Date().toISOString(),
      });
      closeAndReset();
    } catch (err) {
      console.error("Failed to submit contribution:", err);
      toast.error("Submission failed. Please review the form and try again.");
    } finally {
      setSubmitting(false);
    }
  };

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
        <div className="p-6 border-b border-gray-100">
          <button
            onClick={closeAndReset}
            disabled={submitting}
            className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">
            Contribute a Directory Listing
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            All contributions are submitted as draft and require admin approval
            before they are published.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            <span className="text-red-500 font-semibold">*</span> Required
            fields
          </p>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.name}
              onChange={(e) => {
                setForm((p) => ({ ...p, name: e.target.value }));
                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
              }}
              className={
                errors.name
                  ? "border-red-400 focus-visible:ring-red-300"
                  : undefined
              }
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Sector <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, isFinancial: true }))}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium ${form.isFinancial ? "bg-[#D52B1E] border-[#D52B1E] text-white" : "bg-white border-gray-200 text-gray-700"}`}
              >
                Financial
              </button>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, isFinancial: false }))}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium ${!form.isFinancial ? "bg-[#D52B1E] border-[#D52B1E] text-white" : "bg-white border-gray-200 text-gray-700"}`}
              >
                Non-Financial
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => {
                setForm((p) => ({ ...p, categoryId: e.target.value }));
                if (errors.categoryId)
                  setErrors((prev) => ({ ...prev, categoryId: "" }));
              }}
              className={`w-full h-10 rounded-md border px-3 text-sm bg-white text-gray-900 ${errors.categoryId ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-[#D52B1E]/30"}`}
            >
              {availableCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-xs text-red-600 mt-1">{errors.categoryId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Listing Type <span className="text-red-500">*</span>
            </label>
            <select
              value={form.listingType}
              onChange={(e) => {
                setForm((p) => ({ ...p, listingType: e.target.value }));
                if (errors.listingType)
                  setErrors((prev) => ({ ...prev, listingType: "" }));
              }}
              className={`w-full h-10 rounded-md border px-3 text-sm bg-white text-gray-900 ${errors.listingType ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-[#D52B1E]/30"}`}
            >
              {LISTING_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {errors.listingType && (
              <p className="text-xs text-red-600 mt-1">{errors.listingType}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Year Founded
            </label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="e.g. 2025"
              maxLength={4}
              value={form.yearFounded}
              onChange={(e) => {
                const digitsOnly = e.target.value
                  .replace(/\D/g, "")
                  .slice(0, 4);
                setForm((p) => ({ ...p, yearFounded: digitsOnly }));
                if (errors.yearFounded)
                  setErrors((prev) => ({ ...prev, yearFounded: "" }));
              }}
              className={
                errors.yearFounded
                  ? "border-red-400 focus-visible:ring-red-300"
                  : undefined
              }
            />
            {errors.yearFounded && (
              <p className="text-xs text-red-600 mt-1">{errors.yearFounded}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tagline
            </label>
            <Input
              value={form.tagline}
              onChange={(e) =>
                setForm((p) => ({ ...p, tagline: e.target.value }))
              }
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => {
                setForm((p) => ({ ...p, description: e.target.value }));
                if (errors.description)
                  setErrors((prev) => ({ ...prev, description: "" }));
              }}
              className={`w-full min-h-24 rounded-md border px-3 py-2 text-sm bg-white text-gray-900 ${errors.description ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-[#D52B1E]/30"}`}
            />
            {errors.description && (
              <p className="text-xs text-red-600 mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Country <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.country}
              onChange={(e) => {
                setForm((p) => ({ ...p, country: e.target.value }));
                if (errors.country)
                  setErrors((prev) => ({ ...prev, country: "" }));
              }}
              className={
                errors.country
                  ? "border-red-400 focus-visible:ring-red-300"
                  : undefined
              }
            />
            {errors.country && (
              <p className="text-xs text-red-600 mt-1">{errors.country}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              City
            </label>
            <Input
              value={form.city}
              onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Address
            </label>
            <Input
              value={form.address}
              onChange={(e) =>
                setForm((p) => ({ ...p, address: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Website URL
            </label>
            <Input
              value={form.websiteUrl}
              onChange={(e) =>
                setForm((p) => ({ ...p, websiteUrl: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email
            </label>
            <Input
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Phone
            </label>
            <Input
              value={form.phone}
              onChange={(e) =>
                setForm((p) => ({ ...p, phone: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Employee Range
            </label>
            <Input
              value={form.employeeRange}
              onChange={(e) =>
                setForm((p) => ({ ...p, employeeRange: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Services (comma-separated)
            </label>
            <Input
              value={form.services}
              onChange={(e) =>
                setForm((p) => ({ ...p, services: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tags (comma-separated)
            </label>
            <Input
              value={form.tags}
              onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Logo Upload
            </label>
            <ImageUpload
              value={form.logoUrl}
              onChange={(url) => setForm((p) => ({ ...p, logoUrl: url }))}
              previewHeight="h-28"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Upload image (max 5MB). URL is auto-filled from upload response.
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Banner Upload
            </label>
            <ImageUpload
              value={form.bannerUrl}
              onChange={(url) => setForm((p) => ({ ...p, bannerUrl: url }))}
              previewHeight="h-28"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Upload image (max 5MB). URL is auto-filled from upload response.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              LinkedIn URL
            </label>
            <Input
              value={form.linkedin}
              onChange={(e) =>
                setForm((p) => ({ ...p, linkedin: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Twitter/X URL
            </label>
            <Input
              value={form.twitter}
              onChange={(e) =>
                setForm((p) => ({ ...p, twitter: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              AUM (USD Millions)
            </label>
            <Input
              type="number"
              value={form.aumUsdMillions}
              onChange={(e) =>
                setForm((p) => ({ ...p, aumUsdMillions: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Certifying Body
            </label>
            <Input
              value={form.certifyingBody}
              onChange={(e) =>
                setForm((p) => ({ ...p, certifyingBody: e.target.value }))
              }
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.shariahCertified}
              onChange={(e) =>
                setForm((p) => ({ ...p, shariahCertified: e.target.checked }))
              }
              className="h-4 w-4 rounded border-gray-300 accent-[#D52B1E]"
            />
            <span className="text-sm text-gray-700">Shariah certified</span>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={closeAndReset}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={submitting}
            className="bg-[#D52B1E] hover:bg-[#B8241B] text-white"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Submit for Admin Review
          </Button>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

const LISTING_TYPES = [
  "institution",
  "fund",
  "professional",
  "regulator",
  "consultancy",
  "fintech",
  "ngo",
] as const;

function FilterPanel({
  countries,
  selectedCountries,
  onCountryChange,
  allServices,
  selectedServices,
  onServiceChange,
  yearRange,
  onYearRangeChange,
  listingType,
  onListingTypeChange,
  shariahCertified,
  onShariahCertifiedChange,
  citySearch,
  onCitySearchChange,
  tagsFilter,
  onTagsFilterChange,
  onClear,
  onClose,
}: Readonly<{
  countries: string[];
  selectedCountries: string[];
  onCountryChange: (c: string) => void;
  allServices: string[];
  selectedServices: string[];
  onServiceChange: (s: string) => void;
  yearRange: [number | null, number | null];
  onYearRangeChange: (r: [number | null, number | null]) => void;
  listingType: string;
  onListingTypeChange: (t: string) => void;
  shariahCertified: boolean | null;
  onShariahCertifiedChange: (v: boolean | null) => void;
  citySearch: string;
  onCitySearchChange: (v: string) => void;
  tagsFilter: string[];
  onTagsFilterChange: (tags: string[]) => void;
  onClear: () => void;
  onClose: () => void;
}>) {
  const [expanded, setExpanded] = useState({
    country: true,
    services: true,
    listingType: true,
  });
  const [tagInput, setTagInput] = useState("");
  const activeCount =
    selectedCountries.length +
    selectedServices.length +
    (yearRange[0] ? 1 : 0) +
    (yearRange[1] ? 1 : 0) +
    (listingType ? 1 : 0) +
    (shariahCertified !== null ? 1 : 0) +
    (citySearch ? 1 : 0) +
    tagsFilter.length;

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !tagsFilter.includes(t)) {
      onTagsFilterChange([...tagsFilter, t]);
    }
    setTagInput("");
  }

  return (
    <motion.div
      className="fixed inset-0 z-40 flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.aside
        className="relative ml-auto w-full max-w-xs bg-white h-full overflow-y-auto shadow-2xl flex flex-col"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">Filters</h3>
            {activeCount > 0 && (
              <p className="text-xs text-[#D52B1E]">{activeCount} active</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <button
                onClick={onClear}
                className="text-xs text-gray-400 hover:text-[#D52B1E]"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 p-5 space-y-5">
          {/* Listing Type */}
          <div>
            <button
              className="flex items-center justify-between w-full text-sm font-semibold text-gray-800 mb-3"
              onClick={() =>
                setExpanded((p) => ({ ...p, listingType: !p.listingType }))
              }
            >
              Listing Type
              {expanded.listingType ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>
            {expanded.listingType && (
              <div className="flex flex-wrap gap-2">
                {LISTING_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() =>
                      onListingTypeChange(listingType === t ? "" : t)
                    }
                    className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize border transition-all ${
                      listingType === t
                        ? "bg-[#D52B1E] text-white border-[#D52B1E]"
                        : "bg-white text-slate-600 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Shariah Certified */}
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">
              Shariah Certified
            </p>
            <div className="flex gap-2">
              {(
                [
                  { label: "Any", value: null },
                  { label: "Yes", value: true },
                  { label: "No", value: false },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => onShariahCertifiedChange(opt.value)}
                  className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    shariahCertified === opt.value
                      ? "bg-[#D52B1E] text-white border-[#D52B1E]"
                      : "bg-white text-slate-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {/* City */}
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">City</p>
            <input
              type="text"
              placeholder="e.g. Dubai, Kuala Lumpur"
              value={citySearch}
              onChange={(e) => onCitySearchChange(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D52B1E]/30"
            />
          </div>
          {/* Tags */}
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">Tags</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D52B1E]/30"
              />
              <button
                onClick={addTag}
                className="px-3 py-2 bg-[#D52B1E] text-white rounded-lg text-xs font-semibold hover:bg-[#B8241B]"
              >
                Add
              </button>
            </div>
            {tagsFilter.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tagsFilter.map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-1 text-xs bg-gray-100 px-2.5 py-1 rounded-full text-gray-700"
                  >
                    #{t}
                    <button
                      onClick={() =>
                        onTagsFilterChange(tagsFilter.filter((x) => x !== t))
                      }
                      className="hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          {/* Country */}
          <div>
            <button
              className="flex items-center justify-between w-full text-sm font-semibold text-gray-800 mb-3"
              onClick={() =>
                setExpanded((p) => ({ ...p, country: !p.country }))
              }
            >
              Country / Region
              {expanded.country ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>
            {expanded.country && (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {countries.map((c) => (
                  <label
                    key={c}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCountries.includes(c)}
                      onChange={() => onCountryChange(c)}
                      className="h-4 w-4 rounded border-gray-300 accent-[#D52B1E]"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900">
                      {c}
                    </span>
                  </label>
                ))}
                {countries.length === 0 && (
                  <p className="text-xs text-gray-400">
                    No countries available
                  </p>
                )}
              </div>
            )}
          </div>
          {/* Services */}
          <div>
            <button
              className="flex items-center justify-between w-full text-sm font-semibold text-gray-800 mb-3"
              onClick={() =>
                setExpanded((p) => ({ ...p, services: !p.services }))
              }
            >
              Services
              {expanded.services ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>
            {expanded.services && (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {allServices.map((s) => (
                  <label
                    key={s}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(s)}
                      onChange={() => onServiceChange(s)}
                      className="h-4 w-4 rounded border-gray-300 accent-[#D52B1E]"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900">
                      {s}
                    </span>
                  </label>
                ))}
                {allServices.length === 0 && (
                  <p className="text-xs text-gray-400">No services available</p>
                )}
              </div>
            )}
          </div>
          {/* Year range */}
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">
              Year Founded
            </p>
            <div className="flex gap-3 items-center">
              <input
                type="number"
                placeholder="From"
                value={yearRange[0] ?? ""}
                onChange={(e) =>
                  onYearRangeChange([
                    e.target.value ? Number.parseInt(e.target.value) : null,
                    yearRange[1],
                  ])
                }
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D52B1E]/30"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                placeholder="To"
                value={yearRange[1] ?? ""}
                onChange={(e) =>
                  onYearRangeChange([
                    yearRange[0],
                    e.target.value ? Number.parseInt(e.target.value) : null,
                  ])
                }
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D52B1E]/30"
              />
            </div>
          </div>
        </div>
        <div className="p-5 border-t border-gray-100">
          <Button
            onClick={onClose}
            className="w-full bg-[#D52B1E] hover:bg-[#B8241B] text-white rounded-xl"
          >
            Apply Filters
          </Button>
        </div>
      </motion.aside>
    </motion.div>
  );
}

/* -- Main Page ------------------------------------------------------------- */
export default function Directory() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const [searchParams] = useSearchParams();

  /* -- API state -- */
  const [apiEntries, setApiEntries] = useState<DirectoryEntry[] | null>(null);
  const [apiCategories, setApiCategories] = useState<DirectoryCategoryAPI[]>(
    [],
  );
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [contributeOpen, setContributeOpen] = useState(false);
  const [countryUniverse, setCountryUniverse] = useState<string[]>([]);
  const [submissionReceipt, setSubmissionReceipt] =
    useState<SubmissionReceipt | null>(null);

  const [statsEntries, setStatsEntries] = useState<{
    finCount: number;
    nonFinCount: number;
    countryCount: number;
  } | null>(null);

  /* -- Filter state -- */
  const [sector, setSector] = useState<"financial" | "non-financial">(() => {
    const s = searchParams.get("sector");
    return s === "non-financial" ? "non-financial" : "financial";
  });
  const [geography, setGeography] = useState<"all" | "local" | "global">("all");
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return searchParams.get("category") ?? "All";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [listingType, setListingType] = useState("");
  const [shariahCertified, setShariahCertified] = useState<boolean | null>(
    null,
  );
  const [citySearch, setCitySearch] = useState("");
  const [tagsFilter, setTagsFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [yearRange, setYearRange] = useState<[number | null, number | null]>([
    null,
    null,
  ]);
  const [selectedEntry, setSelectedEntry] = useState<DirectoryEntry | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);

  const CARDS_PER_PAGE = 6;
  const RECEIPT_STORAGE_KEY = "directory-contribution-receipt";

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(RECEIPT_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as SubmissionReceipt;
      if (parsed?.name && parsed?.submittedAt && parsed?.expectedTimeline) {
        setSubmissionReceipt(parsed);
      }
    } catch {
      // ignore bad localStorage payloads
    }
  }, []);

  const handleSubmissionReceived = ({
    name,
    submittedAt,
  }: {
    name: string;
    submittedAt: string;
  }) => {
    const receipt: SubmissionReceipt = {
      name,
      submittedAt,
      expectedTimeline: "Typically reviewed within 3-5 business days.",
    };
    setSubmissionReceipt(receipt);
    try {
      window.localStorage.setItem(RECEIPT_STORAGE_KEY, JSON.stringify(receipt));
    } catch {
      // no-op when storage is unavailable
    }
  };

  const clearSubmissionReceipt = () => {
    setSubmissionReceipt(null);
    try {
      window.localStorage.removeItem(RECEIPT_STORAGE_KEY);
    } catch {
      // no-op when storage is unavailable
    }
  };

  /* -- Debounce search query -- */
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  /* -- Initial load: categories + summary stats for hero section -- */
  useEffect(() => {
    Promise.all([
      directoryService.getListings(),
      directoryService.getCategories(),
    ])
      .then(([listings, categories]) => {
        const mapped = listings.map(apiListingToEntry);
        setCountryUniverse(
          [...new Set(mapped.map((e) => e.country).filter(Boolean))].sort(
            (a, b) => a.localeCompare(b),
          ),
        );
        setStatsEntries({
          finCount: mapped.filter((e) => e.sector === "financial").length,
          nonFinCount: mapped.filter((e) => e.sector === "non-financial")
            .length,
          countryCount: new Set(mapped.map((e) => e.country)).size,
        });
        setApiCategories(categories);
      })
      .catch(console.error);
  }, []);

  /* -- Reactive fetch: re-run whenever any filter changes -- */
  useEffect(() => {
    const params: DirectoryListingsParams = {
      isFinancial: sector === "financial",
    };
    if (debouncedSearch) params.search = debouncedSearch;
    if (selectedCategory !== "All") {
      const cat = apiCategories.find((c) => c.name === selectedCategory);
      if (cat) params.categoryId = cat.id;
    }
    if (listingType) params.listingType = listingType;
    if (selectedServices.length > 0)
      params.services = selectedServices.join(",");
    if (yearRange[0]) params.yearFoundedFrom = yearRange[0];
    if (yearRange[1]) params.yearFoundedTo = yearRange[1];
    if (shariahCertified !== null) params.shariahCertified = shariahCertified;
    if (citySearch) params.city = citySearch;
    if (tagsFilter.length > 0) params.tags = tagsFilter.join(",");

    if (geography === "local") {
      params.country = "Nigeria";
    } else if (geography === "global") {
      const nonNigeriaCountries = countryUniverse.filter(
        (c) => c.trim().toLowerCase() !== "nigeria",
      );
      const selectedNonNigeria = selectedCountries.filter(
        (c) => c.trim().toLowerCase() !== "nigeria",
      );
      const countriesForQuery =
        selectedNonNigeria.length > 0
          ? selectedNonNigeria
          : nonNigeriaCountries;
      if (countriesForQuery.length > 0) {
        params.countries = countriesForQuery.join(",");
      }
    } else if (selectedCountries.length > 0) {
      params.countries = selectedCountries.join(",");
    }

    setApiLoading(true);
    directoryService
      .getListings(params)
      .then((listings) => {
        setApiEntries(listings.map(apiListingToEntry));
        setApiError(null);
      })
      .catch((err) => {
        console.error("Failed to load directory listings:", err);
        setApiError("Failed to load directory. Please try again.");
      })
      .finally(() => setApiLoading(false));
  }, [
    sector,
    debouncedSearch,
    selectedCategory,
    apiCategories,
    listingType,
    selectedCountries,
    selectedServices,
    yearRange,
    shariahCertified,
    citySearch,
    tagsFilter,
    geography,
    countryUniverse,
  ]);

  // When navigating via searchParams change (e.g. from global search), sync state
  useEffect(() => {
    const s = searchParams.get("sector");
    const c = searchParams.get("category");
    if (s === "non-financial") setSector("non-financial");
    else if (s === "financial") setSector("financial");
    if (c) setSelectedCategory(decodeURIComponent(c));
    setCurrentPage(1);
  }, [searchParams]);

  // Reset filters when sector tab is switched
  useEffect(() => {
    if (!searchParams.get("category")) {
      setSelectedCategory("All");
    }
    setSelectedCountries([]);
    setSelectedServices([]);
    setYearRange([null, null]);
    setListingType("");
    setShariahCertified(null);
    setCitySearch("");
    setTagsFilter([]);
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sector]);

  useEffect(() => {
    setSelectedCountries([]);
    setCurrentPage(1);
  }, [geography]);

  const allEntries = apiEntries ?? [];

  const categories = useMemo(
    () =>
      apiCategories
        .filter((c) => c.isFinancial === (sector === "financial"))
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((c) => c.name),
    [apiCategories, sector],
  );

  // Derived from current API results (dynamic, reflects active filters)
  const allCountries = useMemo(
    () =>
      [...new Set(allEntries.map((e) => e.country).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b),
      ),
    [allEntries],
  );

  const allServices = useMemo(() => {
    const set = new Set<string>();
    allEntries.forEach((e) => e.keyServices.forEach((s) => set.add(s)));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [allEntries]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: allEntries.length };
    allEntries.forEach((e) =>
      e.categories.forEach((c) => {
        counts[c] = (counts[c] ?? 0) + 1;
      }),
    );
    return counts;
  }, [allEntries]);

  const filteredEntries = allEntries;

  const totalPages = Math.ceil(filteredEntries.length / CARDS_PER_PAGE);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * CARDS_PER_PAGE,
    currentPage * CARDS_PER_PAGE,
  );

  const toggleCountry = (c: string) => {
    setSelectedCountries((p) =>
      p.includes(c) ? p.filter((x) => x !== c) : [...p, c],
    );
    setCurrentPage(1);
  };
  const toggleService = (s: string) => {
    setSelectedServices((p) =>
      p.includes(s) ? p.filter((x) => x !== s) : [...p, s],
    );
    setCurrentPage(1);
  };
  const clearFilters = () => {
    setSelectedCountries([]);
    setSelectedServices([]);
    setYearRange([null, null]);
    setListingType("");
    setShariahCertified(null);
    setCitySearch("");
    setTagsFilter([]);
    setCurrentPage(1);
  };
  const activeFilterCount =
    selectedCountries.length +
    selectedServices.length +
    (yearRange[0] ? 1 : 0) +
    (yearRange[1] ? 1 : 0) +
    (listingType ? 1 : 0) +
    (shariahCertified !== null ? 1 : 0) +
    (citySearch ? 1 : 0) +
    tagsFilter.length;

  const finCount = statsEntries?.finCount ?? 0;
  const nonFinCount = statsEntries?.nonFinCount ?? 0;
  const countryCount = statsEntries?.countryCount ?? 0;

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* API error banner */}
      {apiError && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          {apiError}
        </div>
      )}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-950 via-[#1c0505] to-gray-900 p-8 md:p-12 min-h-[220px] flex items-center">
          <div className="pointer-events-none absolute -top-16 -right-16 h-72 w-72 rounded-full bg-[#D52B1E]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-[#D52B1E]/10 blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8 w-full">
            <div className="flex-1 space-y-4">
              <span className="inline-flex items-center gap-1.5 bg-[#D52B1E]/20 text-[#D52B1E] text-xs font-bold px-3 py-1.5 rounded-full border border-[#D52B1E]/30 tracking-widest uppercase">
                <Globe className="h-3 w-3" /> IEFA Directory
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                The Islamic Finance{" "}
                <span className="text-[#D52B1E]">Global Directory</span>
              </h1>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl">
                A structured database of Islamic finance institutions, service
                providers, regulatory bodies and market participants across the
                global Islamic finance ecosystem.
              </p>
              <div className="flex gap-3 pt-1 flex-wrap">
                {[
                  { label: "Financial Providers", value: finCount },
                  { label: "Non-Financial Providers", value: nonFinCount },
                  { label: "Countries Covered", value: `${countryCount}+` },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-center"
                  >
                    <p className="text-xl font-bold text-white">{stat.value}</p>
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
                  Contributions are submitted as drafts and published only after
                  admin approval.
                </p>

                {submissionReceipt && (
                  <div className="mt-3 rounded-xl border border-emerald-300/30 bg-emerald-500/10 p-3 text-xs text-emerald-100 max-w-xl">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-emerald-200">
                          My submission was received
                        </p>
                        <p className="mt-1 text-emerald-100/90">
                          <span className="font-medium">
                            {submissionReceipt.name}
                          </span>{" "}
                          was submitted on{" "}
                          {new Date(
                            submissionReceipt.submittedAt,
                          ).toLocaleString()}
                          .
                        </p>
                        <p className="mt-1 text-emerald-100/80">
                          {submissionReceipt.expectedTimeline}
                        </p>
                      </div>
                      <button
                        onClick={clearSubmissionReceipt}
                        className="text-emerald-100/70 hover:text-white"
                        aria-label="Dismiss submission receipt"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Geography filter */}
              <div className="flex items-center gap-2 pt-2">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-widest mr-1">
                  View:
                </span>
                {(
                  [
                    {
                      id: "all" as const,
                      label: "🌐 All",
                      desc: "All regions",
                    },
                    {
                      id: "local" as const,
                      label: "🇳🇬 Local",
                      desc: "Nigeria only",
                    },
                    {
                      id: "global" as const,
                      label: "🌍 Global",
                      desc: "International",
                    },
                  ] as const
                ).map((g) => (
                  <button
                    key={g.id}
                    onClick={() => {
                      setGeography(g.id);
                      setCurrentPage(1);
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

            <div className="shrink-0 w-full md:w-80">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search institutions, experts, services..."
                  className="pl-12 pr-4 h-12 rounded-2xl bg-white border-0 shadow-xl text-gray-800 placeholder:text-gray-400 text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute right-8 bottom-4 opacity-5 text-white select-none hidden md:block">
            <Building2 className="h-52 w-52" />
          </div>
        </div>
      </motion.div>

      {/* Sector tabs */}
      <motion.div
        variants={itemVariants}
        className="bg-white border border-gray-100 rounded-xl shadow-sm sticky top-16 z-20 overflow-hidden"
      >
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3 px-4">
          {[
            {
              id: "financial" as const,
              label: "Financial Service Providers",
              count: finCount,
              icon: Building2,
            },
            {
              id: "non-financial" as const,
              label: "Non-Financial Service Providers",
              count: nonFinCount,
              icon: Users,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSector(tab.id)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                sector === tab.id
                  ? "bg-[#D52B1E] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${sector === tab.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Content area */}
      <div className="space-y-5">
        {/* Category chips */}
        <motion.div variants={itemVariants} className="flex items-center gap-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 flex-1">
            <CategoryChip
              label="All"
              active={selectedCategory === "All"}
              count={categoryCounts["All"] ?? 0}
              onClick={() => {
                setSelectedCategory("All");
                setCurrentPage(1);
              }}
            />
            {categories.map((cat) => (
              <CategoryChip
                key={cat}
                label={cat}
                active={selectedCategory === cat}
                count={categoryCounts[cat] ?? 0}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
              />
            ))}
          </div>
          <button
            onClick={() => setShowFilters(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium shrink-0 transition-all ${
              activeFilterCount > 0
                ? "bg-[#D52B1E] text-white border-[#D52B1E]"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-white/25 text-white text-xs px-1.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
        </motion.div>

        {/* Active filter chips */}
        {(selectedCountries.length > 0 ||
          selectedServices.length > 0 ||
          Boolean(listingType) ||
          Boolean(citySearch) ||
          tagsFilter.length > 0 ||
          shariahCertified !== null) && (
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap gap-2 items-center"
          >
            {listingType && (
              <span className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full capitalize">
                Type: {listingType}
                <button
                  onClick={() => setListingType("")}
                  className="hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {shariahCertified !== null && (
              <span className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                Shariah: {shariahCertified ? "Certified" : "Not Certified"}
                <button
                  onClick={() => setShariahCertified(null)}
                  className="hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {citySearch && (
              <span className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                City: {citySearch}
                <button
                  onClick={() => setCitySearch("")}
                  className="hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {tagsFilter.map((t) => (
              <span
                key={t}
                className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full"
              >
                #{t}
                <button
                  onClick={() => setTagsFilter((p) => p.filter((x) => x !== t))}
                  className="hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {selectedCountries.map((c) => (
              <span
                key={c}
                className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full"
              >
                <MapPin className="h-3 w-3" />
                {c}
                <button
                  onClick={() => toggleCountry(c)}
                  className="hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {selectedServices.map((s) => (
              <span
                key={s}
                className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full"
              >
                {s}
                <button
                  onClick={() => toggleService(s)}
                  className="hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <button
              onClick={clearFilters}
              className="text-xs text-[#D52B1E] hover:underline font-medium"
            >
              Clear all
            </button>
          </motion.div>
        )}

        {/* Results */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between"
        >
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-800">
              {filteredEntries.length}
            </span>{" "}
            {filteredEntries.length === 1 ? "entry" : "entries"} found
            {searchQuery && (
              <span>
                {" "}
                for{" "}
                <span className="font-medium text-gray-700">
                  "{searchQuery}"
                </span>
              </span>
            )}
          </p>
        </motion.div>

        {apiLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-gray-100 rounded" />
                <div className="h-3 bg-gray-100 rounded w-5/6" />
              </div>
            ))}
          </div>
        ) : filteredEntries.length > 0 ? (
          <>
            <motion.div
              key={`${sector}-${selectedCategory}-${currentPage}`}
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              variants={gridVariants}
              initial="hidden"
              animate="visible"
            >
              {paginatedEntries.map((entry) => (
                <OrgCard
                  key={entry.id}
                  entry={entry}
                  onView={setSelectedEntry}
                />
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-gray-400">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-[#D52B1E] hover:text-[#D52B1E] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`h-8 w-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                          p === currentPage
                            ? "bg-[#D52B1E] text-white"
                            : "border border-gray-200 text-gray-600 hover:border-[#D52B1E] hover:text-[#D52B1E]"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-[#D52B1E] hover:text-[#D52B1E] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Search className="h-7 w-7 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              No results found
            </h3>
            <p className="text-sm text-gray-400 max-w-xs">
              Try adjusting your search or filters to find what you are looking
              for.
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                clearFilters();
                setSelectedCategory("All");
              }}
              variant="outline"
              className="mt-4"
            >
              Clear all filters
            </Button>
          </motion.div>
        )}
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <FilterPanel
            countries={allCountries}
            selectedCountries={selectedCountries}
            onCountryChange={toggleCountry}
            allServices={allServices}
            selectedServices={selectedServices}
            onServiceChange={toggleService}
            yearRange={yearRange}
            onYearRangeChange={setYearRange}
            listingType={listingType}
            onListingTypeChange={setListingType}
            shariahCertified={shariahCertified}
            onShariahCertifiedChange={setShariahCertified}
            citySearch={citySearch}
            onCitySearchChange={setCitySearch}
            tagsFilter={tagsFilter}
            onTagsFilterChange={setTagsFilter}
            onClear={clearFilters}
            onClose={() => setShowFilters(false)}
          />
        )}
      </AnimatePresence>

      {/* Contribute listing modal */}
      <AnimatePresence>
        {contributeOpen && (
          <ContributeListingModal
            open={contributeOpen}
            onClose={() => setContributeOpen(false)}
            categories={apiCategories}
            onSubmitted={handleSubmissionReceived}
          />
        )}
      </AnimatePresence>

      {/* Detail modal */}
      <AnimatePresence>
        {selectedEntry && (
          <DetailModal
            entry={selectedEntry}
            onClose={() => setSelectedEntry(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
