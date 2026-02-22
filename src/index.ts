// SPDX-FileCopyrightText: 2026 Amy <amyulated@proton.me>
// SPDX-FileCopyrightText: 2026 Sunnie <>
//
// SPDX-License-Identifier: EUPL-1.2

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { config } from "./config.ts";
import {
  getAnimatedImageData,
  getJsonData,
  getStillImageData,
  identify,
} from "./lib/discord.ts";
import { handleOSSignals } from "./signalHandler.ts";
//import { Router } from "./router.ts";

config.tokens.forEach(async (i, v) => {
  const identity = await identify(i);
  if (!identity) {
    console.error(
      `invalid token: ${i.length === 0 ? "<empty token>" : `${i}`} at ${v}`,
    );
  } else {
    console.log(`logged in as ${identity}`);
  }
});

// TODO: MAKE ROUTER TYPE THAT HANDLES API ROUTING!

const app = new Hono();
//const router = new Router(app);

//router.createEndpoint("/index");

app.get("/:id{.+\\.json}", async (ctx) => {
  const fullId = ctx.req.param("id");
  const id = fullId.replace(".json", "");
  if (id === "@me") {
    return ctx.json({
      ok: false,
      message: "Why tf do you care abt the bot.",
    });
  }
  const meow = await getJsonData(id);
  if (!meow.ok) {
    return ctx.json(meow, 500);
  }
  return ctx.json(meow);
});

app.get("/:id{.+\\.png}", async (ctx) => {
  const fullId = ctx.req.param("id");
  const id = fullId.replace(".png", "");
  if (id === "@me") {
    return ctx.json({
      ok: false,
      message: "im an amy",
    });
  }
  const meow = await getStillImageData(id);
  if (!meow) {
    return ctx.status(500);
  }
  ctx.header("Content-Type", "image/png");
  return ctx.body(new Uint8Array(meow));
});

app.get("/:id{.+\\.gif}", async (ctx) => {
  const fullId = ctx.req.param("id");
  const id = fullId.replace(".gif", "");
  const meow = await getAnimatedImageData(id);
  if (id === "@me") {
    ctx.status(418);
    return ctx.json({
      ok: false,
      message: "im an amy",
    });
  }
  if (!meow) {
    return ctx.status(500);
  }
  ctx.header("Content-Type", "image/gif");
  return ctx.body(new Uint8Array(meow));
});

//const server = router.serve(8787);
const server = serve({
  fetch: app.fetch,
  port: 8787,
});

handleOSSignals(server);
