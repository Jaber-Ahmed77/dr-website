import Image from "next/image";
import React from "react";
import DataCards from "../../../components/dashboardComponents/DataCards";
import { authOptions } from "../../../api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import AdminPanel from "@/src/app/components/AdminPanel";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  const tabsData = [
    {
      id: 1,
      title: "Enrolled Courses",
      count: 0,
    },
    {
      id: 2,
      title: "Completed Courses",
      count: 0,
    },
    {
      id: 3,
      title: "Hours Studied",
      count: 0,
    },
    {
      id: 4,
      title: "Certificates Earned",
      count: 0,
    },
  ];

  return (
    <div className="min-h-screen p-5">
      <div className="flex justify-between items-center bg-white shadow-lg p-8 rounded-xl">
        <div>
          <h4 className="text-2xl mb-2 font-semibold">
            Welcome, {session?.user?.name}
          </h4>
          <p className="text-slate-600">
            Track your progress and manage your courses
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
      <div className="mt-10 bg-white shadow-lg p-8 rounded-xl">
        <h4 className="text-xl mb-2 font-semibold text-gray-800">
          Recent Activity
        </h4>
        <div></div>
      </div>
    </div>
  );
}
