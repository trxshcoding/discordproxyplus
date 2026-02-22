// SPDX-FileCopyrightText: 2026 Amy <amyulated@proton.me>
// SPDX-FileCopyrightText: 2026 Sunnie <>
//
// SPDX-License-Identifier: EUPL-1.2

import { readFileSync } from "fs";
import { z } from "zod";

const fileConfig = JSON.parse(
  readFileSync("config.json", { encoding: "utf-8" }),
);

export const configT = z.object({
  tokens: z.array(z.string()),
  cacheTTL: z.number(),
});

export type Config = z.infer<typeof configT>;
export const config: Config = {
  ...configT.parse(fileConfig),
};

interface tokenIteratorResponse {
  token: string;
  islastone: boolean;
  numberOfTokens: number;
}

let innercounter = 0;
export function getNextToken(): tokenIteratorResponse {
  if (innercounter === config.tokens.length) {
    innercounter = 0;
  }
  return {
    token: config.tokens[innercounter++],
    islastone: innercounter === config.tokens.length,
    numberOfTokens: config.tokens.length,
  };
}
