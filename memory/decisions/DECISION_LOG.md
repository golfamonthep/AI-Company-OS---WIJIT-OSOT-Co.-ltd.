# Decision Log

## 2026-05-07 - Memory Starts File-Based

- Owner: CTO
- Decision: Start Memory Retrieval Engine with markdown files before pgvector.
- Reasoning: Keeps the memory layer testable and avoids a hard dependency on paid APIs or vector database setup.
- Related workflow: content_creator_execution
