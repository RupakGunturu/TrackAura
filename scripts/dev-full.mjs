import { spawn } from "node:child_process";

function run(name, args) {
  const child = spawn(process.execPath, args, {
    stdio: "inherit",
    shell: false,
  });

  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`[${name}] exited with code ${code}`);
      process.exit(code);
    }
  });

  child.on("error", (error) => {
    console.error(`[${name}] failed`, error);
    process.exit(1);
  });

  return child;
}

const frontend = run("frontend", ["./node_modules/vite/bin/vite.js"]);
const backend = run("backend", ["./backend/node_modules/tsx/dist/cli.mjs", "watch", "./backend/src/server.ts"]);

function shutdown() {
  frontend.kill("SIGTERM");
  backend.kill("SIGTERM");
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
