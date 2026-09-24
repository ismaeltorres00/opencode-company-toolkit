import type { Plugin } from "@opencode-ai/plugin"

export const AuditPlugin: Plugin = async ({ client }) => ({
  "tool.execute.before": async (input) => {
    await client.app.log({
      body: {
        service: "company-audit",
        level: "info",
        message: `Tool requested: ${input.tool}`
      }
    })
  }
})
