// Shared constants for Cashback IQ.

import type { Category } from "@/core/types";

// localStorage key under which UserData is persisted.
export const STORAGE_KEY = "cashback-iq:user-data";

// All spending categories, in display order.
export const CATEGORIES: Category[] = [
  "groceries",
  "dining",
  "gas",
  "travel",
  "online",
  "streaming",
  "transit",
  "other",
];
