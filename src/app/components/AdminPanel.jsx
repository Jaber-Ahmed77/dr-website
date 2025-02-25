"use client";

import React from "react";
import { removeCourses, updateCourses } from "../actions/pageActions";
import toast from "react-hot-toast";

export default function AdminPanel() {
  const updateTheCourses = async () => {
    const response = await updateCourses();

    if (response.success) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };

  const removeTheCourses = async () => {
    const response = await removeCourses();

    if (response.success) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={updateTheCourses}
        className="bg-[#2196f3] flex-1 inline-block text-center transition-colors hover:bg-blue-600 text-white w-full py-2 px-4 rounded"
      >
        Update The Courses
      </button>
      <button
        onClick={removeTheCourses}
        className="bg-[#2196f3] flex-1 inline-block text-center transition-colors hover:bg-blue-600 text-white w-full py-2 px-4 rounded"
      >
        Delete The Courses
      </button>
    </div>
  );
}
