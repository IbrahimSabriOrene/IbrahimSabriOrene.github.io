# AI Help Center — audio-ingestion prototype

Personal project by Ibrahim Sabri Örene: a modular .NET 9 application for audio ingestion and a React/Vite interface prototype.

## What is implemented

The backend has audio upload/status endpoints, MinIO storage, PostgreSQL/EF Core persistence and Hangfire job processing. The implemented initial audio path stores an upload, performs noise removal through the DeepFilter service and stores the cleaned audio.

The frontend includes uploads, chat, calls, reports and settings views, driven by synthetic mock data. It is a UI prototype, not evidence of completed backend integration.

## Explicitly incomplete

Whisper transcription is not wired into the complete ingestion pipeline. RAG/chat, knowledge extraction and vector-store integration remain mocked or incomplete. A full 'chat with calls and documents' product, authenticated multi-tenancy, healthcare compliance and production deployment are **not** claimed.

## Explore locally

Requires .NET 9; frontend requires Node.js. Docker/service paths have additional local infrastructure requirements.

```sh
dotnet build AI-Help-Center.sln
cd audio-doc-hub
npm ci
npm run dev
```

The development compose/configuration includes example local passwords and open service endpoints. Use a local isolated environment, supply your own private settings and complete authentication/isolation work before handling real or sensitive data. Running the UI alone uses mock data.

## Public export

Fresh source-only snapshot. Original history, the private frontend repository's Git metadata, `.env`, provider credentials, model caches, service databases, audio recordings, personal data and internal research are excluded. The existing private repository is unchanged. Mock email addresses use reserved example domains; legacy remote preview-image links are removed.

`backend/` contains the .NET modules; `services/` contains local audio-service adapters; `audio-doc-hub/` contains the React/Vite UI. Third-party frameworks and scaffolding retain their own authorship and licenses. No new license grant has been selected for this source release.

## Publication location

Published as the independent `codex/ai-help-center-source` branch of the personal portfolio repository because GitHub temporarily rate-limited creation of a standalone repository. This branch contains the reviewed source snapshot only; it does not replace or deploy the portfolio website.
