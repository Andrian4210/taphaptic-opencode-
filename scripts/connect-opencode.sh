#!/bin/sh

set -eu

repo_root="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"

usage() {
  printf '%s\n' "usage: sh scripts/connect-opencode.sh"
}

while [ $# -gt 0 ]; do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    *)
      usage >&2
      exit 64
      ;;
  esac
done

/bin/sh "$repo_root/scripts/install-opencode-plugin.sh"

printf '%s\n' "Taphaptic opencode plugin installed."
printf '%s\n' "Start a new opencode session so the plugin is loaded."
printf '%s\n' "Works for both the opencode CLI and the opencode Mac app."
