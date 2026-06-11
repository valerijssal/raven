import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { supabaseAdmin } from "../../lib/supabase";
import PROPERTIES from "../../lib/properties";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { requestType, notes, people, selectedUuids, excludeMode } = req.body;

  const { data, error } = await supabaseAdmin
    .from("requests")
    .insert({
      submitted_by: session.user.email,
      request_type: requestType,
      notes: notes || null,
      people: people || [],
      property_uuids: selectedUuids || [],
      exclude_mode: excludeMode || false,
      status: "pending",
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message, code: error.code, details: error.details });

  // Fire Asana task async after response (best-effort)
  if (process.env.ASANA_PAT) {
    const uuidSet = new Set(selectedUuids || []);
    const matchedProps = PROPERTIES.filter(p => uuidSet.has(p.uuid));
    const propLines = matchedProps.map(p => `• ${p.title}`).join("\n");

    const taskName = `[CASS] ${requestType} — ${(people || []).map(p => p.name).join(", ")}`;

    const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const peopleLines = (people || []).map(p =>
      `- ${esc(p.name)} - ${p.roles.map(esc).join(", ")}`
    ).join("\n");

    const propLines2 = matchedProps.map(p => `- ${esc(p.title)}`).join("\n");

    const notes_text = [
      `Request type: ${esc(requestType)}`,
      `Submitted by: ${esc(session.user.email)}`,
      notes ? `Notes: ${esc(notes)}` : "",
      "",
      "People:",
      peopleLines,
      "",
      `${excludeMode ? "Properties to EXCLUDE" : "Properties"} (${matchedProps.length}):`,
      propLines2,
    ].filter(l => l !== undefined).join("\n");

    try {
      const asanaRes = await fetch("https://app.asana.com/api/1.0/tasks", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.ASANA_PAT}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: { name: taskName, notes: notes_text, projects: ["1210527837423031"] }
        }),
      });
      if (!asanaRes.ok) {
        const errText = await asanaRes.text();
        console.error("Asana error:", errText);
      }
    } catch (err) {
      console.error("Asana fetch error:", err.message);
    }
  }

  res.status(200).json(data);
}
