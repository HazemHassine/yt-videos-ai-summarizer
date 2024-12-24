"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavbarWrapper from "../../components/NavbarWrapper";

export default function Account() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchUserStats = async () => {
    try {
      const response = await fetch("/api/getUserStats", {
        method: "GET",
        credentials: "include", // This ensures cookies are sent with the request
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setLoading(false);
      } else if (response.status === 401) {
        // If not authenticated, redirect to sign-in page
        router.push("/auth/sign-in");
      } else {
        throw new Error("Failed to fetch user stats");
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
      setError(error.message);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUserStats();
  });

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div>
      <div className="absolute -z-10 inset-0 h-full w-full bg-white bg-[linear-gradient(to_right,#80808032_1px,transparent_1px),linear-gradient(to_bottom,#80808032_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <NavbarWrapper />
      <div className="container mx-auto mt-10 p-6 bg-white border-2 border-black rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6">Account Information</h1>
        {loading ? (
          <p className="font-semibold">loading....</p>
        ) : (
          <div className="flex gap-20">
            <div className="space-y-4 border-r-2 pr-20 border-solid border-black">
              <h2 className="text-2xl font-semibold">Your Statistics</h2>
              <p>
                <strong>Name:</strong> {stats.displayName || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {stats.email || "N/A"}
              </p>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Your Statistics</h2>
              <p>
                <strong>Videos Summarized:</strong>{" "}
                {stats.videosSummarized || 0}
              </p>
              <p>
                <strong>Articles Saved:</strong> {stats.articlesSaved || 0}
              </p>
              <p>
                <strong>Favorite Articles:</strong>{" "}
                {stats.favoriteArticles || 0}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
