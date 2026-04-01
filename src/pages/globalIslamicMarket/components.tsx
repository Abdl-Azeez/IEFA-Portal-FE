import React, { useState, useEffect } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Building,
  DollarSign,
  FileText,
  Globe2,
  LayoutDashboard,
  Building2,
  Shield,
  Landmark,
  Trophy,
  TrendingUp,
  PieChart,
  Download,
  Users,
  Leaf,
  Radio,
  BookOpen,
  MapPin,
  Layers,
} from 'lucide-react'
import { ResponsivePie } from '@nivo/pie'
import { ResponsiveBar } from '@nivo/bar'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'

// ─── Colour System ────────────────────────────────────────────────────────────
export const COLORS = {
  teal:        '#0D9488',
  tealLight:   '#14B8A6',
  ocean:       '#0891B2',
  oceanLight:  '#06B6D4',
  purple:      '#7C3AED',
  purpleLight: '#8B5CF6',
  gold:        '#D97706',
  goldLight:   '#F59E0B',
  crimson:     '#DC2626',
  emerald:     '#059669',
  cardBg:      '#FFFFFF',
  cardBorder:  '#E5E7EB',
  cardBorder2: '#D1D5DB',
  pageBg:      '#FEF2F2',
  textPrimary: '#111827',
  textSecond:  '#6B7280',
  textMuted:   '#9CA3AF',
  projected:   '#F59E0B',
} as const

// ─── Nivo Shared Theme ────────────────────────────────────────────────────────
const NIVO_THEME = {
  background: 'transparent',
  text: { fill: '#6B7280', fontSize: 11, fontFamily: 'inherit' },
  axis: {
    ticks:  { text: { fill: '#6B7280', fontSize: 10 } },
    legend: { text: { fill: '#6B7280', fontSize: 12 } },
  },
  grid:    { line: { stroke: '#E5E7EB', strokeWidth: 1 } },
  tooltip: {
    container: {
      background:   '#FFFFFF',
      color:        '#111827',
      fontSize:     12,
      border:       '1px solid #E5E7EB',
      borderRadius: 8,
      padding:      '8px 12px',
      boxShadow:    '0 4px 12px rgba(0,0,0,0.08)',
    },
  },
  legends: { text: { fill: '#6B7280', fontSize: 11 } },
}

// ─── Recharts Tooltip Style ───────────────────────────────────────────────────
const RECHARTS_TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: '#FFFFFF',
    border:          '1px solid #E5E7EB',
    borderRadius:    8,
    color:           '#111827',
    fontSize:        12,
    boxShadow:       '0 4px 12px rgba(0,0,0,0.08)',
  },
  labelStyle: { color: '#0D9488', fontWeight: 600 as const },
  itemStyle:  { color: '#111827' },
}

// ─── All Data ─────────────────────────────────────────────────────────────────
const ISLAMIC_DATA = {
  globalGlance: {
    headline: {
      totalAssets:       'US$6tn',
      totalAssetsRaw:    5985,
      yoyGrowth:         '21%',
      totalInstitutions: 2255,
      countriesCovered:  140,
    },
    assetsBySector: [
      { id: 'Islamic Banking', label: 'Islamic Banking', value: 4318, share: 72, color: '#0D9488' },
      { id: 'Sukuk',           label: 'Sukuk',           value: 1031, share: 17, color: '#0891B2' },
      { id: 'Islamic Funds',   label: 'Islamic Funds',   value: 308,  share: 5,  color: '#7C3AED' },
      { id: 'Other IFIs',      label: 'Other IFIs',      value: 193,  share: 3,  color: '#D97706' },
      { id: 'Takaful',         label: 'Takaful',         value: 136,  share: 2,  color: '#DC2626' },
    ],
    assetsGrowth: [
      { year: '2018', value: 2505, projected: false },
      { year: '2019', value: 2909, projected: false },
      { year: '2020', value: 3329, projected: false },
      { year: '2021', value: 3989, projected: false },
      { year: '2022', value: 4304, projected: false },
      { year: '2023', value: 4963, projected: false },
      { year: '2024', value: 5985, projected: false },
      { year: '2029',  value: 9719, projected: true  },
    ],
    topCountriesByAssets: [
      { country: 'Iran',         value: 2249, flag: '🇮🇷' },
      { country: 'Saudi Arabia', value: 1316, flag: '🇸🇦' },
      { country: 'Malaysia',     value: 761,  flag: '🇲🇾' },
      { country: 'UAE',          value: 460,  flag: '🇦🇪' },
      { country: 'Kuwait',       value: 198,  flag: '🇰🇼' },
      { country: 'Qatar',        value: 192,  flag: '🇶🇦' },
      { country: 'Indonesia',    value: 179,  flag: '🇮🇩' },
      { country: 'Bahrain',      value: 139,  flag: '🇧🇭' },
      { country: 'Türkiye',      value: 127,  flag: '🇹🇷' },
      { country: 'Pakistan',     value: 77,   flag: '🇵🇰' },
    ],
    topIFDIMarkets: [
      { rank: 1, country: 'Malaysia',     flag: '🇲🇾', medal: '🥇' },
      { rank: 2, country: 'Saudi Arabia', flag: '🇸🇦', medal: '🥈' },
      { rank: 3, country: 'UAE',          flag: '🇦🇪', medal: '🥉' },
      { rank: 4, country: 'Indonesia',    flag: '🇮🇩', medal: '4️⃣' },
      { rank: 5, country: 'Pakistan',     flag: '🇵🇰', medal: '5️⃣' },
    ],
    highlights: {
      leadingCountry: 'Iran',
      leadingCountryValue: 2249,
      topThreeSharePercent: 72,
      topTenGrowthNote: 'All top 10 saw double-digit growth',
      chartAnnotation: '21% YoY Growth',
      milestoneLabel: 'US$6tn Milestone',
      sourceNote: 'Data covers 140 countries',
    },
    ecosystem: {
      governance: [
        { label: 'Countries with IF Regulation',   value: 57,   suffix: '' },
        { label: 'Countries with FinTech Sandbox', value: 72,   suffix: '' },
        { label: 'Central Shariah Committees',     value: 23,   suffix: '' },
        { label: 'Avg Disclosure Index',           value: 76,   suffix: '%' },
        { label: 'Shariah Scholars',               value: 1617, suffix: '' },
      ],
      sustainability: [
        { label: 'ESG Sukuk Outstanding',         value: 'US$61.5bn', raw: 61.5 },
        { label: 'ESG Islamic Funds Outstanding', value: 'US$9.7bn',  raw: 9.7  },
        { label: 'Countries with S. Guidelines',  value: '50',        raw: 50   },
        { label: 'Avg Sustainability Reporting',  value: '49%',       raw: 49   },
        { label: 'Total CSR Funds Disbursed',     value: 'US$1.65bn', raw: 1.65 },
      ],
      awareness: [
        { label: 'In-Person Events', value: 1031 },
        { label: 'Virtual Events',   value: 379  },
        { label: 'IF News Articles', value: 9480 },
      ],
      knowledge: [
        { label: 'Education Providers', value: 1186 },
        { label: 'Research Papers',     value: 5291 },
        { label: 'Journals',            value: 379  },
      ],
      knowledgeLeader: {
        country: 'Indonesia',
        providers: 536,
      },
    },
  },

  globalOverview: {
    headline: {
      totalAssets:           'US$6tn',
      totalAssetsExact:      'US$5.986tn',
      yoyGrowth:             '21%',
      countriesWithPresence: 98,
      majorSectors:          5,
      totalInstitutions:     2255,
      regionsCount:          8,
      gccMenaShare:          78,
      oicCountriesAssetShare: 98,
    },
    sectorBreakdown: [
      { sector: 'Islamic Banking', totalAssets: 'US$4.3tn', sharePercent: 72, institutionsLabel: '681 Banks',          color: '#0D9488' },
      { sector: 'Sukuk',           totalAssets: 'US$1.0tn', sharePercent: 17, institutionsLabel: '4,712 Outstanding',  color: '#0891B2' },
      { sector: 'Islamic Funds',   totalAssets: 'US$308bn', sharePercent: 5,  institutionsLabel: '2,610 Outstanding',  color: '#7C3AED' },
      { sector: 'Other IFIs',      totalAssets: 'US$193bn', sharePercent: 3,  institutionsLabel: '1,179 Institutions', color: '#D97706' },
      { sector: 'Takaful',         totalAssets: 'US$136bn', sharePercent: 2,  institutionsLabel: '395 Operators',      color: '#DC2626' },
    ],
    institutionBreakdown: {
      fullyFledged: { count: 1376, shareOfAssets: 86, label: 'Fully-Fledged' },
      windows:      { count: 877,  shareOfAssets: 14, label: 'Windows'       },
    },
    regionalDistribution: [
      { id: 'GCC',              label: 'GCC',              value: 39,   color: '#0D9488' },
      { id: 'Other MENA',       label: 'Other MENA',       value: 39,   color: '#0891B2' },
      { id: 'Southeast Asia',   label: 'Southeast Asia',   value: 16,   color: '#7C3AED' },
      { id: 'Europe',           label: 'Europe',           value: 3,    color: '#D97706' },
      { id: 'South Asia',       label: 'South Asia',       value: 2,    color: '#DC2626' },
      { id: 'Sub-Saharan Afr.', label: 'Sub-Saharan Afr.', value: 0.25, color: '#059669' },
      { id: 'Americas',         label: 'Americas',         value: 0.22, color: '#9333EA' },
      { id: 'Other Asia',       label: 'Other Asia',       value: 0.05, color: '#F59E0B' },
    ],
  },

  islamicBanking: {
    headline: {
      totalAssets:         'US$4.32tn',
      growth:              '21%',
      totalBanks:          681,
      shareOfIfAssets:     '72%',
      marketsCount:        84,
      globalBankingShare:  '2.3%',
      windowsBankShare:    '48%',
      windowsAssetShare:   '14%',
      subSaharanAfricaBanks: 104,
      subSaharanAfricaCountries: 28,
      menaDominanceValue:  3755,
      menaDominanceShare:  '87%',
      southeastAsiaValue:  380,
    },
    assetsGrowth: [
      { year: '2018', value: 1685, projected: false },
      { year: '2019', value: 1970, projected: false },
      { year: '2020', value: 2264, projected: false },
      { year: '2021', value: 2680, projected: false },
      { year: '2022', value: 3024, projected: false },
      { year: '2023', value: 3557, projected: false },
      { year: '2024', value: 4318, projected: false },
      { year: '2029',  value: 6897, projected: true  },
    ],
    topCountries: [
      { country: 'Iran',         value: 2012, flag: '🇮🇷' },
      { country: 'Saudi Arabia', value: 913,  flag: '🇸🇦' },
      { country: 'Malaysia',     value: 312,  flag: '🇲🇾' },
      { country: 'UAE',          value: 306,  flag: '🇦🇪' },
      { country: 'Kuwait',       value: 180,  flag: '🇰🇼' },
      { country: 'Qatar',        value: 153,  flag: '🇶🇦' },
      { country: 'Bahrain',      value: 88,   flag: '🇧🇭' },
      { country: 'Türkiye',      value: 75,   flag: '🇹🇷' },
      { country: 'Indonesia',    value: 59,   flag: '🇮🇩' },
      { country: 'Bangladesh',   value: 50,   flag: '🇧🇩' },
    ],
    regionalAssets: [
      { id: 'Other MENA',    label: 'Other MENA',    value: 2095, color: '#0891B2' },
      { id: 'GCC',           label: 'GCC',           value: 1660, color: '#0D9488' },
      { id: 'Southeast Asia',label: 'Southeast Asia',value: 380,  color: '#7C3AED' },
      { id: 'South Asia',    label: 'South Asia',    value: 92,   color: '#DC2626' },
      { id: 'Europe',        label: 'Europe',        value: 85,   color: '#D97706' },
      { id: 'Other',         label: 'Other',         value: 6,    color: '#6B7280' },
    ],
  },

  takaful: {
    headline: {
      totalAssets:             'US$136bn',
      growth:                  '26%',
      totalOperators:          395,
      shareOfIfAssets:         '2%',
      activeCountries:         53,
      projectedAssets2029:     'US$237bn',
      iranGlobalShare:         '54%',
      topThreeShare:           '90%',
      growthSince2018Multiple: '3×',
    },
    assetsGrowth: [
      { year: '2018', value: 45,  projected: false },
      { year: '2019', value: 54,  projected: false },
      { year: '2020', value: 63,  projected: false },
      { year: '2021', value: 76,  projected: false },
      { year: '2022', value: 83,  projected: false },
      { year: '2023', value: 108, projected: false },
      { year: '2024', value: 136, projected: false },
      { year: '2029',  value: 237, projected: true  },
    ],
    topCountries: [
      { country: 'Iran',              value: 73,  flag: '🇮🇷' },
      { country: 'Malaysia',          value: 28,  flag: '🇲🇾' },
      { country: 'Saudi Arabia',      value: 22,  flag: '🇸🇦' },
      { country: 'UAE',               value: 4,   flag: '🇦🇪' },
      { country: 'Indonesia',         value: 2,   flag: '🇮🇩' },
      { country: 'Türkiye',           value: 2,   flag: '🇹🇷' },
      { country: 'Qatar',             value: 1,   flag: '🇶🇦' },
      { country: 'Pakistan',          value: 0.9, flag: '🇵🇰' },
      { country: 'Oman',              value: 0.5, flag: '🇴🇲' },
      { country: 'Brunei Darussalam', value: 0.5, flag: '🇧🇳' },
    ],
    regionalAssets: [
      { id: 'Other MENA',    label: 'Other MENA',    value: 73, color: '#0891B2' },
      { id: 'Southeast Asia',label: 'Southeast Asia',value: 31, color: '#7C3AED' },
      { id: 'GCC',           label: 'GCC',           value: 28, color: '#0D9488' },
      { id: 'Other',         label: 'Other',         value: 3,  color: '#6B7280' },
    ],
    emergingMarkets: [
      {
        country: 'Uganda',
        flag: '🇺🇬',
        description: 'Insurance regulator issued Takaful guidelines in 2024. First Islamic bank also established same year.',
        status: '🟡 Guidelines Issued',
        statusClassName: 'border-amber-200 bg-amber-50 text-amber-700',
      },
      {
        country: 'Philippines',
        flag: '🇵🇭',
        description: 'First Takaful operator launched by Pru Life UK, Nov 2024. First Takaful product launched Jan 2025.',
        status: '🟢 Operational',
        statusClassName: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      },
      {
        country: 'Kyrgyzstan',
        flag: '🇰🇬',
        description: 'Draft Takaful legislation under parliamentary review.',
        status: '🔵 Draft Legislation',
        statusClassName: 'border-sky-200 bg-sky-50 text-sky-700',
      },
      {
        country: 'Australia',
        flag: '🇦🇺',
        description: 'Orient Insurance (UAE) in discussions with APRA for Takaful launch approval.',
        status: '⚪ Exploratory',
        statusClassName: 'border-gray-200 bg-gray-50 text-gray-600',
      },
      {
        country: 'Saudi Arabia',
        flag: '🇸🇦',
        description: 'Multiple merger discussions ongoing: Saudi Enaya/Salama, MedGulf/Buruj, Liva/Malath. New 30% reinsurance cede rule.',
        status: '🔴 Consolidation',
        statusClassName: 'border-red-200 bg-red-50 text-red-700',
      },
    ],
  },

  otherIFIs: {
    headline: {
      totalAssets:          'US$193bn',
      growth:               '6%',
      totalOIFIs:           1179,
      shareOfIfAssets:      '3%',
      stabilityWindowStart: 'US$176bn',
      stabilityWindowEnd:   'US$193bn',
      switzerlandValue:     'US$6bn',
      gccValue:             94,
      gccShare:             '49%',
      southeastAsiaValue:   51,
      southeastAsiaShare:   '26%',
    },
    assetsGrowth: [
      { year: '2018', value: 176, projected: false },
      { year: '2019', value: 182, projected: false },
      { year: '2020', value: 176, projected: false },
      { year: '2021', value: 166, projected: false },
      { year: '2022', value: 166, projected: false },
      { year: '2023', value: 181, projected: false },
      { year: '2024', value: 193, projected: false },
      { year: '2029',  value: 246, projected: true  },
    ],
    topCountries: [
      { country: 'Malaysia',     value: 46, flag: '🇲🇾' },
      { country: 'Saudi Arabia', value: 38, flag: '🇸🇦' },
      { country: 'Iran',         value: 37, flag: '🇮🇷' },
      { country: 'Bahrain',      value: 34, flag: '🇧🇭' },
      { country: 'Qatar',        value: 12, flag: '🇶🇦' },
      { country: 'UAE',          value: 6,  flag: '🇦🇪' },
      { country: 'Switzerland',  value: 6,  flag: '🇨🇭' },
      { country: 'Kuwait',       value: 4,  flag: '🇰🇼' },
      { country: 'Indonesia',    value: 4,  flag: '🇮🇩' },
      { country: 'Pakistan',     value: 2,  flag: '🇵🇰' },
    ],
    regionalAssets: [
      { id: 'GCC',           label: 'GCC',           value: 94, color: '#0D9488' },
      { id: 'Southeast Asia',label: 'Southeast Asia',value: 51, color: '#7C3AED' },
      { id: 'Other MENA',    label: 'Other MENA',    value: 37, color: '#0891B2' },
      { id: 'Europe',        label: 'Europe',        value: 7,  color: '#D97706' },
      { id: 'Other',         label: 'Other',         value: 3,  color: '#6B7280' },
    ],
    composition: [
      {
        title: 'Mudaraba Companies',
        icon: 'TrendingUp',
        accent: '#7C3AED',
        description: 'Profit-sharing investment vehicles primarily operating in Pakistan. Serve SME financing needs through Shariah-compliant equity participation.',
        countries: '🇵🇰 Pakistan leads this sub-sector',
      },
      {
        title: 'Islamic Development Finance',
        icon: 'Globe2',
        accent: '#0891B2',
        description: 'Multilateral and bilateral development institutions including IsDB Group entities, ICD, and regional development banks operating on Shariah principles.',
        countries: '🌍 GCC-based institutions dominate',
      },
      {
        title: 'Islamic Leasing & Microfinance',
        icon: 'Layers',
        accent: '#059669',
        description: 'Ijarah-based leasing companies and Shariah-compliant microfinance institutions serving underbanked populations across Southeast Asia and Sub-Saharan Africa.',
        countries: '🇲🇾 🇧🇩 🇮🇩 Growing rapidly',
      },
    ],
  },

  sukuk: {
    headline: {
      totalOutstanding:     'US$1tn',
      growth:               '20%',
      numberOutstanding:    4712,
      globalIssuance2024:   254.3,
      globalIssuanceGrowth: '11%',
      govtShareOfIssuance:  '58%',
      saudiIssuance2024:     75.3,
      saudiIssuanceGrowth:   '53%',
      globalMaturityBy2030:  '55%',
      maturingIn2025:        105,
      malaysiaGlobalShare:   '~33%',
    },
    valueGrowth: [
      { year: '2018', value: 470,  projected: false },
      { year: '2019', value: 538,  projected: false },
      { year: '2020', value: 626,  projected: false },
      { year: '2021', value: 713,  projected: false },
      { year: '2022', value: 788,  projected: false },
      { year: '2023', value: 863,  projected: false },
      { year: '2024', value: 1031, projected: false },
      { year: '2029',  value: 1802, projected: true  },
    ],
    topCountries: [
      { country: 'Malaysia',     value: 340, flag: '🇲🇾' },
      { country: 'Saudi Arabia', value: 313, flag: '🇸🇦' },
      { country: 'Indonesia',    value: 111, flag: '🇮🇩' },
      { country: 'UAE',          value: 100, flag: '🇦🇪' },
      { country: 'Türkiye',      value: 31,  flag: '🇹🇷' },
      { country: 'Pakistan',     value: 27,  flag: '🇵🇰' },
      { country: 'Qatar',        value: 26,  flag: '🇶🇦' },
      { country: 'Iran',         value: 24,  flag: '🇮🇷' },
      { country: 'Bahrain',      value: 16,  flag: '🇧🇭' },
      { country: 'Kuwait',       value: 11,  flag: '🇰🇼' },
    ],
    regionalOutstanding: [
      { id: 'GCC',           label: 'GCC',           value: 477, color: '#0D9488' },
      { id: 'Southeast Asia',label: 'Southeast Asia',value: 452, color: '#7C3AED' },
      { id: 'Europe',        label: 'Europe',        value: 35,  color: '#D97706' },
      { id: 'South Asia',    label: 'South Asia',    value: 30,  color: '#DC2626' },
      { id: 'Other MENA',    label: 'Other MENA',    value: 28,  color: '#0891B2' },
      { id: 'Other',         label: 'Other',         value: 8,   color: '#6B7280' },
    ],
  },

  islamicFunds: {
    headline: {
      totalAuM:         'US$308bn',
      growth:           '21%',
      fundsOutstanding: 2610,
      shareOfIfAssets:  '5%',
      ukValue:          42,
      usValue:          11,
      dipFrom2021:      20,
      recoveryFrom2022: 65,
      projected2029:    538,
      esgFundsValue:    'US$9.7bn',
      sukukFundsValue:  15.3,
      sukukFundsShare:  '9%',
      sukukFundsGrowth: '37%',
    },
    aumGrowth: [
      { year: '2018', value: 128, projected: false },
      { year: '2019', value: 165, projected: false },
      { year: '2020', value: 200, projected: false },
      { year: '2021', value: 263, projected: false },
      { year: '2022', value: 243, projected: false },
      { year: '2023', value: 254, projected: false },
      { year: '2024', value: 308, projected: false },
      { year: '2029',  value: 538, projected: true  },
    ],
    topCountries: [
      { country: 'Iran',          value: 103, flag: '🇮🇷' },
      { country: 'UAE',           value: 44,  flag: '🇦🇪' },
      { country: 'United Kingdom',value: 42,  flag: '🇬🇧' },
      { country: 'Malaysia',      value: 36,  flag: '🇲🇾' },
      { country: 'Saudi Arabia',  value: 31,  flag: '🇸🇦' },
      { country: 'Türkiye',       value: 19,  flag: '🇹🇷' },
      { country: 'United States', value: 11,  flag: '🇺🇸' },
      { country: 'Pakistan',      value: 7,   flag: '🇵🇰' },
      { country: 'South Africa',  value: 4,   flag: '🇿🇦' },
      { country: 'Indonesia',     value: 3,   flag: '🇮🇩' },
    ],
    regionalAuM: [
      { id: 'Other MENA',    label: 'Other MENA',    value: 103, color: '#0891B2' },
      { id: 'GCC',           label: 'GCC',           value: 77,  color: '#0D9488' },
      { id: 'Europe',        label: 'Europe',        value: 64,  color: '#D97706' },
      { id: 'Southeast Asia',label: 'Southeast Asia',value: 40,  color: '#7C3AED' },
      { id: 'Americas',      label: 'Americas',      value: 11,  color: '#DC2626' },
      { id: 'Other',         label: 'Other',         value: 13,  color: '#6B7280' },
    ],
    innovation: [
      {
        market: 'South Africa',
        flag: '🇿🇦',
        title: 'First Islamic ETF — Oct 2024',
        description: 'South Africa launched its first Shariah-compliant ETF, expanding Islamic investing in Sub-Saharan Africa.',
        badge: '🟢 Launched',
        badgeClassName: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      },
      {
        market: 'Kazakhstan',
        flag: '🇰🇿',
        title: "Central Asia's First Islamic ETF — Jan 2025",
        description: 'Listed on Astana International Exchange. First Islamic ETF in the entire Central Asia region.',
        badge: '🟢 Launched',
        badgeClassName: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      },
      {
        market: 'Hong Kong',
        flag: '🇭🇰',
        title: 'Saudi Sukuk ETF — May 2025',
        description: "ETF tracking Saudi government and agency sukuk as part of Hong Kong's strategy to deepen Middle East ties.",
        badge: '🟢 Launched',
        badgeClassName: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      },
      {
        market: 'Saudi Arabia',
        flag: '🇸🇦',
        title: 'Hong Kong Stocks Islamic ETF — Oct 2024',
        description: 'Saudi launch of Islamic ETF tracking Hong Kong stocks, bridging GCC and Asian capital markets.',
        badge: '🟢 Launched',
        badgeClassName: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      },
      {
        market: 'ESG Islamic Funds',
        flag: '🌱',
        title: 'ESG Islamic Funds — US$9.7bn AuM',
        description: 'Growing class of funds combining Shariah compliance with ESG criteria. US leads at US$7.942bn, followed by Malaysia at US$1.234bn.',
        badge: '📊 Growing',
        badgeClassName: 'border-amber-200 bg-amber-50 text-amber-700',
      },
    ],
  },
}

