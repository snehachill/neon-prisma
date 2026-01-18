// app/api/meals/book/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "../../../../lib/prisma";

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session) {
      return Response.json(
        { error: "Unauthorized: Not authenticated" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { mealId } = body;

    // Validate input
    if (!mealId) {
      return Response.json(
        { error: "mealId is required" },
        { status: 400 }
      );
    }

    // Check if meal exists
    const meal = await prisma.meal.findUnique({
      where: {
        id: mealId,
      },
    });

    if (!meal) {
      return Response.json(
        { error: "Meal not found" },
        { status: 404 }
      );
    }

    // Check if meal is in the past
    if (new Date(meal.date) < new Date()) {
      return Response.json(
        { error: "Cannot book past meals" },
        { status: 400 }
      );
    }

    // Check if user already booked this meal
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        userId_mealId: {
          userId: session.user.id,
          mealId: mealId,
        },
      },
    });

    if (existingAttendance) {
      return Response.json(
        { error: "You have already booked this meal" },
        { status: 409 }
      );
    }

    // Create attendance record
    const attendance = await prisma.attendance.create({
      data: {
        userId: session.user.id,
        mealId: mealId,
        hasEaten: false, // Default to false when booking
      },
      include: {
        meal: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return Response.json(
      {
        message: "Meal booked successfully",
        attendance,
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle unique constraint error (user already booked)
    if (error.code === "P2002") {
      return Response.json(
        { error: "You have already booked this meal" },
        { status: 409 }
      );
    }

    console.error("Error booking meal:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
