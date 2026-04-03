import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect, useCallback } from "react";
import {
  directoryService,
  type DirectoryListingAPI,
  type DirectoryCategoryAPI,
  type CreateDirectoryCategoryDto,
} from "@/lib/directoryService";
import type { DirectoryListingsParams } from "@/lib/directoryService";
import {
  FolderOpen,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Building2,
  MapPin,
  Globe,
  Shield,
  TrendingUp,
  Landmark,
  Cpu,
  CheckCircle,
  BookOpen,
  Scale,
  GraduationCap,
  Users,
  Calendar,
  Mail,
  Phone,
  ExternalLink,
  X,
  Save,
  Building,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "@/hooks/use-toast";
import { BulkUploadDialog } from "@/components/admin/BulkUploadDialog";

/* -- Animation variants ---------------------------------------------------- */
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = { hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1 } };

/* -- Types ------------------------------------------------------------------ */
interface DirectoryEntry {
  id: string;
  name: string;
  sector: "financial" | "non-financial";
  categories: string[];
  overview: string;
  yearEstablished: number | null;
  headquarters: string;
  country: string;
  address: string;
  keyServices: string[];
  tags: string[];
  website: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  tagline: string;
  listingType: string;
  logoUrl: string;
  bannerUrl: string;
  employeeRange: string;
  shariahCertified: boolean;
  certifyingBody: string;
  aumUsdMillions: number | null;
  status: "active" | "inactive" | "pending";
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
// INITIAL_ENTRIES removed – data is loaded from API on mount
/* -- Empty form defaults --------------------------------------------------- */
const EMPTY_FORM: Omit<DirectoryEntry, "id"> = {
  name: "",
  sector: "financial",
  categories: [],
  overview: "",
  yearEstablished: null,
  headquarters: "",
  country: "",
  address: "",
  keyServices: [],
  tags: [],
  website: "",
  email: "",
  phone: "",
  linkedinUrl: "",
  twitterUrl: "",
  tagline: "",
  listingType: "institution",
  logoUrl: "",
  bannerUrl: "",
  employeeRange: "",
  shariahCertified: false,
  certifyingBody: "",
  aumUsdMillions: null,
  status: "active",
};

/* -- Status badge ---------------------------------------------------------- */
const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  inactive: "bg-slate-100 text-slate-500",
  pending: "bg-amber-50 text-amber-700",
};

/* -- Stats config ---------------------------------------------------------- */
function buildStats(entries: DirectoryEntry[]) {
  return [
    {
      label: "Total Entries",
      value: entries.length,
      color: "#D52B1E",
      icon: FolderOpen,
    },
    {
      label: "Financial Providers",
      value: entries.filter((e) => e.sector === "financial").length,
      color: "#3b82f6",
      icon: Building,
    },
    {
      label: "Non-Financial",
      value: entries.filter((e) => e.sector === "non-financial").length,
      color: "#7c3aed",
      icon: Users,
    },
    {
      label: "Countries",
      value: new Set(entries.map((e) => e.country)).size,
      color: "#10b981",
      icon: MapPin,
    },
    {
      label: "Pending Review",
      value: entries.filter((e) => e.status === "pending").length,
      color: "#f59e0b",
      icon: Eye,
    },
  ];
}

