import type {
  ApiErrorBody,
  AuthResponse,
  CreateFoodEntryPayload,
  CreateFoodItemPayload,
  DailyGoal,
  DailySummary,
  FoodEntry,
  FoodItem,
  LoginPayload,
  MealType,
  MonthlySummary,
  RangeSummary,
  RegisterPayload,
  UpdateDailyGoalPayload,
  UpdateFoodEntryPayload,
} from './types';

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export interface FoodEntryQuery {
  from?: string;
  to?: string;
  mealType?: MealType;
}

export interface ApiClientOptions {
  baseUrl: string;
  getToken: () => string | null | undefined;
}

function buildQueryString(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value);
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export class BroteinApiClient {
  private baseUrl: string;
  private getToken: () => string | null | undefined;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.getToken = options.getToken;
  }

  private async request<T>(
    path: string,
    init: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string> | undefined),
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers,
    });

    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const body = isJson ? await response.json().catch(() => undefined) : undefined;

    if (!response.ok) {
      const errBody = body as ApiErrorBody | undefined;
      throw new ApiError(
        response.status,
        errBody?.error ?? response.statusText,
        errBody?.details
      );
    }

    return body as T;
  }

  register(payload: RegisterPayload): Promise<AuthResponse> {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  login(payload: LoginPayload): Promise<AuthResponse> {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  searchFoodItems(search?: string): Promise<FoodItem[]> {
    return this.request(`/api/food-items${buildQueryString({ search })}`);
  }

  createFoodItem(payload: CreateFoodItemPayload): Promise<FoodItem> {
    return this.request('/api/food-items', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  createEntry(payload: CreateFoodEntryPayload): Promise<FoodEntry> {
    return this.request('/api/entries', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  getEntries(query: FoodEntryQuery = {}): Promise<FoodEntry[]> {
    return this.request(
      `/api/entries${buildQueryString({
        from: query.from,
        to: query.to,
        mealType: query.mealType,
      })}`
    );
  }

  updateEntry(id: string, payload: UpdateFoodEntryPayload): Promise<FoodEntry> {
    return this.request(`/api/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  deleteEntry(id: string): Promise<{ success: boolean }> {
    return this.request(`/api/entries/${id}`, { method: 'DELETE' });
  }

  getDailySummary(date: string): Promise<DailySummary> {
    return this.request(`/api/summary/daily${buildQueryString({ date })}`);
  }

  getWeeklySummary(from: string, to: string): Promise<RangeSummary> {
    return this.request(`/api/summary/weekly${buildQueryString({ from, to })}`);
  }

  getMonthlySummary(month: number, year: number): Promise<MonthlySummary> {
    return this.request(
      `/api/summary/monthly${buildQueryString({
        month: String(month),
        year: String(year),
      })}`
    );
  }

  getGoals(): Promise<DailyGoal> {
    return this.request('/api/goals');
  }

  updateGoals(payload: UpdateDailyGoalPayload): Promise<DailyGoal> {
    return this.request('/api/goals', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }
}
