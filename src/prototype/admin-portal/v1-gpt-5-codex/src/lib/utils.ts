import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export {
  areExportsEqual,
  createId,
  draftFromExportConfiguration,
  incrementVersionTag,
  normalizeExportConfiguration,
  parseVersionTag,
  toExportConfiguration,
} from "@shared/configuration";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
