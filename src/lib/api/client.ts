import { API_BASE_URL } from '@/lib/constants';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      let errorDetail: unknown;
      try {
        errorDetail = await response.json();
      } catch {
        errorDetail = await response.text();
      }

      throw new ApiError(
        `API Error: ${response.status} ${response.statusText}`,
        response.status,
        errorDetail
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network error or other issue
    throw new ApiError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      0
    );
  }
}

export async function streamRequest(
  endpoint: string,
  body: unknown
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errorDetail: unknown;
    try {
      errorDetail = await response.json();
    } catch {
      errorDetail = await response.text();
    }

    throw new ApiError(
      `API Error: ${response.status} ${response.statusText}`,
      response.status,
      errorDetail
    );
  }

  return response;
}
