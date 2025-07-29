# Alpha Platform — Full-Stack Research Agent

This repository contains the complete solution for the full-stack engineering take-home challenge. It is a fully dockerized, production-ready "vertical slice" of a research agent platform that enriches person data by performing automated web searches.

## Key Features & Architectural Decisions

- **Fully Dockerized:** The entire stack (Backend, Frontend, DB, Queue) runs with a single command: `docker compose up`.
- **Asynchronous Job Processing:** API requests (`POST /enrich`) are lightweight and non-blocking. They instantly return a `jobId` after queueing the task in a Redis-backed BullMQ queue. A separate worker process handles the heavy-lifting (the agent run), ensuring the API remains highly available and responsive.
- **Real-time Progress Streaming:** The UI uses **Server-Sent Events (SSE)** to stream live progress from the agent. This is a robust, lightweight, and efficient choice for one-way data flow from the server to the client, perfectly suited for this use case.
- **Decoupled Agent Logic:** The `ResearchAgent` is a modular class, completely decoupled from the web server. It communicates its progress via a publisher function, which in production pushes messages to a Redis Pub/Sub channel. This makes the agent highly modular and independently testable.
- **Production-Grade Backend:**
  - **Structured Logging:** Uses `pino` for efficient, structured JSON logs.
  - **Configuration Management:** Uses `.env` files for environment-specific configuration.
  - **Graceful Shutdown:** Both the server and worker processes are configured to shut down gracefully on `SIGINT` or `SIGTERM`, ensuring connections are closed properly.
  - **Health Checks:** A `/healthz` endpoint checks the status of the database and Redis connections.
- **Self-Contained Integration Testing:** The integration test suite (`pnpm test:integration`) creates its own data before running and cleans up afterward, ensuring tests are reliable and independent of external state.

---

## Quick Start

**Prerequisites:** Docker and Docker Compose must be installed and running.

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/maheshchichkoti/Alpha-Platform.git
    cd Alpha-Platform
    ```

2.  **Build and run the application:**
    This single command will build the frontend and backend Docker images and start all services.

    ```bash
    docker compose up --build
    ```

3.  **Access the application:**
    - **Web UI:** [http://localhost:3000](http://localhost:3000)
    - **Backend API:** [http://localhost:4000](http://localhost:4000)
    - **API Docs (Swagger):** [http://localhost:4000/api-docs](http://localhost:4000/api-docs)

The backend service automatically runs database migrations and seeds the initial data on the first start, so the application is ready to use immediately.

---

## How to Use

### Triggering Enrichment

- **Via the UI:**

  1.  Open [http://localhost:3000](http://localhost:3000).
  2.  Click the "Run Research" button next to a person's name (e.g., Alice Smith).
  3.  Observe the live progress logs appear in the console below.
  4.  Once the "Enrichment complete!" message appears, the structured results will be displayed in a card.

- **Via the API (cURL):**
  1.  First, find a `personId` by querying the people endpoint.
      ```bash
      # This will return a list of people, including their IDs.
      curl http://localhost:4000/people
      ```
  2.  Using an ID from the previous step, trigger the enrichment job:
      ```bash
      # Replace <personId> with an actual ID from the GET /people response
      curl -X POST http://localhost:4000/enrich/<personId>
      ```
  3.  This will return a `jobId`, which the frontend uses to connect to the SSE progress stream.

---

## Future Work & Scaling

- **Authentication & Authorization:** Implement user authentication (e.g., using JWTs) to protect endpoints and ensure data privacy.
- **Enhanced Agent Re-planning:** The current agent follows a linear path. This could be improved with more sophisticated logic (e.g., a state machine or LLM-based function calling) to handle cases where initial searches fail and a new plan is needed.
- **Horizontal Scaling:** The backend API and workers are stateless and can be scaled horizontally by increasing the number of container replicas (`docker compose up --scale backend=3`). A load balancer (like Nginx) would be needed in front of the API servers for production.
- **Observability:** While structured logging is present, adding distributed tracing (e.g., with OpenTelemetry) and more detailed Prometheus metrics would greatly improve production observability.
