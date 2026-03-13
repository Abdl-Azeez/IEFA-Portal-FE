import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  keyServices: string[];
  website: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
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

const FINANCIAL_CATEGORIES = [
  "Islamic Banks",
  "Takaful Providers",
  "Asset Management",
  "Capital Markets",
  "Islamic Fintech",
  "Shariah Advisory",
];
const NON_FINANCIAL_CATEGORIES = [
  "Research Institutions",
  "Legal Services",
  "Education & Training",
  "Scholars & Experts",
  "Regulatory Bodies",
];
const ALL_CATEGORIES = [...FINANCIAL_CATEGORIES, ...NON_FINANCIAL_CATEGORIES];

/* -- Sample data ----------------------------------------------------------- */
const INITIAL_ENTRIES: DirectoryEntry[] = [
  {
    id: "1",
    name: "Dubai Islamic Bank",
    sector: "financial",
    categories: ["Islamic Banks"],
    overview:
      "The world's first full-service Islamic bank, offering Shariah-compliant retail, corporate, and investment banking services.",
    yearEstablished: 1975,
    headquarters: "Dubai",
    country: "UAE",
    keyServices: [
      "Retail Banking",
      "Corporate Banking",
      "Investment Banking",
      "Sukuk",
    ],
    website: "dib.ae",
    email: "info@dib.ae",
    status: "active",
  },
  {
    id: "2",
    name: "Al Rajhi Bank",
    sector: "financial",
    categories: ["Islamic Banks"],
    overview:
      "One of the largest Islamic banks by assets. Deep retail and corporate focus across Saudi Arabia and internationally.",
    yearEstablished: 1957,
    headquarters: "Riyadh",
    country: "Saudi Arabia",
    keyServices: [
      "Retail Banking",
      "SME Finance",
      "Trade Finance",
      "Home Finance",
    ],
    website: "alrajhibank.com.sa",
    email: "contactus@alrajhi-bank.com",
    status: "active",
  },
  {
    id: "3",
    name: "Maybank Islamic",
    sector: "financial",
    categories: ["Islamic Banks"],
    overview:
      "The largest Islamic bank in Malaysia and ASEAN by assets, providing a comprehensive suite of Shariah-compliant products.",
    yearEstablished: 2008,
    headquarters: "Kuala Lumpur",
    country: "Malaysia",
    keyServices: [
      "Consumer Banking",
      "Commercial Banking",
      "Wealth Management",
    ],
    website: "maybank2u.com.my",
    email: "info@maybank.com",
    status: "active",
  },
  {
    id: "4",
    name: "Kuwait Finance House",
    sector: "financial",
    categories: ["Islamic Banks", "Capital Markets"],
    overview:
      "One of the world leading Islamic financial institutions with a presence across the Gulf, Europe, and Asia.",
    yearEstablished: 1977,
    headquarters: "Kuwait City",
    country: "Kuwait",
    keyServices: [
      "Corporate Finance",
      "Investment Banking",
      "Real Estate",
      "Sukuk Structuring",
    ],
    website: "kfh.com",
    email: "info@kfh.com",
    status: "active",
  },
  {
    id: "5",
    name: "Meezan Bank",
    sector: "financial",
    categories: ["Islamic Banks"],
    overview:
      "Pakistan's first and largest dedicated Islamic commercial bank committed to innovative Shariah-compliant banking solutions.",
    yearEstablished: 2002,
    headquarters: "Karachi",
    country: "Pakistan",
    keyServices: ["Consumer Banking", "Corporate Banking", "Trade Finance"],
    website: "meezanbank.com",
    email: "customercare@meezanbank.com",
    status: "active",
  },
  {
    id: "6",
    name: "Takaful Malaysia Bhd",
    sector: "financial",
    categories: ["Takaful Providers"],
    overview:
      "A pioneer and market leader in the Malaysian Takaful industry offering family and general Takaful products.",
    yearEstablished: 1984,
    headquarters: "Kuala Lumpur",
    country: "Malaysia",
    keyServices: [
      "Family Takaful",
      "General Takaful",
      "Group Takaful",
      "Medical Takaful",
    ],
    website: "takaful.com.my",
    email: "customerservice@takaful.com.my",
    status: "active",
  },
  {
    id: "7",
    name: "Salama Islamic Arab Insurance",
    sector: "financial",
    categories: ["Takaful Providers"],
    overview:
      "One of the largest Takaful operators worldwide, operating across the UAE, Egypt, Senegal, and beyond.",
    yearEstablished: 1979,
    headquarters: "Dubai",
    country: "UAE",
    keyServices: ["Life Takaful", "General Takaful", "Re-Takaful"],
    website: "salama.ae",
    email: "info@salama.ae",
    status: "active",
  },
  {
    id: "8",
    name: "Saturna Capital",
    sector: "financial",
    categories: ["Asset Management"],
    overview:
      "A U.S.-based investment management firm specializing in ethical, Shariah-compliant investment funds (Amana Funds).",
    yearEstablished: 1989,
    headquarters: "Bellingham, WA",
    country: "USA",
    keyServices: [
      "Equity Funds",
      "Income Funds",
      "ESG Investing",
      "Shariah Screening",
    ],
    website: "saturna.com",
    email: "info@saturna.com",
    status: "active",
  },
  {
    id: "9",
    name: "Amundi Islamic",
    sector: "financial",
    categories: ["Asset Management"],
    overview:
      "Part of the global Amundi Group, offering Shariah-compliant fund management for institutional investors.",
    yearEstablished: 2008,
    headquarters: "Paris",
    country: "France",
    keyServices: ["Sukuk Funds", "Equity Portfolios", "Money Market"],
    website: "amundi.com",
    status: "active",
  },
  {
    id: "10",
    name: "Nasdaq Dubai",
    sector: "financial",
    categories: ["Capital Markets"],
    overview:
      "The international financial exchange in the Middle East, providing a platform for Sukuk listings and equities.",
    yearEstablished: 2005,
    headquarters: "Dubai",
    country: "UAE",
    keyServices: ["Sukuk Listing", "Equity Market", "Derivatives"],
    website: "nasdaqdubai.com",
    email: "info@nasdaqdubai.com",
    status: "active",
  },
  {
    id: "11",
    name: "Wahed Invest",
    sector: "financial",
    categories: ["Islamic Fintech"],
    overview:
      "A New York-based halal robo-advisory platform offering automated, Shariah-compliant portfolio management globally.",
    yearEstablished: 2015,
    headquarters: "New York",
    country: "USA",
    keyServices: ["Robo-Advisory", "Portfolio Management", "Shariah Screening"],
    website: "wahedinvest.com",
    email: "support@wahedinvest.com",
    status: "active",
  },
  {
    id: "12",
    name: "Ethis Group",
    sector: "financial",
    categories: ["Islamic Fintech"],
    overview:
      "A Singapore-based Islamic crowdfunding platform specializing in property and social impact investments.",
    yearEstablished: 2014,
    headquarters: "Singapore",
    country: "Singapore",
    keyServices: ["Crowdfunding", "Real Estate Finance", "SME Financing"],
    website: "ethis.co",
    email: "hello@ethis.co",
    status: "active",
  },
  {
    id: "13",
    name: "Amanie Advisors",
    sector: "financial",
    categories: ["Shariah Advisory"],
    overview:
      "A globally respected Shariah advisory firm providing structuring, audit, and compliance services worldwide.",
    yearEstablished: 2008,
    headquarters: "Kuala Lumpur",
    country: "Malaysia",
    keyServices: ["Shariah Structuring", "Shariah Audit", "Compliance Review"],
    website: "amanieadvisors.com",
    email: "info@amanieadvisors.com",
    status: "active",
  },
  {
    id: "14",
    name: "Dar Al Shariah",
    sector: "financial",
    categories: ["Shariah Advisory"],
    overview:
      "A leading Islamic finance consultancy in the UAE providing Shariah advisory and product structuring services.",
    yearEstablished: 2009,
    headquarters: "Dubai",
    country: "UAE",
    keyServices: ["Shariah Advisory", "Fatwa Issuance", "Product Structuring"],
    website: "daralshariah.com",
    email: "info@daralshariah.com",
    status: "pending",
  },
  {
    id: "15",
    name: "Shariyah Review Bureau",
    sector: "financial",
    categories: ["Shariah Advisory"],
    overview:
      "A Bahrain-based Shariah advisory and audit firm delivering technology-driven compliance solutions.",
    yearEstablished: 2012,
    headquarters: "Manama",
    country: "Bahrain",
    keyServices: ["Shariah Audit", "Compliance SaaS", "Training"],
    website: "shariyah.com",
    email: "info@shariyah.com",
    status: "active",
  },
  {
    id: "16",
    name: "ISRA (International Shariah Research Academy)",
    sector: "non-financial",
    categories: ["Research Institutions"],
    overview:
      "Malaysia's premier institution for Shariah research in Islamic finance, with a global fatwa repository.",
    yearEstablished: 2008,
    headquarters: "Kuala Lumpur",
    country: "Malaysia",
    keyServices: [
      "Shariah Research",
      "Fatwa Repository",
      "Academic Publishing",
    ],
    website: "isra.my",
    email: "info@isra.my",
    status: "active",
  },
  {
    id: "17",
    name: "AAOIFI",
    sector: "non-financial",
    categories: ["Regulatory Bodies", "Research Institutions"],
    overview:
      "The leading international standard-setting body for accounting, auditing, and Shariah standards for Islamic FIs.",
    yearEstablished: 1991,
    headquarters: "Manama",
    country: "Bahrain",
    keyServices: ["Standard Setting", "Certifications", "Conferences"],
    website: "aaoifi.com",
    email: "secretariat@aaoifi.com",
    status: "active",
  },
  {
    id: "18",
    name: "IFSB (Islamic Financial Services Board)",
    sector: "non-financial",
    categories: ["Regulatory Bodies"],
    overview:
      "An international standard-setting organisation promoting the soundness and stability of the Islamic financial industry.",
    yearEstablished: 2002,
    headquarters: "Kuala Lumpur",
    country: "Malaysia",
    keyServices: ["Prudential Standards", "Regulatory Guidelines", "Research"],
    website: "ifsb.org",
    email: "ifsb_sec@ifsb.org",
    status: "active",
  },
  {
    id: "19",
    name: "INCEIF: The Global University of Islamic Finance",
    sector: "non-financial",
    categories: ["Education & Training", "Research Institutions"],
    overview:
      "Malaysia's leading graduate university for Islamic finance offering internationally recognized programs.",
    yearEstablished: 2006,
    headquarters: "Kuala Lumpur",
    country: "Malaysia",
    keyServices: [
      "Graduate Programs",
      "Professional Certifications",
      "Executive Training",
    ],
    website: "inceif.org",
    email: "info@inceif.org",
    status: "active",
  },
  {
    id: "20",
    name: "Ethica Institute of Islamic Finance",
    sector: "non-financial",
    categories: ["Education & Training"],
    overview:
      "The world's largest Islamic finance education provider, offering the CIFP certification and e-learning modules.",
    yearEstablished: 2001,
    headquarters: "Dubai",
    country: "UAE",
    keyServices: ["CIFP Certification", "E-Learning", "Corporate Training"],
    website: "ethicainstitute.com",
    email: "info@ethicainstitute.com",
    status: "inactive",
  },
  {
    id: "21",
    name: "Zaid Ibrahim & Co",
    sector: "non-financial",
    categories: ["Legal Services"],
    overview:
      "One of the largest law firms in Malaysia with a specialist Islamic finance practice covering Sukuk and Takaful.",
    yearEstablished: 1969,
    headquarters: "Kuala Lumpur",
    country: "Malaysia",
    keyServices: [
      "Sukuk Structuring",
      "Regulatory Advisory",
      "Dispute Resolution",
    ],
    website: "zaidibrahim.com",
    email: "enquiries@zaidibrahim.com",
    status: "active",
  },
  {
    id: "22",
    name: "Al Tamimi & Company",
    sector: "non-financial",
    categories: ["Legal Services"],
    overview:
      "The largest full-service law firm in the Middle East with a specialist Islamic finance team.",
    yearEstablished: 1989,
    headquarters: "Dubai",
    country: "UAE",
    keyServices: ["Islamic Finance Law", "Sukuk Issuance", "Project Finance"],
    website: "tamimi.com",
    email: "dubai@tamimi.com",
    status: "active",
  },
  {
    id: "23",
    name: "Dr. Daud Bakar",
    sector: "non-financial",
    categories: ["Scholars & Experts"],
    overview:
      "A renowned Shariah scholar serving on multiple international Shariah supervisory boards and prolific author.",
    yearEstablished: null,
    headquarters: "Kuala Lumpur",
    country: "Malaysia",
    keyServices: ["Shariah Advisory", "Training & Education", "Research"],
    website: "amanie.com",
    status: "active",
  },
  {
    id: "24",
    name: "Bank Negara Malaysia (BNM)",
    sector: "non-financial",
    categories: ["Regulatory Bodies"],
    overview:
      "Malaysia's central bank and primary regulator of Islamic finance institutions.",
    yearEstablished: 1959,
    headquarters: "Kuala Lumpur",
    country: "Malaysia",
    keyServices: [
      "Monetary Policy",
      "Financial Regulation",
      "Islamic Finance Development",
    ],
    website: "bnm.gov.my",
    email: "info@bnm.gov.my",
    status: "active",
  },
];

