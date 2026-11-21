# NestJS AI agent demo

A minimal NestJS 12 app with an AI agent built on the official [`@nestjs/ai`](https://docs.nestjs.com/ai/overview) module. It shows how to add an agent to an existing app in five steps, without changing your services.

It runs without an API key: a small scripted fake model stands in for a real one.

## What it shows

| Step | Where | What |
|---|---|---|
| 1. Install | `package.json` | `@nestjs/ai`, `@nestjs/resilience`, `ai`, `@ai-sdk/anthropic`, `zod` |
| 2. Register | `src/app.module.ts` | `AiModule.forRoot({ models })` |
| 3. Expose | `src/orders/orders.tools.ts` | `@AgentFunction()` on provider methods; `OrdersService` is untouched |
| 4. Call | `src/support/support.controller.ts` | `ai.generateText({ prompt, tools, caller: { request } })` |
| 5. Protect | `src/auth/support-only.guard.ts` | `@UseGuards()` on the `refund` tool |

## The request flow

1. `POST /ask` reaches the controller.
2. `ai.generateText()` sends the prompt to the model.
3. The model asks for a tool, for example `find-order`.
4. Nest checks the input against the tool's schema.
5. Nest checks scopes, then runs guards.
6. Your method runs.
7. The model reads the result. Steps 3 to 7 repeat until it can answer (10 model calls by default).
8. The client gets the answer.

## Run it

Needs Node.js 22 or later.

```bash
npm install
npm run dev
```

The app listens on port 3000. If that port is taken, set another one, for example `PORT=3456 npm run dev`, and use it in the commands below.

Ask about an order:

```bash
curl -s localhost:3000/ask -H 'content-type: application/json' -d '{"question":"Where is order ord_1?"}'
```

Try a refund as a customer. The guard refuses, and the model reads `Forbidden resource`:

```bash
curl -s localhost:3000/ask -H 'content-type: application/json' -d '{"question":"Please refund ord_2"}'
```

Try it as a support user. The refund goes through:

```bash
curl -s localhost:3000/ask -H 'content-type: application/json' -H 'x-demo-role: support' -d '{"question":"Please refund ord_2"}'
```

Run all three flows as a check:

```bash
npm run smoke
```

## Use a real model

Set `ANTHROPIC_API_KEY` in your environment and start the app again. `src/models.ts` then uses `@ai-sdk/anthropic` instead of the fake model. Any `@ai-sdk/*` provider package works the same way.

## Things to know

- **Demo auth.** `src/auth/demo-user.middleware.ts` trusts an `x-demo-role` header so the guard has a user to check. It is there only to make the demo runnable. In a real app your own authentication sets `request.user`.
- **Early package.** This was built against `@nestjs/ai` 0.0.2, first published in November 2026. The API can still change.
- **Tested with the fake model only.** The three flows above pass with the scripted model. The real-model path was not run here.
- **Not included.** Durable runs with human approval (`@nestjs/ai/workflows`) and MCP tools (`@nestjs/mcp`). See the docs below.

## References

- Overview: https://docs.nestjs.com/ai/overview
- Tools, guards, scopes: https://docs.nestjs.com/ai/tools
- Agents and durable runs: https://docs.nestjs.com/ai/agents
- Source: https://github.com/nestjs/ai

## License

MIT
