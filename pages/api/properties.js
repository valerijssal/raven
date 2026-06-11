import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import PROPERTIES from "../../lib/properties";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });
  res.status(200).json(PROPERTIES);
}