/* -- Empty form defaults --------------------------------------------------- */
const EMPTY_FORM: Omit<DirectoryEntry, "id"> = {
  name: "",
  sector: "financial",
  categories: [],
  overview: "",
  yearEstablished: null,
  headquarters: "",
  country: "",
  keyServices: [],
  website: "",
  email: "",
  phone: "",
  linkedinUrl: "",
  twitterUrl: "",
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
}: {
  initial: Omit<DirectoryEntry, "id"> | (DirectoryEntry & { id: string });
  onSave: (data: Omit<DirectoryEntry, "id">) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Omit<DirectoryEntry, "id">>({
    name: initial.name,
    sector: initial.sector,
    categories: [...initial.categories],
    overview: initial.overview,
    yearEstablished: initial.yearEstablished,
    headquarters: initial.headquarters,
    country: initial.country,
    keyServices: [...initial.keyServices],
    website: initial.website,
    email: initial.email ?? "",
    phone: initial.phone ?? "",
    linkedinUrl: initial.linkedinUrl ?? "",
    twitterUrl: initial.twitterUrl ?? "",
    status: initial.status,
  });
  const [serviceInput, setServiceInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cats =
    form.sector === "financial"
      ? FINANCIAL_CATEGORIES
      : NON_FINANCIAL_CATEGORIES;

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
          {/* Name */}
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
                const cfg = CATEGORY_CONFIG[cat];
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
              className="w-full bg-white text-gray-900 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D52B1E]/30 resize-none"
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
                Headquarters
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
  const cfg = CATEGORY_CONFIG[primaryCat] ?? {
    color: "#D52B1E",
    bg: "#FEF2F2",
    icon: Building2,
  };
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
                      backgroundColor: CATEGORY_CONFIG[cat]?.bg ?? "#F3F4F6",
                      color: CATEGORY_CONFIG[cat]?.color ?? "#6B7280",
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
export default function AdminDirectory() {
  const [entries, setEntries] = useState<DirectoryEntry[]>(INITIAL_ENTRIES);
  const [search, setSearch] = useState("");
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

  // Reset category filter when sector changes
  const handleSectorChange = (s: "all" | "financial" | "non-financial") => {
    setSector(s);
    setSelectedCategory("All");
  };

  const availableCategories = useMemo(() => {
    if (sector === "financial") return FINANCIAL_CATEGORIES;
    if (sector === "non-financial") return NON_FINANCIAL_CATEGORIES;
    return ALL_CATEGORIES;
  }, [sector]);

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
    return entries.filter((e) => {
      if (sector !== "all" && e.sector !== sector) return false;
      if (
        selectedCategory !== "All" &&
        !e.categories.includes(selectedCategory)
      )
        return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !e.name.toLowerCase().includes(q) &&
          !e.country.toLowerCase().includes(q) &&
          !e.categories.some((c) => c.toLowerCase().includes(q))
        )
          return false;
      }
      return true;
    });
  }, [entries, sector, selectedCategory, search]);

  const stats = buildStats(entries);

  function handleSave(data: Omit<DirectoryEntry, "id">) {
    if (modalState?.type === "edit") {
      setEntries((p) =>
        p.map((e) =>
          e.id === modalState.entry.id ? { ...data, id: e.id } : e,
        ),
      );
    } else {
      const newId = String(Date.now());
      setEntries((p) => [{ ...data, id: newId }, ...p]);
    }
    setModalState(null);
  }

  function handleDelete() {
    if (modalState?.type === "delete") {
      setEntries((p) => p.filter((e) => e.id !== modalState.entry.id));
      setModalState(null);
    }
  }

  function toggleStatus(id: string) {
    setEntries((p) =>
      p.map((e) =>
        e.id === id
          ? { ...e, status: e.status === "active" ? "inactive" : "active" }
          : e,
      ),
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
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
        <Button
          size="sm"
          onClick={() => setModalState({ type: "create" })}
          className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-xl gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" /> Add Entry
        </Button>
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
              const cfg = cat === "All" ? null : CATEGORY_CONFIG[cat];
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
              {filtered.length === 0 ? (
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
                  const cfg = CATEGORY_CONFIG[primaryCat] ?? {
                    color: "#D52B1E",
                    bg: "#FEF2F2",
                    icon: Building2,
                  };
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
                                backgroundColor:
                                  CATEGORY_CONFIG[cat]?.bg ?? "#F3F4F6",
                                color: CATEGORY_CONFIG[cat]?.color ?? "#6B7280",
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

      {/* Modals */}
      <AnimatePresence>
        {modalState?.type === "create" && (
          <EntryFormModal
            initial={EMPTY_FORM}
            onSave={handleSave}
            onClose={() => setModalState(null)}
          />
        )}
        {modalState?.type === "edit" && (
          <EntryFormModal
            initial={modalState.entry}
            onSave={handleSave}
            onClose={() => setModalState(null)}
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
    </motion.div>
  );
}
