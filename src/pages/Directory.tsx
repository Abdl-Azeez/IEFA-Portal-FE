import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  directoryService,
  type DirectoryListingAPI,
  type DirectoryCategoryAPI,
} from "@/lib/directoryService";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  website: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
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
const DYNAMIC_PALETTE: Array<{ color: string; bg: string; icon: React.ElementType }> = [
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
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffff;
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
    keyServices: a.services ?? a.tags ?? [],
    website: a.websiteUrl ?? "",
    email: a.email ?? undefined,
    phone: a.phone ?? undefined,
    linkedinUrl: a.socialLinks?.linkedin ?? undefined,
    twitterUrl: a.socialLinks?.twitter ?? undefined,
  };
}

// Kept as fallback so the UI renders without an API connection during development
const DIRECTORY_DATA: DirectoryEntry[] = [
  /* === FINANCIAL === */
  {
    id: "1",
    name: "Dubai Islamic Bank",
    sector: "financial",
    categories: ["Islamic Banks"],
    overview:
      "The world's first full-service Islamic bank, offering Shariah-compliant retail, corporate, and investment banking services across the UAE and globally.",
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
    linkedinUrl: "#",
    twitterUrl: "#",
  },
  {
    id: "2",
    name: "Al Rajhi Bank",
    sector: "financial",
    categories: ["Islamic Banks"],
    overview:
      "One of the largest Islamic banks by assets, headquartered in Riyadh with an extensive regional and international network focusing on Shariah-compliant banking.",
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
    linkedinUrl: "#",
  },
  {
    id: "3",
    name: "Maybank Islamic",
    sector: "financial",
    categories: ["Islamic Banks"],
    overview:
      "The largest Islamic bank in Malaysia and ASEAN by assets, providing a comprehensive suite of Shariah-compliant products for individuals and institutions.",
    yearEstablished: 2008,
    headquarters: "Kuala Lumpur",
    country: "Malaysia",
    keyServices: [
      "Consumer Banking",
      "Commercial Banking",
      "Wealth Management",
      "Investment Banking",
    ],
    website: "maybank2u.com.my",
    email: "info@maybank.com",
    linkedinUrl: "#",
    twitterUrl: "#",
  },
  {
    id: "4",
    name: "Kuwait Finance House",
    sector: "financial",
    categories: ["Islamic Banks", "Capital Markets"],
    overview:
      "One of the world's leading Islamic financial institutions with a presence across the Gulf, Europe, and Asia, specializing in corporate, investment, and retail banking.",
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
    linkedinUrl: "#",
  },
  {
    id: "5",
    name: "Meezan Bank",
    sector: "financial",
    categories: ["Islamic Banks"],
    overview:
      "Pakistan's first and largest dedicated Islamic commercial bank providing innovative Shariah-compliant banking solutions to individuals and businesses.",
    yearEstablished: 2002,
    headquarters: "Karachi",
    country: "Pakistan",
    keyServices: [
      "Consumer Banking",
      "Corporate Banking",
      "Trade Finance",
      "Home Finance",
    ],
    website: "meezanbank.com",
    email: "customercare@meezanbank.com",
    linkedinUrl: "#",
    twitterUrl: "#",
  },
  {
    id: "6",
    name: "Qatar Islamic Bank",
    sector: "financial",
    categories: ["Islamic Banks"],
    overview:
      "Qatar's leading Islamic bank providing innovative financial solutions with strict adherence to Shariah principles across retail, corporate, and private banking.",
    yearEstablished: 1982,
    headquarters: "Doha",
    country: "Qatar",
    keyServices: [
      "Retail Banking",
      "Corporate Banking",
      "Private Banking",
      "Treasury",
    ],
    website: "qib.com.qa",
    email: "info@qib.com.qa",
    linkedinUrl: "#",
  },
  {
    id: "7",
    name: "Takaful Malaysia Bhd",
    sector: "financial",
    categories: ["Takaful Providers"],
    overview:
      "A pioneer and market leader in the Malaysian Takaful industry, offering a comprehensive range of family and general Takaful products to individuals and corporates.",
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
    linkedinUrl: "#",
  },
  {
    id: "8",
    name: "Salama Islamic Arab Insurance",
    sector: "financial",
    categories: ["Takaful Providers"],
    overview:
      "One of the largest Takaful operators worldwide, with operations spanning the UAE, Egypt, Senegal, and beyond, offering life, general, and re-Takaful solutions.",
    yearEstablished: 1979,
    headquarters: "Dubai",
    country: "UAE",
    keyServices: [
      "Life Takaful",
      "General Takaful",
      "Re-Takaful",
      "Health Cover",
    ],
    website: "salama.ae",
    email: "info@salama.ae",
    linkedinUrl: "#",
  },
  {
    id: "9",
    name: "Syarikat Takaful Malaysia Keluarga",
    sector: "financial",
    categories: ["Takaful Providers"],
    overview:
      "Malaysia's largest family Takaful operator by assets, providing Shariah-compliant protection and savings solutions to over 4 million certificate holders.",
    yearEstablished: 1985,
    headquarters: "Kuala Lumpur",
    country: "Malaysia",
    keyServices: [
      "Family Takaful",
      "Investment-linked Plans",
      "Group Benefits",
      "Retirement Planning",
    ],
    website: "takafulmalaysia.com.my",
    email: "customercare@takafulmalaysia.com.my",
    linkedinUrl: "#",
  },
  {
    id: "10",
    name: "Saturna Capital",
    sector: "financial",
    categories: ["Asset Management"],
    overview:
      "A U.S.-based investment management firm specializing in ethical, Shariah-compliant investment funds including the widely recognized Amana Funds.",
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
    linkedinUrl: "#",
    twitterUrl: "#",
  },
  {
    id: "11",
    name: "Amundi Islamic",
    sector: "financial",
    categories: ["Asset Management"],
    overview:
      "Part of the global Amundi Group, offering Shariah-compliant fund management and portfolio solutions for institutional investors across Europe and the GCC.",
    yearEstablished: 2008,
    headquarters: "Paris",
    country: "France",
    keyServices: [
      "Sukuk Funds",
      "Equity Portfolios",
      "Money Market",
      "Multi-Asset Solutions",
    ],
    website: "amundi.com",
    linkedinUrl: "#",
  },
  {
    id: "12",
    name: "CIMB Islamic Asset Management",
    sector: "financial",
    categories: ["Asset Management", "Capital Markets"],
    overview:
      "A leading Islamic asset manager in ASEAN providing professionally managed Shariah-compliant investment products to retail, corporate, and institutional investors.",
    yearEstablished: 2005,
    headquarters: "Kuala Lumpur",
    country: "Malaysia",
    keyServices: [
      "Unit Trusts",
      "Discretionary Portfolios",
      "Pension Solutions",
      "Alternative Investments",
    ],
    website: "cimbislamic.com",
    email: "am@cimb.com",
    linkedinUrl: "#",
  },
  {
    id: "13",
    name: "Nasdaq Dubai",
    sector: "financial",
    categories: ["Capital Markets"],
    overview:
      "The international financial exchange in the Middle East, providing a transparent, regulated platform for Sukuk listings, equities, and derivatives.",
    yearEstablished: 2005,
    headquarters: "Dubai",
    country: "UAE",
    keyServices: [
      "Sukuk Listing",
      "Equity Market",
      "Derivatives",
      "Market Data Services",
    ],
    website: "nasdaqdubai.com",
    email: "info@nasdaqdubai.com",
    linkedinUrl: "#",
  },
  {
    id: "14",
    name: "IILM",
    sector: "financial",
    categories: ["Capital Markets"],
    overview:
      "An international institution issuing short-term Sukuk instruments to facilitate efficient cross-border liquidity management for Islamic financial institutions globally.",
    yearEstablished: 2010,
    headquarters: "Kuala Lumpur",
    country: "Malaysia",
    keyServices: [
      "Short-term Sukuk",
      "Liquidity Instruments",
      "Cross-border Settlement",
    ],
    website: "iilm.com",
    email: "info@iilm.com",
    linkedinUrl: "#",
  },
  {
    id: "15",
    name: "Wahed Invest",
    sector: "financial",
    categories: ["Islamic Fintech"],
    overview:
      "A New York-based halal robo-advisory platform offering automated, Shariah-compliant portfolio management to retail investors globally via a mobile-first experience.",
    yearEstablished: 2015,
    headquarters: "New York",
    country: "USA",
    keyServices: [
      "Robo-Advisory",
      "Portfolio Management",
      "Shariah Screening",
      "Retirement Planning",
    ],
    website: "wahedinvest.com",
    email: "support@wahedinvest.com",
    linkedinUrl: "#",
    twitterUrl: "#",
  },
  {
    id: "16",
    name: "Ethis Group",
    sector: "financial",
    categories: ["Islamic Fintech"],
    overview:
      "A Singapore-based Islamic crowdfunding and impact investment platform specializing in property and social impact opportunities across Southeast Asia.",
    yearEstablished: 2014,
    headquarters: "Singapore",
    country: "Singapore",
    keyServices: [
      "Crowdfunding",
      "Real Estate Finance",
      "SME Financing",
      "Impact Investing",
    ],
    website: "ethis.co",
    email: "hello@ethis.co",
    linkedinUrl: "#",
    twitterUrl: "#",
  },
  {
    id: "17",
    name: "Hijra (formerly Alami)",
    sector: "financial",
    categories: ["Islamic Fintech"],
    overview:
      "Indonesia's leading Shariah P2P lending platform, connecting underserved SMEs with investors seeking transparent, halal investment opportunities.",
    yearEstablished: 2018,
    headquarters: "Jakarta",
    country: "Indonesia",
    keyServices: [
      "P2P Lending",
      "SME Finance",
      "Supply Chain Finance",
      "Shariah Advisory",
    ],
    website: "hijra.id",
    email: "hello@hijra.id",
    linkedinUrl: "#",
  },
  {
    id: "18",
    name: "Amanie Advisors",
    sector: "financial",
    categories: ["Shariah Advisory"],
    overview:
      "A globally respected Shariah advisory firm providing structuring, audit, and compliance services to Islamic financial institutions and capital markets worldwide.",
    yearEstablished: 2008,
    headquarters: "Kuala Lumpur",
    country: "Malaysia",
    keyServices: [
      "Shariah Structuring",
      "Shariah Audit",
      "Compliance Review",
      "Training",
    ],
    website: "amanieadvisors.com",
    email: "info@amanieadvisors.com",
    linkedinUrl: "#",
  },
  {
    id: "19",
    name: "Dar Al Shariah",
    sector: "financial",
    categories: ["Shariah Advisory"],
    overview:
      "A leading Islamic finance consultancy in the UAE providing comprehensive Shariah advisory, fatwa issuance, and product structuring services to financial institutions.",
    yearEstablished: 2009,
    headquarters: "Dubai",
    country: "UAE",
    keyServices: [
      "Shariah Advisory",
      "Fatwa Issuance",
      "Product Structuring",
      "Training",
    ],
    website: "daralshariah.com",
    email: "info@daralshariah.com",
    linkedinUrl: "#",
  },
  {
    id: "20",
    name: "Shariyah Review Bureau",
    sector: "financial",
    categories: ["Shariah Advisory"],
    overview:
      "A Bahrain-based Shariah advisory and audit firm delivering technology-driven compliance tools and digital fatwa management solutions to institutions globally.",
    yearEstablished: 2012,
    headquarters: "Manama",
    country: "Bahrain",
    keyServices: [
      "Shariah Audit",
      "Compliance SaaS",
      "Digital Fatwa Management",
      "Training",
    ],
    website: "shariyah.com",
    email: "info@shariyah.com",
    linkedinUrl: "#",
    twitterUrl: "#",
  },
  /* === NON-FINANCIAL === */
  {
    id: "21",
    name: "ISRA (International Shariah Research Academy)",
    sector: "non-financial",
    categories: ["Research Institutions"],
    overview:
      "Malaysia's premier institution for Shariah research in Islamic finance, driving academic and policy research through publications, a global fatwa repository, and conferences.",
    yearEstablished: 2008,
    headquarters: "Kuala Lumpur",
    country: "Malaysia",
    keyServices: [
      "Shariah Research",
      "Fatwa Repository",
      "Academic Publishing",
      "Conferences",
    ],
    website: "isra.my",
    email: "info@isra.my",
    linkedinUrl: "#",
  },
  {
    id: "22",
    name: "IIFM (International Islamic Financial Market)",
    sector: "non-financial",
    categories: ["Research Institutions", "Regulatory Bodies"],
    overview:
      "An international standard-setting body for Islamic capital and money market products and contracts, facilitating standardization across jurisdictions.",
    yearEstablished: 2002,
    headquarters: "Manama",
    country: "Bahrain",
    keyServices: [
      "Standard Setting",
      "Product Templates",
      "Market Research",
      "Industry Reports",
    ],
    website: "iifm.net",
    email: "info@iifm.net",
    linkedinUrl: "#",
  },
  {
    id: "23",
    name: "Islamic Economics Institute, King Abdulaziz University",
    sector: "non-financial",
    categories: ["Research Institutions", "Education & Training"],
    overview:
      "A leading academic research institution advancing the study of Islamic economics, finance, and banking through scholarly publications and international conferences.",
    yearEstablished: 1976,
    headquarters: "Jeddah",
    country: "Saudi Arabia",
    keyServices: [
      "Academic Research",
      "Publishing",
      "Conferences",
      "Economic Policy Analysis",
    ],
    website: "kau.edu.sa/iei",
  },
  {
    id: "24",
    name: "Zaid Ibrahim & Co",
    sector: "non-financial",
    categories: ["Legal Services"],
    overview:
      "One of the largest law firms in Malaysia, with a specialist Islamic finance practice advising on Sukuk structures, Takaful regulation, and Islamic banking transactions.",
    yearEstablished: 1969,
    headquarters: "Kuala Lumpur",
    country: "Malaysia",
    keyServices: [
      "Sukuk Structuring",
      "Regulatory Advisory",
      "Islamic Banking Law",
      "Dispute Resolution",
    ],
    website: "zaidibrahim.com",
    email: "enquiries@zaidibrahim.com",
    linkedinUrl: "#",
  },
  {
    id: "25",
    name: "Al Tamimi & Company",
    sector: "non-financial",
    categories: ["Legal Services"],
    overview:
      "The largest full-service law firm in the Middle East, with a specialist Islamic finance team advising on complex cross-border Sukuk, project finance, and regulatory matters.",
    yearEstablished: 1989,
    headquarters: "Dubai",
    country: "UAE",
    keyServices: [
      "Islamic Finance Law",
      "Sukuk Issuance",
      "Project Finance",
      "Regulatory Compliance",
    ],
    website: "tamimi.com",
    email: "dubai@tamimi.com",
    linkedinUrl: "#",
  },
  {
    id: "26",
    name: "Norton Rose Fulbright (Islamic Finance)",
    sector: "non-financial",
    categories: ["Legal Services"],
    overview:
      "A global law firm with a dedicated Islamic finance practice advising on landmark Sukuk issuances, Islamic trade finance, and Takaful regulatory matters globally.",
    yearEstablished: 1794,
    headquarters: "London",
    country: "United Kingdom",
    keyServices: [
      "Sukuk Documentation",
      "Takaful Advisory",
      "Cross-border Finance",
      "Regulatory",
    ],
    website: "nortonrosefulbright.com",
    email: "contact@nortonrosefulbright.com",
    linkedinUrl: "#",
  },
  {
    id: "27",
    name: "INCEIF: The Global University of Islamic Finance",
    sector: "non-financial",
    categories: ["Education & Training", "Research Institutions"],
    overview:
      "Malaysia's leading graduate university for Islamic finance offering internationally recognized master's and doctoral programs alongside professional certifications.",
    yearEstablished: 2006,
    headquarters: "Kuala Lumpur",
    country: "Malaysia",
    keyServices: [
      "Graduate Programs",
      "Professional Certifications",
      "Executive Training",
      "Research",
    ],
    website: "inceif.org",
    email: "info@inceif.org",
    linkedinUrl: "#",
    twitterUrl: "#",
  },
  {
    id: "28",
    name: "Ethica Institute of Islamic Finance",
    sector: "non-financial",
    categories: ["Education & Training"],
    overview:
      "The world's largest Islamic finance education provider, offering the CIFP certification and hundreds of e-learning modules accessible from anywhere in the world.",
    yearEstablished: 2001,
    headquarters: "Dubai",
    country: "UAE",
    keyServices: [
      "CIFP Certification",
      "E-Learning",
      "Corporate Training",
      "Shariah Compliance Courses",
    ],
    website: "ethicainstitute.com",
    email: "info@ethicainstitute.com",
    linkedinUrl: "#",
    twitterUrl: "#",
  },
  {
    id: "29",
    name: "IBFIM (Islamic Banking & Finance Institute Malaysia)",
    sector: "non-financial",
    categories: ["Education & Training"],
    overview:
      "A dedicated Islamic finance training institute in Malaysia offering professional certifications, workshops, and tailored corporate training programs for practitioners.",
    yearEstablished: 2001,
    headquarters: "Kuala Lumpur",
    country: "Malaysia",
    keyServices: [
      "Professional Certifications",
      "Workshops",
      "Corporate Training",
      "Consultancy",
    ],
    website: "ibfim.com",
    email: "info@ibfim.com",
    linkedinUrl: "#",
  },
  {
    id: "30",
    name: "Dr. Muhammad Imran Usmani",
    sector: "non-financial",
    categories: ["Scholars & Experts"],
    overview:
      "One of the world's foremost Islamic finance scholars and Shariah supervisory board members, with deep expertise in contemporary fiqh al-muamalat and product structuring.",
    yearEstablished: null,
    headquarters: "Karachi",
    country: "Pakistan",
    keyServices: [
      "Shariah Board Membership",
      "Fatwa Issuance",
      "Product Structuring",
      "Keynote Speaking",
    ],
    website: "darululoomkarachi.edu.pk",
  },
  {
    id: "31",
    name: "Dr. Daud Bakar",
    sector: "non-financial",
    categories: ["Scholars & Experts"],
    overview:
      "A renowned Shariah scholar serving on multiple international Shariah supervisory boards, prolific author, and educator with expertise in Islamic finance jurisprudence.",
    yearEstablished: null,
    headquarters: "Kuala Lumpur",
    country: "Malaysia",
    keyServices: [
      "Shariah Advisory",
      "Training & Education",
      "Research",
      "Keynote Speaking",
    ],
    website: "amanie.com",
    linkedinUrl: "#",
  },
  {
    id: "32",
    name: "Sheikh Nizam Yaquby",
    sector: "non-financial",
    categories: ["Scholars & Experts"],
    overview:
      "One of the most sought-after Shariah scholars globally, serving on the boards of numerous leading Islamic banks, investment firms, and regulatory bodies across the GCC.",
    yearEstablished: null,
    headquarters: "Manama",
    country: "Bahrain",
    keyServices: [
      "Shariah Board Membership",
      "Fatwa Issuance",
      "Scholarly Advisory",
    ],
    website: "#",
  },
  {
    id: "33",
    name: "Bank Negara Malaysia (BNM)",
    sector: "non-financial",
    categories: ["Regulatory Bodies"],
    overview:
      "Malaysia's central bank and primary regulator of Islamic finance institutions, responsible for monetary policy, financial stability, and the development of the Islamic financial system.",
    yearEstablished: 1959,
    headquarters: "Kuala Lumpur",
    country: "Malaysia",
    keyServices: [
      "Monetary Policy",
      "Financial Regulation",
      "Islamic Finance Development",
      "Licensing",
    ],
    website: "bnm.gov.my",
    email: "info@bnm.gov.my",
    linkedinUrl: "#",
  },
  {
    id: "34",
    name: "AAOIFI",
    sector: "non-financial",
    categories: ["Regulatory Bodies", "Research Institutions"],
    overview:
      "The leading international standard-setting body for accounting, auditing, governance, ethics, and Shariah standards for Islamic financial institutions globally.",
    yearEstablished: 1991,
    headquarters: "Manama",
    country: "Bahrain",
    keyServices: [
      "Standard Setting",
      "Certifications",
      "Conferences",
      "Training",
    ],
    website: "aaoifi.com",
    email: "secretariat@aaoifi.com",
    linkedinUrl: "#",
    twitterUrl: "#",
  },
  {
    id: "35",
    name: "IFSB (Islamic Financial Services Board)",
    sector: "non-financial",
    categories: ["Regulatory Bodies"],
    overview:
      "An international standard-setting organisation that promotes the soundness and stability of the Islamic financial services industry through prudential regulatory standards.",
    yearEstablished: 2002,
    headquarters: "Kuala Lumpur",
    country: "Malaysia",
    keyServices: [
      "Prudential Standards",
      "Regulatory Guidelines",
      "Research",
      "Capacity Building",
    ],
    website: "ifsb.org",
    email: "ifsb_sec@ifsb.org",
    linkedinUrl: "#",
    twitterUrl: "#",
  },
  {
    id: "36",
    name: "Securities Commission Malaysia",
    sector: "non-financial",
    categories: ["Regulatory Bodies"],
    overview:
      "Malaysia's capital markets regulator and a leading authority on Islamic capital markets, overseeing Sukuk issuance, Islamic funds, and related market activities.",
    yearEstablished: 1993,
    headquarters: "Kuala Lumpur",
    country: "Malaysia",
    keyServices: [
      "Capital Market Regulation",
      "Sukuk Approval",
      "Fund Oversight",
      "Investor Protection",
    ],
    website: "sc.com.my",
    email: "cau@seccom.com.my",
    linkedinUrl: "#",
  },
  {
    id: "37",
    name: "Jaiz Bank PLC",
    sector: "financial",
    categories: ["Islamic Banks"],
    overview:
      "Nigeria's first full-fledged non-interest Islamic bank, providing Shariah-compliant retail, corporate and investment banking services across Nigeria.",
    yearEstablished: 2012,
    headquarters: "Abuja",
    country: "Nigeria",
    keyServices: [
      "Retail Banking",
      "Corporate Banking",
      "Trade Finance",
      "Shariah-Compliant Financing",
    ],
    website: "jaizbank.com",
    email: "info@jaizbank.com",
  },
];

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

