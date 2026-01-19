"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Users,
  Package,
  AlertCircle,
  Loader2,
  Calendar,
  Utensils,
  TrendingUp,
} from "lucide-react";
import AddMealForm from "@/components/AddMealForm";

export default function AdminMealPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [upcomingMeals, setUpcomingMeals] = useState([]);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [stats, setStats] = useState({
    totalUpcomingMeals: 0,
    totalBookings: 0,
    avgIngredients: 0,
  });

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchUpcomingMeals();
    } else if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
      router.push("/login");
    }
  }, [status, session]);

  const fetchUpcomingMeals = async () => {
    try {
      const response = await fetch("/api/admin/upcoming-meals");
      const data = await response.json();
      setUpcomingMeals(data.meals || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error("Error fetching meals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMealCreated = () => {
    fetchUpcomingMeals();
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Quick Action */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Manage upcoming meals and bookings
            </p>
          </div>
          <button
            onClick={() => setShowAddMeal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Add New Meal
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Upcoming Meals */}
          <div className="bg-white rounded-xl border-l-4 border-l-orange-500 shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Upcoming Meals</p>
                <p className="text-3xl font-bold text-slate-800 mt-2">
                  {stats.totalUpcomingMeals}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500 opacity-50" />
            </div>
          </div>

          {/* Total Bookings */}
          <div className="bg-white rounded-xl border-l-4 border-l-blue-500 shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Bookings</p>
                <p className="text-3xl font-bold text-slate-800 mt-2">
                  {stats.totalBookings}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </div>

          {/* Avg Ingredients per Meal */}
          <div className="bg-white rounded-xl border-l-4 border-l-green-500 shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">
                  Avg Ingredients
                </p>
                <p className="text-3xl font-bold text-slate-800 mt-2">
                  {stats.avgIngredients}
                </p>
              </div>
              <Package className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Upcoming Meals Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-orange-50 to-transparent">
            <div className="flex items-center gap-3">
              <Utensils className="w-6 h-6 text-orange-500" />
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Upcoming Meals
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Overview of scheduled meals with booking details
                </p>
              </div>
            </div>
          </div>

          {upcomingMeals.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-4">No upcoming meals scheduled</p>
              <button
                onClick={() => setShowAddMeal(true)}
                className="inline-flex items-center gap-2 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition"
              >
                <Plus className="w-4 h-4" />
                Create First Meal
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {upcomingMeals.map((meal) => (
                <div key={meal.id} className="p-6 hover:bg-orange-50 transition">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Meal Info */}
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-2">
                        {meal.title}
                      </h3>
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {meal.type}
                        </span>
                        <span className="text-sm">
                          {new Date(meal.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Bookings */}
                    <div className="border-l border-slate-200 pl-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        <p className="text-slate-500 text-sm font-medium">
                          Bookings
                        </p>
                      </div>
                      <p className="text-3xl font-bold text-slate-800">
                        {meal.bookings}
                      </p>
                    </div>

                    {/* Ingredients Count */}
                    <div className="border-l border-slate-200 pl-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-5 h-5 text-green-500" />
                        <p className="text-slate-500 text-sm font-medium">
                          Ingredients
                        </p>
                      </div>
                      <p className="text-3xl font-bold text-slate-800">
                        {meal.ingredientCount}
                      </p>
                    </div>

                    {/* Total Quantity Needed */}
                    <div className="border-l border-slate-200 pl-6">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-orange-500" />
                        <p className="text-slate-500 text-sm font-medium">
                          Total Needed
                        </p>
                      </div>
                      <p className="text-3xl font-bold text-slate-800">
                        {(meal.totalIngredients / 1000).toFixed(1)}
                        <span className="text-lg text-slate-500">kg</span>
                      </p>
                    </div>
                  </div>

                  {/* Ingredients Breakdown */}
                  {meal.ingredients.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-100">
                      <p className="text-sm font-semibold text-slate-700 mb-3">
                        📦 Ingredients Breakdown:
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {meal.ingredients.map((ing, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-50 rounded-lg p-3 border border-slate-200"
                          >
                            <p className="text-xs text-slate-500 font-medium uppercase">
                              {ing.itemName}
                            </p>
                            <p className="text-lg font-bold text-slate-800 mt-1">
                              {(ing.totalGrams / 1000).toFixed(1)}
                              <span className="text-xs text-slate-500 ml-1">kg</span>
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {ing.gramsPerPax}g per person
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4">
          <p className="text-sm text-orange-900">
            <span className="font-semibold">💡 Quick Tip:</span> Use the stats
            above to plan your ingredient purchases and prepare for meal
            preparation based on expected bookings.
          </p>
        </div>
      </div>

      {/* Add Meal Modal */}
      {showAddMeal && (
        <AddMealForm
          onSuccess={handleMealCreated}
          onClose={() => setShowAddMeal(false)}
        />
      )}
    </div>
  );
}
