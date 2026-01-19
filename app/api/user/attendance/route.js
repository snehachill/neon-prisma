import prisma from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "USER") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // Get user's attendance records
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        meal: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get total available meals
    const totalMeals = await prisma.meal.count();

    // Calculate stats
    const totalBooked = attendanceRecords.length;
    const attendedCount = attendanceRecords.filter((r) => r.hasEaten).length;
    const bookingRate = totalBooked > 0 ? Math.round((attendedCount / totalBooked) * 100) : 0;

    // Format attendance data
    const formattedAttendance = attendanceRecords.map((record) => ({
      id: record.id,
      mealTitle: record.meal.title,
      mealType: record.meal.type,
      mealDate: record.meal.date,
      attended: record.hasEaten,
      bookedAt: record.createdAt,
    }));

    const stats = {
      totalBooked: totalBooked,
      attendedCount: attendedCount,
      bookingRate: bookingRate,
      totalMeals: totalMeals,
    };

    return new Response(
      JSON.stringify({ attendance: formattedAttendance, stats }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch attendance data" }),
      { status: 500 }
    );
  }
}
