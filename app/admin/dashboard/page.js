"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartLegend } from "@/components/ui/chart";
import {
  Users,
  Utensils,
  TrendingUp,
  AlertCircle,
  Loader2,
  Package,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalMeals: 0,
    totalAttendance: 0,
    totalFeedback: 0,
    mealDistribution: [],
    ingredientConsumption: [],
    attendanceTrends: [],
    topMeals: [],
    avgRating: 0,
  });

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchDashboardData();
    } else if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
      router.push("/login");
    }
  }, [status, session]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/dashboard-stats");
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
      </div>
    );
  }

  const ORANGE_COLORS = [
    "#f97316",
    "#fb923c",
    "#fdba74",
    "#fed7aa",
    "#ffedd5",
  ];

  const MEAL_TYPE_COLORS = {
    BREAKFAST: "#ea580c",
    LUNCH: "#f97316",
    DINNER: "#fb923c",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
            Admin Dashboard
          </h1>
          <p className="text-slate-600">
            Real-time insights into meal management and attendance
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Users Card */}
          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="text-slate-600">Total Users</span>
                <Users className="w-5 h-5 text-orange-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">
                {dashboardData.totalUsers}
              </div>
              <p className="text-xs text-slate-500 mt-1">Active users</p>
            </CardContent>
          </Card>

          {/* Total Meals Card */}
          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="text-slate-600">Total Meals</span>
                <Utensils className="w-5 h-5 text-orange-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">
                {dashboardData.totalMeals}
              </div>
              <p className="text-xs text-slate-500 mt-1">Created meals</p>
            </CardContent>
          </Card>

          {/* Total Attendance Card */}
          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="text-slate-600">Bookings</span>
                <TrendingUp className="w-5 h-5 text-orange-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">
                {dashboardData.totalAttendance}
              </div>
              <p className="text-xs text-slate-500 mt-1">Meal bookings</p>
            </CardContent>
          </Card>

          {/* Avg Rating Card */}
          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="text-slate-600">Avg Rating</span>
                <AlertCircle className="w-5 h-5 text-orange-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">
                {dashboardData.avgRating.toFixed(1)}⭐
              </div>
              <p className="text-xs text-slate-500 mt-1">User satisfaction</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Meal Type Distribution */}
          <Card className="hover:shadow-lg transition">
            <CardHeader>
              <CardTitle className="text-lg">Meal Distribution</CardTitle>
              <CardDescription>
                Breakdown by meal type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.mealDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dashboardData.mealDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={MEAL_TYPE_COLORS[entry.name] || ORANGE_COLORS[index]}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => value}
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "2px solid #f97316",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Ingredient Consumption */}
          <Card className="hover:shadow-lg transition">
            <CardHeader>
              <CardTitle className="text-lg">Top Ingredients</CardTitle>
              <CardDescription>
                Most consumed ingredients (in grams)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardData.ingredientConsumption.slice(0, 8)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={190} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "2px solid #f97316",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => [
                        `${(value / 1000).toFixed(2)} kg`,
                        "Total",
                      ]}
                    />
                    <Bar
                      dataKey="value"
                      fill="#f97316"
                      radius={[0, 8, 8, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Trends and Top Meals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Trends */}
          <Card className="hover:shadow-lg transition">
            <CardHeader>
              <CardTitle className="text-lg">Attendance Trends</CardTitle>
              <CardDescription>
                Bookings over the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardData.attendanceTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "2px solid #f97316",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#f97316"
                      strokeWidth={3}
                      dot={{ fill: "#f97316", r: 5 }}
                      activeDot={{ r: 7 }}
                      name="Bookings"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Meals */}
          <Card className="hover:shadow-lg transition">
            <CardHeader>
              <CardTitle className="text-lg">Most Booked Meals</CardTitle>
              <CardDescription>
                Top 8 meals by bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardData.topMeals.slice(0, 8)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "2px solid #f97316",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => [value, "Bookings"]}
                    />
                    <Bar
                      dataKey="bookings"
                      fill="#fb923c"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Stats */}
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 border-0 text-white hover:shadow-lg transition">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Dashboard Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-white">
              <div>
                <p className="text-orange-100 text-sm mb-1">Total Feedback</p>
                <p className="text-2xl font-bold">{dashboardData.totalFeedback}</p>
              </div>
              <div>
                <p className="text-orange-100 text-sm mb-1">Avg Booking Rate</p>
                <p className="text-2xl font-bold">
                  {dashboardData.totalMeals > 0
                    ? (
                        (dashboardData.totalAttendance /
                          dashboardData.totalMeals) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
              <div>
                <p className="text-orange-100 text-sm mb-1">Meals Per User</p>
                <p className="text-2xl font-bold">
                  {dashboardData.totalUsers > 0
                    ? (
                        dashboardData.totalMeals /
                        dashboardData.totalUsers
                      ).toFixed(1)
                    : 0}
                </p>
              </div>
              <div>
                <p className="text-orange-100 text-sm mb-1">Last Updated</p>
                <p className="text-2xl font-bold">{new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
