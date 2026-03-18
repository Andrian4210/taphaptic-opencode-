// Taphaptic opencode plugin - example / reference copy
//
// The live plugin is written to ~/.config/opencode/plugins/taphaptic.js
// by `taphapticctl install-opencode`. This file is kept for reference.
//
// Events forwarded to Taphaptic:
//   session.idle        -> "stop"   (session waiting for user input)
//   session.error       -> "failed" (session encountered an error)
//   permission.asked    -> "permission_prompt" (opencode needs a permission)

export const TaphapticPlugin = async ({ $ }) => {
  const ctl = `${process.env.HOME}/Library/Application Support/Taphaptic/bin/taphapticctl`

  async function emit(action) {
    try {
      await $`${ctl} emit --action ${action} --source opencode`
    } catch (_) {
      // never block opencode execution
    }
  }

  return {
    event: async ({ event }) => {
      if (event.type === "session.idle") {
        await emit("stop")
      } else if (event.type === "session.error") {
        await emit("failed")
      }
    },
    "permission.asked": async () => {
      await emit("permission_prompt")
    },
  }
}
