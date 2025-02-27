import Image from "next/image";
import React from "react";
import DataCards from "../../../components/dashboardComponents/DataCards";
import { authOptions } from "../../../api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import AdminPanel from "@/src/app/components/AdminPanel";
import Course from "@/src/app/models/Course";
import { User } from "@/src/app/models/User";
import Order from "@/src/app/models/Order";
import CourseCard from "@/src/app/components/homeComponents/CourseCard";
import { formatDistanceToNow } from "date-fns";
import UserAnalyticsSection from "@/src/app/components/dashboardComponents/UserAnalyticsSection";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  const tabsData = [];

  let currentCourses = [];

  if (session?.user?.role === "admin") {
    const [courseStats, usersCount, orderCount] = await Promise.all([
      Course.aggregate([
        {
          $group: {
            _id: null,
            totalCount: { $sum: "$count" },
            totalCourses: { $sum: 1 },
          },
        },
      ]),
      User.countDocuments().exec(),
      Order.countDocuments().exec(),
    ]);
    
    const totalVideosCount = courseStats[0]?.totalCount || 0;
    const totalCourses = courseStats[0]?.totalCourses || 0;

    tabsData.push(
      {
        id: 1,
        title: "Users signed up",
        count: usersCount,
      },
      {
        id: 2,
        title: "Courses Enrolled",
        count: orderCount,
      },
      {
        id: 3,
        title: "Courses",
        count: totalCourses,
      },
      {
        id: 4,
        title: "Videos",
        count: totalVideosCount,
      }
    );
  } else {

  }

  return (
    <div className="min-h-screen p-5">
      <div className="flex justify-between items-center bg-white shadow-lg p-8 rounded-xl">
        <div>
          <h4 className="text-2xl mb-2 font-semibold">
            Welcome, {session?.user?.name}
          </h4>
          <p className="text-slate-600">
            {session?.user?.role === "admin"
              ? "Track your users and manage your courses"
              : "Track your progress and manage your courses"}
          </p>
        </div>

        <div>
          <Image
            src={session?.user?.image}
            alt={session?.user?.name}
            width={40}
            height={40}
            className="rounded-full aspect-square object-cover"
          />
        </div>
      </div>

      {session?.user?.role === "admin" && (
        <div className="mt-10 bg-white py-5 px-8 rounded-xl shadow-lg">
          <AdminPanel />
        </div>
      )}

      <UserAnalyticsSection session={session}/>

    </div>
  );
}
