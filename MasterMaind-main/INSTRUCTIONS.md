# Mastermind Full Stack Instructions

## Prerequisites
- Docker
- Docker Compose

## Quick Start

1. Open a terminal in the project root.
2. Run the application:
   ```bash
   docker-compose up -d --build
   ```
3. Access the game in your browser: [http://localhost:3000](http://localhost:3000)

## Architecture

- **Frontend (UI)**: [http://localhost:3000](http://localhost:3000)
- **Backend (API)**: [http://localhost:8000](http://localhost:8000)

## API Reference

If you want to interact with the API directly:

- **Start Game**: `POST /start`
- **Guess**: `POST /guess`

## Troubleshooting

If the UI doesn't load or verify guesses:
1. Ensure both containers are running: `docker-compose ps`
2. Check logs: `docker-compose logs -f`
3. Ensure no other service is using ports 3000 or 8000.
