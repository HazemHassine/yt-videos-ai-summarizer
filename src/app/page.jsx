"use client";

import Button from "../components/Button";
import Image from "next/image";
import Link from "next/link";
import HomeLayout from "../components/HomeLayout";
import StatisticCard from "../components/StatisticCard";
import React, { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState(null);
  const [stats, setStats] = useState(null);
  
  const fetchStats = async () => {
    const response = await fetch("/api/sitestatistics");

    if (response.ok) {
      response.json().then((data) => {
        console.log(data);
        setStats(data);
        console.log(data);
      });
    } else {
      console.log("Failed to fetch stats");
    }
  };
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const status = user ? "authenticated" : "unauthenticated";
    setStatus(status);
    fetchStats()
  }, []);

  return (
    <HomeLayout>
      <div className="flex flex-col lg:flex-row px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="w-full lg:w-2/3 lg:pr-8 mb-8 lg:mb-0">
          <div className="flex flex-col gap-3 items-start max-w-screen-lg">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">
              Turn YouTube videos into articles with AI.
            </h1>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">
              Easily{" "}
              <span className="inline-block text-transparent bg-gradient-to-r from-[#FF0303] to-[#35B24C] via-[#666666] bg-clip-text font-semibold">
                Save, Edit, Share
              </span>{" "}
            </h1>
            <p className="text-sm sm:text-base">
              Transform the way you process information by summarizing YouTube
              videos into concise, shareable articles. Whether you need quick
              insights or detailed overviews, our AI-powered tool makes it easy
              to save, organize, and revisit valuable content at your
              convenience.
            </p>
            {status === "authenticated" ? (
              <Link href="/summarize">
                <Button>Start Summarizing</Button>
              </Link>
            ) : (
              <Link href="/auth/sign-up">
                <Button>Try free</Button>
              </Link>
            )}
            <div className="flex flex-wrap gap-3 mt-12 lg:mt-24 grayscale">
              <Image
                className="hover:opacity-100 transition-opacity ease-in-out duration-200 opacity-30"
                src="/Medium_logo.svg"
                alt="medium website logo"
                width={200}
                height={0}
              />
              <Image
                className="hover:opacity-100 transition-opacity ease-in-out duration-200 opacity-30"
                src="/the-washington-post.png"
                alt="the washington post logo"
                width={200}
                height={0}
              />
              <Image
                className="hover:opacity-100 transition-opacity ease-in-out duration-200 opacity-30"
                src="/Vox_logo.png"
                alt="vox news logo"
                width={100}
                height={20}
              />
              <Image
                className="hover:opacity-100 transition-opacity ease-in-out duration-200 opacity-30"
                src="/dailydev.png"
                alt="daily dot dev logo"
                width={200}
                height={0}
              />
            </div>
          </div>
        </div>
        <div className={`w-full ${stats ? "opacity-100": "opacity-0"} transition-all duration-700 ease-in-out lg:w-1/3 lg:pl-8 lg:border-l-2 lg:border-black`}>
          <div className="flex flex-col gap-6">
            <h2 className="text-xl sm:text-2xl font-semibold underline">
              Platform Statistics
            </h2>
            <StatisticCard
              title="Total Users"
              statistic={stats?.userCount}
              color="blue"
            />
            <StatisticCard
              title="Videos Summarized"
              statistic={stats?.articlesSummarized}
              color="green"
            />
            <StatisticCard
              title="Articles Saved"
              statistic={stats?.articlesSaved}
              color="purple"
            />
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
