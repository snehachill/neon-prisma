// app/api/meals/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "../../../lib/prisma";

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session) {
      return Response.json(
        { error: "Unauthorized: Not authenticated" },
        { status: 401 }
      );
    }

    // Get upcoming meals (from today onwards)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const meals = await prisma.meal.findMany({
      where: {
        date: {
          gte: today,
        },
      },
      include: {
        ingredients: true,
        attendance: {
          select: {
            id: true,
          },
        },
        feedback: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            attendance: true,
            feedback: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return Response.json({ meals }, { status: 200 });
  } catch (error) {
    console.error("Error fetching meals:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
