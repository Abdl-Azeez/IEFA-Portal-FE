import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export type NotificationOrder = "ASC" | "DESC";

export interface NotificationsMeta {
  page: number;
  perPage: number;
  itemCount: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface NotificationsPage {
  data: NotificationItem[];
  meta: NotificationsMeta;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
  actionUrl?: string;
  actorName?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationsQueryParams {
  order?: NotificationOrder;
  page?: number;
  perPage?: number;
  search?: string;
  enabled?: boolean;
}

interface ApiNotificationsMeta {
  page?: number;
  perPage?: number;
  itemCount?: number;
  pageCount?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

interface ApiNotification {
  id: string;
  title?: string;
  subject?: string;
  message?: string;
  content?: string;
  body?: string;
  description?: string;
  type?: string;
  category?: string;
  eventType?: string;
  isRead?: boolean;
  read?: boolean;
  readAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  actionUrl?: string;
  link?: string;
  url?: string;
  actorName?: string;
  actor?: {
    fullName?: string;
    name?: string;
    username?: string;
  };
  metadata?: Record<string, unknown>;
}

interface ApiNotificationsPage {
  data?: ApiNotification[];
  items?: ApiNotification[];
  meta?: ApiNotificationsMeta;
}

const defaultMeta: NotificationsMeta = {
  page: 1,
  perPage: 10,
  itemCount: 0,
  pageCount: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;
}

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

function firstBoolean(...values: unknown[]): boolean | undefined {
  for (const value of values) {
    if (typeof value === "boolean") return value;
  }
  return undefined;
}

function prettifyType(value?: string): string {
  if (!value) return "general";
  return value
    .replaceAll(/[_.-]+/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function titleFromType(type?: string): string {
  const label = prettifyType(type);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function normalizeMeta(meta?: ApiNotificationsMeta): NotificationsMeta {
  const page = meta?.page ?? defaultMeta.page;
  const perPage = meta?.perPage ?? defaultMeta.perPage;
  const itemCount = meta?.itemCount ?? defaultMeta.itemCount;
  const pageCount = meta?.pageCount ?? Math.ceil(itemCount / Math.max(perPage, 1));
  return {
    page,
    perPage,
    itemCount,
    pageCount,
    hasPreviousPage: meta?.hasPreviousPage ?? page > 1,
    hasNextPage: meta?.hasNextPage ?? page < pageCount,
  };
}

function normalizeNotification(notification: ApiNotification): NotificationItem {
  const metadata = asRecord(notification.metadata);
  const actor = notification.actor;
  const title = firstString(
    notification.title,
    notification.subject,
    metadata?.title,
    metadata?.subject,
  ) ?? titleFromType(notification.type ?? notification.category ?? notification.eventType);

  const message =
    firstString(
      notification.message,
      notification.content,
      notification.body,
      notification.description,
      metadata?.message,
      metadata?.content,
      metadata?.body,
    ) ?? "You have a new notification.";

  const isRead =
    firstBoolean(notification.isRead, notification.read) ?? Boolean(notification.readAt);

  const createdAt =
    firstString(notification.createdAt, notification.updatedAt, notification.readAt) ??
    new Date().toISOString();

  return {
    id: notification.id,
    title,
    message,
    type: prettifyType(notification.type ?? notification.category ?? notification.eventType),
    isRead,
    createdAt,
    readAt: notification.readAt,
    actionUrl: firstString(
      notification.actionUrl,
      notification.link,
      notification.url,
      metadata?.actionUrl,
      metadata?.link,
      metadata?.url,
      metadata?.route,
    ),
    actorName: firstString(
      notification.actorName,
      actor?.fullName,
      actor?.name,
      actor?.username,
      metadata?.actorName,
      metadata?.taggedBy,
    ),
    metadata,
  };
}

export const useNotifications = (params: NotificationsQueryParams = {}) =>
  useQuery<NotificationsPage>({
    queryKey: ["notifications", params],
    queryFn: async () => {
      const queryParams: NotificationsQueryParams = {
        order: params.order ?? "DESC",
        page: params.page ?? 1,
        perPage: params.perPage ?? 10,
      };
      if (params.search?.trim()) queryParams.search = params.search.trim();

      const { data } = await api.get<ApiNotificationsPage>("/notifications", {
        params: queryParams,
      });

      let items: ApiNotification[] = [];
      if (Array.isArray(data.data)) {
        items = data.data;
      } else if (Array.isArray(data.items)) {
        items = data.items;
      }

      return {
        data: items.map(normalizeNotification),
        meta: normalizeMeta(data.meta),
      };
    },
    enabled: params.enabled ?? true,
  });

export const useUnreadNotificationsCount = (enabled = true) =>
  useQuery<number>({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const { data } = await api.get<number>("/notifications/unread-count");
      return typeof data === "number" ? data : 0;
    },
    enabled,
  });

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<ApiNotification>(`/notifications/${id}/read`);
      return normalizeNotification(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message ?? "Unable to mark notification as read",
        variant: "destructive",
      });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.patch("/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
      toast({
        title: "Notifications updated",
        description: "All notifications have been marked as read.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message ?? "Unable to mark all notifications as read",
        variant: "destructive",
      });
    },
  });
};