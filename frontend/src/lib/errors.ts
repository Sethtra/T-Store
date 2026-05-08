type ApiErrorData = {
  message?: string;
  errors?: Record<string, string[]>;
};

type ApiError = {
  response?: {
    data?: ApiErrorData;
  };
  message?: string;
};

export const getApiErrorMessage = (
  err: unknown,
  fallback: string,
  fields: string[] = [],
) => {
  const apiError = err as ApiError;
  const data = apiError.response?.data;

  for (const field of fields) {
    const message = data?.errors?.[field]?.[0];
    if (message) return message;
  }

  return data?.message || apiError.message || fallback;
};
