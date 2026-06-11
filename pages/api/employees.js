import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import EMPLOYEES from "../../lib/employees";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });
  res.status(200).json(EMPLOYEES);
}
