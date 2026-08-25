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

// React must be a single instance. pnpm keeps a hoisted copy of every package
// under node_modules/.pnpm/node_modules, and because apps/api pins React 18
// while this app is on React 19, that hoisted copy is React 18. Packages that
// declare no React dependency of their own -- @expo-google-fonts/* is the one
// that bites here -- resolve past their own folder and land on it, so useFonts
// ends up calling hooks against a second React whose dispatcher is null. That
// is a blank screen on web with only a "Cannot read properties of null" to go
// on, so pin these two to this app's copies.
//
// Deliberately excludes react-native: Expo aliases it to react-native-web for
// the web build, and forcing a path here would defeat that.
const SINGLETONS = ["react", "react-dom"]

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const singleton = SINGLETONS.find(
    (name) => moduleName === name || moduleName.startsWith(`${name}/`)
  )

  if (singleton) {
    const target = path.join(
      projectRoot,
      "node_modules",
      singleton,
      moduleName.slice(singleton.length)
    )
    return context.resolveRequest(context, target, platform)
  }

  return context.resolveRequest(context, moduleName, platform)
}

module.exports = config
