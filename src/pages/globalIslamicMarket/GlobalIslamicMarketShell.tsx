import { useEffect, useState } from 'react'
import { Globe2 } from 'lucide-react'
import { SUB_TABS, TAB_COMPONENTS, COLORS } from "./components";

function GlobalIslamicMarketShell() {
  const [activeTab, setActiveTab] = useState("Global Glance");
  const [displayTab, setDisplayTab] = useState("Global Glance");
  const [mounted, setMounted] = useState(true);
  const [loading, setLoading] = useState(true);
  const [transitionProgress, setTransitionProgress] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setMounted(false);
    setTransitionProgress(0);

    const swapTimer = setTimeout(() => {
      setDisplayTab(activeTab);
      setMounted(true);
      const el = document.getElementById("gim-content");
      if (el) {
        el.scrollTop = 0;
      }
    }, 150);

    const progressTimer = setTimeout(() => setTransitionProgress(100), 20);

    return () => {
      clearTimeout(swapTimer);
      clearTimeout(progressTimer);
    };
  }, [activeTab]);

  const ActiveSection = TAB_COMPONENTS[displayTab];

  return (
    <div
      className="relative overflow-hidden rounded-xl"
      style={{
        backgroundColor: COLORS.cardBg,
        border: `1px solid ${COLORS.cardBorder}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      {loading && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-20 w-20 animate-spin [animation-duration:3s]">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <div
                  key={angle}
                  className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45"
                  style={{
                    backgroundColor: COLORS.teal,
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-32px) rotate(45deg)`,
                  }}
                />
              ))}
            </div>
            <p className="text-sm animate-pulse" style={{ color: COLORS.teal }}>
              Loading Global Islamic Finance Data...
            </p>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div
        className="sticky top-0 z-50 h-0.5"
        style={{ backgroundColor: COLORS.cardBorder }}
      >
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${transitionProgress}%`,
            backgroundColor: COLORS.teal,
          }}
        />
      </div>

      {/* Header */}
      <div
        className="px-6 pt-5 pb-4"
        style={{
          borderBottom: `1px solid ${COLORS.cardBorder}`,
          backgroundColor: "#FAFAFA",
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
              style={{
                backgroundColor: `${COLORS.teal}12`,
                border: `1px solid ${COLORS.teal}25`,
              }}
            >
              <Globe2 className="h-5 w-5" style={{ color: COLORS.teal }} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold leading-tight tracking-tight"
                style={{ color: COLORS.textPrimary }}
              >
                Global Islamic Market
              </h1>
              <p className="text-xs mt-0.5" style={{ color: COLORS.textMuted }}>
                Powered by ICD–LSEG Islamic Finance Development Report 2025
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: COLORS.emerald }}
            />
            <span
              className="text-xs font-medium"
              style={{ color: COLORS.emerald }}
            >
              Live Data 2024
            </span>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div
        className="px-6 pt-3"
        style={{
          borderBottom: `1px solid ${COLORS.cardBorder}`,
          backgroundColor: "#FAFAFA",
        }}
      >
        <div
          className="flex gap-1.5 overflow-x-auto pb-3"
          style={{ scrollbarWidth: "none" }}
        >
          {SUB_TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => {
                  if (id !== activeTab) {
                    setActiveTab(id);
                  }
                }}
                className="relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all duration-200 shrink-0"
                role="tab"
                aria-selected={isActive}
                aria-label={`Open ${label} tab`}
                style={
                  isActive
                    ? {
                        backgroundColor: COLORS.teal,
                        color: "#FFFFFF",
                        fontWeight: 600,
                        boxShadow: `0 2px 8px ${COLORS.teal}30`,
                      }
                    : {
                        backgroundColor: "transparent",
                        color: COLORS.textSecond,
                        border: `1px solid transparent`,
                      }
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = `${COLORS.teal}08`;
                    e.currentTarget.style.color = COLORS.textPrimary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = COLORS.textSecond;
                  }
                }}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div
        id="gim-content"
        className={`p-6 min-h-[480px] max-h-screen overflow-y-auto transition-all duration-[300ms] ease-out ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        style={{ backgroundColor: COLORS.pageBg }}
      >
        <ActiveSection />
      </div>

      {/* Footer */}
      <div
        className="px-6 py-2.5"
        style={{
          borderTop: `1px solid ${COLORS.cardBorder}`,
          backgroundColor: "#FAFAFA",
        }}
      >
        <div className="flex flex-col gap-1 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <span className="text-[11px]" style={{ color: COLORS.textMuted }}>
            ICD-LSEG Islamic Finance Development Report 2025
          </span>
          <span className="text-[11px]" style={{ color: COLORS.textMuted }}>
            Data covers 140 countries · All values in US$ billions
          </span>
          <span className="text-[11px]" style={{ color: COLORS.textMuted }}>
            Last Updated: 2024 · © LSEG Data & Analytics
          </span>
        </div>
      </div>
    </div>
  );
}

export default GlobalIslamicMarketShell
