"use client";
import { useEffect, useState } from "react";
import DataCards from "./DataCards";
import toast from "react-hot-toast";
import CourseCard from "../homeComponents/CourseCard";
import { formatDistanceToNow } from "date-fns";

export default function UserAnalyticsSection({ session }) {
  const [data, setData] = useState({});
  
  const getData = async () => {
    try {
      const response = await fetch(`/api/getUserAnalytics?id=${session?.user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch analytics data");
      const res = await response.json();
      setData(res);
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  useEffect(() => {
    getData();
  }, []);

  console.log("orders", data?.orders);
  
  return (
    <>
      <div className="mt-10 grid grid-cols-4 gap-8">
        {data.tabsData && data.tabsData.map((tab) => (
          <DataCards key={tab.id} data={tab} />
        ))}
      </div>
      {session?.user?.role === "user" && (
        <div className="mt-10 bg-white shadow-lg p-8 rounded-xl">
          <h4 className="text-xl mb-2 font-semibold text-gray-800">
            Our Courses
          </h4>
          {data?.orders?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
              {data?.orders.map((course, i) => (
                <CourseCard
                  key={i}
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
    </>
  );
}