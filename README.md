# Taphaptic

Taphaptic sends AI coding assistant task status to Apple Watch using a local API running on your Mac.

Supported consumers: **Claude Code** and **opencode** (CLI and Mac app).

## What this repo contains

- watchOS app (watch-only)
- local Go API for pairing + event ingestion
- Claude Code hook installer
- opencode plugin installer

## Requirements

- macOS with Xcode (Apple Watch deployment enabled)
- Go 1.22+
- Physical Apple Watch paired to iPhone

## Physical Watch Quickstart

1. Clone and bootstrap in one command:

**Claude Code:**

```sh
git clone https://github.com/dzzzgnr/taphaptic.git && cd taphaptic && ./scripts/bootstrap-watch.sh
```

**opencode (CLI or Mac app):**

```sh
git clone https://github.com/dzzzgnr/taphaptic.git && cd taphaptic && ./scripts/bootstrap-watch.sh --consumer opencode
```

2. In Xcode, select scheme `Taphaptic`, choose your physical Apple Watch destination, and press Run.

3. Open Taphaptic on Apple Watch and enter the **4-digit** pairing code printed during bootstrap.

Bootstrap builds `taphaptic-api` and `taphapticctl` from local source.

## Daily Run

1. Start the API:

```sh
./scripts/start-api.sh
```

This runs in the background and prints the API log path.

2. Start a new Claude Code or opencode session so hooks/plugins load.

3. Optional verification event:

```sh
./scripts/test-claude-connection.sh stop
```

4. Stop the API when you are done (recommended):

```sh
./scripts/stop-api.sh
```

## API Lifecycle Quick Reference

Start:

```sh
./scripts/start-api.sh
```

Stop:

```sh
./scripts/stop-api.sh
```

Restart after Wi-Fi/network/IP changes:

```sh
./scripts/stop-api.sh
./scripts/start-api.sh
```

## opencode Integration

Taphaptic integrates with both the **opencode CLI** and the **opencode Mac app**.
Both use the same configuration directory (`~/.config/opencode/`), so one install step covers both.

### Connect opencode

```sh
./scripts/connect-opencode.sh
```

This writes `~/.config/opencode/plugins/taphaptic.js` which opencode loads automatically at startup.

### What events are sent

| opencode event     | Taphaptic action    | Apple Watch notification         |
|--------------------|---------------------|----------------------------------|
| `session.idle`     | `stop`              | Session completed, ready for you |
| `session.error`    | `failed`            | Session failed                   |
| `permission.asked` | `permission_prompt` | opencode needs permission        |

### Manual install (advanced)

You can also run the installer directly:

```sh
taphapticctl install-opencode
```

Or with a custom API URL:

```sh
taphapticctl install-opencode --api-base-url http://127.0.0.1:8080
```

## Claude Code Integration

### Connect Claude Code

```sh
./scripts/connect-claude-code.sh
```

Or use project-scoped hooks:

```sh
./scripts/connect-claude-code.sh --scope project
```

## Uninstall

Run from anywhere (no local clone required):

```sh
curl -fsSL https://raw.githubusercontent.com/dzzzgnr/taphaptic/main/scripts/uninstall.sh | sh -s -- --yes
```

If you already cloned this repo:

```sh
./scripts/uninstall.sh --yes
```

## How pairing works

- Installer calls `POST /v1/claude/installations` to bootstrap installation identity.
- Installer calls `POST /v1/watch/pairings/code` to generate a 4-digit code.
- Watch app auto-discovers the local API on LAN (`_taphaptic._tcp`) and claims code via `POST /v1/watch/pairings/claim`.
- Claude Code hooks / opencode plugin send events with `POST /v1/events`.
- Watch polls events with `GET /v1/events?since=<id>`.

## Local API

Public routes:

- `GET /healthz`
- `POST /v1/claude/installations`
- `POST /v1/watch/pairings/claim`

Authenticated routes:

- `POST /v1/watch/pairings/code` (installation token)
- `POST /v1/events` (claude session token)
- `GET /v1/events?since=<id>` (watch session token)

## CI checks (local equivalent)

Run backend unit tests:

```sh
go test ./... -count=1
```

Run API smoke e2e (installation -> pairing -> claim -> event -> poll):

```sh
./scripts/smoke-local-e2e.sh
```

Run shared Swift regression tests:

```sh
./scripts/test-shared-swift.sh
```

## Notes

- Watch and Mac must be on the same local network.
- If discovery fails, keep the API running and retry pairing from watch.
