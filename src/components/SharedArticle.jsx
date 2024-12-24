"use client";

import React, { useState, useEffect } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Printer } from "lucide-react";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Button from "./Button";
import { useRouter } from "next/navigation";

export default function SharedArticle({ shareToken }) {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  useEffect(() => {
    const fetchSharedArticle = async () => {
      try {
        const response = await fetch(`/api/shared?shareToken=${shareToken}`);
        if (!response.ok) {
          throw new Error("Failed to fetch shared article");
        }
        const data = await response.json();
        setArticle(data.article);
      } catch (err) {
        setError(err.message);
        toast.error("Failed to load the article. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (shareToken) {
      fetchSharedArticle();
    }
  }, [shareToken]);

  const renderers = {
    h1: ({ node, ...props }) => (
      <h1
        className="mb-4 text-2xl font-bold self-center text-wrap max-w-md"
        {...props}
      />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="my-2 font-extrabold text-xl" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="my-2 font-extrabold text-lg" {...props} />
    ),
    h4: ({ node, ...props }) => <h4 className="font-extrabold" {...props} />,
    h5: ({ node, ...props }) => <h5 className="font-bold" {...props} />,
    h6: ({ node, ...props }) => <h6 className="font-semibold" {...props} />,
    strong: ({ node, ...props }) => (
      <strong className="font-semibold" {...props} />
    ),
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  if (!article) {
    return <div className="text-center py-8">Article not found</div>;
  }

  const getYouTubeVideoId = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYouTubeVideoId(article.videoUrl);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
      <div className="max-w-6xl mx-auto bg-white inner-border-2 inner-border-solid inner-border-black drop-shadow-2xl py-6 px-10 relative">
        <div className="absolute h-8 w-8 bg-white top-0 left-0 border-t-4 border-t-white border-l-white border-l-4 border-r-2 border-r-black border-b-2 border-b-black">
          <div className="absolute inset-0 bg-transparent">
            <div className="bg-black h-[43px] w-[2px] rotate-45 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-4xl font-bold self-center w-full text-center">
            {article.videoTitle}
          </h1>
        </div>
        <div className="noprint mb-4">
          <div className="relative pt-[56.25%] w-full">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&fs=1`}
              className="absolute top-0 left-0 w-full h-full border-2 border-solid border-black"
              allowFullScreen
              allow="fullscreen"
            ></iframe>
          </div>
        </div>
        <div className="prose max-w-none">
          <Markdown remarkPlugins={[remarkGfm]} components={renderers}>
            {article.content}
          </Markdown>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Created at: {new Date(article.createdAt).toLocaleString()}
          </div>
          <div className="noprint flex items-center gap-6 text-gray-500 hover:text-black transition-colors duration-200">
            <Printer
              size={30}
              onClick={handlePrint}
              className="cursor-pointer"
            />
            <Button
              onClick={() => {
                router.push("/");
              }}
            >
              Summarize A Video
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
