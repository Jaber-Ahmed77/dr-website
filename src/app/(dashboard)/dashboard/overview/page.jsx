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
import Login from "@/src/app/(password)/login/page";
import { formatDistanceToNow } from "date-fns";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  const tabsData = [];

  let currentCourses = [];

  if (session?.user?.role === "admin") {
    const result = await Course.aggregate([
      {
        $group: {
          _id: null,
          totalCount: { $sum: "$count" }, // Sum of `count` field
          totalCourses: { $sum: 1 }, // Count of documents
        },
      },
    ]);

    const usersCount = await User.countDocuments({}).exec();
    const orderCount = await Order.countDocuments({}).exec();
    const totalVideosCount = result[0]?.totalCount || 0;
    const totalCourses = result[0]?.totalCourses || 0;

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
    const orders = await Order.find(
      { userId: session?.user?.id, status: "completed" },
      "courseId createdAt"
    )
      .populate("courseId", "title price thumbnail count")
      .exec();
    currentCourses = orders;

    const ordersCount = orders.length;
    const totalVideosCount = orders.reduce((total, order) => {
      return total + order.courseId.count;
    }, 0);

    tabsData.push(
      {
        id: 1,
        title: "Courses Enrolled",
        count: ordersCount,
      },
      {
        id: 2,
        title: "Lessons",
        count: totalVideosCount,
      }
    );

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

      <div className="mt-10 grid grid-cols-4 gap-8">
        {tabsData.map((tab) => (
          <DataCards key={tab.id} data={tab} />
        ))}
      </div>
      {session?.user?.role === "user" && (
        <div className="mt-10 bg-white shadow-lg p-8 rounded-xl">
          <h4 className="text-xl mb-2 font-semibold text-gray-800">
            our courses
          </h4>
          {currentCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
              {currentCourses?.map((course) => (
                <CourseCard
                  key={course?.courseId?._id}
                  course={course?.courseId}
                  role={session?.role}
                  dateDistance={formatDistanceToNow(
                    new Date(course?.createdAt),
                    { addSuffix: true }
                  )}
                />
              ))}
            </div>
          ) : (
            <p>No courses found</p>
          )}
        </div>
      )}
    </div>
  );
}