function FilterPanel({
  countries,
  selectedCountries,
  onCountryChange,
  allServices,
  selectedServices,
  onServiceChange,
  yearRange,
  onYearRangeChange,
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
  onClear: () => void;
  onClose: () => void;
}>) {
  const [expanded, setExpanded] = useState({ country: true, services: true });
  const activeCount =
    selectedCountries.length +
    selectedServices.length +
    (yearRange[0] ? 1 : 0) +
    (yearRange[1] ? 1 : 0);

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
              </div>
            )}
          </div>
          {/* Year range */}
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">
              Year Established
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const [searchParams] = useSearchParams();

  /* -- API state -- */
  const [apiEntries, setApiEntries] = useState<DirectoryEntry[] | null>(null);
  const [apiCategories, setApiCategories] = useState<DirectoryCategoryAPI[]>([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    setApiLoading(true);
    Promise.all([
      directoryService.getListings(),
      directoryService.getCategories(),
    ])
      .then(([listings, categories]) => {
        setApiEntries(listings.map(apiListingToEntry));
        setApiCategories(categories);
        setApiError(null);
      })
      .catch((err) => {
        console.error("Failed to load directory listings:", err);
        setApiError("Failed to load directory. Showing cached data.");
      })
      .finally(() => setApiLoading(false));
  }, []);

  // Use API data when available, fall back to built-in data
  const allEntries = apiEntries ?? DIRECTORY_DATA;

  const [sector, setSector] = useState<'financial' | 'non-financial'>(() => {
    const s = searchParams.get('sector');
    return s === 'non-financial' ? 'non-financial' : 'financial';
  });
  const [geography, setGeography] = useState<'all' | 'local' | 'global'>('all');
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return searchParams.get('category') ?? 'All';
  });
  const [searchQuery, setSearchQuery] = useState("");
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

  // When navigating via searchParams change (e.g. from global search), sync state
  useEffect(() => {
    const s = searchParams.get('sector');
    const c = searchParams.get('category');
    if (s === 'non-financial') setSector('non-financial');
    else if (s === 'financial') setSector('financial');
    if (c) setSelectedCategory(decodeURIComponent(c));
    setCurrentPage(1);
  }, [searchParams]);

  // Reset filters when user manually switches sector tab
  useEffect(() => {
    if (!searchParams.get('category')) {
      setSelectedCategory('All');
    }
    setSelectedCountries([]);
    setSelectedServices([]);
    setYearRange([null, null]);
    setCurrentPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sector]);

  const categories = useMemo(
    () =>
      apiCategories
        .filter((c) => c.isFinancial === (sector === "financial"))
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((c) => c.name),
    [apiCategories, sector],
  );

  const sectorEntries = useMemo(
    () => allEntries.filter((e) => e.sector === sector),
    [allEntries, sector],
  );

  // Sector entries further filtered by geography — used for category counts
  const geoSectorEntries = useMemo(() => {
    if (geography === 'local') return sectorEntries.filter((e) => e.country === 'Nigeria');
    if (geography === 'global') return sectorEntries.filter((e) => e.country !== 'Nigeria');
    return sectorEntries;
  }, [sectorEntries, geography]);

  const allCountries = useMemo(
    () =>
      [...new Set(geoSectorEntries.map((e) => e.country))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [geoSectorEntries],
  );

  const allServices = useMemo(() => {
    const set = new Set<string>();
    geoSectorEntries.forEach((e) => e.keyServices.forEach((s) => set.add(s)));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [geoSectorEntries]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: geoSectorEntries.length };
    geoSectorEntries.forEach((e) =>
      e.categories.forEach((c) => {
        counts[c] = (counts[c] ?? 0) + 1;
      }),
    );
    return counts;
  }, [geoSectorEntries]);

  const filteredEntries = useMemo(() => {
    return sectorEntries.filter((e) => {
      if (geography === 'local' && e.country !== 'Nigeria') return false;
      if (geography === 'global' && e.country === 'Nigeria') return false;
      if (
        selectedCategory !== "All" &&
        !e.categories.includes(selectedCategory)
      )
        return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !e.name.toLowerCase().includes(q) &&
          !e.overview.toLowerCase().includes(q) &&
          !e.country.toLowerCase().includes(q) &&
          !e.keyServices.some((s) => s.toLowerCase().includes(q))
        )
          return false;
      }
      if (
        selectedCountries.length > 0 &&
        !selectedCountries.includes(e.country)
      )
        return false;
      if (
        selectedServices.length > 0 &&
        !e.keyServices.some((s) => selectedServices.includes(s))
      )
        return false;
      if (yearRange[0] && e.yearEstablished && e.yearEstablished < yearRange[0])
        return false;
      if (yearRange[1] && e.yearEstablished && e.yearEstablished > yearRange[1])
        return false;
      return true;
    });
  }, [
    sectorEntries,
    geography,
    selectedCategory,
    searchQuery,
    selectedCountries,
    selectedServices,
    yearRange,
  ]);

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
    setCurrentPage(1);
  };
  const activeFilterCount =
    selectedCountries.length +
    selectedServices.length +
    (yearRange[0] ? 1 : 0) +
    (yearRange[1] ? 1 : 0);

  const geoFilteredData = geography === 'local'
    ? allEntries.filter((e) => e.country === 'Nigeria')
    : geography === 'global'
    ? allEntries.filter((e) => e.country !== 'Nigeria')
    : allEntries;
  const finCount = geoFilteredData.filter(
    (e) => e.sector === "financial",
  ).length;
  const nonFinCount = geoFilteredData.filter(
    (e) => e.sector === "non-financial",
  ).length;
  const countryCount = new Set(geoFilteredData.map((e) => e.country)).size;

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

              {/* Geography filter */}
              <div className="flex items-center gap-2 pt-2">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-widest mr-1">View:</span>
                {([
                  { id: 'all' as const, label: '🌐 All', desc: 'All regions' },
                  { id: 'local' as const, label: '🇳🇬 Local', desc: 'Nigeria only' },
                  { id: 'global' as const, label: '🌍 Global', desc: 'International' },
                ] as const).map((g) => (
                  <button
                    key={g.id}
                    onClick={() => { setGeography(g.id); setCurrentPage(1); }}
                    title={g.desc}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                      geography === g.id
                        ? 'bg-[#D52B1E] text-white border-[#D52B1E] shadow-lg shadow-[#D52B1E]/25'
                        : 'bg-white/10 text-gray-300 border-white/20 hover:bg-white/20 hover:text-white'
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
        {(selectedCountries.length > 0 || selectedServices.length > 0) && (
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap gap-2 items-center"
          >
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
            onClear={clearFilters}
            onClose={() => setShowFilters(false)}
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
