// Metro configuration: lets the app import the website's engine and data from ../../src
// (the same backtest code runs on quantrih.com and in the app).
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const sharedRoot = path.resolve(projectRoot, "../../src");

const config = getDefaultConfig(projectRoot);
config.watchFolders = [sharedRoot];
// Shared files resolve their packages from the app, never from the website's node_modules.
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, "node_modules")];
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
