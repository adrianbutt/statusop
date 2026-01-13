import { spawn as spawnSync } from "child_process";
import chalk from "chalk";
import * as fs from "fs";
import * as path from "path";

// import yargs from "yargs/yargs";
// import { hideBin } from "yargs/helpers";
// const argv = yargs(hideBin(process.argv)).argv;
// console.log("argv", argv);

const buildMaps = [
  {
    name: "mjs",
    config: "tsconfig-mjs.json",
    dir: "./dist/mjs",
    packageJSON: {
      type: "module"
    }
  },
  {
    name: "cjs",
    config: "tsconfig-cjs.json",
    dir: "./dist/cjs",
    packageJSON: {
      type: "commonjs"
    }
  }
];

console.log(chalk.bgGreen("Clearing previous build directory"));
await execWithLogs("rm", ["-fr", "./dist"]);
console.log("  done");

for (let i = 0; i < buildMaps.length; i++) {
  const map = buildMaps[i];
  console.log(chalk.bgGreen(`Building '${map.name}' export`));
  await execWithLogs("npx", ["tsc", "-p", map.config]);
  await execWithLogs("npx", ["tsc-alias", "-p", map.config]);

  // generate a package json file
  fs.writeFileSync(
    path.join(map.dir, "package.json"),
    JSON.stringify(map.packageJSON, null, 2)
  );

  console.log(`  done`);
}

function execWithLogs(toExec, args) {
  const cp = spawnSync(toExec, args || [], { stdio: "inherit" });
  return new Promise((resolve, reject) => {
    cp.on("close", code => {
      resolve(code || 0);
    });
  });
}
