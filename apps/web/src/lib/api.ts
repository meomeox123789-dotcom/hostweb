const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly code?: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    method: "GET",
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string; code?: string } | null;
    throw new ApiError(body?.message ?? "Không thể tải dữ liệu. Vui lòng thử lại.", response.status, body?.code);
  }
  return response.json() as Promise<T>;
}

export type TicketPrice = {
  ticket_code: string;
  ticket_name: string;
  duration_minutes: number | null;
  day_type: "WEEKDAY" | "WEEKEND" | "ALL";
  price: number;
  currency: string;
};

export type MenuItem = {
  category: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  is_available: boolean;
};

export const publicApi = {
  ticketPrices: (branchCode = "MAIN") => apiGet<TicketPrice[]>(`/public/ticket-prices?branchCode=${encodeURIComponent(branchCode)}`),
  menu: (branchCode = "MAIN") => apiGet<MenuItem[]>(`/public/menu?branchCode=${encodeURIComponent(branchCode)}`),
};
