export class ApiError extends Error {
  constructor(public readonly status: number, message: string, public readonly details?: unknown) {
    super(message);
  }
}

export function badRequest(message: string, details?: unknown) {
  return new ApiError(400, message, details);
}

export function forbidden(message = "Action is not allowed.", details?: unknown) {
  return new ApiError(403, message, details);
}

export function notFound(message = "Resource not found.", details?: unknown) {
  return new ApiError(404, message, details);
}

export function conflict(message = "Request conflicts with current state.", details?: unknown) {
  return new ApiError(409, message, details);
}
