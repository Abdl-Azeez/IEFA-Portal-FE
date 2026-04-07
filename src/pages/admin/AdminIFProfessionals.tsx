import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  Briefcase,
  Check,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  Loader2,
  X,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import { TableSkeleton, CardGridSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  useAdminIFProfessionals,
  useAdminPendingIFProfessionals,
  useAdminCreateIFProfessional,
  useAdminUpdateIFProfessional,
  useAdminDeleteIFProfessional,
  useAdminApproveIFProfessional,
  useAdminRejectIFProfessional,
  useAdminToggleFeaturedProfessional,
  type IFProfessional,
  type CareerLevel,
  type ProfessionalScope,
  type VerificationStatus,
  type CreateIFProfessionalDto,
} from "@/hooks/useAdmin";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = { hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1 } };

const LEVEL_LABELS: Record<CareerLevel, string> = {
  "Early career": "Early Career",
  "Mid career": "Mid Career",
  Senior: "Senior",
};

const LEVEL_COLORS: Record<CareerLevel, string> = {
  "Early career": "bg-blue-50 text-blue-700",
  "Mid career": "bg-purple-50 text-purple-700",
  Senior: "bg-amber-50 text-amber-700",
};

type LevelFilter = "All" | CareerLevel;
type AdminViewFilter = "All" | "Pending";

const CAREER_LEVELS: CareerLevel[] = ["Early career", "Mid career", "Senior"];
const SCOPE_OPTIONS: ProfessionalScope[] = ["Local", "Global"];

function isPendingProfile(p: IFProfessional): boolean {
  return p.verificationStatus === "Pending";
}

function getVerificationStatus(p: IFProfessional): VerificationStatus {
  if (p.verificationStatus) return p.verificationStatus;
  if (p.isVerified === true) return "Verified";
  if (p.isVerified === false) return "Unverified";
  return "Verified";
}

const EMPTY_FORM: CreateIFProfessionalDto = {
  fullName: "",
  organization: "",
  linkedinUrl: "",
  role: "",
  location: "",
  description: "",
  seniority: "Early career",
  scope: "Local",
  profileImageUrl: "",
  resumeUrl: "",
  isFeatured: false,
};