/* -- Entry form modal ------------------------------------------------------ */
function EntryFormModal({
  initial,
  onSave,
  onClose,
  financialCats,
  nonFinancialCats,
}: {
  initial: Omit<DirectoryEntry, "id"> | (DirectoryEntry & { id: string });
  onSave: (data: Omit<DirectoryEntry, "id">) => void;
  onClose: () => void;
  financialCats: string[];
  nonFinancialCats: string[];
}) {
  const [form, setForm] = useState<Omit<DirectoryEntry, "id">>({
    name: initial.name,
    sector: initial.sector,
    categories: [...initial.categories],
    overview: initial.overview,
    yearEstablished: initial.yearEstablished,
    headquarters: initial.headquarters,
    country: initial.country,
    address: initial.address,
    keyServices: [...initial.keyServices],
    tags: [...initial.tags],
    website: initial.website,
    email: initial.email ?? "",
    phone: initial.phone ?? "",
    linkedinUrl: initial.linkedinUrl ?? "",
    twitterUrl: initial.twitterUrl ?? "",
    tagline: initial.tagline,
    listingType: initial.listingType,
    logoUrl: initial.logoUrl,
    bannerUrl: initial.bannerUrl,
    employeeRange: initial.employeeRange,
    shariahCertified: initial.shariahCertified,
    certifyingBody: initial.certifyingBody,
    aumUsdMillions: initial.aumUsdMillions,
    status: initial.status,
  });
  const [serviceInput, setServiceInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [logoUploading, setLogoUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);

  const cats = form.sector === "financial" ? financialCats : nonFinancialCats;

  function toggleCategory(cat: string) {
    setForm((p) => ({
      ...p,
      categories: p.categories.includes(cat)
        ? p.categories.filter((c) => c !== cat)
        : [...p.categories, cat],
    }));
  }

  function addService() {
    const t = serviceInput.trim();
    if (t && !form.keyServices.includes(t)) {
      setForm((p) => ({ ...p, keyServices: [...p.keyServices, t] }));
      setServiceInput("");
    }
  }

  function removeService(s: string) {
    setForm((p) => ({
      ...p,
      keyServices: p.keyServices.filter((x) => x !== s),
    }));
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) {
      setForm((p) => ({ ...p, tags: [...p.tags, t] }));
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setForm((p) => ({
      ...p,
      tags: p.tags.filter((x) => x !== tag),
    }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.overview.trim()) e.overview = "Overview is required";
    if (!form.website.trim()) e.website = "Website is required";
    if (!form.country.trim()) e.country = "Country is required";
    if (form.categories.length === 0)
      e.categories = "Select at least one category";
    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    onSave(form);
  }

  return createPortal(
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        initial={{ y: 40, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-slate-800">
            {"id" in initial ? "Edit Entry" : "Add New Entry"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Name + Tagline */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Organization / Person Name *
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Dubai Islamic Bank"
              className="h-10 text-sm"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Tagline
            </label>
            <Input
              value={form.tagline}
              onChange={(e) =>
                setForm((p) => ({ ...p, tagline: e.target.value }))
              }
              placeholder="e.g. World class Islamic bank"
              className="h-10 text-sm"
            />
          </div>

          {/* Listing Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Listing Type
            </label>
            <div className="flex gap-2">
              {["institution", "individual", "organization"].map((t) => (
                <button
                  key={t}
                  onClick={() => setForm((p) => ({ ...p, listingType: t }))}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium capitalize transition-all ${
                    form.listingType === t
                      ? "bg-[#D52B1E] text-white border-[#D52B1E]"
                      : "bg-white text-slate-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Sector */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Sector *
            </label>
            <div className="flex gap-3">
              {(["financial", "non-financial"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() =>
                    setForm((p) => ({ ...p, sector: s, categories: [] }))
                  }
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-medium capitalize transition-all ${
                    form.sector === s
                      ? "bg-[#D52B1E] text-white border-[#D52B1E]"
                      : "bg-white text-slate-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {s === "financial"
                    ? "Financial Services"
                    : "Non-Financial Services"}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Categories * (select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {cats.map((cat) => {
                const cfg = getCategoryConfig(cat);
                const isSelected = form.categories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      isSelected
                        ? "border-transparent text-white"
                        : "bg-white border-gray-200 text-slate-600 hover:bg-gray-50"
                    }`}
                    style={
                      isSelected
                        ? { backgroundColor: cfg.color, borderColor: cfg.color }
                        : {}
                    }
                  >
                    {isSelected && <CheckCircle className="h-3 w-3" />}
                    {cat}
                  </button>
                );
              })}
            </div>
            {errors.categories && (
              <p className="text-xs text-red-500 mt-1">{errors.categories}</p>
            )}
          </div>

          {/* Overview */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Overview *
            </label>
            <textarea
              value={form.overview}
              onChange={(e) =>
                setForm((p) => ({ ...p, overview: e.target.value }))
              }
              rows={3}
              placeholder="Brief description of the organization..."
              className="w-full bg-background text-foreground border border-gray-200 rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#D52B1E]/30 resize-none"
            />
            {errors.overview && (
              <p className="text-xs text-red-500 mt-1">{errors.overview}</p>
            )}
          </div>

          {/* Location row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Year Est.
              </label>
              <Input
                type="number"
                value={form.yearEstablished ?? ""}
                placeholder="e.g. 1975"
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    yearEstablished: e.target.value
                      ? parseInt(e.target.value)
                      : null,
                  }))
                }
                className="h-10 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                City
              </label>
              <Input
                value={form.headquarters}
                placeholder="City"
                onChange={(e) =>
                  setForm((p) => ({ ...p, headquarters: e.target.value }))
                }
                className="h-10 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Country *
              </label>
              <Input
                value={form.country}
                placeholder="Country"
                onChange={(e) =>
                  setForm((p) => ({ ...p, country: e.target.value }))
                }
                className="h-10 text-sm"
              />
              {errors.country && (
                <p className="text-xs text-red-500 mt-1">{errors.country}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Address
            </label>
            <Input
              value={form.address}
              onChange={(e) =>
                setForm((p) => ({ ...p, address: e.target.value }))
              }
              placeholder="Full street address"
              className="h-10 text-sm"
            />
          </div>

          {/* Key Services */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Key Services
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                value={serviceInput}
                onChange={(e) => setServiceInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addService();
                  }
                }}
                placeholder="Type a service and press Enter"
                className="h-9 text-sm flex-1"
              />
              <Button
                onClick={addService}
                size="sm"
                variant="outline"
                className="rounded-lg h-9 px-3"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.keyServices.map((s) => (
                <span
                  key={s}
                  className="flex items-center gap-1.5 text-xs bg-gray-100 text-slate-700 px-2.5 py-1 rounded-full"
                >
                  {s}
                  <button
                    onClick={() => removeService(s)}
                    className="hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Type a tag and press Enter"
                className="h-9 text-sm flex-1"
              />
              <Button
                onClick={addTag}
                size="sm"
                variant="outline"
                className="rounded-lg h-9 px-3"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.tags.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full"
                >
                  {t}
                  <button
                    onClick={() => removeTag(t)}
                    className="hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Website *
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={form.website}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, website: e.target.value }))
                  }
                  placeholder="example.com"
                  className="pl-9 h-10 text-sm"
                />
              </div>
              {errors.website && (
                <p className="text-xs text-red-500 mt-1">{errors.website}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={form.email ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="info@example.com"
                  className="pl-9 h-10 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={form.phone ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="+1 234 567 8901"
                  className="pl-9 h-10 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                LinkedIn URL
              </label>
              <div className="relative">
                <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={form.linkedinUrl ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, linkedinUrl: e.target.value }))
                  }
                  placeholder="https://linkedin.com/..."
                  className="pl-9 h-10 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Logo & Banner Uploads */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Logo Upload
              </label>
              <ImageUpload
                value={form.logoUrl}
                onChange={(url) => setForm((p) => ({ ...p, logoUrl: url }))}
                onUploadPendingChange={setLogoUploading}
                previewHeight="h-28"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Upload image (max 5MB). URL is auto-filled from upload response.
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Banner Upload
              </label>
              <ImageUpload
                value={form.bannerUrl}
                onChange={(url) => setForm((p) => ({ ...p, bannerUrl: url }))}
                onUploadPendingChange={setBannerUploading}
                previewHeight="h-28"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Upload image (max 5MB). URL is auto-filled from upload response.
              </p>
            </div>
          </div>

          {/* Shariah & Financial details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Employee Range
              </label>
              <Input
                value={form.employeeRange}
                onChange={(e) =>
                  setForm((p) => ({ ...p, employeeRange: e.target.value }))
                }
                placeholder="e.g. 1000-5000"
                className="h-10 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                AUM (USD Millions)
              </label>
              <Input
                type="number"
                value={form.aumUsdMillions ?? ""}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    aumUsdMillions: e.target.value
                      ? parseFloat(e.target.value)
                      : null,
                  }))
                }
                placeholder="e.g. 500"
                className="h-10 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-slate-700">
                Shariah Certified
              </label>
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    shariahCertified: !p.shariahCertified,
                  }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  form.shariahCertified ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    form.shariahCertified ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Certifying Body
              </label>
              <Input
                value={form.certifyingBody}
                onChange={(e) =>
                  setForm((p) => ({ ...p, certifyingBody: e.target.value }))
                }
                placeholder="e.g. AAOIFI"
                className="h-10 text-sm"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Status
            </label>
            <div className="flex gap-3">
              {(["active", "inactive", "pending"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setForm((p) => ({ ...p, status: s }))}
                  className={`flex-1 py-2 rounded-xl border text-sm font-medium capitalize transition-all ${
                    form.status === s
                      ? s === "active"
                        ? "bg-green-600 text-white border-green-600"
                        : s === "inactive"
                          ? "bg-slate-600 text-white border-slate-600"
                          : "bg-amber-500 text-white border-amber-500"
                      : "bg-white text-slate-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={logoUploading || bannerUploading}
            className="bg-[#D52B1E] hover:bg-[#B8241B] text-white rounded-xl gap-2"
          >
            <Save className="h-4 w-4" /> Save Entry
          </Button>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

/* -- View detail modal ----------------------------------------------------- */
function ViewModal({
  entry,
  onClose,
}: {
  entry: DirectoryEntry;
  onClose: () => void;
}) {
  const primaryCat = entry.categories[0];
  const cfg = getCategoryConfig(primaryCat ?? "");
  const initials = entry.name
    .split(" ")
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
  const Icon = cfg.icon;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        className="relative bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        initial={{ y: 30, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
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
          <div className="flex items-start gap-4 mb-4">
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0"
              style={{ backgroundColor: cfg.bg, color: cfg.color }}
            >
              {initials || <Icon className="h-6 w-6" />}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-slate-800 pr-8">
                {entry.name}
              </h2>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {entry.categories.map((cat) => (
                  <span
                    key={cat}
                    className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: getCategoryConfig(cat).bg,
                      color: getCategoryConfig(cat).color,
                    }}
                  >
                    {cat}
                  </span>
                ))}
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${STATUS_STYLES[entry.status]}`}
                >
                  {entry.status}
                </span>
              </div>
            </div>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed mb-4">
            {entry.overview}
          </p>
          <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
            {entry.yearEstablished && (
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Established</p>
                  <p className="font-medium text-slate-700">
                    {entry.yearEstablished}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5">
              <MapPin className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Location</p>
                <p className="font-medium text-slate-700">
                  {entry.headquarters}, {entry.country}
                </p>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Key Services
            </p>
            <div className="flex flex-wrap gap-1.5">
              {entry.keyServices.map((s) => (
                <span
                  key={s}
                  className="text-xs px-2.5 py-1 rounded-lg font-medium"
                  style={{ backgroundColor: cfg.bg, color: cfg.color }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <a
              href={`https://${entry.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#D52B1E] transition-colors"
            >
              <Globe className="h-4 w-4" />
              {entry.website}
            </a>
            {entry.email && (
              <a
                href={`mailto:${entry.email}`}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors"
              >
                <Mail className="h-4 w-4" />
                {entry.email}
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

/* -- Delete confirm -------------------------------------------------------- */
function DeleteConfirm({
  name,
  onConfirm,
  onClose,
}: {
  name: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return createPortal(
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 text-center mb-1">
          Delete Entry
        </h3>
        <p className="text-sm text-slate-500 text-center mb-5">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-700">{name}</span>? This
          action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl"
          >
            Delete
          </Button>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

/* -- Main component -------------------------------------------------------- */
/* -- API mapping helper (module-level so it's stable) ────────────────── */
function apiToEntry(a: DirectoryListingAPI): DirectoryEntry {
  const statusMap: Record<string, "active" | "inactive" | "pending"> = {
    published: "active",
    draft: "inactive",
    pending: "pending",
  };
  return {
    id: a.id,
    name: a.name,
    sector: a.isFinancial ? "financial" : "non-financial",
    categories: a.category ? [a.category.name] : [],
    overview: a.description ?? "",
    yearEstablished: a.yearFounded ?? null,
    headquarters: a.city ?? "",
    country: a.country ?? "",
    address: a.address ?? "",
    keyServices: a.services ?? [],
    tags: a.tags ?? [],
    website: a.websiteUrl ?? "",
    email: a.email ?? undefined,
    phone: a.phone ?? undefined,
    linkedinUrl: a.socialLinks?.linkedin ?? undefined,
    twitterUrl: a.socialLinks?.twitter ?? undefined,
    tagline: a.tagline ?? "",
    listingType: a.listingType ?? "institution",
    logoUrl: a.logoUrl ?? "",
    bannerUrl: a.bannerUrl ?? "",
    employeeRange: a.employeeRange ?? "",
    shariahCertified: a.shariahCertified ?? false,
    certifyingBody: a.certifyingBody ?? "",
    aumUsdMillions: a.aumUsdMillions ?? null,
    status: statusMap[a.status] ?? "active",
  };
}

/* -- CategoryFormModal ----------------------------------------------------- */
function CategoryFormModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: DirectoryCategoryAPI;
  onSave: (dto: CreateDirectoryCategoryDto) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isFinancial, setIsFinancial] = useState(initial?.isFinancial ?? true);
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErr("Name is required");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      await onSave({
        name: name.trim(),
        slug,
        description: description.trim() || undefined,
        isFinancial,
        sortOrder,
      });
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">
            {initial ? "Edit Category" : "New Category"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Islamic Banks"
              className="rounded-xl"
              autoFocus
            />
            {slug && (
              <p className="text-xs text-slate-400 mt-1">
                Slug: <span className="font-mono">{slug}</span>
              </p>
            )}
            {err && <p className="text-xs text-red-500 mt-1">{err}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief description of this category"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#D52B1E]/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Type
            </label>
            <div className="flex gap-3">
              {([true, false] as const).map((val) => (
                <button
                  type="button"
                  key={String(val)}
                  onClick={() => setIsFinancial(val)}
                  className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${
                    isFinancial === val
                      ? "bg-[#D52B1E] text-white border-[#D52B1E]"
                      : "bg-white text-slate-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {val ? "Financial" : "Non-Financial"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Sort Order
            </label>
            <Input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
              className="rounded-xl w-28"
              min={0}
            />
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#D52B1E] hover:bg-[#B8241B] text-white rounded-xl"
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body,
  );
}

/* -- DeleteCategoryConfirm ------------------------------------------------- */
function DeleteCategoryConfirm({
  name,
  onConfirm,
  onClose,
}: {
  name: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4"
      >
        <h2 className="text-lg font-bold text-slate-800">Delete Category</h2>
        <p className="text-sm text-slate-600">
          Are you sure you want to delete <strong>{name}</strong>? This cannot
          be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button
            disabled={deleting}
            onClick={async () => {
              setDeleting(true);
              await onConfirm();
              setDeleting(false);
            }}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
          >
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}

export default function AdminDirectory() {
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [apiCategories, setApiCategories] = useState<DirectoryCategoryAPI[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sector, setSector] = useState<"all" | "financial" | "non-financial">(
    "all",
  );
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [modalState, setModalState] = useState<
    | { type: "create" }
    | { type: "edit"; entry: DirectoryEntry }
    | { type: "view"; entry: DirectoryEntry }
    | { type: "delete"; entry: DirectoryEntry }
    | null
  >(null);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);

  const [catModal, setCatModal] = useState<
    | { type: "create" }
    | { type: "edit"; cat: DirectoryCategoryAPI }
    | { type: "delete"; cat: DirectoryCategoryAPI }
    | null
  >(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  /* -- Fetch data on mount -- */
  useEffect(() => {
    directoryService
      .getCategories()
      .then((categories) => {
        setApiCategories(categories);
      })
      .catch((err) => {
        console.error("Failed to load directory categories:", err);
      });
  }, []);

  /* -- Fetch listings with active search/filter params -- */
  useEffect(() => {
    const params: DirectoryListingsParams = {};
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (sector !== "all") params.isFinancial = sector === "financial";
    if (selectedCategory !== "All") {
      const category = apiCategories.find((c) => c.name === selectedCategory);
      if (category) params.categoryId = category.id;
    }

    setLoading(true);
    directoryService
      .getListings(params)
      .then((listings) => {
        setEntries(listings.map(apiToEntry));
        setApiError(null);
      })
      .catch((err) => {
        console.error("Failed to load directory data:", err);
        setApiError("Failed to load data from server. Please refresh.");
      })
      .finally(() => setLoading(false));
  }, [debouncedSearch, sector, selectedCategory, apiCategories]);

  /* -- Category name → ID lookup for form submission -- */
  const categoryNameToId = useMemo(() => {
    const map = new Map<string, string>();
    apiCategories.forEach((c) => map.set(c.name, c.id));
    return map;
  }, [apiCategories]);

  /* -- Category lists for the entry form -- */
  const financialCats = useMemo(
    () =>
      apiCategories
        .filter((c) => c.isFinancial)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((c) => c.name),
    [apiCategories],
  );

  const nonFinancialCats = useMemo(
    () =>
      apiCategories
        .filter((c) => !c.isFinancial)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((c) => c.name),
    [apiCategories],
  );

  // Reset category filter when sector changes
  const handleSectorChange = (s: "all" | "financial" | "non-financial") => {
    setSector(s);
    setSelectedCategory("All");
  };

  const availableCategories = useMemo(() => {
    const sorted = [...apiCategories].sort((a, b) => a.sortOrder - b.sortOrder);
    if (sector === "financial")
      return sorted.filter((c) => c.isFinancial).map((c) => c.name);
    if (sector === "non-financial")
      return sorted.filter((c) => !c.isFinancial).map((c) => c.name);
    return sorted.map((c) => c.name);
  }, [apiCategories, sector]);

  const categoryCounts = useMemo(() => {
    const base =
      sector === "all" ? entries : entries.filter((e) => e.sector === sector);
    const counts: Record<string, number> = { All: base.length };
    base.forEach((e) =>
      e.categories.forEach((c) => {
        counts[c] = (counts[c] ?? 0) + 1;
      }),
    );
    return counts;
  }, [entries, sector]);

  const filtered = useMemo(() => {
    return entries;
  }, [entries]);

  const stats = buildStats(entries);

  const handleSave = useCallback(
    async (data: Omit<DirectoryEntry, "id">) => {
      const statusMap: Record<string, string> = {
        active: "published",
        inactive: "draft",
        pending: "pending",
      };
      const socialLinks: Record<string, string> = {};
      if (data.linkedinUrl) socialLinks.linkedin = data.linkedinUrl;
      if (data.twitterUrl) socialLinks.twitter = data.twitterUrl;
      const slug = data.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const dto = {
        name: data.name,
        slug,
        description: data.overview,
        isFinancial: data.sector === "financial",
        listingType: data.listingType || "institution",
        tagline: data.tagline || undefined,
        country: data.country,
        city: data.headquarters,
        address: data.address || undefined,
        yearFounded: data.yearEstablished,
        employeeRange: data.employeeRange || undefined,
        shariahCertified: data.shariahCertified,
        certifyingBody: data.certifyingBody || undefined,
        aumUsdMillions: data.aumUsdMillions,
        services: data.keyServices.length ? data.keyServices : undefined,
        tags: data.tags.length ? data.tags : undefined,
        websiteUrl: data.website,
        email: data.email || undefined,
        phone: data.phone || undefined,
        logoUrl: data.logoUrl || undefined,
        bannerUrl: data.bannerUrl || undefined,
        socialLinks: Object.keys(socialLinks).length ? socialLinks : undefined,
        status: statusMap[data.status] ?? data.status,
        categoryId: data.categories
          .map((name) => categoryNameToId.get(name))
          .find((id): id is string => Boolean(id)),
      };
      try {
        if (modalState?.type === "edit") {
          const updated = await directoryService.updateListing(
            modalState.entry.id,
            dto,
          );
          setEntries((p) =>
            p.map((e) =>
              e.id ===
              (modalState as { type: "edit"; entry: DirectoryEntry }).entry.id
                ? apiToEntry(updated)
                : e,
            ),
          );
        } else {
          const created = await directoryService.createListing(dto);
          setEntries((p) => [apiToEntry(created), ...p]);
        }
        setModalState(null);
      } catch (err) {
        console.error("Failed to save listing:", err);
        toast.error("Failed to save entry. Please try again.");
      }
    },
    [modalState, categoryNameToId],
  );

  const handleDelete = useCallback(async () => {
    if (modalState?.type !== "delete") return;
    const entryId = modalState.entry.id;
    try {
      await directoryService.deleteListing(entryId);
      setEntries((p) => p.filter((e) => e.id !== entryId));
      setModalState(null);
    } catch (err) {
      console.error("Failed to delete listing:", err);
      toast.error("Failed to delete entry. Please try again.");
    }
  }, [modalState]);

  const toggleStatus = useCallback(
    async (id: string) => {
      const entry = entries.find((e) => e.id === id);
      if (!entry) return;
      const newStatus = entry.status === "active" ? "inactive" : "active";
      try {
        await directoryService.updateListing(id, { status: newStatus });
        setEntries((p) =>
          p.map((e) => (e.id === id ? { ...e, status: newStatus } : e)),
        );
      } catch (err) {
        console.error("Failed to update status:", err);
      }
    },
    [entries],
  );

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* API error banner */}
      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {apiError}
        </div>
      )}

      {/* Header */}
      <motion.div
        variants={item}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Directory Management
          </h1>
          <p className="text-slate-500 text-sm">
            Manage Islamic finance institutions, service providers, scholars,
            and regulatory bodies
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setBulkUploadOpen(true)}
            className="rounded-xl gap-1.5 border-[#D52B1E] text-[#D52B1E] hover:bg-[#FFEFEF]"
          >
            <Upload className="h-3.5 w-3.5" /> Bulk Upload
          </Button>
          <Button
            size="sm"
            onClick={() => setModalState({ type: "create" })}
            className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-xl gap-1.5"
            disabled={loading}
          >
            <Plus className="h-3.5 w-3.5" /> Add Entry
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((s) => (
          <motion.div
            key={s.label}
            variants={item}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
          >
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${s.color}18` }}
            >
              <s.icon className="h-5 w-5" style={{ color: s.color }} />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-500 truncate">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sector + Search + Category filter */}
      <motion.div
        variants={item}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        {/* Sector tabs */}
        <div className="flex items-center gap-1 p-4 border-b border-gray-100 overflow-x-auto scrollbar-hide">
          {[
            { id: "all" as const, label: "All Sectors", count: entries.length },
            {
              id: "financial" as const,
              label: "Financial Services",
              count: entries.filter((e) => e.sector === "financial").length,
            },
            {
              id: "non-financial" as const,
              label: "Non-Financial",
              count: entries.filter((e) => e.sector === "non-financial").length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleSectorChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                sector === tab.id
                  ? "bg-[#D52B1E] text-white"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${sector === tab.id ? "bg-white/20 text-white" : "bg-gray-100 text-slate-500"}`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Category chips + search */}
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, country, category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm rounded-lg"
              />
            </div>
            <span className="text-xs text-slate-400 shrink-0">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-0.5">
            {["All", ...availableCategories].map((cat) => {
              const cfg = cat === "All" ? null : getCategoryConfig(cat);
              const isActive = selectedCategory === cat;
              const count = categoryCounts[cat] ?? 0;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${
                    isActive
                      ? "border-transparent text-white"
                      : "bg-white border-gray-200 text-slate-600 hover:bg-gray-50"
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: cfg?.color ?? "#D52B1E",
                          borderColor: cfg?.color ?? "#D52B1E",
                        }
                      : {}
                  }
                >
                  {cat}
                  <span
                    className={`text-xs rounded-full px-1 py-0.5 font-semibold ${isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Organization</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">
                  Categories
                </th>
                <th className="px-4 py-3 text-left hidden md:table-cell">
                  Location
                </th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">
                  Website
                </th>
                <th className="px-4 py-3 text-left hidden xl:table-cell">
                  Est.
                </th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gray-200" />
                        <div className="space-y-1.5">
                          <div className="h-3 bg-gray-200 rounded w-32" />
                          <div className="h-2.5 bg-gray-100 rounded w-20" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="h-5 bg-gray-100 rounded-full w-24" />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="h-3 bg-gray-100 rounded w-28" />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="h-3 bg-gray-100 rounded w-24" />
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <div className="h-3 bg-gray-100 rounded w-12" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-5 bg-gray-100 rounded-full w-16" />
                    </td>
                    <td className="px-4 py-3" />
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <FolderOpen className="h-10 w-10 opacity-40" />
                      <p className="text-sm">No entries match your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((e) => {
                  const primaryCat = e.categories[0];
                  const cfg = getCategoryConfig(primaryCat ?? "");
                  const initials = e.name
                    .split(" ")
                    .filter((w) => w.length > 2)
                    .slice(0, 2)
                    .map((w) => w[0].toUpperCase())
                    .join("");
                  const CatIcon = cfg.icon;
                  return (
                    <tr
                      key={e.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                            style={{
                              backgroundColor: cfg.bg,
                              color: cfg.color,
                            }}
                          >
                            {initials || <CatIcon className="h-4 w-4" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 truncate max-w-[180px]">
                              {e.name}
                            </p>
                            <p className="text-xs text-slate-400 capitalize">
                              {e.sector === "financial"
                                ? "Financial"
                                : "Non-Financial"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {e.categories.slice(0, 2).map((cat) => (
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
                          {e.categories.length > 2 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                              +{e.categories.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {e.headquarters}, {e.country}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">
                        <a
                          href={`https://${e.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-[#D52B1E] transition-colors"
                        >
                          <Globe className="h-3 w-3 shrink-0" />
                          {e.website}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs hidden xl:table-cell">
                        {e.yearEstablished ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleStatus(e.id)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize transition-colors ${STATUS_STYLES[e.status]}`}
                        >
                          {e.status}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setOpenMenu(openMenu === e.id ? null : e.id)
                            }
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {openMenu === e.id && (
                            <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-1 text-sm">
                              <button
                                onClick={() => {
                                  setModalState({ type: "view", entry: e });
                                  setOpenMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"
                              >
                                <Eye className="h-3.5 w-3.5 text-blue-500" />{" "}
                                View
                              </button>
                              <button
                                onClick={() => {
                                  setModalState({ type: "edit", entry: e });
                                  setOpenMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"
                              >
                                <Edit className="h-3.5 w-3.5 text-green-500" />{" "}
                                Edit
                              </button>
                              <hr className="my-1 border-gray-100" />
                              <button
                                onClick={() => {
                                  setModalState({ type: "delete", entry: e });
                                  setOpenMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer summary */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50/50 border-t border-gray-50 text-xs text-slate-400">
          <span>
            Showing{" "}
            <span className="font-semibold text-slate-600">
              {filtered.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-600">
              {entries.length}
            </span>{" "}
            entries
          </span>
          <span>
            <span className="text-green-600 font-semibold">
              {entries.filter((e) => e.status === "active").length} active
            </span>
            {" · "}
            <span className="text-amber-600 font-semibold">
              {entries.filter((e) => e.status === "pending").length} pending
            </span>
          </span>
        </div>
      </motion.div>

      {/* ── Category Management ─────────────────────────────────────────── */}
      <motion.div
        variants={item}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              Category Management
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Create and manage classification categories
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setCatModal({ type: "create" })}
            className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-xl gap-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Add Category
          </Button>
        </div>

        {(() => {
          if (loading) {
            return (
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <div
                    key={`skel-cat-${i}`}
                    className="animate-pulse h-10 bg-slate-100 rounded-xl"
                  />
                ))}
              </div>
            );
          }
          if (apiCategories.length === 0) {
            return (
              <p className="text-center text-slate-400 text-sm py-8">
                No categories found.
              </p>
            );
          }
          return (
            <div className="divide-y divide-gray-100">
              {(
                [
                  {
                    label: "Financial",
                    badge: "bg-blue-50 text-blue-700 border-blue-100",
                    dot: "bg-blue-500",
                    items: apiCategories
                      .filter((c) => c.isFinancial)
                      .sort((a, b) => a.sortOrder - b.sortOrder),
                  },
                  {
                    label: "Non-Financial",
                    badge: "bg-purple-50 text-purple-700 border-purple-100",
                    dot: "bg-purple-500",
                    items: apiCategories
                      .filter((c) => !c.isFinancial)
                      .sort((a, b) => a.sortOrder - b.sortOrder),
                  },
                ] as const
              ).map((group) => (
                <div key={group.label} className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${group.badge}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${group.dot}`}
                      />
                      {group.label}
                    </span>
                    <span className="text-xs text-slate-400">
                      {group.items.length}{" "}
                      {group.items.length === 1 ? "category" : "categories"}
                    </span>
                  </div>
                  {group.items.length === 0 ? (
                    <p className="text-xs text-slate-400 pl-1">
                      No {group.label.toLowerCase()} categories yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {group.items.map((cat) => (
                        <div
                          key={cat.id}
                          className="flex items-center justify-between gap-2 bg-slate-50 rounded-xl px-3 py-2"
                        >
                          <span className="text-sm text-slate-700 truncate">
                            {cat.name}
                          </span>
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => setCatModal({ type: "edit", cat })}
                              className="p-1 rounded hover:bg-slate-200 text-slate-500"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setCatModal({ type: "delete", cat })
                              }
                              className="p-1 rounded hover:bg-red-100 text-red-500"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })()}
      </motion.div>

      {/* Category Modals */}
      <AnimatePresence>
        {catModal?.type === "create" && (
          <CategoryFormModal
            onSave={async (dto) => {
              try {
                const created = await directoryService.createCategory(dto);
                setApiCategories((prev) => [...prev, created]);
                setCatModal(null);
              } catch {
                toast.error("Failed to create category.");
              }
            }}
            onClose={() => setCatModal(null)}
          />
        )}
        {catModal?.type === "edit" && (
          <CategoryFormModal
            initial={catModal.cat}
            onSave={async (dto) => {
              try {
                const updated = await directoryService.updateCategory(
                  catModal.cat.id,
                  dto,
                );
                setApiCategories((prev) =>
                  prev.map((c) => (c.id === updated.id ? updated : c)),
                );
                setCatModal(null);
              } catch {
                toast.error("Failed to update category.");
              }
            }}
            onClose={() => setCatModal(null)}
          />
        )}
        {catModal?.type === "delete" && (
          <DeleteCategoryConfirm
            name={catModal.cat.name}
            onConfirm={async () => {
              try {
                await directoryService.deleteCategory(catModal.cat.id);
                setApiCategories((prev) =>
                  prev.filter((c) => c.id !== catModal.cat.id),
                );
                setCatModal(null);
              } catch {
                toast.error("Failed to delete category.");
              }
            }}
            onClose={() => setCatModal(null)}
          />
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {modalState?.type === "create" && (
          <EntryFormModal
            initial={EMPTY_FORM}
            onSave={handleSave}
            onClose={() => setModalState(null)}
            financialCats={financialCats}
            nonFinancialCats={nonFinancialCats}
          />
        )}
        {modalState?.type === "edit" && (
          <EntryFormModal
            initial={modalState.entry}
            onSave={handleSave}
            onClose={() => setModalState(null)}
            financialCats={financialCats}
            nonFinancialCats={nonFinancialCats}
          />
        )}
        {modalState?.type === "view" && (
          <ViewModal
            entry={modalState.entry}
            onClose={() => setModalState(null)}
          />
        )}
        {modalState?.type === "delete" && (
          <DeleteConfirm
            name={modalState.entry.name}
            onConfirm={handleDelete}
            onClose={() => setModalState(null)}
          />
        )}
      </AnimatePresence>

      {/* Bulk Upload Dialog */}
      <BulkUploadDialog
        open={bulkUploadOpen}
        onClose={() => setBulkUploadOpen(false)}
        title="Directory Listings"
        templateEndpoint="/directory/listings/bulk-upload/template"
        uploadEndpoint="/directory/listings/bulk-upload"
        invalidateKeys={["admin", "directory"]}
        templateFilename="directory-listings-template.csv"
        onSuccess={() => {
          // Re-fetch entries after bulk upload
          directoryService
            .getListings()
            .then((data) => setEntries(data.map(apiToEntry)))
            .catch(() => null);
        }}
      />
    </motion.div>
  );
}
