export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNSUPPORTED_UNIVERSITY_EMAIL: 'UNSUPPORTED_UNIVERSITY_EMAIL',
  EMAIL_ALREADY_REGISTERED: 'EMAIL_ALREADY_REGISTERED',
  INVALID_VERIFICATION_TOKEN: 'INVALID_VERIFICATION_TOKEN',
  EXPIRED_VERIFICATION_TOKEN: 'EXPIRED_VERIFICATION_TOKEN',
  INVALID_PAYMENT_METHOD: 'INVALID_PAYMENT_METHOD',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  REGISTRATION_FAILED: 'REGISTRATION_FAILED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  SKILL_NOT_FOUND: 'SKILL_NOT_FOUND',
  STUDENT_SKILL_ALREADY_EXISTS: 'STUDENT_SKILL_ALREADY_EXISTS',
  STUDENT_SKILL_NOT_FOUND: 'STUDENT_SKILL_NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details: Array<{ field?: string; message: string }>;

  constructor(
    code: ErrorCode,
    message: string,
    status: number,
    details: Array<{ field?: string; message: string }> = [],
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function validationError(
  message: string,
  details: Array<{ field?: string; message: string }> = [],
): AppError {
  return new AppError(ErrorCode.VALIDATION_ERROR, message, 400, details);
}

export function unsupportedUniversityEmail(): AppError {
  return new AppError(
    ErrorCode.UNSUPPORTED_UNIVERSITY_EMAIL,
    'Use a supported university email address to register as a Student.',
    400,
    [{ field: 'email', message: 'Use a supported university email address to register as a Student.' }],
  );
}

export function emailAlreadyRegistered(): AppError {
  return new AppError(
    ErrorCode.EMAIL_ALREADY_REGISTERED,
    'An account already exists for this email.',
    409,
    [{ field: 'email', message: 'An account already exists for this email.' }],
  );
}

export function invalidVerificationToken(): AppError {
  return new AppError(
    ErrorCode.INVALID_VERIFICATION_TOKEN,
    'This verification link is invalid.',
    400,
    [{ field: 'token', message: 'This verification link is invalid.' }],
  );
}

export function expiredVerificationToken(): AppError {
  return new AppError(
    ErrorCode.EXPIRED_VERIFICATION_TOKEN,
    'This verification link has expired.',
    400,
    [{ field: 'token', message: 'This verification link has expired.' }],
  );
}

export function invalidPaymentMethod(): AppError {
  return new AppError(
    ErrorCode.INVALID_PAYMENT_METHOD,
    'Choose a supported payment preference.',
    400,
    [{ field: 'preferredPaymentMethod', message: 'Choose a supported payment preference.' }],
  );
}

export function invalidCredentials(): AppError {
  return new AppError(ErrorCode.INVALID_CREDENTIALS, 'Email or password is incorrect.', 401);
}

export function registrationFailed(): AppError {
  return new AppError(ErrorCode.REGISTRATION_FAILED, 'Registration could not be completed.', 500);
}

export function skillNotFound(): AppError {
  return new AppError(ErrorCode.SKILL_NOT_FOUND, 'That skill is not available.', 404, [
    { field: 'skillId', message: 'That skill is not available.' },
  ]);
}

export function studentSkillAlreadyExists(): AppError {
  return new AppError(
    ErrorCode.STUDENT_SKILL_ALREADY_EXISTS,
    "You've already added this skill.",
    409,
    [{ field: 'skillId', message: "You've already added this skill." }],
  );
}

export function studentSkillNotFound(): AppError {
  return new AppError(ErrorCode.STUDENT_SKILL_NOT_FOUND, 'That skill is not on your profile.', 404);
}

export function forbidden(): AppError {
  return new AppError(ErrorCode.FORBIDDEN, 'You do not have access to this resource.', 403);
}

