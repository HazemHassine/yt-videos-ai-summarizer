"use client";

import React, { useState, useRef, useEffect } from "react";
import Button from "../../components/Button";
import { useRouter } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Star, Trash2, X, InfoIcon, CheckCircle, Share } from "lucide-react";
import { ToastContainer, toast, Bounce } from "react-toastify";
import NavbarWrapper from "../../components/NavbarWrapper";
import DropdownChoose from "../../components/DropdownChoose";

function Page() {
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState(null);
  const [uuid, setUuid] = useState(null);
  const [error, setError] = useState(null);
  const playerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [article, setArticle] = useState(null);
  const [hoverFavorite, setHoverFavorite] = useState(false);
  const [hoverTrash, setHoverTrash] = useState(false);
  const [hoverClose, setHoverClose] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [user, setUser] = useState(null);
  const [llm, setLLM] = useState("llama-3.1-70b-versatile");
  const [changedLLM, setChangedLLM] = useState(false);

  // Handle the mouse hover for each icon
  const handleMouseEnter = (setHover) => setHover(true);
  const handleMouseLeave = (setHover) => setHover(false);

  const router = useRouter();

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/auth/user"); // Replace with your actual user data endpoint
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  useEffect(() => {
    async function initializeUser() {
      const userData = await fetchUserData();
      if (userData) {
        setUser(userData);
      } else {
        router.replace("/auth/sign-in/");
      }
    }

    initializeUser();

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      if (videoId) {
        loadVideo(videoId);
      }
    };

    return () => {
      window.onYouTubeIframeAPIReady = () => {};
    };
  }, [videoId, router]);

  const getYoutubeVideoId = (url) => {
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  const validateAndLoadVideo = () => {
    setError(null);
    const id = getYoutubeVideoId(url);

    if (!id) {
      setError("Invalid YouTube URL");
      toast.error("Invalid video URL");
      setVideoId(null);
      return;
    }
    success("Valid video URL!");
    setVideoId(id);
    loadVideo(id);
  };

  const summarizeVideo = async () => {
    // console.log(videoId, user)
    setError(null);
    try {
      setStatus("Summarizing...");
      setIsLoading(true);
      const response = await fetch(
        "/api/summarizeProcess",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            video: videoId,
            email: user.email,
            llm: llm,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch summary");
      }

      const data = await response.json();
      setStatus("Summary Ready");
      setIsLoading(false);
      success("Article Successfully summarized");
      setArticle(data.article.content);
      setUuid(data.article._id);

      // Update localStorage
      const existingArticles = JSON.parse(
        localStorage.getItem("articles") || "[]"
      );
      existingArticles.push(data.article);
      localStorage.setItem("articles", JSON.stringify(existingArticles));

      console.log("Article added:", data.article);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to fetch summary");
    }
  };

  const handleSummarize = () => {
    if (isLoading) {
      info("Wait till the summarizing end!");
      return;
    }
    if (!videoId) {
      setError("No video to summarize");
      return;
    }
    setFavorite(false);
    info(`Summarizing Video, id: ${videoId}`);
    summarizeVideo();
  };
  const loadVideo = (id) => {
    if (window.YT && window.YT.Player) {
      if (playerRef.current) {
        playerRef.current.loadVideoById(id);
      } else {
        playerRef.current = new window.YT.Player("youtube-player", {
          height: "360",
          width: "640",
          videoId: id,
        });
      }
    }
  };
  const success = (message) =>
    toast.success(message, { icon: <CheckCircle className="text-black" /> });

  const info = (message) => {
    toast.info(message, {
      position: "top-right",
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "light",
      icon: <InfoIcon />,
      transition: Bounce,
    });
  };

  const renderers = {
    h1: ({ node, ...props }) => (
      <h1
        className="mb-4 text-center text-3xl font-bold self-center text-wrap max-w-md"
        {...props}
      />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="my-2 font-extrabold text-2xl" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="my-2 font-extrabold text-xl" {...props} />
    ),
    h4: ({ node, ...props }) => <h4 className="font-extrabold" {...props} />,
    h5: ({ node, ...props }) => <h5 className="font-bold" {...props} />,
    h6: ({ node, ...props }) => <h6 className="font-semibold" {...props} />,
    strong: ({ node, ...props }) => (
      <strong className="font-semibold" {...props} />
    ),
  };

  const handleDelete = async () => {
    if (!user || !article || !uuid) {
      setError("Unable to delete: No article selected.");
      return;
    }

    try {
      const response = await fetch("/api/deleteArticle", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: uuid, email: user.email }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete the article from the server.");
      }

      // Update localStorage
      const existingArticles = JSON.parse(
        localStorage.getItem("articles") || "[]"
      );
      const updatedArticles = existingArticles.filter(
        (savedArticle) => savedArticle._id !== uuid
      );
      localStorage.setItem("articles", JSON.stringify(updatedArticles));

      setArticle(null);
      setStatus(null);
      setUuid(null);
      setError(null);
      success("Article deleted successfully!");
      setFavorite(false);
    } catch (error) {
      console.error("Error deleting article:", error);
      setError("Failed to delete the article. Please try again.");
    }
  };

  const handleFavorite = async () => {
    const articleId = uuid;
    setError(null);
    if (!user || !articleId) {
      setError("Unable to update favorite status: No article selected.");
      return;
    }

    const updatedFavorite = !favorite;
    setFavorite(updatedFavorite);

    try {
      const response = await fetch(
        "/api/updateFavoriteStatus",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ articleId: articleId, email: user.email }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update the favorite status on the server.");
      }
      // Update localStorage
      const existingArticles = JSON.parse(
        localStorage.getItem("articles") || "[]"
      );
      const updatedArticles = existingArticles.map((savedArticle) =>
        savedArticle._id === articleId
          ? { ...savedArticle, favorite: updatedFavorite }
          : savedArticle
      );
      localStorage.setItem("articles", JSON.stringify(updatedArticles));

      success("Favorite status updated successfully!");
    } catch (error) {
      setFavorite(favorite);
      console.error("Error updating favorite status:", error);
      setError("Failed to update favorite status. Please try again.");
    }
  };
