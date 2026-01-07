import { createServer } from "node:http";
import { fileURLToPath } from "url";
import { hostname } from "node:os";
import { server as wisp, logging } from "@mercuryworkshop/wisp-js/server";
import Fastify from "fastify";
import express from "express";
import aiRoutes from "./ai.js";
import fastifyStatic from "@fastify/static";

import { scramjetPath } from "@mercuryworkshop/scramjet/path";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import { handleAI } from "./ai.js";

const publicPath = fileURLToPath(new URL("../public/", import.meta.url));


// Wisp Configuration
logging.set_level(logging.NONE);
Object.assign(wisp.options, {
  allow_udp_streams: false,
  hostname_blacklist: [/example\.com/],
  dns_servers: ["1.1.1.3", "1.0.0.3"],
});

const fastify = Fastify({
  serverFactory: (handler) => {
    return createServer()
      .on("request", (req, res) => {
        // ------------------------------------------------------------------
        // ✅ Apply COOP/COEP ONLY for Scramjet proxy resources
        //    This prevents TMDB posters & external images from breaking.
        // ------------------------------------------------------------------
        if (
          req.url.startsWith("/scram/") ||
          req.url.startsWith("/baremux/") ||
          req.url.startsWith("/epoxy/") ||
          req.url.startsWith("/wisp/")
        ) {
          res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
          res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
        }

        // Continue normally
        handler(req, res);
      })
      .on("upgrade", (req, socket, head) => {
        if (req.url.endsWith("/wisp/")) wisp.routeRequest(req, socket, head);
        else socket.end();
      });
  },
});

// Static public files
fastify.register(fastifyStatic, {
  root: publicPath,
  decorateReply: true,
});

// Scramjet static files
fastify.register(fastifyStatic, {
  root: scramjetPath,
  prefix: "/scram/",
  decorateReply: false,
});

// Epoxy static files
fastify.register(fastifyStatic, {
  root: epoxyPath,
  prefix: "/epoxy/",
  decorateReply: false,
});

// BareMux static files
fastify.register(fastifyStatic, {
  root: baremuxPath,
  prefix: "/baremux/",
  decorateReply: false,
});

// 404 Handler
fastify.setNotFoundHandler((res, reply) => {
  return reply.code(404).type("text/html").sendFile("404.html");
});

// Logging listener
fastify.server.on("listening", () => {
  const address = fastify.server.address();
  console.log("Listening on:");
  console.log(`\thttp://localhost:${address.port}`);
  console.log(`\thttp://${hostname()}:${address.port}`);
  console.log(
    `\thttp://${
      address.family === "IPv6" ? `[${address.address}]` : address.address
    }:${address.port}`
  );
});

fastify.post("/api/ai", aiRoute);

// Shutdown handlers
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function shutdown() {
  console.log("SIGTERM signal received: closing HTTP server");
  fastify.close();
  process.exit(0);
}

// Port config
let port = parseInt(process.env.PORT || "");
if (isNaN(port)) port = 8080;

fastify.listen({
  port,
  host: "0.0.0.0",
});
