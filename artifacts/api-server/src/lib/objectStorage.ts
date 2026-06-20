import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
}

function getR2Config(): R2Config {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
    throw new Error(
      "R2 storage not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, " +
        "R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and R2_PUBLIC_URL.",
    );
  }
  return { accountId, accessKeyId, secretAccessKey, bucketName, publicUrl };
}

function createS3Client(): S3Client {
  const { accountId, accessKeyId, secretAccessKey } = getR2Config();
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
    // forcePathStyle required for R2 — it doesn't support virtual-hosted bucket URLs
    // when using a custom account endpoint.
    forcePathStyle: true,
  });
}

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  /**
   * Generates a pre-signed S3 PUT URL pointing at R2.
   * The caller uploads the file directly to this URL (PUT request).
   * Pass the returned URL to normalizeObjectEntityPath() to obtain the
   * permanent public URL that should be stored in the database.
   */
  async getObjectEntityUploadURL(): Promise<string> {
    const { bucketName } = getR2Config();
    const client = createS3Client();
    const key = `uploads/${randomUUID()}`;
    const command = new PutObjectCommand({ Bucket: bucketName, Key: key });
    return getSignedUrl(client, command, { expiresIn: 900 });
  }

  /**
   * Converts a pre-signed R2 PUT URL into the permanent public URL.
   *
   * With forcePathStyle=true the signed URL has the form:
   *   https://<accountId>.r2.cloudflarestorage.com/<bucketName>/<key>?X-Amz-...
   *
   * We strip the bucket prefix from the pathname and prefix with R2_PUBLIC_URL:
   *   https://<R2_PUBLIC_URL>/<key>   e.g. https://pub-xxx.r2.dev/uploads/<uuid>
   *
   * If rawPath is already an https:// URL that doesn't look like a signed URL
   * (e.g. already normalised on a previous call), it is returned as-is.
   */
  normalizeObjectEntityPath(rawPath: string): string {
    try {
      const { bucketName, publicUrl } = getR2Config();
      const url = new URL(rawPath);
      let key = url.pathname; // /<bucketName>/<key>
      const bucketPrefix = `/${bucketName}/`;
      if (key.startsWith(bucketPrefix)) {
        key = key.slice(bucketPrefix.length); // strip leading bucket segment
      } else if (key.startsWith("/")) {
        key = key.slice(1);
      }
      return `${publicUrl}/${key}`;
    } catch {
      // Not a valid URL — return unchanged (already normalised or non-URL path)
      return rawPath;
    }
  }

  /**
   * No-op for R2: the bucket uses public-read access at the bucket level.
   * Per-object ACLs are not supported on R2. Returns rawPath unchanged.
   */
  async trySetObjectEntityAclPolicy(rawPath: string): Promise<string> {
    return rawPath;
  }
}
