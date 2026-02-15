// SPDX-FileCopyrightText: 2026 Amy <amyulated@proton.me>
// SPDX-FileCopyrightText: 2026 Sunnie <>
//
// SPDX-License-Identifier: EUPL-1.2

import { ofetch, type FetchOptions } from "ofetch";

type InitOptions = Exclude<FetchOptions, "responseType">;

export const http = ofetch.create({
	timeout: 10_000,
	retry: 2,
});

export type HttpClient = typeof http;

export const httpJson = async <T = any>(url: string, init?: InitOptions) =>
	http<T>(url, { ...init, responseType: "json" } as any);

export const httpBuffer = async (url: string, init?: InitOptions) =>
	Buffer.from(
		await http<ArrayBuffer>(url, {
			...init,
			responseType: "arrayBuffer",
		} as any),
	);

export const httpText = async (url: string, init?: InitOptions) =>
	http<string>(url, { ...init, responseType: "text" } as any);
