import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  useAdminApproveIFProfessional,
  useAdminPendingIFProfessionals,
  useAdminRejectIFProfessional,
  useCreateProfessionalProfile,
} from "@/hooks/useAdmin";

vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from "@/lib/api";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("IF professionals hooks", () => {
  it("fetches pending professionals and maps API fields", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: [
        {
          id: "p1",
          fullName: "Jane Doe",
          organization: "IEFA",
          linkedInUrl: "https://www.linkedin.com/in/jane",
          role: "Analyst",
          location: "Lagos, Nigeria",
          description: "Focus on sukuk",
          seniority: "Early (0-6 yrs)",
          locationType: "Local",
          verificationStatus: "pending",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    });

    const { result } = renderHook(() => useAdminPendingIFProfessionals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(api.get).toHaveBeenCalledWith("/professionals/pending");
    expect(result.current.data?.[0]).toMatchObject({
      id: "p1",
      linkedinUrl: "https://www.linkedin.com/in/jane",
      seniority: "Early career",
      scope: "Local",
      verificationStatus: "Pending",
    });
  });

  it("approves a pending professional", async () => {
    vi.mocked(api.patch).mockResolvedValueOnce({
      data: {
        id: "p2",
        fullName: "John Doe",
        linkedInUrl: "https://www.linkedin.com/in/john",
        seniority: "Mid (7-14 yrs)",
        locationType: "Global",
        verificationStatus: "approved",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    });

    const { result } = renderHook(() => useAdminApproveIFProfessional(), {
      wrapper: createWrapper(),
    });

    const approved = await result.current.mutateAsync("p2");

    expect(api.patch).toHaveBeenCalledWith("/professionals/p2/approve");
    expect(approved.verificationStatus).toBe("Verified");
    expect(approved.seniority).toBe("Mid career");
  });

  it("rejects a pending professional with reason", async () => {
    vi.mocked(api.patch).mockResolvedValueOnce({
      data: {
        id: "p3",
        fullName: "Sam Doe",
        linkedInUrl: "https://www.linkedin.com/in/sam",
        seniority: "Senior (15+ yrs)",
        locationType: "Global",
        verificationStatus: "rejected",
        rejectedReason: "Insufficient profile detail",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    });

    const { result } = renderHook(() => useAdminRejectIFProfessional(), {
      wrapper: createWrapper(),
    });

    const rejected = await result.current.mutateAsync({
      id: "p3",
      reason: "Insufficient profile detail",
    });

    expect(api.patch).toHaveBeenCalledWith("/professionals/p3/reject", {
      reason: "Insufficient profile detail",
    });
    expect(rejected.verificationStatus).toBe("Unverified");
    expect(rejected.rejectedReason).toBe("Insufficient profile detail");
  });

  it("submits add-yourself profile using API contract field names", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: {
        id: "p4",
        fullName: "Ada Doe",
        linkedInUrl: "https://www.linkedin.com/in/ada",
        seniority: "Early (0-6 yrs)",
        locationType: "Local",
        verificationStatus: "pending",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    });

    const { result } = renderHook(() => useCreateProfessionalProfile(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      fullName: "Ada Doe",
      organization: "IEFA",
      linkedinUrl: "https://www.linkedin.com/in/ada",
      role: "Investment Analyst",
      location: "Lagos, Nigeria",
      description: "Equities, macro strategy",
      seniority: "Early career",
      scope: "Local",
      profileImageUrl: "https://example.com/avatar.png",
      resumeUrl: "https://example.com/resume.pdf",
    });

    expect(api.post).toHaveBeenCalledWith("/professionals/add-yourself", {
      fullName: "Ada Doe",
      organization: "IEFA",
      linkedInUrl: "https://www.linkedin.com/in/ada",
      role: "Investment Analyst",
      location: "Lagos, Nigeria",
      description: "Equities, macro strategy",
      seniority: "Early (0-6 yrs)",
      locationType: "Local",
      profileImageUrl: "https://example.com/avatar.png",
      resumeUrl: "https://example.com/resume.pdf",
    });
  });
});
