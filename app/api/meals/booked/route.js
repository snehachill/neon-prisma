// app/api/meals/booked/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "../../../../lib/prisma";

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

    // Get all meals booked by current user
    const attendances = await prisma.attendance.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        mealId: true,
      },
    });

    const bookedMealIds = attendances.map((a) => a.mealId);

    return Response.json({ bookedMealIds }, { status: 200 });
  } catch (error) {
    console.error("Error fetching booked meals:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