// ─── Shared Components ────────────────────────────────────────────────────────

interface KPICardProps {
  icon: React.ElementType
  label: string
  value: string | number
  subtitle?: string
  accentColor?: string
  animated?: boolean
}

function KPICard({
  icon: Icon,
  label,
  value,
  subtitle,
  accentColor = COLORS.teal,
  animated = false,
}: Readonly<KPICardProps>) {
  const isNumeric = typeof value === 'number'
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!animated || !isNumeric) return
    const target = value
    const duration = 1500
    const steps = 60
    const step = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += step
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [animated, isNumeric, value])

  let displayValue: string | number
  if (animated && isNumeric) {
    displayValue = count.toLocaleString()
  } else if (isNumeric) {
    displayValue = value.toLocaleString()
  } else {
    displayValue = value
  }

  return (
    <div
      className="relative h-28 flex items-center gap-4 bg-white border border-gray-200 rounded-2xl px-5 transition-all duration-300 hover:shadow-lg group overflow-hidden cursor-default"
    >
      {/* Hover glow border */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
        style={{ boxShadow: `inset 0 0 0 1px ${accentColor}50` }}
      />
      {/* Icon */}
      <div
        className="shrink-0 h-12 w-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${accentColor}20` }}
      >
        <Icon className="h-6 w-6" style={{ color: accentColor }} />
      </div>
      {/* Text */}
      <div className="min-w-0 flex-1">
        <p aria-live="polite" className="text-3xl font-bold text-gray-900 leading-none mb-1 truncate">{displayValue}</p>
        <p className="text-sm text-gray-500">{label}</p>
        {subtitle && (
          <p className="text-xs mt-0.5 font-medium" style={{ color: accentColor }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}

interface SectionHeaderProps {
  icon: React.ElementType
  title: string
  subtitle: string
  accentColor: string
}

function SectionHeader({ icon: Icon, title, subtitle, accentColor }: Readonly<SectionHeaderProps>) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <Icon className="h-5 w-5" style={{ color: accentColor }} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">{title}</h2>
            <p className="text-sm text-gray-500 leading-tight">{subtitle}</p>
          </div>
        </div>
        <span className="text-xs bg-gray-100 text-gray-500 border border-gray-200 rounded-full px-3 py-1 shrink-0">
          Source: ICD-LSEG IFDR 2025
        </span>
      </div>
      <div className="h-px" style={{ backgroundColor: `${accentColor}4D` }} />
    </div>
  )
}

function ProjectedBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs rounded-full px-2 py-0.5 font-medium">
      📊 Projected
    </span>
  )
}

interface SectionCardProps {
  title: string
  children: React.ReactNode
  className?: string
}

function SectionCard({ title, children, className = '' }: Readonly<SectionCardProps>) {
  const hasContent = React.Children.count(children) > 0

  return (
    <div className={`bg-white border border-gray-200 rounded-2xl p-5 ${className}`} role="region" aria-label={title}>
      <p className="text-gray-600 text-sm font-semibold mb-4">{title}</p>
      <p className="sr-only">{title}</p>
      {hasContent ? children : <p className="py-8 text-center text-xs text-gray-400">No data available for this metric</p>}
    </div>
  )
}

interface CountryBarProps {
  country: string
  flag: string
  value: number
  maxValue: number
  color: string
  unit?: string
  delay?: number
  displayValue?: string
  minWidthPercent?: number
}