// llama-3.1-70b-versatile
  const LLMList = [
    "llama3-8b-8192",
    "gemma2-9b-it",
    "llama3-groq-70b-8192-tool-use-preview",
    "llama3-groq-8b-8192-tool-use-preview",
    "llama-3.1-70b-versatile",
    "llama-3.1-8b-instant",
    "llama-3.2-1b-preview",
    "llama-3.2-3b-preview",
    "llama-3.3-70b-versatile",
    "llama-guard-3-8b",
    "llama3-70b-8192",
    "mixtral-8x7b-32768",
  ];

  const handleShare = async (articleId) => {
    if (!user) return;

    try {
      info("Generating share link...");

      const response = await fetch("/api/generateShareToken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: articleId, email: user.email }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate share link.");
      }

      const { shareToken } = await response.json();
      const shareUrl = `${window.location.origin}/shared/${shareToken}`;

      // Copy the share URL to clipboard
      await navigator.clipboard.writeText(shareUrl);

      success("Share link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to generate share link. Please try again.");
      console.error(err);
    }
  };


  return (
    <div className="relative">
      <NavbarWrapper />
      <div className="absolute min-h-[calc(100vh+40%)] -z-10 inset-0 bg-white bg-[linear-gradient(to_right,#80808032_1px,transparent_1px),linear-gradient(to_bottom,#80808032_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="w-full max-w-3xl mx-auto space-y-4 flex flex-col mt-20 justify-center items-center">
        <ToastContainer
          position="top-right"
          autoClose={1500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          closeButton={false}
          rtl={false}
          draggable
          theme="light"
          transition={Bounce}
          toastClassName="rounded-none inner-border-2 inner-border-solid inner-border-black text-black"
          pauseOnHover={false}
          pauseOnFocusLoss={false}
          className="translate-y-32"
          progressClassName="bg-black"
        />
        <div>
          {/* Video embed */}
          {videoId ? (
            <div className="aspect-video w-full">
              <iframe
                width="560"
                height="315"
                src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
              ></iframe>
            </div>
          ) : (
            <div className="w-[560px] h-[315px] bg-gray-400 animate-pulse opacity-25" />
          )}
        </div>

        <div className="flex gap-2 w-[calc(100%+25%)]">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1 border-2 border-solid border-black rounded-xl px-5 w-1/2"
          />
          <div className="w-fit">
            <Button onClick={validateAndLoadVideo}>Validate</Button>
          </div>
          <div className="w-fit">
            <DropdownChoose
              setChoice={setLLM}
              items={LLMList}
              current={llm}
              changedLLM={setChangedLLM}
            >
              <Button>
                {llm === "llama-3.1-70b-versatile" && !changedLLM
                  ? "Choose LLM (default: llama-3.1-70b-versatile)"
                  : llm}
              </Button>
            </DropdownChoose>
          </div>
        </div>
        {error && <p className="text-red-500">{error}</p>}

        <Button onClick={handleSummarize}>Summarize</Button>

        <div className="relative flex flex-col items-center">
          {status && <p className="underline mb-4">{status}</p>}
          {article && (
            <div className="inner-border-2 border-solid bg-white drop-shadow-2xl inner-border-black relative mb-10">
              <div className="relative h-8 w-8 top-0 left-0 z-[55] border-t-4 border-t-white border-l-white border-l-4 border-r-2 border-r-black border-b-2 border-b-black">
                <div className="absolute inset-0 bg-transparent">
                  <div className="bg-black h-[43px] w-[2px] rotate-45 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
              </div>

              <div className="flex flex-col my-3 mx-14">
                <Markdown remarkPlugins={[remarkGfm]} components={renderers}>
                  {article}
                </Markdown>
              </div>
              <div className="absolute flex top-0 right-0 m-5 gap-2">
                <Star
                  size={26}
                  className={`cursor-pointer transition-colors duration-200 ${
                    favorite ? "text-orange-500" : "text-gray-500"
                  } hover:text-orange-500 cursor-pointer transition-colors duration-200`}
                  onClick={handleFavorite}
                  onMouseEnter={() => handleMouseEnter(setHoverFavorite)}
                  onMouseLeave={() => handleMouseLeave(setHoverFavorite)}
                />
                <Share
                  size={26}
                  className="cursor-pointer text-gray-500 hover:text-black transition-colors duration-200"
                  onClick={() => handleShare(uuid)} // Share button
                />
                <Trash2
                  size={26}
                  onClick={handleDelete}
                  className={`cursor-pointer ${
                    hoverTrash ? "text-black" : "text-gray-500"
                  } transition-colors duration-200`}
                  onMouseEnter={() => handleMouseEnter(setHoverTrash)}
                  onMouseLeave={() => handleMouseLeave(setHoverTrash)}
                />
                <X
                  size={26}
                  onClick={() => {
                    setArticle(null);
                    setStatus(null);
                  }}
                  className={`cursor-pointer ${
                    hoverClose ? "text-black" : "text-gray-500"
                  } transition-colors duration-200`}
                  onMouseEnter={() => handleMouseEnter(setHoverClose)}
                  onMouseLeave={() => handleMouseLeave(setHoverClose)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Page;
