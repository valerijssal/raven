import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { supabaseAdmin } from "../../lib/supabase";
import PROPERTIES from "../../lib/properties";

const propMap = Object.fromEntries(PROPERTIES.map(p => [p.uuid, p]));

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { requestType, notes, people } = req.body;

  // Save to Supabase — store people with their individual selectedUuids
  const { data, error } = await supabaseAdmin
    .from("requests")
    .insert({
      submitted_by: session.user.email,
      request_type: requestType,
      notes: notes || null,
      people: people || [],
      property_uuids: (people || []).flatMap(p => p.selectedUuids || []),
      exclude_mode: false,
      status: "pending",
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message, code: error.code });

  // Create Asana task
  if (process.env.ASANA_PAT) {
    const esc = s => String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const peopleNames = (people || []).map(p => p.name);
    const taskName = `[CASS] ${requestType} — ${peopleNames.length > 1 ? "multiple employees" : peopleNames[0] || ""}`;

    const personSections = (people || []).map(p => {
      const props = (p.selectedUuids || []).map(uuid => propMap[uuid]).filter(Boolean);
      return [
        `${esc(p.name)} (${p.roles.map(esc).join(", ")})`,
        `Properties (${props.length}):`,
        ...props.map(prop => `- ${esc(prop.title)}`),
      ].join("\n");
    }).join("\n\n");

    const notes_text = [
      `Request type: ${esc(requestType)}`,
      `Submitted by: ${esc(session.user.email)}`,
      notes ? `Notes: ${esc(notes)}` : "",
      "",
      personSections,
    ].filter(Boolean).join("\n");

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
