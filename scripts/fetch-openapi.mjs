// Downloads the API's OpenAPI document into openapi/veritas-api.json, the
// committed snapshot the TypeScript types are generated from. Committed so
// CI and Vercel builds never need the API running: run `npm run api:sync`
// whenever the backend's DTOs change, and review the diff.
import { writeFile } from "node:fs/promises";

const base = (process.env.API_URL ?? "http://localhost:5152").replace(
  /\/+$/,
  "",
);
const url = `${base}/openapi/v1.json`;

const response = await fetch(url).catch((error) => {
  console.error(`Could not reach ${url}. Is the API running?\n${error}`);
  process.exit(1);
});
if (!response.ok) {
  console.error(`${url} answered ${response.status}.`);
  process.exit(1);
}

const document = await response.json();

// Keep the snapshot's diff about the contract only: the server address
// depends on where the API ran, and ASP.NET doesn't list an operation's
// responses in a stable order from one run to the next.
delete document.servers;
for (const pathItem of Object.values(document.paths ?? {})) {
  for (const operation of Object.values(pathItem)) {
    if (operation?.responses) {
      operation.responses = Object.fromEntries(
        Object.entries(operation.responses).sort(([a], [b]) =>
          a.localeCompare(b),
        ),
      );
    }
  }
}

await writeFile(
  new URL("../openapi/veritas-api.json", import.meta.url),
  JSON.stringify(document, null, 2) + "\n",
);
console.log(`Saved ${url} to openapi/veritas-api.json`);
