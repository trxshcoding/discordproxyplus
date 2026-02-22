import type { ServerType } from "@hono/node-server/.";

export function handleOSSignals(server: ServerType): void {
  // Interrupt handler
  process.on("SIGINT", () => {
    server.close();
    process.exit(0);
  });

  // Awful termination signal handler
  process.on("SIGTERM", () => {
    server.close((err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }

      process.exit(0);
    });
  });
}
