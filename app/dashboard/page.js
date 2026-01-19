"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Users,
  ChefHat,
  Loader2,
  CheckCircle,
  AlertCircle,
  Utensils,
  MapPin,
  TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingMealId, setBookingMealId] = useState(null);
  const [bookedMeals, setBookedMeals] = useState(new Set());
  const [notification, setNotification] = useState(null);

  // Fetch meals on mount
  useEffect(() => {
    if (status === "authenticated") {
      fetchMeals();
      fetchBookedMeals();
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/meals");
      if (response.ok) {
        const data = await response.json();
        setMeals(data.meals || []);
      }
    } catch (error) {
      console.error("Error fetching meals:", error);
      showNotification("Failed to load meals", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookedMeals = async () => {
    try {
      const response = await fetch("/api/meals/booked");
      if (response.ok) {
        const data = await response.json();
        setBookedMeals(new Set(data.bookedMealIds || []));
      }
    } catch (error) {
      console.error("Error fetching booked meals:", error);
    }
  };

  const handleBookMeal = async (mealId) => {
    try {
      setBookingMealId(mealId);
      const response = await fetch("/api/meals/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mealId }),
      });

      const data = await response.json();

      if (response.ok) {
        setBookedMeals((prev) => new Set([...prev, mealId]));
        showNotification("Meal booked successfully! ✅", "success");
      } else {
        showNotification(data.error || "Failed to book meal", "error");
      }
    } catch (error) {
      console.error("Error booking meal:", error);
      showNotification("Error booking meal", "error");
    } finally {
      setBookingMealId(null);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const getMealTypeEmoji = (type) => {
    const emojis = {
      BREAKFAST: "🍳",
      LUNCH: "🍽️",
      DINNER: "🌙",
    };
    return emojis[type] || "🍴";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const upcomingMeals = meals.filter(
    (meal) => new Date(meal.date) >= new Date()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 max-w-md z-50 rounded-xl p-4 shadow-lg border flex items-start gap-3 animate-in slide-in-from-top ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <p
            className={`text-sm font-medium ${
              notification.type === "success"
                ? "text-emerald-900"
                : "text-red-900"
            }`}
          >
            {notification.message}
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Upcoming Meals</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {upcomingMeals.length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Meals Booked</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {bookedMeals.size}
                </p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Available to Book</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {upcomingMeals.length - bookedMeals.size}
                </p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <Utensils className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Meals Section */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <ChefHat className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-900">
              {upcomingMeals.length > 0
                ? "Upcoming Meals - Book Now!"
                : "No Upcoming Meals"}
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              <p className="ml-4 text-slate-600">Loading meals...</p>
            </div>
          ) : upcomingMeals.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
              <ChefHat className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">
                No upcoming meals available yet. Check back soon! 😋
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col"
                >
                  {/* Meal Image */}
                  <div className="relative h-48 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
                    <img
                      src={meal.imgURL}
                      alt={meal.title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1">
                      <span>{getMealTypeEmoji(meal.type)}</span>
                      {meal.type}
                    </div>
                    {bookedMeals.has(meal.id) && (
                      <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Booked
                      </div>
                    )}
                  </div>

                  {/* Meal Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                      {meal.title}
                    </h3>

                    {/* Meal Details */}
                    <div className="space-y-3 mb-4 flex-1">
                      <div className="flex items-center gap-3 text-slate-600">
                        <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="text-sm">{formatDate(meal.date)}</span>
                      </div>

                      {meal.ingredients && meal.ingredients.length > 0 && (
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                          <div className="text-sm text-slate-600">
                            <p className="font-medium mb-1">Ingredients:</p>
                            <ul className="space-y-1">
                              {meal.ingredients.slice(0, 3).map((ing, idx) => (
                                <li key={idx} className="text-xs text-slate-500">
                                  • {ing.itemName} ({ing.gramsPerPax}g)
                                </li>
                              ))}
                              {meal.ingredients.length > 3 && (
                                <li className="text-xs text-slate-500 font-medium">
                                  +{meal.ingredients.length - 3} more
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                      )}

                      {meal._count?.attendance > 0 && (
                        <div className="flex items-center gap-3 text-slate-600">
                          <Users className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className="text-sm">
                            {meal._count.attendance} {meal._count.attendance === 1 ? "person" : "people"} booked
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Book Button */}
                    <button
                      onClick={() => handleBookMeal(meal.id)}
                      disabled={bookedMeals.has(meal.id) || bookingMealId === meal.id}
                      className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 mt-4 ${
                        bookedMeals.has(meal.id)
                          ? "bg-emerald-100 text-emerald-700 cursor-not-allowed"
                          : bookingMealId === meal.id
                          ? "bg-blue-500 text-white opacity-75 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:shadow-lg transform hover:scale-105"
                      }`}
                    >
                      {bookingMealId === meal.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Booking...
                        </>
                      ) : bookedMeals.has(meal.id) ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Already Booked
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4" />
                          Book Now
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Meals Section (Optional) */}
        {meals.filter((m) => new Date(m.date) < new Date()).length > 0 && (
          <div className="mt-16 pt-12 border-t-2 border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-500" />
              Past Meals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {meals
                .filter((m) => new Date(m.date) < new Date())
                .slice(0, 3)
                .map((meal) => (
                  <div
                    key={meal.id}
                    className="bg-slate-50 rounded-xl overflow-hidden shadow-sm border border-slate-200 opacity-75 p-6"
                  >
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {meal.title}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {formatDate(meal.date)}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
