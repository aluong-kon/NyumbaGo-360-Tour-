// Supabase Edge Function: check-broken-tours
// Description: Scheduled weekly cron function to ping all active Viewora tour URLs
// and flag dead/unreachable tours to protect NyumbaGO hunter experience.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all listings with a non-null tour_url
    const { data: listings, error } = await supabase
      .from("listings")
      .select("id, title, tour_url, tour_verified")
      .not("tour_url", "is", null);

    if (error) throw error;

    const results = [];

    for (const item of listings || []) {
      const tourUrl = item.tour_url;
      let status = "ok";
      let httpCode = 200;

      // Validate Viewora hostname format
      try {
        const parsed = new URL(tourUrl);
        const host = parsed.hostname.toLowerCase();
        if (parsed.protocol !== "https:" || !(host === "viewora.software" || host.endsWith(".viewora.software"))) {
          status = "invalid_host";
        } else {
          // Perform lightweight HEAD request with 5s timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          const response = await fetch(tourUrl, {
            method: "HEAD",
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          httpCode = response.status;
          if (!response.ok && response.status >= 400) {
            status = "unreachable";
          }
        }
      } catch (err: any) {
        status = err.name === "AbortError" ? "timeout" : "error";
      }

      results.push({
        id: item.id,
        title: item.title,
        tour_url: item.tour_url,
        status,
        httpCode,
        checked_at: new Date().toISOString(),
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        scanned_count: results.length,
        broken_count: results.filter((r) => r.status !== "ok").length,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
