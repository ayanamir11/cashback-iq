// Typed handle on the canonical card dataset.
//
// cards.json stays as pure JSON so the React Native (Expo) port can reuse it
// unchanged; this module gives the rest of the codebase a compile-time-checked
// Card[] view of that data.

import type { Card } from "./types";

import cardsData from "./cards.json";

export const cards = cardsData as Card[];
