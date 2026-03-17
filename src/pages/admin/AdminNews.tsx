import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  Newspaper,
  Plus,
  Search,
  Eye,
  MoreVertical,
  Edit,
  Trash2,
  Send,
  Tag,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckCircle,
  Clock,
  Loader2,
  Download,
  Star,
  Rss,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { TableSkeleton, CardGridSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { exportToCsv } from "@/lib/utils";
import {
  useAdminNews,
  useAdminCreateNews,
  useAdminUpdateNews,
  useAdminDeleteNews,
  useAdminToggleFeaturedNews,
  type AdminNewsItem,
  type CreateNewsDto,
} from "@/hooks/useAdmin";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = { hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1 } };

const STATUS_STYLES: Record<string, { cls: string; icon: React.ElementType }> =
  {
    published: { cls: "bg-green-50 text-green-700", icon: CheckCircle },
    draft: { cls: "bg-slate-100 text-slate-600", icon: FileText },
    review: { cls: "bg-yellow-50 text-yellow-700", icon: Clock },
  };

type StatusFilter = "All" | "published" | "draft";

const EMPTY_FORM: CreateNewsDto = {
  title: "",
  content: "",
  excerpt: "",
  coverImageUrl: "",
  status: "draft",
  tagNames: [],
};

const EXT_QUERY_KEY = "iefa_ext_news_query";
const DEFAULT_EXT_QUERY = "Islamic finance";

