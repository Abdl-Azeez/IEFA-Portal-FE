import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AtSign,
  Bell,
  BellRing,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  Filter,
  Search,
  Sparkles,
  Tag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
  useUnreadNotificationsCount,
  type NotificationItem,
  type NotificationOrder,
} from "@/hooks/useNotifications";

type ViewFilter = "all" | "unread" | "read";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatRelativeTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Moments ago";
  const diffMs = date.getTime() - Date.now();
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const minutes = Math.round(diffMs / 60000);
  if (Math.abs(minutes) < 60) return formatter.format(minutes, "minute");
  const hours = Math.round(diffMs / 3600000);
  if (Math.abs(hours) < 24) return formatter.format(hours, "hour");
  const days = Math.round(diffMs / 86400000);
  return formatter.format(days, "day");
}

function getNotificationTheme(type: string) {
  if (type.includes("tag") || type.includes("mention")) {
    return {
      icon: AtSign,
      chip: "bg-[#FFF0ED] text-[#B8241B] border-[#F3C6BC]",
      iconWrap: "bg-[#D52B1E]/12 text-[#B8241B]",
      accent: "from-[#D52B1E] to-[#F4A261]",
      label: "Mention",
    };
  }
  if (
    type.includes("comment") ||
    type.includes("reply") ||
    type.includes("community")
  ) {
    return {
      icon: Tag,
      chip: "bg-[#FFF6F5] text-[#D52B1E] border-[#F3C6BC]",
      iconWrap: "bg-[#D52B1E]/12 text-[#D52B1E]",
      accent: "from-[#D52B1E] to-[#6F1610]",
      label: "Conversation",
    };
  }
  return {
    icon: BellRing,
    chip: "bg-[#FFF6F5] text-[#B84B35] border-[#F3C6BC]",
    iconWrap: "bg-[#D52B1E]/10 text-[#B84B35]",
    accent: "from-[#B84B35] to-[#F4A261]",
    label: "Update",
  };
}

