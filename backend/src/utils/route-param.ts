import { AppError } from "./app-error.js";

export function getRequiredRouteParam(
  value: string | string[] | undefined,
  name: string
) {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError(`Missing route parameter: ${name}`, 400);
  }

  return value;
}