export default function AdminNews() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [page, setPage] = useState(1);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [extQuery, setExtQuery] = useState(() => {
    try {
      return localStorage.getItem(EXT_QUERY_KEY) || DEFAULT_EXT_QUERY;
    } catch {
      return DEFAULT_EXT_QUERY;
    }
  });
  const [extQueryInput, setExtQueryInput] = useState(extQuery);
  const [extQuerySaved, setExtQuerySaved] = useState(false);

  function saveExtQuery() {
    const trimmed = extQueryInput.trim() || DEFAULT_EXT_QUERY;
    try {
      localStorage.setItem(EXT_QUERY_KEY, trimmed);
    } catch {
      /* ignore */
    }
    setExtQuery(trimmed);
    setExtQueryInput(trimmed);
    setExtQuerySaved(true);
    setTimeout(() => setExtQuerySaved(false), 2000);
  }

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<AdminNewsItem | null>(null);
  const [form, setForm] = useState<CreateNewsDto>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  function openCreate() {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setModalOpen(true);
  }

  function openEdit(a: AdminNewsItem) {
    setEditItem(a);
    setForm({
      title: a.title,
      content: a.content ?? "",
      excerpt: a.excerpt ?? "",
      coverImageUrl: a.coverImageUrl ?? "",
      status: a.status,
      tagNames: a.tagNames ?? [],
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

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Title is required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const { data, isLoading } = useAdminNews({
    search: search || undefined,
    status: statusFilter === "All" ? undefined : statusFilter,
    page,
    perPage: 15,
  });
  const createMutation = useAdminCreateNews();
  const updateMutation = useAdminUpdateNews();
  const deleteMutation = useAdminDeleteNews();
  const toggleFeaturedMutation = useAdminToggleFeaturedNews();

  const articles = data?.data ?? [];
  const meta = data?.meta;

  const publishedCount = articles.filter(
    (a) => a.status === "published",
  ).length;
  const draftCount = articles.filter((a) => a.status === "draft").length;
  const totalViews = articles.reduce((sum, a) => sum + (a.viewCount ?? 0), 0);

  const totalPages = meta?.pageCount ?? 1;
  function buildPageNumbers(): (number | string)[] {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, "…", totalPages];
    if (page >= totalPages - 2)
      return [1, "…", totalPages - 2, totalPages - 1, totalPages];
    return [1, "…", page, "…", totalPages];
  }
  const pageNumbers = buildPageNumbers();
  const btnLabel = editItem ? "Save Changes" : "Create Article";

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
          <h1 className="text-2xl font-bold text-slate-800">News Management</h1>
          <p className="text-slate-500 text-sm">
            Create, edit and publish news articles
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg gap-1.5"
            onClick={() =>
              exportToCsv(
                "news",
                articles.map((a) => ({
                  id: a.id,
                  title: a.title,
                  status: a.status,
                  views: a.viewCount,
                  author: a.author
                    ? `${a.author.firstName} ${a.author.lastName}`
                    : "",
                  tags: (a.tagNames ?? []).join(";"),
                  createdAt: a.createdAt,
                })),
              )
            }
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
          <Button
            size="sm"
            className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg gap-1.5"
            onClick={openCreate}
          >
            <Plus className="h-3.5 w-3.5" /> New Article
          </Button>
        </div>
      </motion.div>

      {/* Live Feed Settings */}
      <motion.div
        variants={item}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center">
              <Rss className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Live Feed Search Query
              </p>
              <p className="text-xs text-slate-500">
                Controls what the user-facing market intelligence feed shows
              </p>
            </div>
          </div>
          <div className="flex flex-1 items-center gap-2 min-w-[240px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                value={extQueryInput}
                onChange={(e) => setExtQueryInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveExtQuery()}
                placeholder="e.g. Islamic finance"
                className="pl-8 h-9 text-sm rounded-lg border-gray-200"
              />
            </div>
            <Button
              size="sm"
              className={`rounded-lg gap-1.5 shrink-0 ${extQuerySaved ? "bg-green-600 hover:bg-green-700" : "bg-slate-700 hover:bg-slate-800"}`}
              onClick={saveExtQuery}
            >
              <Save className="h-3.5 w-3.5" />
              {extQuerySaved ? "Saved!" : "Save"}
            </Button>
          </div>
          <span className="text-xs text-slate-400">
            Current:{" "}
            <span className="font-medium text-slate-600">{extQuery}</span>
          </span>
        </div>
      </motion.div>

      {isLoading ? (
        <CardGridSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Articles",
              value: meta?.itemCount ?? "—",
              icon: Newspaper,
              color: "#D52B1E",
            },
            {
              label: "Published",
              value: publishedCount,
              icon: CheckCircle,
              color: "#10b981",
            },
            {
              label: "Drafts",
              value: draftCount,
              icon: FileText,
              color: "#6b7280",
            },
            {
              label: "Total Views",
              value: totalViews > 0 ? totalViews.toLocaleString() : "—",
              icon: Eye,
              color: "#3b82f6",
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
              placeholder="Search articles…"
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
            {(["All", "published", "draft"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs capitalize transition-colors ${statusFilter === s ? "bg-[#D52B1E] text-white border-[#D52B1E]" : "border-gray-200 hover:border-[#D52B1E]"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading && <TableSkeleton rows={8} cols={7} />}
          {!isLoading && articles.length === 0 && (
            <EmptyState
              icon={Newspaper}
              title="No articles found"
              description="Try adjusting your search or status filter, or create a new article."
            />
          )}
          {!isLoading && articles.length > 0 && (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Article</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">
                    Author
                  </th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">
                    Tags
                  </th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">
                    Views
                  </th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">
                    Featured
                  </th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {articles.map((a: AdminNewsItem) => {
                  const { cls, icon: StatusIcon } = STATUS_STYLES[a.status] ?? {
                    cls: "",
                    icon: FileText,
                  };
                  const authorName = a.author
                    ? `${a.author.firstName} ${a.author.lastName}`.trim()
                    : "—";
                  return (
                    <tr
                      key={a.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 max-w-xs">
                        <p className="font-medium text-slate-800 text-sm line-clamp-1">
                          {a.title}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">
                        {authorName}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex gap-1 flex-wrap">
                          {(a.tagNames ?? []).slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1"
                            >
                              <Tag className="h-2.5 w-2.5" />
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {a.viewCount > 0 ? a.viewCount.toLocaleString() : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full w-fit capitalize ${cls}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {a.isFeatured ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full w-fit">
                            <Star className="h-3 w-3 fill-amber-500" /> Featured
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">
                        {new Date(a.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setOpenMenu(openMenu === a.id ? null : a.id)
                            }
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {openMenu === a.id && (
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-10 py-1 text-sm">
                              <button
                                onClick={() => openEdit(a)}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"
                              >
                                <Edit className="h-3.5 w-3.5 text-blue-600" />{" "}
                                Edit
                              </button>
                              {a.status !== "published" && (
                                <button
                                  onClick={() => {
                                    updateMutation.mutate({
                                      id: a.id,
                                      dto: { status: "published" },
                                    });
                                    setOpenMenu(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"
                                >
                                  <Send className="h-3.5 w-3.5 text-green-600" />{" "}
                                  Publish
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  toggleFeaturedMutation.mutate({
                                    id: a.id,
                                    isFeatured: !a.isFeatured,
                                  });
                                  setOpenMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"
                              >
                                <Star
                                  className={`h-3.5 w-3.5 ${a.isFeatured ? "text-amber-500 fill-amber-500" : "text-slate-400"}`}
                                />
                                {a.isFeatured ? "Unfeature" : "Feature"}
                              </button>
                              <hr className="my-1 border-gray-100" />
                              <button
                                onClick={() => {
                                  deleteMutation.mutate(a.id);
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

        {meta && meta.pageCount > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-xs text-slate-500">
            <span>
              Showing {(meta.page - 1) * meta.perPage + 1}–
              {Math.min(meta.page * meta.perPage, meta.itemCount)} of{" "}
              {meta.itemCount} articles
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={!meta.hasPreviousPage}
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
                disabled={!meta.hasNextPage}
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
        title={editItem ? "Edit Article" : "New Article"}
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="news-title"
              className="block text-xs font-medium text-slate-600 mb-1"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="news-title"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="Article title"
              className="h-9 text-sm"
            />
            {formErrors.title && (
              <p className="text-xs text-red-500 mt-0.5">{formErrors.title}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="news-excerpt"
              className="block text-xs font-medium text-slate-600 mb-1"
            >
              Excerpt
            </label>
            <textarea
              id="news-excerpt"
              value={form.excerpt ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, excerpt: e.target.value }))
              }
              placeholder="Short summary…"
              rows={2}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:border-[#D52B1E] resize-none"
            />
          </div>
          <div>
            <label
              htmlFor="news-content"
              className="block text-xs font-medium text-slate-600 mb-1"
            >
              Content
            </label>
            <RichTextEditor
              value={form.content ?? ""}
              onChange={(html) => setForm((f) => ({ ...f, content: html }))}
              placeholder="Full article content…"
            />
          </div>
          <div>
            <p className="block text-xs font-medium text-slate-600 mb-1">
              Cover Image
            </p>
            <ImageUpload
              id="news-cover"
              value={form.coverImageUrl ?? ""}
              onChange={(url) => setForm((f) => ({ ...f, coverImageUrl: url }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="news-status"
                className="block text-xs font-medium text-slate-600 mb-1"
              >
                Status
              </label>
              <Select
                id="news-status"
                value={form.status ?? "draft"}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as "draft" | "published",
                  }))
                }
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            </div>
            <div>
              <label
                htmlFor="news-tags"
                className="block text-xs font-medium text-slate-600 mb-1"
              >
                Tags (comma-separated)
              </label>
              <Input
                id="news-tags"
                value={(form.tagNames ?? []).join(", ")}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    tagNames: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder="finance, markets"
                className="h-9 text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
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
    </motion.div>
  );
}
