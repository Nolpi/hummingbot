# Hummingbot App

A desktop/web application for controlling Hummingbot trading bots. Built with Tauri, React, TypeScript, and TailwindCSS.

## Features

- **Dashboard**: Overview of bot status, open orders, and positions
- **Connectors**: Manage exchange connections (Binance, Hyperliquid, etc.)
- **Trading**: Place and manage orders on connected exchanges
- **Strategies**: Start/stop trading strategies and manage controllers
- **Logs**: View real-time bot activity logs
- **Settings**: Configure API connection and app appearance

## Prerequisites

- Node.js 18+
- pnpm
- Rust (for Tauri desktop builds)
- Hummingbot with embedded FastAPI enabled

## Development

### Install Dependencies

```bash
pnpm install
```

### Run Web Development Server

```bash
pnpm dev
```

The app will be available at http://localhost:1420

### Run Tauri Desktop App (Development)

```bash
pnpm tauri dev
```

### Build for Production

```bash
# Web build
pnpm build

# Desktop build
pnpm tauri build
```

## Configuration

### Hummingbot Setup

Enable the embedded FastAPI server in your Hummingbot `conf_client.yml`:

```yaml
api:
  api_enabled: true
  api_host: "0.0.0.0"
  api_port: 8000
```

### App Configuration

The app connects to `http://localhost:8000/api/v1` by default. You can change this in Settings.

## Tech Stack

- **Frontend**: React 18, TypeScript, TailwindCSS
- **UI Components**: shadcn/ui (Radix UI)
- **Desktop**: Tauri 2.0
- **State Management**: React Context
- **Icons**: Lucide React
- **Charts**: Recharts (future)

## Project Structure

```
hummingbot-app/
├── src/
│   ├── components/
│   │   ├── layout/        # Header, Sidebar
│   │   ├── pages/         # Dashboard, Trading, etc.
│   │   └── ui/            # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   └── lib/               # API client, context, utilities
├── src-tauri/             # Tauri/Rust backend
├── public/                # Static assets
└── config/                # Configuration files
```

## License

Apache 2.0 - See LICENSE file for details.