function CountryBar({
  country,
  flag,
  value,
  maxValue,
  color,
  unit = 'US$bn',
  delay = 0,
  displayValue,
  minWidthPercent = 0,
}: Readonly<CountryBarProps>) {
  const [width, setWidth] = useState(0)
  const pct = Math.max((value / maxValue) * 100, minWidthPercent)

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 200 + delay)
    return () => clearTimeout(t)
  }, [pct, delay])

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 flex items-center gap-1.5 min-w-0">
          <span className="text-base leading-none shrink-0">{flag}</span>
          <span className="truncate">{country}</span>
        </span>
        <span className="text-gray-500 text-xs font-medium shrink-0 ml-2">
          {displayValue ?? (value >= 1000 ? `US$${(value / 1000).toFixed(1)}tn` : `${value}${unit === 'bn' ? 'bn' : unit}`.startsWith('US$') ? `${value}${unit}` : `US$${value}${unit === 'US$bn' ? 'bn' : unit}`)}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${width}%`,
            backgroundColor: color,
            transition: 'width 1000ms ease-out',
          }}
        />
      </div>
      {/* visually suppress the unit prop warning */}
      {unit && null}
    </div>
  )
}

function DownloadButton() {
  return (
    <button
      aria-label="Download section data"
      onClick={() => console.log('Download triggered')}
      className="flex items-center gap-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-2 transition-colors duration-200"
    >
      <Download className="h-3.5 w-3.5" />
      Download Data
    </button>
  )
}

function formatUsdValue(value: number) {
  if (value >= 1000) {
    return `US$${(value / 1000).toFixed(1)}tn`
  }

  if (Number.isInteger(value)) {
    return `US$${value.toLocaleString()}bn`
  }

  return `US$${value.toFixed(1)}bn`
}

function useAnimatedNumber(target: number, delay = 0) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    let interval: ReturnType<typeof setInterval> | undefined

    timer = setTimeout(() => {
      const duration = 1200
      const steps = 48
      const stepValue = target / steps
      let current = 0

      interval = setInterval(() => {
        current += stepValue
        if (current >= target) {
          setCount(target)
          if (interval) {
            clearInterval(interval)
          }
          return
        }
        setCount(Math.round(current))
      }, duration / steps)
    }, delay)

    return () => {
      if (timer) {
        clearTimeout(timer)
      }
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [delay, target])

  return count
}

function AnimatedMetricNumber({
  value,
  suffix = '',
  className,
  delay = 0,
}: Readonly<{
  value: number
  suffix?: string
  className?: string
  delay?: number
}>) {
  const count = useAnimatedNumber(value, delay)

  return <span className={className}>{`${count.toLocaleString()}${suffix}`}</span>
}

function RechartsDarkTooltip({
  active,
  payload,
  label,
}: Readonly<{
  active?: boolean
  payload?: Array<{ value?: number; payload?: { projected?: boolean } }>
  label?: string
}>) {
  if (!active || !payload?.length || typeof payload[0]?.value !== 'number') {
    return null
  }

  const point = payload[0].payload

  return (
    <div className="rounded-xl border border-teal-200 bg-white px-3 py-2 text-xs text-gray-800 shadow-xl">
      <div className="mb-1 font-semibold text-teal-700">{label}</div>
      <div>{formatUsdValue(payload[0].value)}</div>
      {point?.projected && (
        <div className="mt-2">
          <ProjectedBadge />
        </div>
      )}
    </div>
  )
}

function GlobalGlanceCountryTooltip({
  id,
  value,
}: Readonly<{
  id: string | number
  value: string | number
}>) {
  const match = ISLAMIC_DATA.globalGlance.topCountriesByAssets.find((item) => item.country === id)

  return (
    <div className="rounded-xl border border-teal-200 bg-white px-3 py-2 text-xs text-gray-800 shadow-xl">
      <div className="mb-1 font-semibold text-teal-700">
        {match ? `${match.flag} ${match.country}` : id}
      </div>
      <div>{formatUsdValue(Number(value))}</div>
    </div>
  )
}

function GlobalGlancePieTooltipRenderer(props: Readonly<{ datum: { id: string | number; value: number; data: { share: number } } }>) {
  return <GlobalGlanceDonutTooltip datum={props.datum} />
}

function GlobalGlanceBarTooltipRenderer(props: Readonly<{ id: string | number; value: string | number }>) {
  return <GlobalGlanceCountryTooltip id={props.id} value={props.value} />
}

function getGlobalGlanceMobileCountryColor(index: number) {
  const mobileBarColors = [COLORS.teal, COLORS.ocean, COLORS.purple]
  return mobileBarColors[index] ?? COLORS.purple
}

function formatGlobalGlanceCountryAxis(country: string | number) {
  const match = ISLAMIC_DATA.globalGlance.topCountriesByAssets.find((item) => item.country === country)
  return match ? `${match.flag} ${country}` : String(country)
}

function getGlobalGlanceCountryColor(index: number | string) {
  if (typeof index === 'number' && index <= 3) {
    return COLORS.teal
  }
  if (typeof index === 'number' && index <= 6) {
    return COLORS.ocean
  }
  return COLORS.purple
}

function formatGlobalGlanceSectorArcLabel(datum: { data: { share: number } }) {
  return `${datum.data.share}%`
}

function formatGlobalGlanceBarLabel(datum: { value: string | number | null }) {
  return formatUsdValue(Number(datum.value ?? 0))
}

function GlobalOverviewPieTooltip({
  datum,
}: Readonly<{
  datum: { id: string | number; value: number }
}>) {
  const isDominantRegion = datum.id === 'GCC' || datum.id === 'Other MENA'

  return (
    <div className="rounded-xl border border-cyan-200 bg-white px-3 py-2 text-xs text-gray-800 shadow-xl">
      <div className="mb-1 font-semibold text-cyan-700">{datum.id}</div>
      <div>{datum.value}% share of global IF assets</div>
      {isDominantRegion && (
        <div className="mt-1 text-gray-500">
          GCC &amp; MENA together = {ISLAMIC_DATA.globalOverview.headline.gccMenaShare}% of global IF assets
        </div>
      )}
    </div>
  )
}

function GlobalOverviewPieTooltipRenderer(props: Readonly<{ datum: { id: string | number; value: number } }>) {
  return <GlobalOverviewPieTooltip datum={props.datum} />
}

function formatGlobalOverviewArcLabel(datum: { value: number }) {
  return datum.value >= 1 ? `${datum.value}%` : ''
}

function formatOverviewHoverText(region: { label: string; value: number } | undefined) {
  if (!region) {
    return ''
  }

  return `${region.label}: ${region.value}% share`
}

function colorWithAlpha(hex: string, alpha: string) {
  return `${hex}${alpha}`
}

function lightenHex(hex: string, amount = 36) {
  const normalized = hex.replace('#', '')
  const value = Number.parseInt(normalized, 16)
  const red = Math.min(255, (value >> 16) + amount)
  const green = Math.min(255, ((value >> 8) & 0x00ff) + amount)
  const blue = Math.min(255, (value & 0x0000ff) + amount)
  return `rgb(${red}, ${green}, ${blue})`
}

function getOverviewRegionColor(regionId: string, selectedRegion: string | null, baseColor: string) {
  if (!selectedRegion || selectedRegion === regionId) {
    return baseColor
  }

  return colorWithAlpha(baseColor, '44')
}

function CircularProgressRing({
  value,
  color,
  label,
}: Readonly<{
  value: number
  color: string
  label: string
}>) {
  const radius = 54
  const strokeWidth = 10
  const circumference = 2 * Math.PI * radius
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setProgress(value), 80)
    return () => clearTimeout(timer)
  }, [value])

  const dashOffset = circumference - (progress / 100) * circumference

  return (
    <div className="relative flex h-40 items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
        <circle cx="70" cy="70" r={radius} fill="none" stroke={COLORS.cardBorder} strokeWidth={strokeWidth} />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 1200ms ease' }}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <AnimatedMetricNumber value={value} suffix="%" className="text-2xl font-bold text-gray-900" />
        <div className="text-[11px] text-gray-500">{label}</div>
      </div>
    </div>
  )
}

function SectorBreakdownRow({
  sector,
  index,
  isOpen,
  onToggle,
}: Readonly<{
  sector: {
    sector: string
    totalAssets: string
    sharePercent: number
    institutionsLabel: string
    color: string
  }
  index: number
  isOpen: boolean
  onToggle: () => void
}>) {
  const [progressWidth, setProgressWidth] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setProgressWidth(sector.sharePercent), index * 100)
    return () => clearTimeout(timer)
  }, [index, sector.sharePercent])

  return (
    <button
      type="button"
      onClick={onToggle}
      className="mb-3 w-full rounded-xl border border-gray-200 bg-gray-50/80 p-4 text-left transition-all duration-300 hover:bg-gray-100"
      style={{
        borderColor: isOpen ? sector.color : undefined,
        animationDelay: `${index * 100}ms`,
      }}
    >
      <div className="animate-in slide-in-from-left-4 fade-in duration-500">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="w-full lg:w-1/4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: sector.color }} />
              <span className="text-sm font-semibold text-gray-900">{sector.sector}</span>
            </div>
            <div className="mt-1 text-xs text-gray-600">{sector.totalAssets}</div>
          </div>
          <div className="w-full lg:w-1/6">
            <div className="text-lg font-bold text-gray-900">{sector.totalAssets}</div>
            <div className="text-xs text-gray-400">Total Assets</div>
          </div>
          <div className="w-full lg:w-2/5">
            <div className="mb-1 text-xs text-gray-400">Share of IF Assets</div>
            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${progressWidth}%`,
                    background: `linear-gradient(90deg, ${sector.color} 0%, ${lightenHex(sector.color)} 100%)`,
                  }}
                />
              </div>
              <span className="text-sm font-bold text-gray-900">{sector.sharePercent}%</span>
            </div>
          </div>
          <div className="w-full lg:w-1/5">
            <div className="text-xs text-gray-600">{sector.institutionsLabel}</div>
            <div className="text-xs text-gray-400">Institutions</div>
          </div>
        </div>
        {isOpen && (
          <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-3">
            <svg viewBox="0 0 320 42" className="h-12 w-full">
              <path
                d="M0 26 C24 10, 48 10, 72 24 S120 38, 148 20 S200 6, 228 22 S274 36, 320 12"
                fill="none"
                stroke={sector.color}
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}
      </div>
    </button>
  )
}

function RegionDominanceSegment({
  region,
  index,
  isHovered,
  onHover,
  onLeave,
}: Readonly<{
  region: { id: string; label: string; value: number; color: string }
  index: number
  isHovered: boolean
  onHover: () => void
  onLeave: () => void
}>) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setWidth(region.value), index * 150)
    return () => clearTimeout(timer)
  }, [index, region.value])

  return (
    <button
      type="button"
      aria-label={`${region.label} ${region.value}% share`}
      className="relative min-w-[2px] origin-bottom transition-all duration-300"
      style={{
        width: `${width}%`,
        transform: isHovered ? 'scaleY(1.12)' : 'scaleY(1)',
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onFocus={onHover}
      onBlur={onLeave}
    >
      <div className="h-12 rounded-sm" style={{ backgroundColor: region.color }} />
      {region.value >= 2 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-white">
          {region.value}%
        </div>
      )}
    </button>
  )
}

function formatBankingGrowthTick(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}T`
  }

  return `${value}bn`
}

function BankingGrowthTooltip({
  active,
  payload,
  label,
}: Readonly<{
  active?: boolean
  payload?: Array<{ value?: number | null; payload?: { projected?: boolean } }>
  label?: string
}>) {
  if (!active || !payload?.length) {
    return null
  }

  const item = payload.find((entry) => typeof entry.value === 'number' && entry.value !== null)
  if (!item || typeof item.value !== 'number') {
    return null
  }

  return (
    <div className="rounded-xl border border-teal-200 bg-white px-3 py-2 text-xs text-gray-800 shadow-xl">
      <div className="mb-1 font-semibold text-teal-700">{label}</div>
      <div>{formatUsdValue(item.value)}</div>
      {item.payload?.projected && (
        <div className="mt-2">
          <ProjectedBadge />
        </div>
      )}
    </div>
  )
}

function BankingRegionTooltip({
  datum,
}: Readonly<{
  datum: { id: string | number; value: number }
}>) {
  return (
    <div className="rounded-xl border border-teal-200 bg-white px-3 py-2 text-xs text-gray-800 shadow-xl">
      <div className="mb-1 font-semibold text-teal-700">{datum.id}</div>
      <div>{formatUsdValue(datum.value)}</div>
    </div>
  )
}

function BankingRegionTooltipRenderer(props: Readonly<{ datum: { id: string | number; value: number } }>) {
  return <BankingRegionTooltip datum={props.datum} />
}

function formatBankingRegionArcLabel(datum: { value: number }) {
  return `${((datum.value / 4318) * 100).toFixed(0)}%`
}

function getBankingCountryColor(index: number) {
  if (index === 0) {
    return COLORS.teal
  }
  if (index <= 2) {
    return COLORS.ocean
  }
  if (index <= 6) {
    return COLORS.purple
  }
  return COLORS.textMuted
}

function getBankingCountryBadge(index: number) {
  if (index === 0) {
    return '#1 Leader'
  }
  if (index === 1) {
    return '#2 GCC Leader'
  }
  if (index === 2) {
    return '#3 SEA Leader'
  }
  return null
}

function BankingInsightPill({
  children,
  className,
  delay,
}: Readonly<{
  children: React.ReactNode
  className: string
  delay: number
}>) {
  return (
    <div
      className={`animate-in fade-in slide-in-from-bottom-2 duration-500 rounded-full border px-4 py-2 text-xs ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

function BankingCountryRow({
  country,
  index,
  maxValue,
}: Readonly<{
  country: { country: string; value: number; flag: string }
  index: number
  maxValue: number
}>) {
  const badge = getBankingCountryBadge(index)

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3">
      <CountryBar
        country={country.country}
        flag={country.flag}
        value={country.value}
        maxValue={maxValue}
        color={getBankingCountryColor(index)}
        delay={index * 80}
      />
      {badge && (
        <div className="mt-2 flex justify-end">
          <span className="rounded-full bg-teal-900 px-2 py-0.5 text-xs text-teal-700">{badge}</span>
        </div>
      )}
    </div>
  )
}

function TakafulGrowthTooltip({
  active,
  payload,
  label,
}: Readonly<{
  active?: boolean
  payload?: Array<{ value?: number | null; payload?: { projected?: boolean } }>
  label?: string
}>) {
  if (!active || !payload?.length) {
    return null
  }

  const item = payload.find((entry) => typeof entry.value === 'number' && entry.value !== null)
  if (!item || typeof item.value !== 'number') {
    return null
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs text-gray-800 shadow-xl">
      <div className="mb-1 font-semibold text-amber-600">{label}</div>
      <div>{formatUsdValue(item.value)}</div>
      {item.payload?.projected && (
        <div className="mt-2">
          <ProjectedBadge />
        </div>
      )}
    </div>
  )
}

