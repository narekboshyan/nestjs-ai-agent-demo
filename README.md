# NestJS AI agent demo

A small NestJS 12 app with an AI agent built on the official [`@nestjs/ai`](https://docs.nestjs.com/ai/overview) module. It shows how to add an agent to an existing app without changing your services.

It runs without an API key: in `demo` mode a scripted model stands in for a real one.

## What it shows

| Step        | Where                                      | What                                                                 |
| ----------- | ------------------------------------------ | -------------------------------------------------------------------- |
| 1. Install  | `package.json`                             | `@nestjs/ai`, `@nestjs/resilience`, `ai`, `@ai-sdk/anthropic`, `zod` |
| 2. Register | `src/app.module.ts`, `src/ai/ai.config.ts` | `AiModule.forRootAsync()` built from validated config                |
| 3. Expose   | `src/orders/orders.tools.ts`               | `@AgentFunction()` on provider methods; `OrdersService` is untouched |
| 4. Call     | `src/support/support.service.ts`           | `ai.generateText({ prompt, tools, caller: { request } })`            |
| 5. Protect  | `src/auth/support-only.guard.ts`           | `@UseGuards()` on the `refund` tool                                  |

## Project layout

```text
src/
  main.ts                 bootstrap
  app.module.ts           wires config, rate limit, AI and feature modules
  config/env.ts           environment schema; the app refuses to start on bad config
  ai/                     AiModule options and the demo model
  auth/                   guard, demo user middleware, request types
  orders/                 OrdersService and its agent functions
  support/                POST /ask: controller, service, DTO
test/
  orders.tools.test.ts    tool calls: schema, guard, method
  support.e2e.test.ts     POST /ask over HTTP with a fake model
```

## The request flow

1. `POST /ask` reaches the controller. The body is validated and the rate limit is checked.
2. `SupportService` calls `ai.generateText()` with the prompt.
3. The model asks for a tool, for example `find-order`.
4. Nest checks the input against the tool's schema.
5. Nest checks scopes, then runs guards.
6. Your method runs.
7. The model reads the result. Steps 3 to 7 repeat until it can answer. This app allows 5 model calls per request.
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

## Scripts

| Command          | What it does                 |
| ---------------- | ---------------------------- |
| `npm run dev`    | Build and start              |
| `npm test`       | Type-check and run the tests |
| `npm run lint`   | ESLint                       |
| `npm run format` | Prettier                     |
| `npm run build`  | Compile `src` to `dist`      |

## Configuration

Copy `.env.example` to `.env` or set the variables in your shell.

| Variable            | Default           | Meaning                                                   |
| ------------------- | ----------------- | --------------------------------------------------------- |
| `AI_PROVIDER`       | `demo`            | `demo` for the scripted model, `anthropic` for a real one |
| `ANTHROPIC_API_KEY` | none              | Required when `AI_PROVIDER=anthropic`                     |
| `ANTHROPIC_MODEL`   | `claude-opus-5-5` | Model id passed to `@ai-sdk/anthropic`                    |
| `PORT`              | `3000`            | HTTP port                                                 |

Any `@ai-sdk/*` provider package can replace Anthropic in `src/ai/ai.config.ts`.

## Things to know

- **Why imports end in `.js`.** The source files are TypeScript. NestJS 12 is ESM, and Node's ESM rules need the import to name the compiled file, so `import './app.module.js'` points at `app.module.ts`.
- **Demo auth.** `src/auth/demo-user.middleware.ts` trusts an `x-demo-role` header so the guard has a user to check. It is there only to make the demo runnable. In a real app your own authentication sets `request.user`.
- **Guards and pipes are bound to the controller, not globally.** Global guards and pipes also run on the model's tool calls. The rate limit and the validation pipe only make sense for the HTTP request, so they sit on `SupportController`.
- **Early package.** This was built against `@nestjs/ai` 0.0.2, first published in November 2026. The API can still change.
- **Tested with fake models only.** The tests and the demo mode use fake models. The real-model path (`AI_PROVIDER=anthropic`) was not run.
- **Plain `tsc`, no Nest CLI.** The build is a single `tsc` call to keep dependencies small.
- **Not included.** Durable runs with human approval (`@nestjs/ai/workflows`) and MCP tools (`@nestjs/mcp`). See the docs below.

## References

- Overview: https://docs.nestjs.com/ai/overview
- Tools, guards, scopes: https://docs.nestjs.com/ai/tools
- Agents and durable runs: https://docs.nestjs.com/ai/agents
- Source: https://github.com/nestjs/ai

## License

MIT
