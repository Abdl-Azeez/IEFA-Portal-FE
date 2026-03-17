import { useEffect, useState, useMemo } from 'react'
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
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { ResourcePreviewPage } from "@/components/resources/ResourcePreviewPage";
import { DownloadEmailModal } from "@/components/resources/DownloadEmailModal";
import { ResourceFilterBar } from "@/components/resources/ResourceFilterBar";
import { GlossarySection } from "@/components/resources/GlossarySection";
import type { ResourceItem, ResourceSection } from "@/types/resources";

/* ── Animation variants ─────────────────────────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.45 } },
};

/* ── Tab configuration ──────────────────────────────────────────────────── */
const TABS: {
  value: ResourceSection;
  label: string;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    value: "educational-guides",
    label: "Educational Guides",
    icon: BookOpen,
    description:
      "Introductory and explanatory materials on the fundamentals of Islamic finance.",
  },
  {
    value: "research-publications",
    label: "Research & Publications",
    icon: FileText,
    description:
      "In-depth academic and industry materials for research, policy analysis, and professional development.",
  },
  {
    value: "standards-governance",
    label: "Standards & Governance",
    icon: Shield,
    description:
      "Regulatory frameworks and Shariah standards guiding Islamic financial institutions.",
  },
  {
    value: "tools-practical",
    label: "Tools & Practical Resources",
    icon: Wrench,
    description:
      "Practical tools and reference materials for real-world financial planning.",
  },
  {
    value: "glossary",
    label: "Glossary",
    icon: BookA,
    description: "Definitions of key terms and concepts in Islamic finance.",
  },
];

