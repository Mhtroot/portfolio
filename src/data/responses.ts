import content from "./content.json";

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: unknown;
}

export const site = content.site;

// ponytail: envelope (status/headers) stays in code — only bodies are content
const commonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "X-Powered-By": "Express",
  "X-Developer": site.name,
  Server: site.domain,
  Date: new Date().toUTCString(),
};

export const endpoints = Object.keys(content.endpoints).map((path) => ({
  method: "GET", // ponytail: every route is GET; add method to JSON if that ever changes
  path,
}));

function makeResponse(path: string, body: unknown): ApiResponse {
  const headers: Record<string, string> = { ...commonHeaders };
  if (path === "/about") headers["Cache-Control"] = "public, max-age=86400";
  if (Array.isArray(body)) headers["X-Total-Count"] = String(body.length);
  if (path === "/resume") {
    headers["Content-Type"] = "application/pdf";
    headers["Content-Disposition"] = `attachment; filename="${site.resumeFile}"`;
  }
  return { status: 200, statusText: "OK", headers, body };
}

export const responses: Record<string, ApiResponse> = Object.fromEntries(
  Object.entries(content.endpoints).map(([path, body]) => [
    path,
    makeResponse(path, body),
  ])
);

export function get404(path: string): ApiResponse {
  return {
    status: 404,
    statusText: "Not Found",
    headers: {
      ...commonHeaders,
      "Cache-Control": "no-store",
    },
    body: {
      error: "Not Found",
      message: `Cannot GET /api${path}`,
      hint: `Try one of: ${Object.keys(content.endpoints).join(", ")}`,
    },
  };
}