export default function AdminIFProfessionals() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("All");
  const [viewFilter, setViewFilter] = useState<AdminViewFilter>("All");
  const [page, setPage] = useState(1);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<IFProfessional | null>(null);
  const [form, setForm] = useState<CreateIFProfessionalDto>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<IFProfessional | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  function openCreate() {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setModalOpen(true);
  }

  function openEdit(p: IFProfessional) {
    setEditItem(p);
    setForm({
      fullName: p.fullName,
      organization: p.organization ?? "",
      linkedinUrl: p.linkedinUrl ?? "",
      role: p.role ?? "",
      location: p.location ?? "",
      description: p.description ?? "",
      seniority: p.seniority ?? "Early career",
      scope: p.scope ?? "Local",
      profileImageUrl: p.profileImageUrl ?? "",
      resumeUrl: p.resumeUrl ?? "",
      isFeatured: p.isFeatured ?? false,
    });
    setOpenMenu(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditItem(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
  }

  function openRejectModal(profile: IFProfessional) {
    setRejectTarget(profile);
    setRejectReason("");
    setRejectError("");
    setRejectModalOpen(true);
    setOpenMenu(null);
  }

  function closeRejectModal() {
    if (rejectMutation.isPending) return;
    setRejectModalOpen(false);
    setRejectTarget(null);
    setRejectReason("");
    setRejectError("");
  }

  function submitReject() {
    const reason = rejectReason.trim();
    if (!reason) {
      setRejectError("Rejection reason is required");
      return;
    }
    if (reason.length < 10) {
      setRejectError("Please provide at least 10 characters");
      return;
    }
    if (!rejectTarget) return;

    rejectMutation.mutate(
      { id: rejectTarget.id, reason },
      {
        onSuccess: () => {
          closeRejectModal();
        },
      },
    );
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = "Name is required";
    if (
      form.linkedinUrl?.trim() &&
      !/^https?:\/\/(www\.)?linkedin\.com\/.+/i.test(form.linkedinUrl.trim())
    ) {
      errs.linkedinUrl = "Enter a valid LinkedIn profile URL";
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const { data: approvedProfessionals = [], isLoading: isApprovedLoading } =
    useAdminIFProfessionals();
  const { data: pendingProfessionals = [], isLoading: isPendingLoading } =
    useAdminPendingIFProfessionals();
  const createMutation = useAdminCreateIFProfessional();
  const updateMutation = useAdminUpdateIFProfessional();
  const deleteMutation = useAdminDeleteIFProfessional();
  const approveMutation = useAdminApproveIFProfessional();
  const rejectMutation = useAdminRejectIFProfessional();
  const toggleFeaturedMutation = useAdminToggleFeaturedProfessional();

  const allProfessionals = [
    ...approvedProfessionals,
    ...pendingProfessionals,
  ].filter((p, idx, arr) => arr.findIndex((x) => x.id === p.id) === idx);
  const isLoading = isApprovedLoading || isPendingLoading;

  // Client-side filter + paginate
  const filtered = allProfessionals.filter((p) => {
    if (viewFilter === "Pending" && !isPendingProfile(p)) return false;
    if (levelFilter !== "All" && p.seniority !== levelFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (
        !p.fullName.toLowerCase().includes(q) &&
        !p.role?.toLowerCase().includes(q) &&
        !p.location?.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const PER_PAGE = 15;
  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));
  const professionals = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const seniorCount = allProfessionals.filter(
    (p) => p.seniority === "Senior",
  ).length;
  const midCareerCount = allProfessionals.filter(
    (p) => p.seniority === "Mid career",
  ).length;
  const pendingCount = allProfessionals.filter(isPendingProfile).length;

  function buildPageNumbers(): (number | string)[] {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, "…", totalPages];
    if (page >= totalPages - 2)
      return [1, "…", totalPages - 2, totalPages - 1, totalPages];
    return [1, "…", page, "…", totalPages];
  }
  const pageNumbers = buildPageNumbers();
  const btnLabel = editItem ? "Save Changes" : "Add Professional";

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div
        variants={item}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            IF Professionals
          </h1>
          <p className="text-slate-500 text-sm">
            Manage Islamic Finance professional profiles
          </p>
        </div>
        <Button
          size="sm"
          className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg gap-1.5"
          onClick={openCreate}
        >
          <Plus className="h-3.5 w-3.5" /> Add Professional
        </Button>
      </motion.div>

      {isLoading ? (
        <CardGridSkeleton count={5} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            {
              label: "Total Profiles",
              value: allProfessionals.length,
              icon: Briefcase,
              color: "#D52B1E",
            },
            {
              label: "Early Career",
              value: professionals.filter((p) => p.seniority === "Early career")
                .length,
              icon: Users,
              color: "#3b82f6",
            },
            {
              label: "Mid Career",
              value: midCareerCount,
              icon: MapPin,
              color: "#8b5cf6",
            },
            {
              label: "Senior Level",
              value: seniorCount,
              icon: Briefcase,
              color: "#f59e0b",
            },
            {
              label: "Pending Review",
              value: pendingCount,
              icon: Filter,
              color: "#f97316",
            },
          ].map((s) => (
            <motion.div
              key={s.label}
              variants={item}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
            >
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${s.color}18` }}
              >
                <s.icon className="h-5 w-5" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <motion.div
        variants={item}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search professionals…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9 text-sm rounded-lg border-gray-200"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-slate-400" />
            {(["All", "Pending"] as AdminViewFilter[]).map((vf) => (
              <button
                key={vf}
                onClick={() => {
                  setViewFilter(vf);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${viewFilter === vf ? "bg-[#111827] text-white border-[#111827]" : "border-gray-200 hover:border-[#111827] text-slate-600"}`}
              >
                {vf === "All" ? "All Profiles" : "Pending Review"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-slate-400" />
            {(["All", ...CAREER_LEVELS] as LevelFilter[]).map((l) => (
              <button
                key={l}
                onClick={() => {
                  setLevelFilter(l);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs capitalize transition-colors ${levelFilter === l ? "bg-[#D52B1E] text-white border-[#D52B1E]" : "border-gray-200 hover:border-[#D52B1E]"}`}
              >
                {l === "All" ? "All" : LEVEL_LABELS[l]}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading && <TableSkeleton rows={8} cols={6} />}
          {!isLoading && professionals.length === 0 && (
            <EmptyState
              icon={Briefcase}
              title="No professionals found"
              description="Add your first IF professional profile to get started."
            />
          )}
          {!isLoading && professionals.length > 0 && (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Profile</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">
                    Level
                  </th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">
                    Featured
                  </th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {professionals.map((p: IFProfessional) => {
                  const levelCls = p.seniority
                    ? LEVEL_COLORS[p.seniority]
                    : "bg-gray-100 text-gray-500";
                  const levelLabel = p.seniority
                    ? LEVEL_LABELS[p.seniority]
                    : "—";
                  const verification = getVerificationStatus(p);
                  let statusCls = "bg-gray-100 text-gray-600";
                  if (verification === "Pending") {
                    statusCls = "bg-orange-100 text-orange-700";
                  } else if (verification === "Verified") {
                    statusCls = "bg-green-100 text-green-700";
                  }
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.profileImageUrl ? (
                            <img
                              src={p.profileImageUrl}
                              alt={p.fullName}
                              className="h-9 w-9 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-[#D52B1E]/10 flex items-center justify-center shrink-0">
                              <span className="text-[#D52B1E] text-xs font-bold">
                                {p.fullName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-slate-800 text-sm">
                              {p.fullName}
                            </p>
                            {p.role && (
                              <p className="text-xs text-slate-400">{p.role}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">
                        {p.location ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {p.location}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs hidden lg:table-cell max-w-[160px]">
                        <span className="line-clamp-1">
                          {p.description ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${levelCls}`}
                        >
                          {levelLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        {p.isFeatured ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />{" "}
                            Featured
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusCls}`}
                        >
                          {verification}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setOpenMenu(openMenu === p.id ? null : p.id)
                            }
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {openMenu === p.id && (
                            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-xl z-10 py-1 text-sm">
                              {verification === "Pending" && (
                                <>
                                  <button
                                    onClick={() => {
                                      approveMutation.mutate(p.id);
                                      setOpenMenu(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-green-50 text-green-700"
                                  >
                                    <Check className="h-3.5 w-3.5" /> Approve
                                  </button>
                                  <button
                                    onClick={() => openRejectModal(p)}
                                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-orange-50 text-orange-700"
                                  >
                                    <X className="h-3.5 w-3.5" /> Reject
                                  </button>
                                  <hr className="my-1 border-gray-100" />
                                </>
                              )}
                              <button
                                onClick={() => openEdit(p)}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"
                              >
                                <Edit className="h-3.5 w-3.5 text-blue-600" />{" "}
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  toggleFeaturedMutation.mutate({
                                    id: p.id,
                                    isFeatured: !p.isFeatured,
                                  });
                                  setOpenMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-amber-50 text-amber-700"
                              >
                                <Star className="h-3.5 w-3.5" />{" "}
                                {p.isFeatured ? "Unfeature" : "Mark Featured"}
                              </button>
                              <hr className="my-1 border-gray-100" />
                              <button
                                onClick={() => {
                                  deleteMutation.mutate(p.id);
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
                })}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-xs text-slate-500">
            <span>
              Showing {(page - 1) * PER_PAGE + 1}–
              {Math.min(page * PER_PAGE, totalCount)} of {totalCount}{" "}
              professionals
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {pageNumbers.map((p) => {
                const cls =
                  p === page ? "bg-[#D52B1E] text-white" : "hover:bg-slate-100";
                const isEllipsis = p === "…";
                return (
                  <button
                    key={String(p)}
                    onClick={() => typeof p === "number" && setPage(p)}
                    className={`h-7 w-7 rounded-lg text-xs ${isEllipsis ? "cursor-default" : cls}`}
                  >
                    {p}
                  </button>
                );
              })}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Create / Edit Modal */}
      <Dialog
        open={modalOpen}
        onClose={closeModal}
        title={editItem ? "Edit Professional" : "Add Professional"}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label
                htmlFor="prof-name"
                className="block text-xs font-medium text-slate-600 mb-1"
              >
                Full name <span className="text-red-500">*</span>
              </label>
              <Input
                id="prof-name"
                value={form.fullName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fullName: e.target.value }))
                }
                placeholder="Your name"
                className="h-9 text-sm"
              />
              {formErrors.fullName && (
                <p className="text-xs text-red-500 mt-0.5">
                  {formErrors.fullName}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="prof-organization"
                className="block text-xs font-medium text-slate-600 mb-1"
              >
                Organization
              </label>
              <Input
                id="prof-organization"
                value={form.organization ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, organization: e.target.value }))
                }
                placeholder="Organization or institution"
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="prof-linkedin"
                className="block text-xs font-medium text-slate-600 mb-1"
              >
                LinkedIn profile URL
              </label>
              <Input
                id="prof-linkedin"
                type="url"
                value={form.linkedinUrl ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, linkedinUrl: e.target.value }))
                }
                placeholder="https://www.linkedin.com/in/yourname"
                className="h-9 text-sm"
              />
              {formErrors.linkedinUrl && (
                <p className="text-xs text-red-500 mt-0.5">
                  {formErrors.linkedinUrl}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="prof-role"
                className="block text-xs font-medium text-slate-600 mb-1"
              >
                Role / Title
              </label>
              <Input
                id="prof-role"
                value={form.role ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, role: e.target.value }))
                }
                placeholder="e.g. Investment Analyst"
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="prof-location"
                className="block text-xs font-medium text-slate-600 mb-1"
              >
                Location
              </label>
              <Input
                id="prof-location"
                value={form.location ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
                placeholder="e.g. Kuala Lumpur, Malaysia"
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="prof-description"
              className="block text-xs font-medium text-slate-600 mb-1"
            >
              Description
            </label>
            <textarea
              id="prof-description"
              value={form.description ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Brief description of the professional…"
              rows={4}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#D52B1E] resize-none"
            />
          </div>

          <div>
            <p className="block text-xs font-medium text-slate-600 mb-1">
              Picture
            </p>
            <ImageUpload
              id="prof-image"
              value={form.profileImageUrl ?? ""}
              onChange={(url) =>
                setForm((f) => ({ ...f, profileImageUrl: url }))
              }
              previewHeight="h-28"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="prof-level"
                className="block text-xs font-medium text-slate-600 mb-1"
              >
                Career level
              </label>
              <Select
                id="prof-level"
                value={form.seniority ?? "Early career"}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    seniority: e.target.value as CareerLevel,
                  }))
                }
              >
                {CAREER_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {LEVEL_LABELS[l]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label
                htmlFor="prof-scope"
                className="block text-xs font-medium text-slate-600 mb-1"
              >
                Local / Global
              </label>
              <Select
                id="prof-scope"
                value={form.scope ?? "Local"}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    scope: e.target.value as ProfessionalScope,
                  }))
                }
              >
                {SCOPE_OPTIONS.map((scope) => (
                  <option key={scope} value={scope}>
                    {scope}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <label
              htmlFor="prof-resume"
              className="block text-xs font-medium text-slate-600 mb-1"
            >
              Resume
            </label>
            <ImageUpload
              id="prof-resume"
              mode="document"
              value={form.resumeUrl ?? ""}
              onChange={(url) => setForm((f) => ({ ...f, resumeUrl: url }))}
              previewHeight="h-28"
            />
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
            <input
              id="prof-featured"
              type="checkbox"
              checked={form.isFeatured ?? false}
              onChange={(e) =>
                setForm((f) => ({ ...f, isFeatured: e.target.checked }))
              }
              className="h-4 w-4 rounded border-gray-300 accent-amber-500"
            />
            <label
              htmlFor="prof-featured"
              className="flex items-center gap-1.5 text-xs font-medium text-amber-800 cursor-pointer select-none"
            >
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              Mark as Featured Professional
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              onClick={closeModal}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg"
              disabled={createMutation.isPending || updateMutation.isPending}
              onClick={() => {
                if (!validate()) return;
                if (editItem) {
                  updateMutation.mutate(
                    { id: editItem.id, dto: form },
                    { onSuccess: closeModal },
                  );
                } else {
                  createMutation.mutate(form, { onSuccess: closeModal });
                }
              }}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                btnLabel
              )}
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={rejectModalOpen}
        onClose={closeRejectModal}
        title="Reject Professional"
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">
            {rejectTarget ? (
              <span>
                You are rejecting <strong>{rejectTarget.fullName}</strong>. This
                will remove the profile from pending approval.
              </span>
            ) : (
              <span>Select a pending professional to reject.</span>
            )}
          </div>

          <div>
            <label
              htmlFor="reject-reason"
              className="block text-xs font-medium text-slate-600 mb-1"
            >
              Rejection reason <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value);
                if (rejectError) setRejectError("");
              }}
              placeholder="Explain why this profile is being rejected (minimum 10 characters)."
              rows={4}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#D52B1E] resize-none"
            />
            {rejectError && (
              <p className="text-xs text-red-500 mt-1">{rejectError}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              onClick={closeRejectModal}
              disabled={rejectMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg"
              onClick={submitReject}
              disabled={rejectMutation.isPending || !rejectTarget}
            >
              {rejectMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Reject Profile"
              )}
            </Button>
          </div>
        </div>
      </Dialog>
    </motion.div>
  );
}
