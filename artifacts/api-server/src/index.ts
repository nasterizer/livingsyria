import app from "./app";
import { logger } from "./lib/logger";
import { ingestFeeds } from "./lib/newsIngestion";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  const ONE_HOUR_MS = 60 * 60 * 1000;

  setTimeout(() => {
    ingestFeeds().catch((e) => logger.error({ err: e }, "Initial news ingestion failed"));
    setInterval(() => {
      ingestFeeds().catch((e) => logger.error({ err: e }, "Hourly news ingestion failed"));
    }, ONE_HOUR_MS);
  }, 5_000);
});
