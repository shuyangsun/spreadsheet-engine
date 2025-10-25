import { register } from "tsconfig-paths";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const tsConfig = require("./tsconfig.json");

const baseUrl = join(dirname(fileURLToPath(import.meta.url)), tsConfig.compilerOptions.baseUrl ?? ".");

register({
    baseUrl,
    paths: tsConfig.compilerOptions.paths ?? {}
});
