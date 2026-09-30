import type { ApiErrorBody } from '../../features/auth/types/auth';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: Array<{ field?: string; message: string }>;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = 'ApiError';
    this.status = status;
    this.code = body.code;
    this.details = body.details ?? [];
  }

  fieldMessage(field: string): string | undefined {
    return this.details.find((detail) => detail.field === field)?.message;
  }
}

const DEFAULT_MESSAGES: Record<string, string> = {
  UNSUPPORTED_UNIVERSITY_EMAIL:
    'Use a supported university email address to register as a Student.',
  EMAIL_ALREADY_REGISTERED: 'An account already exists for this email.',
  VALIDATION_ERROR: 'The submitted data is invalid.',
  INVALID_VERIFICATION_TOKEN: 'This verification link is invalid.',
  EXPIRED_VERIFICATION_TOKEN: 'This verification link has expired.',
  INVALID_PAYMENT_METHOD: 'Choose a supported payment preference.',
  INVALID_CREDENTIALS: 'Email or password is incorrect.',
  UNAUTHORIZED: 'Sign in to continue.',
  FORBIDDEN: 'You do not have access to this page.',
  SKILL_NOT_FOUND: 'That skill is not available.',
  STUDENT_SKILL_ALREADY_EXISTS: "You've already added this skill.",
  STUDENT_SKILL_NOT_FOUND: 'That skill is not on your profile.',
};

export function userFacingAuthMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return DEFAULT_MESSAGES[error.code] ?? error.message;
  }
  return 'The request could not be completed. Try again.';
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '';
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const body = (await response.json().catch(() => null)) as ApiErrorBody | T | null;

  if (!response.ok) {
    const errorBody: ApiErrorBody = {
      code: (body as ApiErrorBody | null)?.code ?? 'INTERNAL_ERROR',
      message:
        (body as ApiErrorBody | null)?.message ?? 'The request could not be completed.',
      details: (body as ApiErrorBody | null)?.details ?? [],
    };
    throw new ApiError(response.status, errorBody);
  }

  return body as T;
}
