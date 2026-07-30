const { getDefaultConfig } = require("expo/metro-config")
const path = require("path")

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, "../..")

const config = getDefaultConfig(projectRoot)

// pnpm monorepo: packages are symlinked from the workspace root's
// node_modules/.pnpm store, so Metro needs to watch the whole workspace
// and know where to find hoisted/shared node_modules.
config.watchFolders = [workspaceRoot]
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
]
config.resolver.unstable_enableSymlinks = true

module.exports = config
