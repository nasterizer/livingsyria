import { Router, type IRouter, type Request, type Response } from "express";
import {
  RequestUploadUrlBody,
  RequestUploadUrlResponse,
} from "@workspace/api-zod";
import { ObjectStorageService } from "../lib/objectStorage";

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_UPLOAD_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

/**
 * POST /storage/uploads/request-url
 *
 * Returns a pre-signed R2 PUT URL plus the permanent public URL (objectPath)
 * that should be stored in the database.
 *
 * Flow:
 *   1. Client POSTs metadata (name, size, contentType)
 *   2. Server returns { uploadURL, objectPath, metadata }
 *   3. Client PUTs the file directly to uploadURL (no server proxy)
 *   4. Client stores objectPath in the listing payload
 */
router.post("/storage/uploads/request-url", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = RequestUploadUrlBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Missing or invalid required fields" });
    return;
  }

  const { name, size, contentType } = parsed.data;

  if (size > MAX_UPLOAD_BYTES) {
    res.status(413).json({ error: `File too large (max ${MAX_UPLOAD_BYTES} bytes)` });
    return;
  }
  if (!ALLOWED_UPLOAD_TYPES.has(contentType)) {
    res.status(415).json({ error: "Unsupported content type" });
    return;
  }

  try {
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);

    res.json(
      RequestUploadUrlResponse.parse({
        uploadURL,
        objectPath,
        metadata: { name, size, contentType },
      }),
    );
  } catch (error) {
    req.log.error({ err: error }, "Error generating R2 upload URL");
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

export default router;
