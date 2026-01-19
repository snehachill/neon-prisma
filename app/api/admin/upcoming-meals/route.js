import prisma from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // Get all meals with their attendance records
    const meals = await prisma.meal.findMany({
      include: {
        attendance: true,
        ingredients: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    // Calculate stats and format meal data
    let totalBookings = 0;
    let totalIngredients = 0;
    let ingredientCount = 0;

    const formattedMeals = meals.map((meal) => {
      const bookings = meal.attendance.length;
      totalBookings += bookings;

      // Calculate total ingredients needed
      const ingredients = meal.ingredients.map((ing) => {
        const totalGrams = ing.gramsPerPax * bookings;
        totalIngredients += totalGrams;
        ingredientCount = Math.max(ingredientCount, meal.ingredients.length);
        
        return {
          itemName: ing.itemName,
          gramsPerPax: ing.gramsPerPax,
          totalGrams: totalGrams,
        };
      });

      return {
        id: meal.id,
        title: meal.title,
        type: meal.type,
        date: meal.date,
        imgURL: meal.imgURL,
        bookings: bookings,
        ingredientCount: meal.ingredients.length,
        totalIngredients: meal.ingredients.reduce((sum, ing) => {
          return sum + ing.gramsPerPax * bookings;
        }, 0),
        ingredients: ingredients,
      };
    });

    // Calculate stats
    const stats = {
      totalUpcomingMeals: meals.length,
      totalBookings: totalBookings,
      avgIngredients: meals.length > 0 ? Math.round((totalIngredients / meals.length) * 10) / 10 : 0,
    };

    return new Response(JSON.stringify({ meals: formattedMeals, stats }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching upcoming meals:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch upcoming meals" }),
      { status: 500 }
    );
  }
}