function TakafulRegionTooltip({
  datum,
}: Readonly<{
  datum: { id: string | number; value: number }
}>) {
  return (
    <div className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs text-gray-800 shadow-xl">
      <div className="mb-1 font-semibold text-amber-600">{datum.id}</div>
      <div>{formatUsdValue(datum.value)}</div>
    </div>
  )
}

function TakafulRegionTooltipRenderer(props: Readonly<{ datum: { id: string | number; value: number } }>) {
  return <TakafulRegionTooltip datum={props.datum} />
}

function formatTakafulRegionArcLabel(datum: { value: number }) {
  return `US$${datum.value}bn`
}

function formatTakafulCountryDisplay(value: number) {
  if (value < 1) {
    return '< US$1bn'
  }

  return `US$${value}bn`
}

function TakafulMarketCard({
  market,
  index,
}: Readonly<{
  market: {
    country: string
    flag: string
    description: string
    status: string
    statusClassName: string
  }
  index: number
}>) {
  return (
    <div
      className="animate-in slide-in-from-right-6 duration-500 w-56 shrink-0 rounded-xl border border-gray-200 bg-gray-100 p-4 transition-colors hover:border-amber-600"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      <div className="mb-3 flex items-center gap-2 text-gray-900">
        <span className="text-2xl leading-none">{market.flag}</span>
        <span className="font-semibold">{market.country}</span>
      </div>
      <p className="min-h-[68px] text-xs leading-relaxed text-gray-500">{market.description}</p>
      <div className={`mt-4 inline-flex rounded-full border px-2.5 py-1 text-[11px] ${market.statusClassName}`}>
        {market.status}
      </div>
    </div>
  )
}

function OifiGrowthTooltip({
  active,
  payload,
  label,
}: Readonly<{
  active?: boolean
  payload?: Array<{ value?: number | null; payload?: { year?: string; projected?: boolean } }>
  label?: string
}>) {
  if (!active || !payload?.length) {
    return null
  }

  const item = payload.find((entry) => typeof entry.value === 'number' && entry.value !== null)
  if (!item || typeof item.value !== 'number') {
    return null
  }

  const isDipYear = item.payload?.year === '2021' || item.payload?.year === '2022'

  return (
    <div className="rounded-xl border border-purple-200 bg-white px-3 py-2 text-xs text-gray-800 shadow-xl">
      <div className="mb-1 font-semibold text-purple-700">{label}</div>
      <div>{formatUsdValue(item.value)}</div>
      {isDipYear && <div className="mt-1 italic text-gray-400">(Post-COVID market adjustment)</div>}
      {item.payload?.projected && (
        <div className="mt-2">
          <ProjectedBadge />
        </div>
      )}
    </div>
  )
}

function OifiRegionTooltip({
  datum,
}: Readonly<{
  datum: { id: string | number; value: number }
}>) {
  return (
    <div className="rounded-xl border border-purple-200 bg-white px-3 py-2 text-xs text-gray-800 shadow-xl">
      <div className="mb-1 font-semibold text-purple-700">{datum.id}</div>
      <div>{formatUsdValue(datum.value)}</div>
    </div>
  )
}

function OifiRegionTooltipRenderer(props: Readonly<{ datum: { id: string | number; value: number } }>) {
  return <OifiRegionTooltip datum={props.datum} />
}

function formatOifiRegionArcLabel(datum: { value: number }) {
  return `US$${datum.value}bn`
}

function OifiHighlightCard({
  country,
  flag,
  value,
  progress,
}: Readonly<{
  country: string
  flag: string
  value: number
  progress: number
}>) {
  const radius = 26
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - progress * circumference

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-100 p-3 text-center">
      <div className="text-2xl leading-none">{flag}</div>
      <div className="mt-2 text-sm font-semibold text-gray-900">{country}</div>
      <div className="mt-1 text-xs text-gray-600">{formatUsdValue(value)}</div>
      <div className="mt-3 flex justify-center">
        <div className="relative h-[68px] w-[68px]">
          <svg width="68" height="68" viewBox="0 0 68 68" className="-rotate-90">
            <circle cx="34" cy="34" r={radius} fill="none" stroke={COLORS.cardBorder} strokeWidth="7" />
            <circle
              cx="34"
              cy="34"
              r={radius}
              fill="none"
              stroke={COLORS.purple}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

function getCompositionIcon(iconName: string) {
  if (iconName === 'TrendingUp') {
    return TrendingUp
  }
  if (iconName === 'Globe2') {
    return Globe2
  }
  return Layers
}

function GlobalGlanceDonutTooltip({
  datum,
}: Readonly<{
  datum: { id: string | number; value: number; data: { share: number } }
}>) {
  return (
    <div className="rounded-xl border border-teal-200 bg-white px-3 py-2 text-xs text-gray-800 shadow-xl">
      <div className="mb-1 font-semibold text-teal-700">{datum.id}</div>
      <div>{formatUsdValue(datum.value)}</div>
      <div className="mt-1 text-gray-500">{datum.data.share}% of total assets</div>
    </div>
  )
}

function EcosystemMetricRow({
  label,
  value,
  suffix = '',
  delay = 0,
}: Readonly<{
  label: string
  value: number
  suffix?: string
  delay?: number
}>) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-gray-200 py-2 last:border-b-0 last:pb-0 first:pt-0">
      <span className="text-xs text-gray-500">{label}</span>
      <AnimatedMetricNumber
        value={value}
        suffix={suffix}
        delay={delay}
        className="text-sm font-bold text-gray-900"
      />
    </div>
  )
}

function SpotlightStat({
  label,
  value,
  delay,
}: Readonly<{
  label: string
  value: number
  delay: number
}>) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-4 text-center">
      <AnimatedMetricNumber
        value={value}
        delay={delay}
        className="block text-2xl font-bold text-gray-900"
      />
      <div className="mt-1 text-xs text-gray-500">{label}</div>
    </div>
  )
}

