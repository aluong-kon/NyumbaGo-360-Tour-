// Supabase Edge Function: validate-tour-url
// Server-side validation of Viewora 360 tour URLs before storing in PostgreSQL.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export function validateVieworaHost(urlString: string): { valid: boolean; reason?: string } {
  if (!urlString || typeof urlString !== "string") {
    return { valid: false, reason: "Tour URL is required." };
  }

  const trimmed = urlString.trim();
  if (!trimmed.startsWith("https://")) {
    return { valid: false, reason: "Tour URL must begin with https://" };
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    const isViewora = host === "viewora.software" || host.endsWith(".viewora.software");
    if (!isViewora) {
      return {
        valid: false,
        reason: "Invalid host. Only links from viewora.software or its subdomains (e.g. app.viewora.software) are accepted.",
      };
    }
    return { valid: true };
  } catch (_e) {
    return { valid: false, reason: "The provided string is not a valid web URL." };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    const result = validateVieworaHost(url);

    return new Response(JSON.stringify(result), {
      status: result.valid ? 200 : 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ valid: false, reason: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