/* ── Sample data ────────────────────────────────────────────────────────── */
const SAMPLE_RESOURCES: ResourceItem[] = [
  // ── Educational Guides ──
  {
    id: "eg-1",
    displayImage: "https://picsum.photos/seed/eg1/600/400",
    authorName: "IEFA Academy",
    authorType: "organization",
    title: "What is Islamic Finance? A Comprehensive Introduction",
    topic: "Fundamentals",
    category: "Introduction",
    briefIntro:
      "An accessible guide covering the core principles, history, and institutions that make up the Islamic finance ecosystem.",
    datePublished: "Mar 5, 2026",
    previewHtml:
      "<h2>Introduction to Islamic Finance</h2><p>Islamic finance refers to financial activities that adhere to Shariah (Islamic law). The main principles include the prohibition of interest (riba), excessive uncertainty (gharar), and gambling (maysir). Instead, Islamic finance promotes risk-sharing, asset-backed financing, and ethical investment.</p><h3>Core Principles</h3><ul><li><strong>Prohibition of Riba:</strong> Interest-based transactions are not permitted.</li><li><strong>Risk Sharing:</strong> Profits and losses are shared between parties.</li><li><strong>Asset-Backed:</strong> Transactions must be backed by tangible assets.</li><li><strong>Ethical Screening:</strong> Investments must comply with Shariah guidelines.</li></ul>",
    previewUrl: null,
    downloadUrl: null,
    viewCount: 1240,
    downloadCount: 856,
    section: "educational-guides",
    tags: ["fundamentals", "beginner"],
    createdAt: "2026-03-05",
  },
  {
    id: "eg-2",
    displayImage: "https://picsum.photos/seed/eg2/600/400",
    authorName: "Dr. Ahmed Hassan",
    authorType: "individual",
    title: "Islamic Banking Basics: How It Works",
    topic: "Banking",
    category: "Banking",
    briefIntro:
      "Understand the structure and operations of Islamic banks, including deposit accounts, financing products, and how they differ from conventional banking.",
    datePublished: "Feb 20, 2026",
    previewHtml:
      "<h2>Islamic Banking Operations</h2><p>Islamic banks operate under Shariah principles, offering products structured on profit-sharing, leasing, and cost-plus financing rather than interest-based lending.</p>",
    previewUrl: null,
    downloadUrl: null,
    viewCount: 980,
    downloadCount: 620,
    section: "educational-guides",
    tags: ["banking", "beginner"],
    createdAt: "2026-02-20",
  },
  {
    id: "eg-3",
    displayImage: "https://picsum.photos/seed/eg3/600/400",
    authorName: "Halal Wealth Advisory",
    authorType: "organization",
    title: "Halal Investing: A Step-by-Step Guide",
    topic: "Investing",
    category: "Investment",
    briefIntro:
      "Learn how to identify, evaluate, and invest in Shariah-compliant assets including equities, sukuk, and real estate funds.",
    datePublished: "Feb 10, 2026",
    previewHtml:
      "<h2>Getting Started with Halal Investing</h2><p>Halal investing requires screening investments against both financial and Shariah criteria. This guide walks you through the process of building a compliant portfolio.</p>",
    previewUrl: null,
    downloadUrl: null,
    viewCount: 1100,
    downloadCount: 730,
    section: "educational-guides",
    tags: ["investing", "halal"],
    createdAt: "2026-02-10",
  },
  {
    id: "eg-4",
    displayImage: null,
    authorName: "IEFA Research",
    authorType: "organization",
    title: "Understanding Sukuk: Islamic Bonds Explained",
    topic: "Sukuk",
    category: "Fixed Income",
    briefIntro:
      "A comprehensive guide to sukuk structures, types, and their role in global capital markets.",
    datePublished: "Jan 28, 2026",
    previewHtml: null,
    previewUrl: null,
    downloadUrl: null,
    viewCount: 750,
    downloadCount: 410,
    section: "educational-guides",
    tags: ["sukuk", "bonds"],
    createdAt: "2026-01-28",
  },

  // ── Research & Publications ──
  {
    id: "rp-1",
    displayImage: "https://picsum.photos/seed/rp1/600/400",
    authorName: "IEFA Research Institute",
    authorType: "organization",
    title: "Global Islamic Finance Industry Report 2026",
    topic: "Industry Report",
    category: "Industry Reports",
    briefIntro:
      "An in-depth analysis of the global Islamic finance industry, covering market size, growth trends, key players, and future outlook.",
    datePublished: "Mar 1, 2026",
    previewHtml:
      "<h2>Executive Summary</h2><p>The global Islamic finance industry continues its growth trajectory, with total assets exceeding $4 trillion in 2025. This report examines key developments across banking, capital markets, takaful, and fintech sectors.</p>",
    previewUrl: null,
    downloadUrl: null,
    viewCount: 2100,
    downloadCount: 1450,
    section: "research-publications",
    tags: ["industry report", "global"],
    createdAt: "2026-03-01",
  },
  {
    id: "rp-2",
    displayImage: "https://picsum.photos/seed/rp2/600/400",
    authorName: "Prof. Fatima Al-Rashid",
    authorType: "individual",
    title: "Fintech and Islamic Finance: Convergence and Opportunities",
    topic: "White Paper",
    category: "White Papers",
    briefIntro:
      "This white paper explores how fintech innovations are reshaping Islamic financial services, from digital banking to blockchain-based sukuk.",
    datePublished: "Feb 15, 2026",
    previewHtml:
      "<h2>Abstract</h2><p>The intersection of financial technology and Islamic finance presents transformative opportunities for the industry. This paper examines key areas of convergence including digital banking platforms, robo-advisory services for halal investing, and distributed ledger technology for sukuk issuance.</p>",
    previewUrl: null,
    downloadUrl: null,
    viewCount: 1560,
    downloadCount: 890,
    section: "research-publications",
    tags: ["fintech", "innovation"],
    createdAt: "2026-02-15",
  },
  {
    id: "rp-3",
    displayImage: null,
    authorName: "Cambridge Islamic Finance Institute",
    authorType: "organization",
    title: "Case Study: Al Rajhi Bank Digital Transformation",
    topic: "Case Study",
    category: "Case Studies",
    briefIntro:
      "A detailed case study examining how Al Rajhi Bank successfully implemented its digital transformation strategy while maintaining Shariah compliance.",
    datePublished: "Jan 30, 2026",
    previewHtml: null,
    previewUrl: null,
    downloadUrl: null,
    viewCount: 870,
    downloadCount: 560,
    section: "research-publications",
    tags: ["case study", "digital"],
    createdAt: "2026-01-30",
  },
  {
    id: "rp-4",
    displayImage: "https://picsum.photos/seed/rp4/600/400",
    authorName: "Dr. Mohamed Ibrahim",
    authorType: "individual",
    title:
      "Comparative Analysis of Islamic vs Conventional Banking Performance",
    topic: "Academic Journal",
    category: "Academic Journals",
    briefIntro:
      "A peer-reviewed academic study comparing the financial performance, stability, and efficiency of Islamic and conventional banks across 15 countries.",
    datePublished: "Jan 10, 2026",
    previewHtml:
      "<h2>Abstract</h2><p>This study employs panel data analysis to compare the performance metrics of 120 Islamic banks and 280 conventional banks across 15 countries over the period 2015-2025.</p>",
    previewUrl: null,
    downloadUrl: null,
    viewCount: 1200,
    downloadCount: 780,
    section: "research-publications",
    tags: ["academic", "comparative"],
    createdAt: "2026-01-10",
  },

  // ── Standards & Governance ──
  {
    id: "sg-1",
    displayImage: "https://picsum.photos/seed/sg1/600/400",
    authorName: "AAOIFI",
    authorType: "organization",
    title: "AAOIFI Shariah Standards 2026 Edition",
    topic: "Shariah Standards",
    category: "Shariah Standards",
    briefIntro:
      "The latest comprehensive collection of Shariah standards issued by AAOIFI, covering all major Islamic financial products and transactions.",
    datePublished: "Mar 8, 2026",
    previewHtml:
      "<h2>Overview</h2><p>The AAOIFI Shariah Standards provide detailed guidelines for Islamic financial institutions on the Shariah-compliant structuring of financial products including murabaha, musharakah, ijarah, and sukuk.</p>",
    previewUrl: null,
    downloadUrl: null,
    viewCount: 3200,
    downloadCount: 2100,
    section: "standards-governance",
    tags: ["AAOIFI", "shariah"],
    createdAt: "2026-03-08",
  },
  {
    id: "sg-2",
    displayImage: "https://picsum.photos/seed/sg2/600/400",
    authorName: "IFSB",
    authorType: "organization",
    title: "Regulatory Framework for Islamic Digital Banks",
    topic: "Regulatory Framework",
    category: "Regulatory Frameworks",
    briefIntro:
      "Guidelines and regulatory framework for the licensing and operation of Islamic digital banks, issued by the Islamic Financial Services Board.",
    datePublished: "Feb 25, 2026",
    previewHtml:
      "<h2>Scope</h2><p>This document outlines the regulatory requirements and prudential standards applicable to Islamic digital banking operations, including capital adequacy, risk management, and Shariah governance.</p>",
    previewUrl: null,
    downloadUrl: null,
    viewCount: 1800,
    downloadCount: 1050,
    section: "standards-governance",
    tags: ["regulatory", "digital"],
    createdAt: "2026-02-25",
  },
  {
    id: "sg-3",
    displayImage: null,
    authorName: "Malaysian Central Bank",
    authorType: "organization",
    title: "Policy Document on Shariah Governance 2026",
    topic: "Policy Document",
    category: "Policy Documents",
    briefIntro:
      "Updated policy document outlining the Shariah governance framework for Islamic financial institutions operating in Malaysia.",
    datePublished: "Feb 5, 2026",
    previewHtml: null,
    previewUrl: null,
    downloadUrl: null,
    viewCount: 950,
    downloadCount: 620,
    section: "standards-governance",
    tags: ["governance", "Malaysia"],
    createdAt: "2026-02-05",
  },

  // ── Tools & Practical Resources ──
  {
    id: "tp-1",
    displayImage: "https://picsum.photos/seed/tp1/600/400",
    authorName: "IEFA Tools Team",
    authorType: "organization",
    title: "Islamic Financial Planning Template Kit",
    topic: "Template",
    category: "Financial Planning Templates",
    briefIntro:
      "A comprehensive set of financial planning templates designed for Shariah-compliant personal and business financial management.",
    datePublished: "Mar 10, 2026",
    previewHtml:
      "<h2>What's Included</h2><ul><li>Personal budget template with zakat calculations</li><li>Investment portfolio tracker (halal screening checklist)</li><li>Retirement planning worksheet</li><li>Business cash flow template</li></ul>",
    previewUrl: null,
    downloadUrl: null,
    viewCount: 1650,
    downloadCount: 1200,
    section: "tools-practical",
    tags: ["template", "planning"],
    createdAt: "2026-03-10",
  },
  {
    id: "tp-2",
    displayImage: "https://picsum.photos/seed/tp2/600/400",
    authorName: "Shariah Contracts Hub",
    authorType: "organization",
    title: "Islamic Finance Contract Templates Collection",
    topic: "Template",
    category: "Contract Templates",
    briefIntro:
      "Ready-to-use Shariah-compliant contract templates for murabaha, ijarah, musharakah, and other Islamic finance transactions.",
    datePublished: "Mar 3, 2026",
    previewHtml:
      "<h2>Contract Templates Included</h2><ul><li>Murabaha Sale Agreement</li><li>Ijarah (Lease) Agreement</li><li>Musharakah Partnership Agreement</li><li>Mudarabah Investment Agreement</li><li>Istisna Manufacturing Contract</li></ul>",
    previewUrl: null,
    downloadUrl: null,
    viewCount: 1300,
    downloadCount: 980,
    section: "tools-practical",
    tags: ["contracts", "templates"],
    createdAt: "2026-03-03",
  },
  {
    id: "tp-3",
    displayImage: null,
    authorName: "Dr. Sarah Khan",
    authorType: "individual",
    title: "Islamic Finance Due Diligence Worksheet",
    topic: "Worksheet",
    category: "Downloadable Guides",
    briefIntro:
      "A practical worksheet for conducting Shariah compliance due diligence on investment opportunities and financial products.",
    datePublished: "Feb 18, 2026",
    previewHtml: null,
    previewUrl: null,
    downloadUrl: null,
    viewCount: 680,
    downloadCount: 450,
    section: "tools-practical",
    tags: ["worksheet", "due diligence"],
    createdAt: "2026-02-18",
  },
  {
    id: "tp-4",
    displayImage: "https://picsum.photos/seed/tp4/600/400",
    authorName: "IEFA Finance Academy",
    authorType: "organization",
    title: "Personal Zakat Calculation Worksheet",
    topic: "Worksheet",
    category: "Downloadable Guides",
    briefIntro:
      "A step-by-step worksheet to help individuals accurately calculate their annual Zakat obligation across different asset categories.",
    datePublished: "Mar 12, 2026",
    previewHtml:
      "<h2>Overview</h2><p>This worksheet guides you through Zakat on cash, gold, silver, shares, business inventory, and receivables — with worked examples for each category.</p>",
    previewUrl: null,
    downloadUrl: null,
    viewCount: 920,
    downloadCount: 740,
    section: "tools-practical",
    tags: ["zakat", "worksheet"],
    createdAt: "2026-03-12",
  },
  {
    id: "tp-5",
    displayImage: "https://picsum.photos/seed/tp5/600/400",
    authorName: "IF Compliance Hub",
    authorType: "organization",
    title: "Halal Investment Portfolio Tracker",
    topic: "Template",
    category: "Financial Planning Templates",
    briefIntro:
      "Track your Shariah-compliant investment portfolio with this template featuring automatic purification calculations and annual Zakat estimations.",
    datePublished: "Mar 1, 2026",
    previewHtml:
      "<h2>Features</h2><ul><li>Halal stock allocation tracker</li><li>Sukuk and Islamic fund holdings</li><li>Purification income calculator</li><li>Annual Zakat on investments estimator</li></ul>",
    previewUrl: null,
    downloadUrl: null,
    viewCount: 1150,
    downloadCount: 890,
    section: "tools-practical",
    tags: ["portfolio", "template", "halal"],
    createdAt: "2026-03-01",
  },
  {
    id: "tp-6",
    displayImage: "https://picsum.photos/seed/tp6/600/400",
    authorName: "Dr. Aminah Yusuf",
    authorType: "individual",
    title: "Islamic Home Financing Guide & Checklist",
    topic: "Guide",
    category: "Downloadable Guides",
    briefIntro:
      "A practical guide comparing Murabaha, Diminishing Musharakah, and Ijarah home financing structures with a Shariah-compliant mortgage selection checklist.",
    datePublished: "Feb 28, 2026",
    previewHtml:
      "<h2>Introduction</h2><p>This guide walks you through the primary Islamic home financing structures available through Islamic banks, helping you make an informed, Shariah-compliant choice for your home purchase journey.</p>",
    previewUrl: null,
    downloadUrl: null,
    viewCount: 780,
    downloadCount: 560,
    section: "tools-practical",
    tags: ["home financing", "guide"],
    createdAt: "2026-02-28",
  },
  {
    id: "tp-7",
    displayImage: "https://picsum.photos/seed/tp7/600/400",
    authorName: "IEFA Digital Tools",
    authorType: "organization",
    title: "Halal Crypto Screener",
    topic: "Screener Tool",
    category: "Digital Tools",
    briefIntro:
      "A live screener tool that filters cryptocurrencies based on Shariah compliance criteria — excluding coins linked to gambling, interest-bearing protocols, and prohibited business models. Identify halal crypto assets with confidence.",
    datePublished: "Apr 1, 2026",
    previewHtml:
      "<h2>Halal Crypto Screener</h2><p>This interactive tool allows you to screen cryptocurrencies against a Shariah compliance framework developed in consultation with Islamic finance scholars.</p><h3>Screening Criteria</h3><ul><li><strong>Business Activity:</strong> Excludes tokens linked to gambling, alcohol, adult content, or interest-based protocols.</li><li><strong>Protocol Type:</strong> Evaluates consensus mechanisms and yield structures for riba concerns.</li><li><strong>Shariah Board Certification:</strong> Highlights coins with formal Shariah board endorsements.</li><li><strong>Purification Guidance:</strong> Provides purification ratios where applicable.</li></ul><p>Use the screener to build and validate a halal crypto portfolio aligned with your ethical and religious values.</p>",
    previewUrl: null,
    downloadUrl: null,
    viewCount: 0,
    downloadCount: 0,
    section: "tools-practical",
    tags: ["crypto", "halal", "screener", "digital tools"],
    createdAt: "2026-04-01",
  },
];