function IFDIRankCard({
  country,
  flag,
  rank,
  medal,
  accentColor,
  delay,
}: Readonly<{
  country: string
  flag: string
  rank: number
  medal: string
  accentColor: string
  delay: number
}>) {
  let rankColor: string = 'text-gray-400'
  if (rank === 1) {
    rankColor = 'text-amber-600'
  } else if (rank === 2) {
    rankColor = 'text-gray-600'
  } else if (rank === 3) {
    rankColor = 'text-orange-600'
  }

  return (
    <div
      className={`relative min-w-[138px] rounded-2xl border p-4 text-center transition-all duration-500 hover:scale-105 hover:border-gray-400 ${rank === 1 ? 'animate-pulse' : ''}`}
      style={{
        background: `linear-gradient(180deg, ${accentColor}1A 0%, rgba(249,250,251,0.9) 100%)`,
        borderColor: `${accentColor}66`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {rank === 1 && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-70"
          style={{ boxShadow: '0 0 28px rgba(245, 158, 11, 0.18)' }}
        />
      )}
      <div className={`relative text-4xl font-black ${rankColor}`}>{rank}</div>
      <div className="relative mt-1 text-lg">{medal}</div>
      <div className="relative mt-3 text-4xl leading-none">{flag}</div>
      <div className="relative mt-3 text-sm font-semibold text-gray-900">{country}</div>
      <div className="relative mt-2 text-xs text-gray-500">IFDI #{rank}</div>
    </div>
  )
}

function TabGlobalGlance() {
  const globalGlance = ISLAMIC_DATA.globalGlance
  const topThreeCountries = globalGlance.topCountriesByAssets.slice(0, 3)
  const maxCountryValue = globalGlance.topCountriesByAssets[0].value
  const countriesData = globalGlance.topCountriesByAssets.map((item) => ({
    ...item,
    label: formatUsdValue(item.value),
  }))
  const assetsGrowthData = globalGlance.assetsGrowth.map((item, index, array) => {
    const previous = array[index - 1]
    return {
      ...item,
      actualValue: item.projected ? null : item.value,
      projectedValue: item.projected || item.year === '2024' ? item.value : null,
      previousYearValue: item.projected && previous ? previous.value : null,
    }
  })
  const governanceDisclosure = globalGlance.ecosystem.governance.find(
    (item) => item.label === 'Avg Disclosure Index',
  )

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader
        icon={Globe2}
        title="Global Glance"
        subtitle="Executive snapshot of the global Islamic finance industry in 2024"
        accentColor={COLORS.teal}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          icon={DollarSign}
          label="Total Islamic Finance Assets"
          value={globalGlance.headline.totalAssets}
          subtitle={`As of 2024 — ${formatUsdValue(globalGlance.headline.totalAssetsRaw)}`}
          accentColor={COLORS.teal}
        />
        <KPICard
          icon={TrendingUp}
          label="Year-on-Year Asset Growth"
          value={globalGlance.headline.yoyGrowth}
          subtitle="Strongest growth in 5 years"
          accentColor={COLORS.goldLight}
        />
        <KPICard
          icon={Building2}
          label="Total Islamic Financial Institutions"
          value={globalGlance.headline.totalInstitutions}
          subtitle={`Across ${globalGlance.headline.countriesCovered} countries globally`}
          accentColor={COLORS.purple}
          animated
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <SectionCard
          title="Islamic Finance Assets Growth (US$bn, 2018–2029)"
          className="relative lg:col-span-3"
        >
          <div className="absolute right-5 top-5 rounded-full bg-teal-900 px-2 py-1 text-xs text-teal-700">
            🚀 {globalGlance.highlights.chartAnnotation}
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={assetsGrowthData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.teal} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={COLORS.teal} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.goldLight} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={COLORS.goldLight} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.cardBorder} />
                <XAxis dataKey="year" tick={{ fill: COLORS.textSecond, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: COLORS.textSecond, fontSize: 11 }}
                  tickFormatter={(value: number) => value.toLocaleString()}
                  label={{ value: 'US$ Billion', angle: -90, position: 'insideLeft', fill: COLORS.textSecond, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip
                  content={<RechartsDarkTooltip />}
                  contentStyle={RECHARTS_TOOLTIP_STYLE.contentStyle}
                  labelStyle={RECHARTS_TOOLTIP_STYLE.labelStyle}
                  itemStyle={RECHARTS_TOOLTIP_STYLE.itemStyle}
                />
                <ReferenceLine
                  x="2024"
                  stroke={COLORS.teal}
                  strokeDasharray="4 2"
                  label={{ value: globalGlance.highlights.milestoneLabel, fill: COLORS.tealLight, fontSize: 11, position: 'insideTopRight' }}
                />
                <Area
                  type="monotone"
                  dataKey="actualValue"
                  stroke={COLORS.teal}
                  strokeWidth={2}
                  fill="url(#tealGradient)"
                  isAnimationActive
                  animationDuration={1400}
                  dot={{ r: 3, fill: COLORS.teal, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: COLORS.tealLight }}
                />
                <Area
                  type="monotone"
                  dataKey="projectedValue"
                  stroke={COLORS.goldLight}
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  fill="url(#goldGradient)"
                  fillOpacity={0.3}
                  connectNulls
                  isAnimationActive
                  animationDuration={1600}
                  dot={{ r: 3, fill: COLORS.goldLight, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: COLORS.goldLight }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Assets by Sector (2024)" className="relative lg:col-span-2">
          <div className="relative h-[320px]">
            <ResponsivePie
              data={globalGlance.assetsBySector}
              innerRadius={0.65}
              padAngle={0.7}
              cornerRadius={4}
              activeOuterRadiusOffset={8}
              colors={{ datum: 'data.color' }}
              theme={NIVO_THEME}
              margin={{ top: 20, right: 20, bottom: 80, left: 20 }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor={COLORS.textPrimary}
              arcLabel={formatGlobalGlanceSectorArcLabel}
              tooltip={GlobalGlancePieTooltipRenderer}
              legends={[
                {
                  anchor: 'bottom',
                  direction: 'row',
                  translateY: 70,
                  itemWidth: 90,
                  itemHeight: 18,
                  symbolShape: 'circle',
                  symbolSize: 8,
                },
              ]}
            />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-lg font-bold text-gray-900">{globalGlance.headline.totalAssets}</div>
              <div className="text-xs text-gray-500">Total Assets</div>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Top 10 Countries by Total Islamic Finance Assets (US$bn, 2024)">
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-teal-900/40 px-3 py-1 text-xs text-teal-700">
            🥇 {globalGlance.highlights.leadingCountry} leads at {formatUsdValue(globalGlance.highlights.leadingCountryValue)}
          </span>
          <span className="rounded-full bg-cyan-950/60 px-3 py-1 text-xs text-cyan-700">
            🌍 Top 3 = {globalGlance.highlights.topThreeSharePercent}% of global assets
          </span>
          <span className="rounded-full bg-purple-950/60 px-3 py-1 text-xs text-purple-700">
            📈 {globalGlance.highlights.topTenGrowthNote}
          </span>
        </div>
        <div className="mb-5 grid grid-cols-1 gap-3 lg:hidden">
          {topThreeCountries.map((item, index) => {
            return (
              <CountryBar
                key={item.country}
                country={item.country}
                flag={item.flag}
                value={item.value}
                maxValue={maxCountryValue}
                color={getGlobalGlanceMobileCountryColor(index)}
                delay={index * 80}
              />
            )
          })}
        </div>
        <div className="h-[360px]">
          <ResponsiveBar
            data={countriesData}
            keys={['value']}
            indexBy="country"
            layout="horizontal"
            margin={{ top: 10, right: 80, bottom: 30, left: 120 }}
            padding={0.28}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={({ index }) => getGlobalGlanceCountryColor(index)}
            theme={NIVO_THEME}
            label={formatGlobalGlanceBarLabel}
            labelTextColor={COLORS.textPrimary}
            enableGridY={false}
            borderRadius={6}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 0,
              tickPadding: 8,
              legend: 'Assets (US$bn)',
              legendOffset: 36,
              legendPosition: 'middle',
            }}
            axisLeft={{
              tickSize: 0,
              tickPadding: 10,
              format: formatGlobalGlanceCountryAxis,
            }}
            tooltip={GlobalGlanceBarTooltipRenderer}
            animate
            motionConfig="gentle"
          />
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SectionCard title="⚖️ Governance" className="border-teal-900/70">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-teal-400">
            <Shield className="h-4 w-4" />
            Governance
          </div>
          <div className="space-y-1">
            {globalGlance.ecosystem.governance.map((metric, index) => (
              <EcosystemMetricRow
                key={metric.label}
                label={metric.label}
                value={metric.value}
                suffix={metric.suffix}
                delay={index * 120}
              />
            ))}
          </div>
          <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="mb-2 text-xs text-gray-500">Avg Disclosure Index</div>
            <div className="relative h-[110px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <RadialBarChart
                  data={[{ name: 'Disclosure', value: governanceDisclosure?.value ?? 0, fill: COLORS.teal }]}
                  startAngle={180}
                  endAngle={0}
                  innerRadius="60%"
                  outerRadius="95%"
                  barSize={12}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar dataKey="value" cornerRadius={10} background />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-6">
                <AnimatedMetricNumber value={governanceDisclosure?.value ?? 0} suffix="%" className="text-lg font-bold text-gray-900" />
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="🌱 Sustainability" className="border-emerald-900/70">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-400">
            <Leaf className="h-4 w-4" />
            Sustainability
          </div>
          <div className="space-y-2">
            {globalGlance.ecosystem.sustainability.map((metric) => (
              <div key={metric.label} className="flex items-center justify-between gap-3 border-b border-gray-200 py-2 last:border-b-0 last:pb-0 first:pt-0">
                <span className="text-xs text-gray-500">{metric.label}</span>
                <span className="text-sm font-bold text-gray-900">{metric.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="mb-2 text-xs text-gray-500">
              {globalGlance.ecosystem.sustainability[2].value} countries have sustainability guidelines
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-1000"
                style={{ width: `${(globalGlance.ecosystem.sustainability[2].raw / globalGlance.headline.countriesCovered) * 100}%` }}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="📡 Awareness" className="border-amber-900/70">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-600">
            <Radio className="h-4 w-4" />
            Awareness
          </div>
          <div className="grid grid-cols-3 gap-2">
            {globalGlance.ecosystem.awareness.map((metric, index) => (
              <SpotlightStat
                key={metric.label}
                label={metric.label}
                value={metric.value}
                delay={index * 200}
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="🎓 Knowledge" className="border-purple-900/70">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-purple-400">
            <BookOpen className="h-4 w-4" />
            Knowledge
          </div>
          <div className="grid grid-cols-3 gap-2">
            {globalGlance.ecosystem.knowledge.map((metric, index) => (
              <SpotlightStat
                key={metric.label}
                label={metric.label}
                value={metric.value}
                delay={index * 200 + 200}
              />
            ))}
          </div>
          <div className="mt-4 text-xs italic text-gray-400">
            {globalGlance.ecosystem.knowledgeLeader.country} leads with {globalGlance.ecosystem.knowledgeLeader.providers.toLocaleString()} IF education providers
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Most Developed Islamic Finance Markets — IFDI 2025">
        <div className="mb-4 text-center text-sm font-semibold text-gray-600">
          Most Developed Islamic Finance Markets — IFDI 2025
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {globalGlance.topIFDIMarkets.map((market, index) => {
            let accentColor: string = COLORS.teal
            if (index === 0) {
              accentColor = COLORS.goldLight
            } else if (index === 1) {
              accentColor = COLORS.textSecond
            } else if (index === 2) {
              accentColor = COLORS.gold
            }

            return (
              <IFDIRankCard
                key={market.country}
                country={market.country}
                flag={market.flag}
                rank={market.rank}
                medal={market.medal}
                accentColor={accentColor}
                delay={index * 100}
              />
            )
          })}
        </div>
      </SectionCard>

      <div className="mt-6 flex justify-end">
        <DownloadButton />
      </div>

      <div className="text-center text-xs text-gray-400">
        Source: ICD-LSEG Islamic Finance Development Report 2025 | {globalGlance.highlights.sourceNote} |
        {' '}All values in US$ billions unless noted
      </div>
    </div>
  )
}

function TabGlobalOverview() {
  const globalOverview = ISLAMIC_DATA.globalOverview
  const [expandedSector, setExpandedSector] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)
  const hoveredRegionData = globalOverview.regionalDistribution.find((item) => item.id === hoveredRegion)

  const processedRegionalDistribution = globalOverview.regionalDistribution.map((region) => ({
    ...region,
    color: getOverviewRegionColor(region.id, selectedRegion, region.color),
  }))

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader
        icon={LayoutDashboard}
        title="Global Overview"
        subtitle="How the Islamic finance industry is structured by sector, institution type, and region"
        accentColor={COLORS.ocean}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          icon={Globe2}
          label="Total Islamic Finance Assets"
          value={globalOverview.headline.totalAssets}
          subtitle={`${globalOverview.headline.yoyGrowth} Year-on-Year Growth`}
          accentColor={COLORS.ocean}
        />
        <KPICard
          icon={MapPin}
          label="Countries with IF Presence"
          value={globalOverview.headline.countriesWithPresence}
          subtitle="Across all major global regions"
          accentColor={COLORS.emerald}
          animated
        />
        <KPICard
          icon={Layers}
          label="Major Sectors & Asset Classes"
          value={globalOverview.headline.majorSectors}
          subtitle="Banking · Sukuk · Funds · OIFIs · Takaful"
          accentColor={COLORS.purple}
          animated
        />
      </div>

      <SectionCard title="Islamic Finance Industry Breakdown by Sector (2024)">
        {globalOverview.sectorBreakdown.map((sector, index) => (
          <SectorBreakdownRow
            key={sector.sector}
            sector={sector}
            index={index}
            isOpen={expandedSector === sector.sector}
            onToggle={() =>
              setExpandedSector((current) => (current === sector.sector ? null : sector.sector))
            }
          />
        ))}
        <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 text-teal-700">
          <div className="flex flex-col gap-4 font-semibold lg:flex-row lg:items-center">
            <div className="w-full lg:w-1/4">TOTAL</div>
            <div className="w-full lg:w-1/6 text-lg font-bold">{globalOverview.headline.totalAssetsExact}</div>
            <div className="w-full lg:w-2/5">
              <div className="flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white">
                  <div className="h-full w-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400" />
                </div>
                <span>100%</span>
              </div>
            </div>
            <div className="w-full lg:w-1/5">{globalOverview.headline.totalInstitutions.toLocaleString()} IFIs</div>
          </div>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Islamic Banking Institution Types (2024)">
          <div className="space-y-5">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <CircularProgressRing
                value={globalOverview.institutionBreakdown.fullyFledged.shareOfAssets}
                color={COLORS.teal}
                label="of IFI Assets"
              />
              <div className="text-center text-sm font-semibold text-teal-700">
                {globalOverview.institutionBreakdown.fullyFledged.count.toLocaleString()} Fully-Fledged Islamic Banks
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-100" />
              <div className="rounded-full border border-gray-200 px-2 py-0.5 text-xs uppercase tracking-[0.2em] text-gray-400">vs</div>
              <div className="h-px flex-1 bg-gray-100" />
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <CircularProgressRing
                value={globalOverview.institutionBreakdown.windows.shareOfAssets}
                color={COLORS.ocean}
                label="of IFI Assets"
              />
              <div className="text-center text-sm font-semibold text-cyan-700">
                {globalOverview.institutionBreakdown.windows.count.toLocaleString()} Islamic Banking Windows
              </div>
            </div>

            <div className="rounded-xl bg-gray-100 p-3 text-xs italic text-gray-500">
              💡 Fully-fledged institutions hold nearly {Math.round(((globalOverview.institutionBreakdown.fullyFledged.shareOfAssets / globalOverview.institutionBreakdown.fullyFledged.count) / (globalOverview.institutionBreakdown.windows.shareOfAssets / globalOverview.institutionBreakdown.windows.count)))}× more assets per institution than Islamic banking windows
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Regional Distribution of IF Assets (%, 2024)">
          <div className="relative h-[300px]">
            <ResponsivePie
              data={processedRegionalDistribution}
              innerRadius={0.6}
              padAngle={0.8}
              cornerRadius={3}
              colors={{ datum: 'data.color' }}
              theme={NIVO_THEME}
              margin={{ top: 10, right: 20, bottom: 90, left: 20 }}
              arcLabelsSkipAngle={8}
              arcLabel={formatGlobalOverviewArcLabel}
              arcLabelsTextColor={COLORS.textPrimary}
              tooltip={GlobalOverviewPieTooltipRenderer}
              onClick={(datum) =>
                setSelectedRegion((current) => (current === String(datum.id) ? null : String(datum.id)))
              }
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{globalOverview.headline.regionsCount} Regions</div>
                <div className="text-xs text-gray-500">Asset distribution</div>
              </div>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-2">
            {globalOverview.regionalDistribution.map((region) => {
              const isActive = selectedRegion === region.id
              return (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => setSelectedRegion((current) => (current === region.id ? null : region.id))}
                  className="flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition-colors"
                  style={{
                    borderColor: isActive ? region.color : COLORS.cardBorder,
                    color: isActive ? COLORS.textPrimary : COLORS.textSecond,
                    backgroundColor: isActive ? colorWithAlpha(region.color, '22') : 'transparent',
                  }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: region.color }} />
                  {region.label}
                </button>
              )
            })}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Regional Islamic Finance Asset Share">
        <div className="relative">
          {hoveredRegion && (
            <div className="mb-3 inline-flex rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 shadow-lg">
              {formatOverviewHoverText(hoveredRegionData)}
            </div>
          )}
          <div className="flex gap-px overflow-hidden rounded-xl bg-white/20">
            {globalOverview.regionalDistribution.map((region, index) => (
              <RegionDominanceSegment
                key={region.id}
                region={region}
                index={index}
                isHovered={hoveredRegion === region.id}
                onHover={() => setHoveredRegion(region.id)}
                onLeave={() => setHoveredRegion(null)}
              />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {globalOverview.regionalDistribution.map((region) => (
              <div key={region.id} className="flex items-center gap-2 text-xs text-gray-500">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: region.color }} />
                <span>{region.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl border border-teal-200 bg-teal-950 p-3 text-center text-sm text-teal-700">
            🌍 OIC Countries represent {globalOverview.headline.oicCountriesAssetShare}% of total global Islamic finance assets
          </div>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <DownloadButton />
      </div>

      <div className="text-center text-xs text-gray-400">
        Source: ICD-LSEG Islamic Finance Development Report 2025 | Data covers global IF structure across all major regions | All values in US$ billions unless noted
      </div>
    </div>
  )
}

function TabIslamicBanking() {
  const islamicBanking = ISLAMIC_DATA.islamicBanking
  const actualGrowth = islamicBanking.assetsGrowth.filter((item) => !item.projected)
  const composedGrowthData = islamicBanking.assetsGrowth.map((item) => ({
    ...item,
    actualValue: item.projected ? null : item.value,
    projectedValue: item.projected ? item.value : item.year === '2024' ? item.value : null,
  }))
  const timelineData = actualGrowth
  const topTwoAssets = islamicBanking.topCountries[0].value + islamicBanking.topCountries[1].value

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader
        icon={Building2}
        title="Islamic Banking"
        subtitle="Premium intelligence view into the largest segment of Islamic finance"
        accentColor={COLORS.teal}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          icon={Landmark}
          label="Total Islamic Banking Assets"
          value={islamicBanking.headline.totalAssets}
          subtitle={`${islamicBanking.headline.shareOfIfAssets} of all Islamic finance assets`}
          accentColor={COLORS.teal}
        />
        <KPICard
          icon={TrendingUp}
          label="Asset Growth in 2024"
          value={islamicBanking.headline.growth}
          subtitle="Strongest annual growth in recent years"
          accentColor={COLORS.goldLight}
        />
        <KPICard
          icon={Building2}
          label="Banks Including Islamic Windows"
          value={islamicBanking.headline.totalBanks}
          subtitle={`Present in ${islamicBanking.headline.marketsCount} markets globally`}
          accentColor={COLORS.ocean}
          animated
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <BankingInsightPill className="border-teal-500/30 bg-teal-500/15 text-teal-700" delay={800}>
          🏦 Islamic banking = {islamicBanking.headline.globalBankingShare} of global banking assets
        </BankingInsightPill>
        <BankingInsightPill className="border-amber-200 bg-amber-50 text-amber-700" delay={900}>
          📍 Sub-Saharan Africa: {islamicBanking.headline.subSaharanAfricaBanks} banks across {islamicBanking.headline.subSaharanAfricaCountries} countries
        </BankingInsightPill>
        <BankingInsightPill className="border-cyan-500/30 bg-cyan-500/15 text-cyan-700" delay={1000}>
          🔀 Windows account for {islamicBanking.headline.windowsBankShare} of banks but only {islamicBanking.headline.windowsAssetShare} of assets
        </BankingInsightPill>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <SectionCard title="Islamic Banking Asset Growth (2018 → 2029 Projected)" className="lg:col-span-3">
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <ComposedChart data={composedGrowthData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="bankingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.teal} stopOpacity={1} />
                    <stop offset="100%" stopColor={COLORS.teal} stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={COLORS.cardBorder} strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fill: COLORS.textSecond, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: COLORS.textSecond, fontSize: 11 }}
                  tickFormatter={formatBankingGrowthTick}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip
                  content={<BankingGrowthTooltip />}
                  contentStyle={RECHARTS_TOOLTIP_STYLE.contentStyle}
                  labelStyle={RECHARTS_TOOLTIP_STYLE.labelStyle}
                  itemStyle={RECHARTS_TOOLTIP_STYLE.itemStyle}
                />
                <ReferenceLine
                  x="2024"
                  stroke={COLORS.tealLight}
                  strokeDasharray="4 2"
                  label={{ value: 'US$4.32tn · 2024', fill: COLORS.tealLight, fontSize: 11, position: 'top' }}
                />
                <Bar
                  dataKey="actualValue"
                  fill="url(#bankingGradient)"
                  radius={[4, 4, 0, 0]}
                  barSize={34}
                  isAnimationActive
                  animationDuration={1200}
                />
                <Line
                  type="monotone"
                  dataKey="projectedValue"
                  stroke={COLORS.goldLight}
                  strokeWidth={2}
                  strokeDasharray="8 4"
                  dot={{ fill: COLORS.goldLight, r: 5 }}
                  connectNulls
                  isAnimationActive
                  animationBegin={600}
                  animationDuration={1200}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Islamic Banking Assets by Region (US$bn, 2024)" className="lg:col-span-2">
          <div className="relative h-[340px]">
            <ResponsivePie
              data={islamicBanking.regionalAssets}
              innerRadius={0.62}
              padAngle={0.6}
              cornerRadius={4}
              colors={{ datum: 'data.color' }}
              theme={NIVO_THEME}
              margin={{ top: 10, right: 10, bottom: 90, left: 10 }}
              arcLabel={formatBankingRegionArcLabel}
              arcLabelsSkipAngle={12}
              arcLabelsTextColor={COLORS.textPrimary}
              tooltip={BankingRegionTooltipRenderer}
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{islamicBanking.headline.totalAssets}</div>
                <div className="text-xs text-gray-500">Regional Split</div>
              </div>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-3 text-xs text-teal-700">
              MENA dominates: {formatUsdValue(islamicBanking.headline.menaDominanceValue)} ({islamicBanking.headline.menaDominanceShare})
            </div>
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 text-xs text-purple-700">
              Southeast Asia growing: {formatUsdValue(islamicBanking.headline.southeastAsiaValue)}
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Top 10 Countries by Islamic Banking Assets (US$bn, 2024)">
        <div className="space-y-3">
          {islamicBanking.topCountries.map((country, index) => (
            <BankingCountryRow
              key={country.country}
              country={country}
              index={index}
              maxValue={islamicBanking.topCountries[0].value}
            />
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-100 p-4 text-xs leading-relaxed text-gray-500">
          💡 Key Insight: Iran and Saudi Arabia alone account for {formatUsdValue(topTwoAssets)} — 68% of total Islamic banking assets globally. Malaysia leads Southeast Asia with {formatUsdValue(islamicBanking.topCountries[2].value)} while Indonesia shows strong growth momentum.
        </div>
      </SectionCard>

      <SectionCard title="Islamic Banking Asset Growth Journey — US$1.685tn to US$4.32tn in 6 Years">
        <div className="mb-3 flex items-center justify-between text-xs">
          <span className="text-gray-500">2018: {formatUsdValue(timelineData[0].value)}</span>
          <span className="text-gray-400">→</span>
          <span className="font-bold text-teal-700">2024: {formatUsdValue(timelineData[timelineData.length - 1].value)} (+156%)</span>
        </div>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={timelineData} margin={{ top: 16, right: 16, left: 16, bottom: 16 }}>
              <defs>
                <linearGradient id="bankingAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.teal} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={COLORS.teal} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis hide dataKey="year" />
              <YAxis hide />
              <RechartsTooltip
                content={<BankingGrowthTooltip />}
                contentStyle={RECHARTS_TOOLTIP_STYLE.contentStyle}
                labelStyle={RECHARTS_TOOLTIP_STYLE.labelStyle}
                itemStyle={RECHARTS_TOOLTIP_STYLE.itemStyle}
              />
              {timelineData.map((point) => (
                <ReferenceLine
                  key={point.year}
                  x={point.year}
                  stroke="transparent"
                  label={{ value: point.year, position: 'insideBottom', fill: COLORS.textSecond, fontSize: 10 }}
                />
              ))}
              <Area
                type="monotone"
                dataKey="value"
                stroke={COLORS.teal}
                strokeWidth={3}
                fill="url(#bankingAreaGradient)"
                isAnimationActive
                animationDuration={1400}
                dot={{ r: 3, fill: COLORS.tealLight, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: COLORS.tealLight }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 border-t border-amber-500/20 pt-2 text-center text-xs text-amber-600">
          2029 Projection: {formatUsdValue(islamicBanking.assetsGrowth[islamicBanking.assetsGrowth.length - 1].value)} (CAGR ~8%)
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <DownloadButton />
      </div>

      <div className="text-center text-xs text-gray-400">
        Source: ICD-LSEG Islamic Finance Development Report 2025 | Islamic banking data covers 84 markets globally | All values in US$ billions unless noted
      </div>
    </div>
  )
}

function TabTakaful() {
  const takaful = ISLAMIC_DATA.takaful
  const growthData = takaful.assetsGrowth.map((item) => ({
    ...item,
    actualValue: item.projected ? null : item.value,
    projectedValue: item.projected ? item.value : item.year === '2024' ? item.value : null,
  }))

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader
        icon={Shield}
        title="Takaful"
        subtitle="Fastest-growing segment in Islamic finance, with expanding global market participation"
        accentColor={COLORS.gold}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          icon={Shield}
          label="Total Takaful Assets"
          value={takaful.headline.totalAssets}
          subtitle={`${takaful.headline.shareOfIfAssets} of total Islamic finance assets`}
          accentColor={COLORS.gold}
        />
        <KPICard
          icon={TrendingUp}
          label="Fastest Growing IF Sector in 2024"
          value={takaful.headline.growth}
          subtitle="Surpassed all other IF sectors in growth rate"
          accentColor={COLORS.goldLight}
        />
        <KPICard
          icon={Users}
          label="Takaful Operators Globally"
          value={takaful.headline.totalOperators}
          subtitle={`Active across ${takaful.headline.activeCountries} countries`}
          accentColor={COLORS.emerald}
          animated
        />
      </div>

      <div className="animate-in slide-in-from-top-3 duration-500 rounded-xl border border-amber-800/50 bg-amber-950/50 p-4 text-amber-600">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15">
              <Shield className="h-5 w-5 text-amber-600" />
            </div>
            <div className="text-sm font-semibold">
              🚀 Takaful is the fastest growing sector in Islamic finance — {takaful.headline.growth} growth in 2024, projecting {takaful.headline.projectedAssets2029} by 2029
            </div>
          </div>
          <div className="hidden items-end gap-1 sm:flex">
            <span className="h-3 w-2 rounded-t bg-amber-600/60" />
            <span className="h-5 w-2 rounded-t bg-amber-500/75" />
            <span className="h-7 w-2 rounded-t bg-amber-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <SectionCard title="Takaful Assets Growth (2018–2029)" className="lg:col-span-3">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={growthData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="takafulGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.gold} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={COLORS.gold} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={COLORS.cardBorder} strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fill: COLORS.textSecond, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: COLORS.textSecond, fontSize: 11 }} axisLine={false} tickLine={false} />
                <RechartsTooltip
                  content={<TakafulGrowthTooltip />}
                  contentStyle={RECHARTS_TOOLTIP_STYLE.contentStyle}
                  labelStyle={RECHARTS_TOOLTIP_STYLE.labelStyle}
                  itemStyle={RECHARTS_TOOLTIP_STYLE.itemStyle}
                />
                <ReferenceLine x="2023" stroke={COLORS.gold} strokeDasharray="4 2" />
                <ReferenceLine x="2024" stroke={COLORS.goldLight} strokeDasharray="4 2" label={{ value: '📈 +26% in 2024', fill: COLORS.goldLight, fontSize: 11, position: 'insideTopRight' }} />
                <Area
                  type="monotone"
                  dataKey="actualValue"
                  stroke={COLORS.gold}
                  strokeWidth={2}
                  fill="url(#takafulGradient)"
                  isAnimationActive
                  animationDuration={1400}
                  dot={(props) => {
                    const is2024 = props.payload?.year === '2024'
                    return (
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={is2024 ? 6 : 4}
                        fill={is2024 ? COLORS.goldLight : COLORS.gold}
                        className={is2024 ? 'animate-pulse' : undefined}
                      />
                    )
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="projectedValue"
                  stroke={COLORS.goldLight}
                  strokeDasharray="6 3"
                  strokeWidth={2}
                  connectNulls
                  dot={{ fill: COLORS.goldLight, r: 5 }}
                  isAnimationActive
                  animationBegin={500}
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-600">
              {takaful.headline.growthSince2018Multiple} growth since 2018 (US$45bn → US$136bn)
            </span>
            <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-600">
              Projected to reach {takaful.headline.projectedAssets2029} by 2029
            </span>
          </div>
        </SectionCard>

        <SectionCard title="Regional Takaful Distribution (2024)" className="lg:col-span-2">
          <div className="relative h-[320px]">
            <ResponsivePie
              data={takaful.regionalAssets}
              innerRadius={0.62}
              padAngle={0.8}
              cornerRadius={4}
              colors={{ datum: 'data.color' }}
              theme={NIVO_THEME}
              margin={{ top: 10, right: 10, bottom: 90, left: 10 }}
              arcLabel={formatTakafulRegionArcLabel}
              arcLabelsSkipAngle={15}
              arcLabelsTextColor={COLORS.textPrimary}
              tooltip={TakafulRegionTooltipRenderer}
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{takaful.headline.totalAssets}</div>
                <div className="text-xs text-gray-500">by Region</div>
              </div>
            </div>
          </div>
          <div className="mt-3 rounded-xl border border-amber-800 bg-amber-950 p-2 text-center text-xs text-amber-600">
            🇮🇷 Iran alone accounts for {takaful.headline.iranGlobalShare} of all Takaful assets globally
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Top 10 Countries by Takaful Assets (US$bn, 2024)">
        <div className="space-y-3">
          {takaful.topCountries.map((country, index) => (
            <div key={country.country} className="rounded-xl border border-gray-200 bg-gray-50/80 p-3">
              <CountryBar
                country={country.country}
                flag={country.flag}
                value={country.value}
                maxValue={takaful.topCountries[0].value}
                color={COLORS.gold}
                unit="bn"
                delay={index * 80}
                displayValue={formatTakafulCountryDisplay(country.value)}
                minWidthPercent={country.value < 1 ? 2 : 0}
              />
              {index === 0 && (
                <div className="mt-2 flex justify-end">
                  <span className="rounded-full bg-amber-950 px-2 py-0.5 text-xs text-amber-600">🏆 Global Takaful Leader</span>
                </div>
              )}
              {(index === 1 || index === 2) && (
                <div className="mt-2 text-right text-xs text-amber-600">
                  Top 3 markets account for {takaful.headline.topThreeShare} of Takaful assets
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-amber-200 bg-gray-100 p-4 text-xs leading-relaxed text-gray-500">
          💡 Takaful operators are present in {takaful.headline.activeCountries} countries. New markets joining in 2024-2025 include Uganda, Philippines, and potentially Australia. GCC consolidation is ongoing with multiple merger discussions in Saudi Arabia and UAE.
        </div>
      </SectionCard>

      <SectionCard title="New & Emerging Takaful Markets — 2024/2025">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {takaful.emergingMarkets.map((market, index) => (
            <TakafulMarketCard key={market.country} market={market} index={index} />
          ))}
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <DownloadButton />
      </div>

      <div className="text-center text-xs text-gray-400">
        Source: ICD-LSEG Islamic Finance Development Report 2025 | Takaful data spans {takaful.headline.activeCountries} countries | All values in US$ billions unless noted
      </div>
    </div>
  )
}

function TabOtherIFIs() {
  const otherIFIs = ISLAMIC_DATA.otherIFIs
  const growthData = otherIFIs.assetsGrowth.map((item) => ({
    ...item,
    actualValue: item.projected ? null : item.value,
    projectedValue: item.projected ? item.value : item.year === '2024' ? item.value : null,
  }))
  const topFour = otherIFIs.topCountries.slice(0, 4)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader
        icon={Landmark}
        title="Other IFIs"
        subtitle="Specialist view of Islamic development finance, mudaraba, leasing and microfinance institutions"
        accentColor={COLORS.purple}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          icon={Building}
          label="Total Other IFI Assets"
          value={otherIFIs.headline.totalAssets}
          subtitle={`${otherIFIs.headline.shareOfIfAssets} of total Islamic finance assets`}
          accentColor={COLORS.purple}
        />
        <KPICard
          icon={Activity}
          label="Asset Growth"
          value={otherIFIs.headline.growth}
          subtitle="Most stable segment in Islamic finance"
          accentColor={COLORS.emerald}
        />
        <KPICard
          icon={Landmark}
          label="Total Institutions"
          value={otherIFIs.headline.totalOIFIs}
          subtitle="Across all global regions"
          accentColor={COLORS.purpleLight}
          animated
        />
      </div>

      <div className="animate-in fade-in slide-in-from-top-3 duration-500 rounded-xl border border-purple-800/50 bg-purple-950/50 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15">
              <Landmark className="h-5 w-5 text-purple-400" />
            </div>
            <div className="text-sm text-purple-700">
              Other IFIs maintain the most consistent growth trajectory in Islamic finance, acting as a stabilizing layer through global rate shocks and post-COVID restructuring.
            </div>
          </div>
          <div className="text-right text-sm font-bold text-gray-900">
            {otherIFIs.headline.stabilityWindowStart} to {otherIFIs.headline.stabilityWindowEnd} in 6 years
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <SectionCard title="Other IFI Asset Trend (2018-2029)" className="lg:col-span-3">
          <div className="relative h-[320px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={growthData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={COLORS.cardBorder} strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fill: COLORS.textSecond, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: COLORS.textSecond, fontSize: 11 }} axisLine={false} tickLine={false} />
                <RechartsTooltip
                  content={<OifiGrowthTooltip />}
                  contentStyle={RECHARTS_TOOLTIP_STYLE.contentStyle}
                  labelStyle={RECHARTS_TOOLTIP_STYLE.labelStyle}
                  itemStyle={RECHARTS_TOOLTIP_STYLE.itemStyle}
                />
                <ReferenceLine
                  x="2021"
                  stroke={COLORS.crimson}
                  strokeDasharray="3 3"
                  label={{ value: 'Market consolidation', position: 'top', fill: COLORS.crimson, fontSize: 11 }}
                />
                <Line
                  type="monotone"
                  dataKey="actualValue"
                  stroke={COLORS.purple}
                  strokeWidth={3}
                  dot={{ fill: COLORS.purple, r: 5, strokeWidth: 2, stroke: '#fff' }}
                  connectNulls
                  isAnimationActive
                  animationDuration={1200}
                />
                <Line
                  type="monotone"
                  dataKey="projectedValue"
                  stroke={COLORS.goldLight}
                  strokeWidth={2}
                  strokeDasharray="8 4"
                  dot={{ fill: COLORS.goldLight, r: 6 }}
                  connectNulls
                  isAnimationActive
                  animationBegin={600}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute left-[44%] top-[63%] rounded-full bg-red-500/10 px-2 py-1 text-[11px] text-red-300 animate-in fade-in duration-500" style={{ animationDelay: '1000ms' }}>
              Dip reflects post-COVID institutional restructuring
            </div>
            <div className="pointer-events-none absolute right-[24%] top-[26%] text-xs text-emerald-400 animate-in fade-in duration-500" style={{ animationDelay: '1400ms' }}>
              Recovery path
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Regional Distribution (2024)" className="lg:col-span-2">
          <div className="relative h-[320px]">
            <ResponsivePie
              data={otherIFIs.regionalAssets}
              innerRadius={0.62}
              padAngle={0.8}
              cornerRadius={4}
              colors={{ datum: 'data.color' }}
              theme={NIVO_THEME}
              margin={{ top: 10, right: 10, bottom: 90, left: 10 }}
              arcLabel={formatOifiRegionArcLabel}
              arcLabelsSkipAngle={15}
              arcLabelsTextColor={COLORS.textPrimary}
              tooltip={OifiRegionTooltipRenderer}
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{otherIFIs.headline.totalAssets}</div>
                <div className="text-xs text-gray-500">by Region</div>
              </div>
            </div>
          </div>
          <div className="mt-3 rounded-xl border border-purple-800 bg-purple-950 p-2 text-center text-xs text-purple-700">
            GCC holds US${otherIFIs.headline.gccValue}bn ({otherIFIs.headline.gccShare}), followed by Southeast Asia at US${otherIFIs.headline.southeastAsiaValue}bn ({otherIFIs.headline.southeastAsiaShare})
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Top 10 Countries by Other IFI Assets (US$bn, 2024)">
        <div className="space-y-3">
          {otherIFIs.topCountries.map((country, index) => (
            <div key={country.country} className="rounded-xl border border-gray-200 bg-gray-50/80 p-3">
              <CountryBar
                country={country.country}
                flag={country.flag}
                value={country.value}
                maxValue={otherIFIs.topCountries[0].value}
                color={COLORS.purple}
                unit="bn"
                delay={index * 80}
              />
              {index === 0 && (
                <div className="mt-2 flex justify-end">
                  <span className="rounded-full bg-purple-950 px-2 py-0.5 text-xs text-purple-700">#1 OIFI hub</span>
                </div>
              )}
              {country.country === 'Switzerland' && (
                <div className="mt-2 text-right text-xs text-gray-500">
                  Leading non-OIC OIFI market
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {topFour.map((country) => (
            <OifiHighlightCard
              key={country.country}
              country={country.country}
              flag={country.flag}
              value={country.value}
              progress={country.value / otherIFIs.topCountries[0].value}
            />
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-purple-200 bg-gray-100 p-4 text-xs leading-relaxed text-gray-500">
          Pakistan's OIFI sector is dominated by mudaraba companies, while Switzerland stands out as the leading non-OIC institutional booking center for Islamic development finance.
        </div>
      </SectionCard>

      <SectionCard title="What Sits Inside Other IFIs?">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {otherIFIs.composition.map((item, index) => {
            const Icon = getCompositionIcon(item.icon)

            return (
              <div
                key={item.title}
                className="animate-in fade-in slide-in-from-bottom-4 rounded-xl border border-gray-200 bg-gray-100 p-4 transition-colors hover:border-purple-600 duration-500"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="mb-3 flex items-center gap-2" style={{ color: item.accent }}>
                  <Icon className="h-5 w-5" />
                  <div className="font-semibold">{item.title}</div>
                </div>
                <div className="text-sm leading-relaxed text-gray-500">{item.description}</div>
                <div className="mt-4 text-xs text-gray-600">{item.countries}</div>
              </div>
            )
          })}
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <DownloadButton />
      </div>

      <div className="text-center text-xs text-gray-400">
        Source: ICD-LSEG Islamic Finance Development Report 2025 | Other IFIs include development finance, mudaraba, leasing and microfinance institutions | All values in US$ billions unless noted
      </div>
    </div>
  )
}

function TabSukuk() {
  const sukuk = ISLAMIC_DATA.sukuk
  const [milestoneAnimated, setMilestoneAnimated] = useState(0)
  const govtShare = Number.parseInt(sukuk.headline.govtShareOfIssuance, 10)
  const corporateShare = 100 - govtShare
  const projectedYear = sukuk.valueGrowth[sukuk.valueGrowth.length - 1]
  const maxCountryValue = sukuk.topCountries[0].value

  useEffect(() => {
    const duration = 2000
    const steps = 80
    const increment = 1031 / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= 1031) {
        setMilestoneAnimated(1031)
        clearInterval(timer)
      } else {
        setMilestoneAnimated(current)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [])

  const milestoneLabel = `US$${(milestoneAnimated / 1000).toFixed(3)}tn`

  const sukukBarData = sukuk.valueGrowth.map((item) => ({
    ...item,
    isMilestone: item.year === '2024',
    isProjected: item.projected,
  }))

  const SukukGrowthTooltip = ({
    active,
    payload,
    label,
  }: Readonly<{
    active?: boolean
    payload?: ReadonlyArray<{ value?: number; payload?: { year?: string; isMilestone?: boolean; isProjected?: boolean } }>
    label?: string
  }>) => {
    if (!active || !payload?.length || typeof payload[0]?.value !== 'number') {
      return null
    }

    const item = payload[0].payload

    return (
      <div className="rounded-xl border border-cyan-200 bg-white px-3 py-2 text-xs text-gray-800 shadow-xl">
        <div className="mb-1 font-semibold text-cyan-700">{label}</div>
        <div>{formatUsdValue(payload[0].value)}</div>
        {item?.isMilestone && <div className="mt-1 text-amber-600">Historic trillion milestone reached</div>}
        {item?.isProjected && (
          <div className="mt-2">
            <ProjectedBadge />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader
        icon={TrendingUp}
        title="Sukuk"
        subtitle="Global sukuk outstanding, issuance trends &amp; regional distribution"
        accentColor={COLORS.ocean}
      />

      <div
        className="animate-in fade-in slide-in-from-top-6 duration-700 rounded-2xl border p-6 mb-4 bg-gradient-to-r from-[#0891B2]/20 via-[#0D9488]/20 to-[#0891B2]/20"
        style={{ borderColor: `${COLORS.ocean}99` }}
      >
        <div className="flex flex-col items-center text-center w-full">
          <Trophy className="h-16 w-16 text-amber-600 animate-bounce [animation-iteration-count:1]" />
          <p className="text-amber-600 font-black text-2xl tracking-widest uppercase mt-3">
            Historic Milestone Achieved
          </p>
          <p className="text-gray-600 text-lg mt-1">Global Sukuk Market Crosses</p>
          <p
            className="text-gray-900 font-black text-5xl animate-pulse"
            style={{ textShadow: '0 0 18px rgba(8,145,178,0.45)' }}
          >
            {milestoneLabel}
          </p>
          <p className="text-gray-500 text-base mt-1">in Outstanding Value - 2024</p>
          <p className="text-gray-400 text-sm mt-2">
            Global issuance rose {sukuk.headline.globalIssuanceGrowth} to US${sukuk.headline.globalIssuance2024}bn in 2024 · Governments account for {sukuk.headline.govtShareOfIssuance} of issuances
          </p>

          <div className="mt-4 grid w-full max-w-4xl grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-teal-200 bg-white/80 px-3 py-2 text-sm text-teal-700">
              {sukuk.headline.globalIssuanceGrowth} ↑ Global Issuance Growth
            </div>
            <div className="rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-900">
              US${sukuk.headline.globalIssuance2024}bn Total 2024 Issuance
            </div>
            <div className="rounded-xl border border-cyan-200 bg-white/80 px-3 py-2 text-sm text-cyan-700">
              {sukuk.headline.govtShareOfIssuance} Government Issuers
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          icon={TrendingUp}
          label="Sukuk Outstanding Value"
          value={sukuk.headline.totalOutstanding}
          subtitle="Historic first trillion milestone"
          accentColor={COLORS.ocean}
        />
        <KPICard
          icon={ArrowUpRight}
          label="Growth in Outstanding Value"
          value={sukuk.headline.growth}
          subtitle="Year-on-year 2023 to 2024"
          accentColor={COLORS.emerald}
        />
        <KPICard
          icon={FileText}
          label="Sukuk Outstanding Instruments"
          value={sukuk.headline.numberOutstanding}
          subtitle="Across all global markets"
          accentColor={COLORS.purple}
          animated
        />
        <KPICard
          icon={DollarSign}
          label="2024 Global Issuance"
          value={`US$${sukuk.headline.globalIssuance2024}bn`}
          subtitle="11% increase from 2023"
          accentColor={COLORS.goldLight}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <SectionCard title="Sukuk Outstanding Value Growth - The Road to US$1 Trillion" className="lg:col-span-3">
          <div className="relative h-[360px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={sukukBarData} margin={{ top: 30, right: 18, left: 6, bottom: 8 }}>
                <defs>
                  <linearGradient id="sukukGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0891B2" />
                    <stop offset="100%" stopColor="#065F73" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={COLORS.cardBorder} strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fill: COLORS.textSecond, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: COLORS.textSecond, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value: number) => (value >= 1000 ? `${(value / 1000).toFixed(1)}T` : `${value}bn`)}
                />
                <RechartsTooltip
                  content={<SukukGrowthTooltip />}
                  contentStyle={RECHARTS_TOOLTIP_STYLE.contentStyle}
                  labelStyle={RECHARTS_TOOLTIP_STYLE.labelStyle}
                  itemStyle={RECHARTS_TOOLTIP_STYLE.itemStyle}
                />
                <ReferenceLine
                  y={1000}
                  stroke="#F59E0B"
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  label={{ value: '- US$1 TRILLION MARK', position: 'right', fill: '#F59E0B', fontSize: 11 }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={1400}>
                  {sukukBarData.map((entry) => {
                    const isMilestone = entry.isMilestone
                    const isProjected = entry.isProjected

                    return (
                      <Cell
                        key={entry.year}
                        fill={isProjected ? '#D97706' : isMilestone ? '#0891B2' : 'url(#sukukGradient)'}
                        fillOpacity={isProjected ? 0.4 : 1}
                        stroke={isMilestone ? '#F59E0B' : isProjected ? '#F59E0B' : 'transparent'}
                        strokeWidth={isMilestone ? 2 : isProjected ? 1.5 : 0}
                        strokeDasharray={isProjected ? '4 3' : undefined}
                      />
                    )
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute left-[68%] top-[10%] rounded-full bg-amber-500/15 px-2 py-1 text-[11px] font-bold text-amber-600">
              🏆 US$1tn
            </div>
            <div className="pointer-events-none absolute right-[2%] top-[0%] rounded-full bg-amber-500/15 px-2 py-1 text-[11px] text-amber-600">
              📊 Projected: {formatUsdValue(projectedYear.value)}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Sukuk Outstanding by Region (US$bn, 2024)" className="lg:col-span-2">
          <div className="relative h-[360px] animate-in fade-in zoom-in-95 duration-700">
            <ResponsivePie
              data={sukuk.regionalOutstanding}
              innerRadius={0.62}
              padAngle={0.6}
              cornerRadius={4}
              colors={{ datum: 'data.color' }}
              theme={NIVO_THEME}
              margin={{ top: 10, right: 10, bottom: 90, left: 10 }}
              arcLabel={(d) => `US$${d.value}bn`}
              arcLabelsSkipAngle={12}
              arcLabelsTextColor={COLORS.textPrimary}
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">US$1.031tn</div>
                <div className="text-xs text-gray-500">Outstanding</div>
              </div>
            </div>
          </div>
          <div className="mt-3 rounded-xl border border-cyan-200 bg-gray-100 p-3 text-center text-xs text-gray-600">
            ⚖️ GCC (US$477bn) vs Southeast Asia (US$452bn) — the two dominant sukuk regions are virtually neck-and-neck, together representing 90% of global outstanding sukuk
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Top 10 Countries by Sukuk Outstanding (US$bn, 2024)">
        <div className="space-y-3">
          {sukuk.topCountries.map((country, index) => {
            let color: string = COLORS.textMuted
            if (index <= 1) {
              color = COLORS.ocean
            } else if (index <= 4) {
              color = COLORS.purple
            }

            return (
              <div key={country.country} className="rounded-xl border border-gray-200 bg-gray-50/80 p-3">
                <CountryBar
                  country={country.country}
                  flag={country.flag}
                  value={country.value}
                  maxValue={maxCountryValue}
                  color={color}
                  unit="bn"
                  delay={index * 80}
                />

                {country.country === 'Malaysia' && (
                  <div className="mt-2 space-y-1 text-right">
                    <span className="rounded-full bg-cyan-950 px-2 py-0.5 text-xs text-cyan-700">🥇 World's Largest Sukuk Market</span>
                    <div className="text-xs text-cyan-700">Malaysia accounts for {sukuk.headline.malaysiaGlobalShare} of all global sukuk outstanding</div>
                  </div>
                )}

                {country.country === 'Saudi Arabia' && (
                  <div className="mt-2 space-y-1 text-right">
                    <span className="rounded-full bg-teal-950 px-2 py-0.5 text-xs text-teal-700">🥈 GCC Leader - US${sukuk.headline.saudiIssuance2024}bn issued in 2024 alone</span>
                    <div className="text-xs text-teal-700">{sukuk.headline.saudiIssuanceGrowth} surge in 2024 issuance driven by Vision 2030 financing</div>
                  </div>
                )}

                {country.country === 'Indonesia' && (
                  <div className="mt-2 text-right text-xs text-purple-700">🏆 World's #1 Green Sukuk Issuer</div>
                )}

                {country.country === 'UAE' && (
                  <div className="mt-2 text-right text-xs text-gray-600">US$100bn outstanding - major hub for ESG sukuk</div>
                )}

                {index === 3 && (
                  <div className="mt-4 border-t border-gray-200 pt-2 text-xs text-gray-400">Emerging sukuk markets</div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-4 rounded-xl border border-cyan-200 bg-gray-100 p-4 text-xs leading-relaxed text-gray-500">
          💡 Sukuk Market Intelligence: {sukuk.headline.globalMaturityBy2030} of outstanding sukuk mature by 2030, with US${sukuk.headline.maturingIn2025}bn due in 2025 alone. Saudi Aramco, PIF, and Saudi Electricity Company were major 2024 issuers. AAOIFI's Standard 62 (delayed to 2026) will reshape sukuk structures by requiring actual legal asset transfer.
        </div>
      </SectionCard>

      <SectionCard title="2024 Sukuk Issuance Highlights">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-xl border border-gray-200 bg-gray-100 p-5 transition-colors hover:border-cyan-600" style={{ animationDelay: '0ms' }}>
            <div className="mb-3 flex items-center gap-2 text-amber-600">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-semibold">Saudi Arabia Surge</span>
            </div>
            <div className="text-2xl font-bold text-amber-600">US${sukuk.headline.saudiIssuance2024}bn</div>
            <div className="mt-1 text-xs text-gray-600">Saudi Arabia 2024 Issuance</div>
            <p className="mt-3 text-xs leading-relaxed text-gray-500">
              {sukuk.headline.saudiIssuanceGrowth} surge from 2023. Saudi government raised US$42.3bn including US$17bn for debt refinancing.
            </p>
            <div className="mt-4">
              <div className="mb-1 text-[11px] text-gray-400">Share of global issuance</div>
              <div className="h-2 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-amber-400" style={{ width: `${(sukuk.headline.saudiIssuance2024 / sukuk.headline.globalIssuance2024) * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-xl border border-gray-200 bg-gray-100 p-5 transition-colors hover:border-cyan-600" style={{ animationDelay: '120ms' }}>
            <div className="mb-3 flex items-center gap-2 text-cyan-400">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-semibold">Government Dominance</span>
            </div>
            <div className="text-2xl font-bold text-cyan-400">{sukuk.headline.govtShareOfIssuance}</div>
            <div className="mt-1 text-xs text-gray-600">Government Share of Issuance</div>
            <p className="mt-3 text-xs leading-relaxed text-gray-500">
              Sovereigns dominate driven by fiscal deficits and refinancing needs. {corporateShare}% from corporates and agencies.
            </p>
            <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-white">
              <div className="h-full bg-cyan-500" style={{ width: `${govtShare}%` }} />
              <div className="h-full bg-gray-300" style={{ width: `${corporateShare}%` }} />
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-xl border border-gray-200 bg-gray-100 p-5 transition-colors hover:border-cyan-600" style={{ animationDelay: '240ms' }}>
            <div className="mb-3 flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm font-semibold">Maturity Wall</span>
            </div>
            <div className="text-2xl font-bold text-amber-600">US${sukuk.headline.maturingIn2025}bn</div>
            <div className="mt-1 text-xs text-gray-600">Sukuk Maturing in 2025</div>
            <p className="mt-3 text-xs leading-relaxed text-gray-500">
              {sukuk.headline.globalMaturityBy2030} of outstanding sukuk mature by 2030. Expected to keep issuance elevated as refinancing needs grow.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white">
                <div className="h-full animate-pulse rounded-full bg-amber-500" style={{ width: `${(sukuk.headline.maturingIn2025 / sukuk.headline.globalIssuance2024) * 100}%` }} />
              </div>
              <span className="text-[11px] text-amber-600">Elevated refinancing cycle</span>
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <DownloadButton />
      </div>

      <div className="text-center text-xs text-gray-400">
        Source: ICD-LSEG Islamic Finance Development Report 2025 | Sukuk are the second-largest Islamic finance sector and crossed US$1 trillion in 2024 | All values in US$ billions unless noted
      </div>
    </div>
  )
}

function TabIslamicFunds() {
  const funds = ISLAMIC_DATA.islamicFunds
  const growthData = funds.aumGrowth.map((item) => ({
    ...item,
    actualValue: item.projected ? null : item.value,
    projectedValue: item.projected ? item.value : item.year === '2024' ? item.value : null,
  }))
  const topCountryValue = funds.topCountries[0].value

  function FundsGrowthTooltip({
    active,
    payload,
    label,
  }: Readonly<{
    active?: boolean
    payload?: Array<{ value?: number | null; payload?: { year?: string; projected?: boolean } }>
    label?: string
  }>) {
    if (!active || !payload?.length) {
      return null
    }

    const item = payload.find((entry) => typeof entry.value === 'number' && entry.value !== null)
    if (!item || typeof item.value !== 'number') {
      return null
    }

    return (
      <div className="rounded-xl border border-purple-200 bg-white px-3 py-2 text-xs text-gray-800 shadow-xl">
        <div className="mb-1 font-semibold text-purple-700">{label}</div>
        <div>{formatUsdValue(item.value)}</div>
        {label === '2022' && <div className="mt-1 italic text-red-300">(Global interest rate hike impact)</div>}
        {item.payload?.projected && (
          <div className="mt-2">
            <ProjectedBadge />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader
        icon={PieChart}
        title="Islamic Funds"
        subtitle="Investor-focused view of global Islamic funds, innovation and non-OIC market depth"
        accentColor={COLORS.purple}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          icon={PieChart}
          label="Total Islamic Funds AuM"
          value={funds.headline.totalAuM}
          subtitle={`${funds.headline.shareOfIfAssets} of total Islamic finance assets`}
          accentColor={COLORS.purple}
        />
        <KPICard
          icon={TrendingUp}
          label="AuM Growth in 2024"
          value={funds.headline.growth}
          subtitle="Strong recovery from 2022 dip"
          accentColor={COLORS.emerald}
        />
        <KPICard
          icon={Layers}
          label="Islamic Funds Outstanding"
          value={funds.headline.fundsOutstanding}
          subtitle="Across equity, sukuk, mixed & ESG funds"
          accentColor={COLORS.ocean}
          animated
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <BankingInsightPill className="border-purple-500/30 bg-purple-500/10 text-purple-700" delay={0}>
          🇬🇧 UK ranks 3rd globally - leading non-OIC Islamic fund market
        </BankingInsightPill>
        <BankingInsightPill className="border-teal-500/30 bg-teal-500/10 text-teal-700" delay={120}>
          🇺🇸 United States in top 10 - US${funds.headline.usValue}bn in Islamic AuM
        </BankingInsightPill>
        <BankingInsightPill className="border-amber-500/30 bg-amber-500/10 text-amber-600" delay={240}>
          📉 2022 dip (US$263bn to US$243bn) reflects global rate hike impact
        </BankingInsightPill>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <SectionCard title="Islamic Funds AuM Growth — Resilience After 2022 Dip" className="lg:col-span-3">
          <div className="relative h-[340px]">
            <p className="sr-only">Islamic Funds AuM growth chart from 2018 to projected 2029</p>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={growthData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fundsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={COLORS.cardBorder} strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fill: COLORS.textSecond, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: COLORS.textSecond, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value: number) => `${value}bn`} />
                <RechartsTooltip
                  content={<FundsGrowthTooltip />}
                  contentStyle={RECHARTS_TOOLTIP_STYLE.contentStyle}
                  labelStyle={RECHARTS_TOOLTIP_STYLE.labelStyle}
                  itemStyle={RECHARTS_TOOLTIP_STYLE.itemStyle}
                />
                <ReferenceLine x="2022" stroke={COLORS.crimson} strokeDasharray="3 3" label={{ value: 'Rate Hike Impact', position: 'top', fill: COLORS.crimson, fontSize: 11 }} />
                <Area
                  type="monotone"
                  dataKey="actualValue"
                  stroke={COLORS.purple}
                  strokeWidth={2}
                  fill="url(#fundsGradient)"
                  isAnimationActive
                  animationDuration={1300}
                  dot={{ fill: COLORS.purple, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="projectedValue"
                  stroke={COLORS.goldLight}
                  strokeDasharray="6 3"
                  strokeWidth={2}
                  connectNulls
                  isAnimationActive
                  animationBegin={500}
                  animationDuration={900}
                  dot={{ fill: COLORS.goldLight, r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute left-[38%] top-[20%] text-xs text-red-300">
              📉 -US${funds.headline.dipFrom2021}bn (Global rate cycle impact)
            </div>
            <div className="pointer-events-none absolute left-[56%] top-[12%] text-xs text-emerald-400">
              ↗ Recovery: +US${funds.headline.recoveryFrom2022}bn (2022→2024)
            </div>
            <div className="pointer-events-none absolute right-[2%] top-[4%] text-xs text-amber-600">
              📊 Projected: US${funds.headline.projected2029}bn by 2029
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Islamic Funds AuM by Region (US$bn, 2024)" className="lg:col-span-2">
          <div className="relative h-[340px]">
            <p className="sr-only">Islamic Funds regional AuM donut chart</p>
            <ResponsivePie
              data={funds.regionalAuM}
              innerRadius={0.62}
              padAngle={0.8}
              cornerRadius={4}
              colors={{ datum: 'data.color' }}
              theme={NIVO_THEME}
              margin={{ top: 10, right: 10, bottom: 90, left: 10 }}
              arcLabel={(d) => `US$${d.value}bn`}
              arcLabelsSkipAngle={15}
              arcLabelsTextColor={COLORS.textPrimary}
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{funds.headline.totalAuM}</div>
                <div className="text-xs text-gray-500">AuM by Region</div>
              </div>
            </div>
          </div>
          <div className="mt-3 rounded-xl border border-purple-800 bg-purple-950 p-3 text-center text-xs text-purple-700">
            🌍 Europe (US$64bn) outranks Southeast Asia (US$40bn) in Islamic funds — driven by Luxembourg and UK domiciliation
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Top 10 Countries by Islamic Funds AuM (US$bn, 2024)">
        <div className="space-y-3">
          {funds.topCountries.map((country, index) => (
            <div key={country.country} className="rounded-xl border border-gray-200 bg-gray-50/80 p-3">
              <CountryBar
                country={country.country}
                flag={country.flag}
                value={country.value}
                maxValue={topCountryValue}
                color={COLORS.purple}
                unit="bn"
                delay={index * 80}
              />

              {country.country === 'Iran' && (
                <div className="mt-2 text-right">
                  <span className="rounded-full bg-purple-950 px-2 py-0.5 text-xs text-purple-700">🥇 Largest AuM — Domestic market-driven</span>
                </div>
              )}
              {country.country === 'UAE' && (
                <div className="mt-2 text-right">
                  <span className="rounded-full bg-purple-950 px-2 py-0.5 text-xs text-purple-700">🥈 GCC Hub — Major fund domicile</span>
                </div>
              )}
              {country.country === 'United Kingdom' && (
                <>
                  <div className="mt-2 text-right">
                    <span className="rounded-full bg-purple-950 px-2 py-0.5 text-xs text-purple-700">🥉 🌍 Highest-ranked non-OIC country globally</span>
                  </div>
                  <div className="mx-4 mt-1 rounded-lg border border-purple-200 bg-purple-950/50 p-2 text-xs text-purple-700">
                    The UK's US${funds.headline.ukValue}bn Islamic fund market is driven by Shariah-compliant pension funds, ETFs, and the growing Muslim investor base accessing HSBC Islamic Global Equity Index.
                  </div>
                </>
              )}
              {country.country === 'Malaysia' && (
                <div className="mt-2 text-right">
                  <span className="rounded-full bg-purple-950 px-2 py-0.5 text-xs text-purple-700">4️⃣ SEA Hub — Largest Islamic fund market in Southeast Asia</span>
                </div>
              )}
              {country.country === 'United States' && (
                <div className="mt-2 text-right">
                  <span className="rounded-full bg-purple-950 px-2 py-0.5 text-xs text-purple-700">7️⃣ 🇺🇸 Non-OIC — Growing ESG-Islamic fund overlap</span>
                </div>
              )}

              {index === 2 && (
                <div className="mt-3 border-t border-gray-200 pt-2 text-xs text-gray-400">Below: Emerging Islamic fund markets</div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-purple-200 bg-gray-100 p-4 text-xs leading-relaxed text-gray-500">
          💡 Fund Intelligence: Sukuk funds (US${funds.headline.sukukFundsValue}bn) represent just {funds.headline.sukukFundsShare} of Islamic fund value despite {funds.headline.sukukFundsGrowth} growth in 2024. Nine new Islamic ETFs launched across 8 countries in 2024 including South Africa's first. Kazakhstan and Hong Kong launched Islamic ETFs in early 2025. ESG Islamic funds outstanding: {funds.headline.esgFundsValue}.
        </div>
      </SectionCard>

      <SectionCard title="Islamic Fund Innovation — ETFs & ESG Funds 2024/2025">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {funds.innovation.map((item, index) => (
            <div
              key={item.title}
              className="animate-in slide-in-from-right-6 duration-500 w-56 shrink-0 rounded-xl border border-gray-200 bg-gray-100 p-4 transition-colors hover:border-purple-200"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="mb-2 flex items-center gap-2 text-gray-900">
                <span className="text-2xl leading-none">{item.flag}</span>
                <span className="text-sm font-semibold">{item.market}</span>
              </div>
              <div className="text-sm font-semibold text-gray-700">{item.title}</div>
              <p className="mt-2 min-h-[86px] text-xs leading-relaxed text-gray-500">{item.description}</p>
              <div className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-[11px] ${item.badgeClassName}`}>
                {item.badge}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <DownloadButton />
      </div>

      <div className="text-center text-xs text-gray-400">
        Source: ICD-LSEG Islamic Finance Development Report 2025 | Islamic Funds data spans ETFs, ESG and multi-asset vehicles across global markets | All values in US$ billions unless noted
      </div>
    </div>
  )
}

// ─── Sub-tab Configuration ────────────────────────────────────────────────────

export const SUB_TABS: Array<{
  id: string
  label: string
  icon: React.ElementType
  accentColor: string
}> = [
  { id: 'Global Glance',   label: 'Global Glance',   icon: Globe2,          accentColor: COLORS.teal   },
  { id: 'Global Overview', label: 'Global Overview', icon: LayoutDashboard, accentColor: COLORS.ocean  },
  { id: 'Islamic Banking', label: 'Islamic Banking', icon: Building2,       accentColor: COLORS.teal   },
  { id: 'Takaful',         label: 'Takaful',         icon: Shield,          accentColor: COLORS.gold   },
  { id: 'Other IFIs',      label: 'Other IFIs',      icon: Landmark,        accentColor: COLORS.purple },
  { id: 'Sukuk',           label: 'Sukuk',           icon: TrendingUp,      accentColor: COLORS.ocean  },
  { id: 'Islamic Funds',   label: 'Islamic Funds',   icon: PieChart,        accentColor: COLORS.purple },
]

export const TAB_COMPONENTS: Record<string, React.ComponentType> = {
  'Global Glance':   TabGlobalGlance,
  'Global Overview': TabGlobalOverview,
  'Islamic Banking': TabIslamicBanking,
  'Takaful':         TabTakaful,
  'Other IFIs':      TabOtherIFIs,
  'Sukuk':           TabSukuk,
  'Islamic Funds':   TabIslamicFunds,
}

// ─── Main Export ──────────────────────────────────────────────────────────────

