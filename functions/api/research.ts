import { research, type AIEnv } from "../../src/lib/site-research";
export const onRequest = (context: { request: Request; env: AIEnv }) =>
  research(context.request, context.env);
