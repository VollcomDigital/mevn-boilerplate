import { z } from "zod";

export const serviceStatusSchema = z.object({
  name: z.string(),
  version: z.string(),
  uptimeSeconds: z.number().nonnegative(),
  timestamp: z.string().datetime()
});

export const apiInfoSchema = z.object({
  status: serviceStatusSchema,
  environment: z.string(),
  observability: z.object({
    tracing: z.literal("enabled").or(z.literal("disabled")),
    metrics: z.literal("enabled")
  })
});

export type ServiceStatus = z.infer<typeof serviceStatusSchema>;
export type ApiInfo = z.infer<typeof apiInfoSchema>;
