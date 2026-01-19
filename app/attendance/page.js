"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle,
  TrendingUp,
  Utensils,
  Users,
} from "lucide-react";

export default function AttendancePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState([]);
  const [stats, setStats] = useState({
    totalBooked: 0,
    attendedCount: 0,
    bookingRate: 0,
    totalMeals: 0,
  });

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "USER") {
      fetchAttendanceData();
    } else if (status === "unauthenticated" || session?.user?.role !== "USER") {
      router.push("/login");
    }
  }, [status, session]);

  const fetchAttendanceData = async () => {
    try {
      const response = await fetch("/api/user/attendance");
      const data = await response.json();
      setAttendanceData(data.attendance || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">My Attendance</h1>
          <p className="text-gray-600 mt-1">Track your meal bookings and attendance history</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Booked */}
          <div className="bg-white rounded-xl border-l-4 border-l-blue-500 shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Booked</p>
                <p className="text-3xl font-bold text-slate-800 mt-2">
                  {stats.totalBooked}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </div>

          {/* Attended */}
          <div className="bg-white rounded-xl border-l-4 border-l-green-500 shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Attended</p>
                <p className="text-3xl font-bold text-slate-800 mt-2">
                  {stats.attendedCount}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </div>

          {/* Booking Rate */}
          <div className="bg-white rounded-xl border-l-4 border-l-purple-500 shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Booking Rate</p>
                <p className="text-3xl font-bold text-slate-800 mt-2">
                  {stats.bookingRate}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </div>

          {/* Available Meals */}
          <div className="bg-white rounded-xl border-l-4 border-l-orange-500 shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Available Meals</p>
                <p className="text-3xl font-bold text-slate-800 mt-2">
                  {stats.totalMeals}
                </p>
              </div>
              <Utensils className="w-8 h-8 text-orange-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Attendance History */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-transparent">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-blue-500" />
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Booking History
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Your past and upcoming meal bookings
                </p>
              </div>
            </div>
          </div>

          {attendanceData.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-4">No attendance records found</p>
              <p className="text-sm text-slate-400">
                Start by booking meals from the dashboard
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Meal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Booked On
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {attendanceData.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-blue-50 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                            <Utensils className="w-5 h-5 text-white" />
                          </div>
                          <div className="font-medium text-slate-900">
                            {record.mealTitle}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {record.mealType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(record.mealDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.attended ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3" />
                            Attended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Clock className="w-3 h-3" />
                            Booked
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {new Date(record.bookedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">💡 Tip:</span> Your attendance status
            is automatically updated when you attend a meal. Keep an eye on your
            booking rate to ensure you don't miss your bookings!
          </p>
        </div>
      </div>
    </div>
  );
}
