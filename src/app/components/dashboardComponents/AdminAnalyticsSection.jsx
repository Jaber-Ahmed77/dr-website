import DataCards from "./DataCards";
import { getAdminAnalytics } from "../../actions/pageActions";

export default async function AdminAnalyticsSection() {
  const { tabsData } = await getAdminAnalytics(); // ✅ Fetch directly on the server

  return (
    <div className="mt-10 grid grid-cols-4 gap-8">
      {tabsData.map((tab) => (
        <DataCards key={tab.id} data={tab} />
      ))}
    </div>
  );
}
