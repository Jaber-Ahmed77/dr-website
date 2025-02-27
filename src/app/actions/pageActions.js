"use server";
import { getServerSession } from "next-auth";
import axios from "axios";
import { authOptions } from "../api/auth/[...nextauth]/route";
import connectToDatabase from "../lib/connectToDb";
import Course from "../models/Course";
import clientPromise from "../lib/mongoClient";
import Order from "../models/Order";
import { User } from "../models/User";

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

// courses

export async function updateCourses() {
  await connectToDatabase();

  const { user } = await getServerSession(authOptions);

  if (user.role !== "admin") {
    return {
      success: false,
      message: "User not authenticated",
    };
  }

  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=${CHANNEL_ID}&key=${API_KEY}`
    );

    const youtubePlaylists = response.data.items;

    const storedCourses = await Course.find(
      {},
      "playlistId title description thumbnail count"
    );

    let addedCount = 0;
    let updatedCount = 0;
    let videosCount = 0;

    for (const playlist of youtubePlaylists) {
      const existingCourse = storedCourses.find(
        (course) => course.playlistId === playlist.id
      );

      const response2 = await axios.get(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=id&playlistId=${playlist.id}&key=${API_KEY}&maxResults=1`
      );
      
      const totalVideos = response2.data.pageInfo.totalResults;
            
      if (existingCourse.count !== totalVideos) {
        await Course.updateOne(
          { playlistId: playlist.id },
          { $set: { count: totalVideos } }
        );
        videosCount++;
      }

      if (existingCourse) {
        if (
          existingCourse.title !== playlist.snippet.title ||
          existingCourse.description !== playlist.snippet.description ||
          existingCourse.thumbnail !== playlist.snippet.thumbnails.medium.url
        ) {
          await Course.updateOne(
            { playlistId: playlist.id },
            {
              $set: {
                title: playlist.snippet.title,
                description: playlist.snippet.description,
                thumbnail: playlist.snippet.thumbnails.medium.url,
              },
            }
          );
          updatedCount++;
        }
      } else {
        await Course.create({
          playlistId: playlist.id,
          title: playlist.snippet.title,
          description: playlist.snippet.description,
          thumbnail: playlist.snippet.thumbnails.medium.url,
          price: 0, // Default price
        });
        addedCount++;
      }
    }

    return {
      success: true,
      message: `✅ ${addedCount} new courses added, 🔄 ${updatedCount} courses updated, 🔄 ${videosCount} videos count updated`,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Error updating courses",
    };
  }
}

export async function removeCourses() {
  await connectToDatabase();

  const { user } = await getServerSession(authOptions);

  if (user.role !== "admin") {
    return {
      success: false,
      message: "User not authenticated",
    };
  }

  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=${CHANNEL_ID}&key=${API_KEY}`
    );

    const youtubePlaylists = response.data.items;
    const youtubePlaylistIds = youtubePlaylists.map((playlist) => playlist.id);

    const storedCourses = await Course.find({}, "playlistId");

    const coursesToDelete = storedCourses.filter(
      (course) => !youtubePlaylistIds.includes(course.playlistId)
    );

    if (coursesToDelete.length > 0) {
      const courseIdsToDelete = coursesToDelete.map(
        (course) => course.playlistId
      );
      await Course.deleteMany({ playlistId: { $in: courseIdsToDelete } });
    }

    return {
      success: true,
      message: `${coursesToDelete.length} courses removed.`,
      removedCourses: coursesToDelete,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Error removing courses",
    };
  }
}
export async function updatePrice(courseId, newPrice) {
  const { user } = await getServerSession(authOptions);

  if (user.role !== "admin") {
    return {
      success: false,
      message: "User not authenticated",
    };
  }

  try {
    await connectToDatabase();
    await Course.updateOne({ _id: courseId }, { $set: { price: newPrice } });
    return { success: true, message: "Price updated successfully" };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Error updating price" };
  }
}

export async function updateUserData(email, userData) {
  // const { user } = await getServerSession(authOptions);

  // if (user.role !== "admin") {
  //   return {
  //     success: false,
  //     message: "User not authenticated",
  //   };
  // }

  if (!email || !userData || Object.keys(userData).length === 0) {
    return { success: false, message: "No data provided for update" };
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const updatedUser = await db
      .collection("users")
      .updateOne({ email }, { $set: { userData: userData } });

    if (updatedUser.matchedCount === 0) {
      return { success: false, message: "User not found" };
    }

    return { success: true, message: "User data updated successfully" };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, message: "Database update failed" };
  }
}

export async function getUserAnalytics(id) {
  try {
    console.time("getUserAnalytics");

    const ordersPromise = Order.find(
      { userId: id, status: "completed" },
      "courseId createdAt"
    )
      .populate("courseId", "title price thumbnail count")
      .exec();

      console.timeLog("getUserAnalytics", "Orders fetched");


    const [orders] = await Promise.all([ordersPromise]);

    console.timeLog("getUserAnalytics", "Orders processed");

    // Simplify orders to avoid circular references
    const simplifiedOrders = orders.map(order => ({
      courseId: order.courseId ? {
        title: order.courseId.title,
        price: order.courseId.price,
        thumbnail: order.courseId.thumbnail,
        count: order.courseId.count,
      } : null,
      createdAt: order.createdAt,
    }));

    console.timeLog("getUserAnalytics", "Orders simplified");


    const ordersCount = simplifiedOrders.length;

    const totalVideosCount = simplifiedOrders.reduce((total, order) => {
      const count = order.courseId?.count || 0;
      return total + count;
    }, 0);

    console.timeLog("getUserAnalytics", "Counts calculated");


    const tabsData = [
      {
        id: 1,
        title: "Courses Enrolled",
        count: ordersCount,
      },
      {
        id: 2,
        title: "Lessons",
        count: totalVideosCount,
      },
    ];

    console.timeEnd("getUserAnalytics");

    return { orders: simplifiedOrders, tabsData };
  } catch (error) {
    console.error("Error in getUserAnalytics:", error);
    throw error;
  }
}

export async function getAdminAnalytics() {
  try {
    await connectToDatabase();

    const [ orderCount] = await Promise.all([
    //   Course.estimatedDocumentCount(), // Fast course count without full scan
    //   Course.aggregate([
    //     { $group: { _id: null, totalCount: { $sum: "$count" } } }
    //   ], { allowDiskUse: true, maxTimeMS: 15000 }), // ✅ Correct way to set options
    //   User.estimatedDocumentCount(), // Faster user count
      Order.estimatedDocumentCount(), // Faster order count
    ]);
    
    // const totalVideos = totalVideosCount[0]?.totalCount || 0;
    

    const tabsData = [
      {
        id: 1,
        title: "Users signed up",
        count: 0,
      },
      {
        id: 2,
        title: "Courses Enrolled",
        count: orderCount,
      },
      {
        id: 3,
        title: "Courses",
        count: 0,
      },
      {
        id: 4,
        title: "Videos",
        count: 0,
      }
    ];


    return { tabsData };
  } catch (error) {
    console.error("Error in getUserAnalytics:", error);
    throw error;
  }
}