/* ── Helper: get categories for a given section ─────────────────────────── */
function getCategoriesForSection(section: ResourceSection): string[] {
  const cats = new Set<string>();
  for (const r of SAMPLE_RESOURCES) {
    if (r.section === section && r.category) cats.add(r.category);
  }
  return Array.from(cats).sort((a, b) => a.localeCompare(b));
}

const PAGE_SIZE = 9;

/* ── Pre-compute resource counts per section ────────────────────────────── */
const SECTION_COUNTS: Record<ResourceSection, number> = {
  "educational-guides": 0,
  "research-publications": 0,
  "standards-governance": 0,
  "tools-practical": 0,
  glossary: 0,
};
for (const r of SAMPLE_RESOURCES) {
  SECTION_COUNTS[r.section] = (SECTION_COUNTS[r.section] ?? 0) + 1;
}

/* ── Main Page Component ────────────────────────────────────────────────── */
export default function Resources() {
  const [activeTab, setActiveTab] =
    useState<ResourceSection>("educational-guides");
  const [previewResource, setPreviewResource] = useState<ResourceItem | null>(
    null,
  );
  const [downloadResource, setDownloadResource] = useState<ResourceItem | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "views" | "downloads">("date");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [searchParams] = useSearchParams();

  // Deep-link: jump to tab from ?tab= query param
  useEffect(() => {
    const tab = searchParams.get("tab") as ResourceSection | null;
    const validTabs: ResourceSection[] = [
      "educational-guides",
      "research-publications",
      "standards-governance",
      "tools-practical",
      "glossary",
    ];
    if (tab && validTabs.includes(tab)) {
      setActiveTab(tab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Reset filters and visible count when switching tabs
  useEffect(() => {
    setSearch("");
    setSelectedCategory("");
    setSortBy("date");
    setVisibleCount(PAGE_SIZE);
  }, [activeTab]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, sortBy, selectedCategory]);

  // Filter & sort resources for current tab
  const filteredResources = useMemo(() => {
    let items = SAMPLE_RESOURCES.filter((r) => r.section === activeTab);

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.authorName.toLowerCase().includes(q) ||
          r.briefIntro.toLowerCase().includes(q) ||
          r.topic.toLowerCase().includes(q),
      );
    }

    if (selectedCategory) {
      items = items.filter((r) => r.category === selectedCategory);
    }

    items = [...items].sort((a, b) => {
      if (sortBy === "views") return b.viewCount - a.viewCount;
      if (sortBy === "downloads") return b.downloadCount - a.downloadCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return items;
  }, [activeTab, search, sortBy, selectedCategory]);

  // Show preview page (modal is self-contained inside ResourcePreviewPage)
  if (previewResource) {
    return (
      <ResourcePreviewPage
        resource={previewResource}
        onBack={() => setPreviewResource(null)}
      />
    );
  }

  return (
    <>
      <motion.div
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* ── Hero Banner ─────────────────────────────────────────────── */}
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
                  Curated guides, research publications, articles, and practical
                  tools designed to help you learn about Islamic financial
                  principles, industry developments, and Shariah-compliant
                  financial practices.
                </p>
                <p className="text-gray-500 text-sm max-w-2xl">
                  Supporting professionals, researchers, students and anyone
                  interested in Islamic finance.
                </p>
              </div>

              {/* Stats */}
              <div className="flex md:flex-col gap-3 shrink-0">
                <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-center">
                  <p className="text-2xl font-bold text-white">5</p>
                  <p className="text-xs text-gray-500">Sections</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-center">
                  <p className="text-2xl font-bold text-[#D52B1E]">20+</p>
                  <p className="text-xs text-gray-500">Glossary Terms</p>
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute right-8 bottom-4 opacity-5 text-white select-none hidden md:block">
              <Library className="h-52 w-52" />
            </div>
          </div>
        </motion.div>

        {/* ── Tab Navigation ──────────────────────────────────────────── */}
        <motion.div variants={itemVariants}>
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as ResourceSection)}
          >
            {/* Custom arrow-shaped tab navigation */}
            <TabsList className="flex flex-nowrap overflow-x-auto scrollbar-hide w-full justify-start bg-transparent border-0 rounded-none p-0 h-auto shadow-none">
              {TABS.map((tab, idx) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="group relative flex items-center gap-1.5 bg-gray-100 data-[state=active]:bg-[#D52B1E] text-gray-600 data-[state=active]:text-white pl-6 pr-10 py-3 text-sm font-medium rounded-none shadow-none transition-colors duration-200 border-0 shrink-0 whitespace-nowrap"
                  style={{
                    marginLeft: idx === 0 ? 0 : -18,
                    clipPath:
                      idx === 0
                        ? "polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 100%)"
                        : "polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 100%, 18px 50%)",
                    zIndex: TABS.length - idx,
                  }}
                >
                  <span className="flex items-center gap-1.5">
                    <tab.icon className="h-4 w-4 shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {tab.value !== "glossary" && (
                      <span className="hidden sm:inline shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-black/15 group-data-[state=active]:bg-white/20 tabular-nums">
                        {SECTION_COUNTS[tab.value]}
                      </span>
                    )}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ── Tab Content ─────────────────────────────────────────── */}
            {TABS.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="mt-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab.value}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Section Description */}
                    <div className="bg-gradient-to-r from-[#D52B1E]/5 via-[#D52B1E]/3 to-transparent rounded-xl p-4 mb-6 border-l-4 border-[#D52B1E]">
                      <p className="text-sm text-[#737692]">
                        {tab.description}
                      </p>
                    </div>

                    {tab.value === "glossary" ? (
                      <GlossarySection />
                    ) : (
                      <>
                        {/* Coming Soon Tools (tools-practical tab only) */}
                        {tab.value === "tools-practical" && (
                          <div className="mb-8 space-y-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-gray-800">
                                Calculators &amp; Screeners
                              </span>
                              <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full font-semibold border border-amber-200">
                                Coming Soon
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* Zakat Calculator */}
                              <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-white/70 p-6 flex flex-col items-center text-center gap-3 hover:border-[#D52B1E]/40 transition-colors">
                                <div className="h-14 w-14 rounded-2xl bg-[#D52B1E]/10 flex items-center justify-center">
                                  <Calculator className="h-7 w-7 text-[#D52B1E]" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-800 mb-1">
                                    Zakat Calculator
                                  </h3>
                                  <p className="text-xs text-[#737692] leading-relaxed">
                                    Calculate your Zakat obligation accurately
                                    based on asset categories including gold,
                                    silver, cash, investments, and business
                                    assets.
                                  </p>
                                </div>
                                <button
                                  disabled
                                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed border border-gray-200"
                                >
                                  <Lock className="h-3.5 w-3.5" /> Coming Soon
                                </button>
                              </div>
                              {/* Halal Stock Screener */}
                              <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-white/70 p-6 flex flex-col items-center text-center gap-3 hover:border-[#D52B1E]/40 transition-colors">
                                <div className="h-14 w-14 rounded-2xl bg-[#D52B1E]/10 flex items-center justify-center">
                                  <TrendingUp className="h-7 w-7 text-[#D52B1E]" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-800 mb-1">
                                    Halal Stock Screener
                                  </h3>
                                  <p className="text-xs text-[#737692] leading-relaxed">
                                    Screen stocks for Shariah compliance based
                                    on business activity, financial ratios, and
                                    purification requirements per leading
                                    Shariah standards.
                                  </p>
                                </div>
                                <button
                                  disabled
                                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed border border-gray-200"
                                >
                                  <Lock className="h-3.5 w-3.5" /> Coming Soon
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                              <span className="text-sm font-semibold text-gray-800">
                                Templates &amp; Downloadable Guides
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Filter Bar */}
                        <ResourceFilterBar
                          search={search}
                          onSearchChange={setSearch}
                          sortBy={sortBy}
                          onSortChange={setSortBy}
                          selectedCategory={selectedCategory}
                          onCategoryChange={setSelectedCategory}
                          categories={getCategoriesForSection(tab.value)}
                        />

                        {/* Resource Cards Grid */}
                        <div className="mt-6">
                          {filteredResources.length === 0 ? (
                            <div className="py-16 text-center">
                              <tab.icon className="h-12 w-12 mx-auto mb-3 text-gray-200" />
                              <p className="text-[#737692] text-sm">
                                No resources found.
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Try adjusting your filters or search terms.
                              </p>
                            </div>
                          ) : (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filteredResources
                                  .slice(0, visibleCount)
                                  .map((resource, idx) => (
                                    <ResourceCard
                                      key={resource.id}
                                      resource={resource}
                                      index={idx}
                                      onPreview={setPreviewResource}
                                      onDownload={setDownloadResource}
                                    />
                                  ))}
                              </div>
                              {visibleCount < filteredResources.length && (
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
                                    {Math.min(
                                      visibleCount,
                                      filteredResources.length,
                                    )}{" "}
                                    of {filteredResources.length}
                                  </p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </motion.div>

      {/* ── Download Email Modal ────────────────────────────────────────── */}
      <DownloadEmailModal
        open={!!downloadResource}
        onClose={() => setDownloadResource(null)}
        resourceTitle={downloadResource?.title ?? ""}
      />
    </>
  );
}
