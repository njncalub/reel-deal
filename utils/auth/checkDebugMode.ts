import { Status } from "$std/http/http_status.ts";

export const checkDebugMode = (req: Request): boolean => {
  const debugModeKey = Deno.env.get("X_DEBUG_MODE_KEY") || "";

  const debugMode = req.headers.get("X-Debug-Mode") === "true";
  const matchKey = req.headers.get("X-Debug-Mode-Key") === debugModeKey;

  return (debugMode && matchKey);
};

export const guardDebugMode = (req: Request): Response | null => {
  if (!checkDebugMode(req)) {
    return Response.json({
      errors: [
        {
          message: "only available in debug mode",
        },
      ],
    }, {
      status: Status.Unauthorized,
    });
  }

  return null;
};