function NotificationCard({
  notification,
  onMarkRead,
  onOpen,
  isPending,
}: {
  notification: NotificationItem;
  onMarkRead: (id: string) => void;
  onOpen: (notification: NotificationItem) => void;
  isPending: boolean;
}) {
  const theme = getNotificationTheme(notification.type);
  const Icon = theme.icon;

  return (
    <motion.article
      variants={item}
      className={[
        "group relative overflow-hidden rounded-[28px] border p-5 shadow-[0_18px_60px_rgba(213,43,30,0.10)] backdrop-blur-sm transition-all duration-300",
        notification.isRead
          ? "border-[#F1E4E1] bg-white"
          : "border-[#F3C6BC] bg-[#FFF9F8]",
      ].join(" ")}
    >
      {!notification.isRead && (
        <div className="absolute inset-y-0 left-0 w-1.5 rounded-r-full bg-gradient-to-b from-[#D52B1E] to-[#FF8A5B]" />
      )}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-4">
          <div
            className={[
              "mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
              theme.iconWrap,
            ].join(" ")}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={[
                  "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                  theme.chip,
                ].join(" ")}
              >
                {theme.label}
              </span>
              {!notification.isRead && (
                <span className="inline-flex items-center rounded-full bg-[#D52B1E] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                  Unread
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-xs text-[#737692]">
                <Clock3 className="h-3.5 w-3.5" />
                {formatRelativeTime(notification.createdAt)}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold leading-tight text-[#111827]">
                {notification.title}
              </h3>
              <p className="mt-1 text-sm leading-6 text-[#5C6178]">
                {notification.actorName ? `${notification.actorName}: ` : ""}
                {notification.message}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#8A8FA3]">
              <span>{formatDate(notification.createdAt)}</span>
              {notification.readAt && (
                <span>Read {formatDate(notification.readAt)}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end">
          {!notification.isRead && (
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => onMarkRead(notification.id)}
              className="rounded-full border-[#F3C6BC] bg-white px-4 text-[#B84B35] hover:bg-[#FFF2EE]"
            >
              <CheckCheck className="h-4 w-4" /> Mark read
            </Button>
          )}
          {notification.actionUrl && (
            <Button
              size="sm"
              onClick={() => onOpen(notification)}
              className="rounded-full bg-[#D52B1E] px-4 text-white hover:bg-[#B8241B]"
            >
              Open
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <div
        className={[
          "pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-gradient-to-br opacity-10 blur-2xl",
          theme.accent,
        ].join(" ")}
      />
    </motion.article>
  );
}

function NotificationCardSkeleton() {
  return (
    <div className="rounded-[28px] border border-[#F1E4E1] bg-white p-5 shadow-[0_18px_60px_rgba(213,43,30,0.08)] animate-pulse">
      <div className="flex gap-4">
        <div className="h-12 w-12 rounded-2xl bg-gray-200" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-24 rounded-full bg-gray-100" />
          <div className="h-5 w-2/5 rounded bg-gray-200" />
          <div className="h-4 w-full rounded bg-gray-100" />
          <div className="h-4 w-4/5 rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

export default function Notifications() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [order, setOrder] = useState<NotificationOrder>("DESC");
  const [viewFilter, setViewFilter] = useState<ViewFilter>("all");

  useEffect(() => {
    const timeout = globalThis.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 250);
    return () => globalThis.clearTimeout(timeout);
  }, [searchInput]);

  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const { data, isLoading, isFetching } = useNotifications({
    page,
    perPage: 10,
    order,
    search,
  });
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const notifications = data?.data ?? [];
  const meta = data?.meta;

  const visibleNotifications = useMemo(() => {
    if (viewFilter === "unread")
      return notifications.filter((item) => !item.isRead);
    if (viewFilter === "read")
      return notifications.filter((item) => item.isRead);
    return notifications;
  }, [notifications, viewFilter]);

  const readCountOnPage =
    notifications.length -
    notifications.filter((entry) => !entry.isRead).length;

  function openNotification(notification: NotificationItem) {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
    }

    if (!notification.actionUrl) return;
    if (notification.actionUrl.startsWith("/")) {
      navigate(notification.actionUrl);
      return;
    }
    globalThis.open(notification.actionUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.section
        variants={item}
        className="relative overflow-hidden rounded-[32px] border border-white/60 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(255,244,240,0.92)_45%,_rgba(255,237,232,0.88)_100%)] p-6 shadow-[0_24px_80px_rgba(213,43,30,0.12)] md:p-8"
      >
        <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-[#FFD2C7] blur-3xl" />
        <div className="absolute right-0 top-4 h-48 w-48 rounded-full bg-[#FFE7A8] blur-3xl" />
        <div className="absolute bottom-0 right-16 h-28 w-28 rounded-full bg-[#FFD8CF] blur-3xl opacity-60" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#B84B35] shadow-sm">
              <Sparkles className="h-3.5 w-3.5" /> In-app activity stream
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#111827] md:text-4xl">
                Notifications that actually keep pace with your work
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5C6178] md:text-base">
                Track mentions, replies, and account activity in one focused
                stream. New updates surface first, and anything actionable can
                take you straight back into the conversation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-gradient-to-br from-[#D52B1E] to-[#B8241B] px-4 py-4 text-white shadow-lg shadow-[#D52B1E]/30">
              <p className="text-xs uppercase tracking-[0.18em] text-white/70">
                Unread
              </p>
              <p className="mt-2 text-3xl font-bold">{unreadCount}</p>
            </div>
            <div className="rounded-3xl bg-white/90 px-4 py-4 shadow-lg shadow-[#D52B1E]/10">
              <p className="text-xs uppercase tracking-[0.18em] text-[#8A8FA3]">
                This page
              </p>
              <p className="mt-2 text-3xl font-bold text-[#111827]">
                {notifications.length}
              </p>
            </div>
            <div className="rounded-3xl bg-white/90 px-4 py-4 shadow-lg shadow-[#D52B1E]/10 sm:col-span-1 col-span-2">
              <p className="text-xs uppercase tracking-[0.18em] text-[#8A8FA3]">
                Read now
              </p>
              <p className="mt-2 text-3xl font-bold text-[#111827]">
                {readCountOnPage}
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={item}
        className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]"
      >
        <div className="rounded-[28px] border border-white/70 bg-white/80 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A8FA3]" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search notifications, tags, or activity"
                className="h-11 rounded-full border-[#F0D7D0] bg-[#FFFDFC] pl-10 pr-4 text-sm"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center rounded-full border border-[#F0D7D0] bg-[#FFFDFC] p-1">
                {["all", "unread", "read"].map((filter) => {
                  const active = viewFilter === filter;
                  const label =
                    filter.charAt(0).toUpperCase() + filter.slice(1);
                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setViewFilter(filter as ViewFilter)}
                      className={[
                        "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                        active
                          ? "bg-[#D52B1E] text-white"
                          : "text-[#6B7280] hover:text-[#D52B1E]",
                      ].join(" ")}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <div className="inline-flex items-center rounded-full border border-[#F0D7D0] bg-[#FFFDFC] p-1">
                {[
                  { label: "Newest", value: "DESC" as NotificationOrder },
                  { label: "Oldest", value: "ASC" as NotificationOrder },
                ].map((option) => {
                  const active = order === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setOrder(option.value);
                        setPage(1);
                      }}
                      className={[
                        "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                        active
                          ? "bg-[#D52B1E] text-white"
                          : "text-[#6B7280] hover:text-[#111827]",
                      ].join(" ")}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-[#F3C6BC] bg-gradient-to-br from-[#D52B1E] to-[#B8241B] p-4 text-white shadow-[0_18px_60px_rgba(213,43,30,0.24)]">
          <div className="flex h-full flex-col justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-white/80">
                <Filter className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.2em]">
                  Quick actions
                </span>
              </div>
              <p className="mt-3 text-xl font-semibold">
                Clear the backlog without losing context.
              </p>
              <p className="mt-2 text-sm leading-6 text-white/80">
                Mark every item as read once you have caught up, or drill into
                specific notifications when you need full context.
              </p>
            </div>
            <Button
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending || unreadCount === 0}
              className="h-11 rounded-full bg-white text-[#B8241B] hover:bg-[#FFF5F2]"
            >
              <CheckCheck className="h-4 w-4" /> Mark all as read
            </Button>
          </div>
        </div>
      </motion.section>

      <motion.section variants={item} className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#111827]">
              Your activity feed
            </h2>
            <p className="text-sm text-[#737692]">
              {isFetching && !isLoading
                ? "Refreshing notifications..."
                : "Mentions, replies, and updates appear here as they happen."}
            </p>
          </div>
          {meta && (
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A8FA3]">
              Page {meta.page} of {Math.max(meta.pageCount, 1)}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }, (_, index) => (
              <NotificationCardSkeleton
                key={`notification-skeleton-${index}`}
              />
            ))}
          </div>
        ) : visibleNotifications.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-[#E9CFC7] bg-white/70 px-6 py-14 text-center shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#FFF2EE] text-[#D52B1E]">
              <Bell className="h-7 w-7" />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-[#111827]">
              Nothing to show right now
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#6B7280]">
              When someone tags you, replies to you, or the platform needs your
              attention, the updates will land here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkRead={(id) => markAsRead.mutate(id)}
                onOpen={openNotification}
                isPending={markAsRead.isPending}
              />
            ))}
          </div>
        )}
      </motion.section>

      {meta && meta.pageCount > 1 && (
        <motion.section
          variants={item}
          className="flex items-center justify-between rounded-[24px] border border-white/70 bg-white/80 px-4 py-3 shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
        >
          <p className="text-sm text-[#6B7280]">
            Showing page {meta.page} with {meta.perPage} notifications per page.
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={!meta.hasPreviousPage}
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((current) => current + 1)}
              disabled={!meta.hasNextPage}
              className="rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.section>
      )}
    </motion.div>
  );
}