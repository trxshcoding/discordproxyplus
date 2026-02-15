// SPDX-FileCopyrightText: 2026 Amy <amyulated@proton.me>
// SPDX-FileCopyrightText: 2026 Sunnie <>
//
// SPDX-License-Identifier: EUPL-1.2

import { config, getNextToken } from "../config.ts";
import { purgeOldValues } from "../util/purge.ts";
import { httpBuffer, httpJson } from "./http.ts";

export async function identify(token: string) {
	const data = await httpJson(`https://discord.com/api/v10/users/@me`, {
		headers: {
			Authorization: `Bot ${token}`,
		},
	}).catch(() => {
		return null;
	});
	if (!data) return;
	return `${data.username}#${data.discriminator} (${data.id})`;
}

// this should only have two uses. i will punch you if you use this directly
// update: i just realized this has three uses. my year was ruined. i am currently having a mental breakdown while getting a divorce
async function getJsonWITHOUTcaching(token: string, id: string) {
	if (id === "@me") {
		return;
	}
	const data = await httpJson(`https://discord.com/api/v10/users/${id}`, {
		headers: {
			Authorization: `Bot ${token}`,
		},
	}).catch(() => {
		return;
	});
	if (!data) return;
	return data;
}

function transformJsonResponse(from: RawUserObject): PreferredUserObject {
	return {
		ok: true,
		avatar: {
			url: `https://cdn.discordapp.com/avatars/${from.id}/${from.avatar}.${(from.avatar as string).startsWith("a_") ? "gif" : "png"}?size=2048`,
			isAnimated: (from.avatar as string).startsWith("a_"),
		},
		bot: from.bot ?? false,
		id: from.id,
		username: from.username,
		raw: { ...from },
	}
}

type RawUserObject = any
interface PreferredUserObject {
	ok: true;
	id: string;
	username: string;
	avatar: {
		url: string;
		isAnimated: boolean;
	};
	bot: boolean;
	/*
	 *	why is this an any?
	 *	please refer to https://docs.discord.food/resources/user#user-object
	 * if you think you can do it, ill gladly take a pr!
	 * of course, youll complain, but you wont pr it.
	 */
	raw: RawUserObject;
}
interface FuckedUpUserObject {
	ok: false;
	message: string;
}
type JsonResponse = PreferredUserObject | FuckedUpUserObject

const jsonCache = {} as Record<string, { response: JsonResponse, at: number }>
purgeOldValues(jsonCache, config.cacheTTL * 1000)
export async function getJsonData(
	id: string,
): Promise<JsonResponse> {
	const cacheHit = jsonCache[id]
	if (cacheHit) return cacheHit.response

	const meow = await getJsonWITHOUTcaching(getNextToken().token, id);
	if (!meow) {
		return {
			ok: false,
			message: "could not get object from discord",
		};
	}

	jsonCache[id] = {
		response: transformJsonResponse(meow),
		at: Date.now()
	}
	return transformJsonResponse(meow);
}

const staticPfpCache = {} as Record<string, { response: Buffer, at: number }>
purgeOldValues(staticPfpCache, config.cacheTTL * 1000)
export async function getStillImageData(
	id: string,
): Promise<Buffer | undefined> {
	const cacheHit = staticPfpCache[id]
	if (cacheHit) return cacheHit.response

	const meow = await getJsonWITHOUTcaching(getNextToken().token, id);
	if (!meow) {
		return;
	}
	const url = `https://cdn.discordapp.com/avatars/${meow.id}/${meow.avatar}.png?size=2048`;

	const balls = await fetch(url);
	// if balls not ok:
	if (!balls.ok) {
		//you should see a doctor
		return;
	}
	if (!balls.headers.get("content-type")?.startsWith("image/")) {
		return;
	}

	const buffer = Buffer.from(await balls.arrayBuffer())
	staticPfpCache[id] = {
		response: buffer,
		at: Date.now()
	}
	return buffer;
}

const animatedPfpCache = {} as Record<string, { response: Buffer, at: number }>
purgeOldValues(animatedPfpCache, config.cacheTTL * 1000)
export async function getAnimatedImageData(
	id: string,
): Promise<Buffer | undefined> {
	const cacheHit = animatedPfpCache[id]
	if (cacheHit) return cacheHit.response

	const meow = await getJsonWITHOUTcaching(getNextToken().token, id);
	if (!meow) {
		return;
	}
	const url = `https://cdn.discordapp.com/avatars/${meow.id}/${meow.avatar}.gif?size=2048`;

	const ImNotMakingTheSameJokeAgain = await fetch(url);
	if (!ImNotMakingTheSameJokeAgain.ok) {
		return;
	}
	if (
		!ImNotMakingTheSameJokeAgain.headers
			.get("content-type")
			?.startsWith("image/")
	) {
		return;
	}
	const buf = Buffer.from(await ImNotMakingTheSameJokeAgain.arrayBuffer());
	animatedPfpCache[id] = {
		response: buf,
		at: Date.now()
	}
	return buf;
}
