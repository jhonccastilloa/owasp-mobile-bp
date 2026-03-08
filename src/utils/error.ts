export const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

export const isNodeError = (
  error: unknown
): error is NodeJS.ErrnoException => {
  return error instanceof Error && 'code' in error;
};
