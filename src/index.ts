import * as z from "zod/v4";

export interface ARN {
  partition: string;
  service: string;
  region: string;
  accountId: string;
  resource: string;
}

const arnSchema = z.object({
  partition: z.string().min(1, "Missing partition field"),
  service: z.string().min(1, "Missing service field"),
  region: z.string(),
  accountId: z.string(),
  resource: z.string().min(1, "Missing resource field"),
});

export function arn(): z.ZodCodec<z.ZodString, typeof arnSchema> {
  return z.codec(z.string().trim(), arnSchema, {
    decode(input, ctx) {
      const [prefix, partition = "", service = "", region = "", accountId = "", ...resource] = input.split(":");
      if (prefix !== "arn" || resource.length === 0) {
        ctx.issues.push({ input, code: "custom", message: "Invalid ARN" });
        return z.NEVER;
      }

      return { partition, service, region, accountId, resource: resource.join(":") } satisfies ARN;
    },
    encode({ partition, service, region, accountId, resource }) {
      return `arn:${partition}:${service}:${region}:${accountId}:${resource}`;
    },
  });
}
