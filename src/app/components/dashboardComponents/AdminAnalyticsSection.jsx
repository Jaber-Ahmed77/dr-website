"use client";
import { useEffect, useState } from "react";
import DataCards from "./DataCards";
import toast from "react-hot-toast";
import { getAdminAnalytics } from "../../actions/pageActions";

export default function AdminAnalyticsSection() {
  const [data, setData] = useState({});
  
  const getData = async () => {
    try {
      const res = await getAdminAnalytics();
      setData(res);
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  useEffect(() => {
    getData();
  }, []);  

  return (
      <div className="mt-10 grid grid-cols-4 gap-8">
        {data.tabsData && data.tabsData.map((tab) => (
          <DataCards key={tab.id} data={tab} />
        ))}
      </div>
  );
}
