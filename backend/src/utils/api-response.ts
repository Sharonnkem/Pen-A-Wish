type SuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

type ErrorResponse = {
  success: false;
  message: string;
  errors: string[];
};

export function successResponse<T>(message: string, data: T): SuccessResponse<T> {
  return {
    success: true,
    message,
    data
  };
}

export function errorResponse(message: string, errors: string[] = []): ErrorResponse {
  return {
    success: false,
    message,
    errors
  };
}
