import "server-only";
import { AwsClient } from "aws4fetch";

// R2 through its S3 API. The browser uploads straight to a signed URL, so no file passes through the server.
const bucketUrl = (key: string) => `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET}/${key}`;

export const r2Ready = () => !!(process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET);

const client = () => {
  if (!r2Ready()) throw new Error("R2 keys are not set");
  return new AwsClient({ accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!, service: "s3", region: "auto" });
};

// a PUT URL that is good for ten minutes
export async function presignPut(key: string) {
  const req = await client().sign(new Request(`${bucketUrl(key)}?X-Amz-Expires=600`, { method: "PUT" }), { aws: { signQuery: true } });
  return req.url;
}

export async function deleteObject(key: string) {
  await client().fetch(bucketUrl(key), { method: "DELETE" });
}
