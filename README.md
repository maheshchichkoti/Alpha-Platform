# Alpha Platform — Founding Full-Stack Engineer Take-Home

This repository contains the solution for the full-stack engineering take-home challenge. It's a fully dockerized, production-ready "vertical slice" of a research agent platform.

## Key Features & Architectural Decisions

- **Fully Dockerized:** The entire stack (Backend, Frontend, DB, Queue) runs with a single command: `docker compose up`.
- **Asynchronous Job Processing:** API requests (`POST /enrich`) are lightweight, instantly returning a `jobId` after queueing the task in Redis. A separate worker process handles the heavy lifting, ensuring the API remains highly available.
- **Real-time Progress Streaming:** The UI uses **Server-Sent Events (SSE)** to stream live progress from the agent. This is a lightweight and efficient choice for one-way data flow from server to client.
- **Decoupled Agent:** The `ResearchAgent` is decoupled from the web server. It communicates its progress via a publisher function, which in production pushes messages to a Redis Pub/Sub channel. This makes the agent highly modular and testable.
- **Production-Ready Practices:**
  - **Structured Logging:** Uses `pino` for efficient, structured JSON logs.
  - **Singleton DB Client:** A single, shared Prisma instance prevents database connection exhaustion.
  - **Graceful Shutdown:** The server and worker are configured to shut down gracefully.
  - **Health Checks:** A `/healthz` endpoint checks database and Redis connectivity.

---

## Quick Start

**Prerequisites:** Docker and Docker Compose must be installed.

1.  **Clone the repository:**

    ```bash
    git clone <your-repo-url>
    cd alpha-platform-challenge
    ```

2.  **Build and run the application:**

    ```bash
    docker compose up --build
    ```

3.  **Access the application:**
    - **Web UI:** [http://localhost:3000](http://localhost:3000)
    - **Backend API:** [http://localhost:4000](http://localhost:4000)
    - **API Docs (Swagger):** [http://localhost:4000/api-docs](http://localhost:4000/api-docs)

The backend service automatically runs database migrations and seeds the initial data on the first start.

---

## How to Use

### Triggering Enrichment

- **Via the UI:**

  1.  Open [http://localhost:3000](http://localhost:3000).
  2.  Click the "Run Research" button next to a person's name.
  3.  Observe the live progress logs in the console below.
  4.  Once complete, the structured results will be displayed.

- **Via the API (cURL):**

  1.  Get a `personId` from the `GET /people` endpoint (or use the seeded data). The first person is `Alice Smith`.
  2.  Trigger the enrichment job:

      ```bash
      # First, find a person's ID
      curl http://localhost:4000/people | json_pp

      # Then, trigger the job (replace <personId> with an actual ID)
      curl -X POST http://localhost:4000/enrich/<personId>
      ```

  3.  This will return a `jobId`. You can use this to listen to the SSE stream if you wanted to build a custom client.

### Swapping Search Providers

The agent uses a pluggable `SearchProvider`. The default is a `MockSearchProvider`. To switch to a real one (not implemented, but the plumbing is there):

1.  Set the `SEARCH_PROVIDER=real` environment variable in `docker-compose.yml`.
2.  Implement the `RealSearchProvider` in `backend/src/agent/searchProvider.ts` to call an external API like SerpAPI.

---

## Future Work & Scaling

- **Authentication & Authorization:** Implement user authentication (e.g., JWT) and authorization rules to protect endpoints.
- **Enhanced Agent Re-planning:** The agent's query-building logic is basic. It could be improved with more sophisticated NLP or a state machine to handle more complex research scenarios.
- **Horizontal Scaling:** The backend API and workers are stateless and can be scaled horizontally by increasing the number of container replicas. A load balancer would be needed in front of the API servers.
- **Error Handling & Retries:** Implement more robust error handling within the agent and configure BullMQ's retry policies for transient failures.
