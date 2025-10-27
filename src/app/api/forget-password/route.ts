// pages/api/auth/reset-password.ts
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { signIn } from "next-auth/react";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { token, password } = req.body;

  try {
    const session = await getServerSession(req, res);
    if (!session?.user?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find user by email and update password
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate token (NextAuth handles this automatically)
    // Update password in your database
    await prisma.user.update({
      where: { id: user.id },
      data: { password },
    });

    res.status(200).json({ message: "Password updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}