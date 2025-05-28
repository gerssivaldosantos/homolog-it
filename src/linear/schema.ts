import { z } from 'zod';

export const issueStateSchema = z.object({
  name: z.string()
});

export const linearIssueDataSchema = z.object({
  type: z.literal('Issue'),
  action: z.string(),
  actor: z.object({
    id: z.string(),
    name: z.string()
  }),
  createdAt: z.string(),
  updatedFrom: z.record(z.unknown()),
  data: z.object({
    state: issueStateSchema,
    identifier: z.string(),
    title: z.string(),
    url: z.string(),
    webhookTimestamp: z.number().optional()
  })
});

export type LinearWebhookSchema = z.infer<typeof linearIssueDataSchema>;
