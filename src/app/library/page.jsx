"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SkeletonCard from "../../components/SkeletonCard";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Button from "../../components/Button";
import {
  Star,
  Trash2,
  X,
  Pen,
  Share,
  InfoIcon,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";
import { ToastContainer, toast, Bounce } from "react-toastify";
import NavbarWrapper from "../../components/NavbarWrapper";

function Page() {
  const router = useRouter();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoverState, setHoverState] = useState({});
  const [expandedArticle, setExpandedArticle] = useState(null);
  const [editingArticle, setEditingArticle] = useState(null);
  const [user, setUser] = useState(null);

  const handleMouseEnter = (index, icon) => {
    setHoverState((prevState) => ({
      ...prevState,
      [index]: { ...prevState[index], [icon]: true },
    }));
  };

  const handleMouseLeave = (index, icon) => {
    setHoverState((prevState) => ({
      ...prevState,
      [index]: { ...prevState[index], [icon]: false },
    }));
  };

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/auth/user");
        if (response.ok) {
          const data = await response.json();
          setUser(data); // Set the user after fetching data
        } else {
          console.log("User not authenticated");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []); // Run this once when the component mounts

  // Only check for user redirection after user data is loaded
  useEffect(() => {
    if (!loading && !user) {
      console.log("redirecting to sign-in");
      router.push("/auth/sign-in/");
    }
  }, [loading, user, router]); // This checks after loading is complete and user is still not authenticated

  // Fetch articles after ensuring user is authenticated
  useEffect(() => {
    if (user) {
      async function fetchArticles() {
        try {
          const response = await fetch("/api/articles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });

          if (!response.ok) throw new Error("Failed to fetch articles.");
          const data = await response.json();
          setArticles(data.articles || []);
          localStorage.setItem("articles", JSON.stringify(data.articles || []));
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }

      fetchArticles();
    }
  }, [user]); // Only fetch articles if the user exists

  const success = (message) =>
    toast.success(message, { icon: <CheckCircle className="text-black" /> });

  const info = (message) => {
    toast.info(message, {
      icon: <InfoIcon className="text-black" />,
    });
  };
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const handleDelete = async (articleId) => {
    setExpandedArticle(null);
    if (!user) return;

    try {
      info("Deleting Article!");
      const response = await fetch(`/api/deleteArticle`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, email: user.email }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete article.");
      }

      setArticles((prevArticles) => {
        const updatedArticles = prevArticles.filter(
          (article) => article._id !== articleId
        );
        localStorage.setItem("articles", JSON.stringify(updatedArticles));
        return updatedArticles;
      });
      success("Article deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete article!");
      setError(err.message);
    }
  };

  const handleFavorite = async (articleId, currentFavorite) => {
    if (!user) return; // If no user, exit the function
    // Update the state for the articles
    setArticles((prevArticles) => {
      const updatedArticles = prevArticles.map((article) =>
        article._id === articleId
          ? { ...article, favorite: !currentFavorite } // Toggle the favorite value
          : article
      );
      localStorage.setItem("articles", JSON.stringify(updatedArticles)); // Save in localStorage
      return updatedArticles;
    });
    info("Changing favorite status!");
    try {
      // Send a PUT request to the server to toggle the favorite status
      const response = await fetch(
        "/api/updateFavoriteStatus",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            articleId,
            email: user.email,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData?.message || "Failed to update favorite status."
        );
      }

      success("Favorite status updated successfully!");
    } catch (err) {
      // Update the state for the articles
      setArticles((prevArticles) => {
        const updatedArticles = prevArticles.map((article) =>
          article._id === articleId
            ? { ...article, favorite: !currentFavorite } // Toggle the favorite value
            : article
        );
        localStorage.setItem("articles", JSON.stringify(updatedArticles)); // Save in localStorage
        return updatedArticles;
      });
      setError(err.message);
    }
  };

  const handleSave = async (articleId, updatedContent) => {
    if (!user) return;

    try {
      info("Saving Article!");
      const response = await fetch("/api/updateArticle", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId,
          email: user.email,
          content: updatedContent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update article.");
      }

      setArticles((prevArticles) => {
        const updatedArticles = prevArticles.map((article) =>
          article._id === articleId
            ? { ...article, content: updatedContent }
            : article
        );
        localStorage.setItem("articles", JSON.stringify(updatedArticles));
        return updatedArticles;
      });
      info("Aritcle Saved!");
      setEditingArticle(null);
      setExpandedArticle(null);
    } catch (err) {
      toast.error("Failed to update article, try again!");
      setError(err.message);
    }
  };

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

  return (
    <div className="relative">
      <NavbarWrapper />
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

      <div className="container mx-auto p-4">
        {loading && (
          <div className="space-y-4 flex flex-grow gap-6 flex-wrap items-center justify-center">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!loading && !error && articles.length === 0 && (
          <p className="text-xl absolute underline-offset-4 underline">
            You have no articles in your library yet, summarize something
            first!.
          </p>
        )}
        {!loading && !error && articles.length > 0 && (
          <div className="">
            <div className="relative space-y-4 flex flex-grow gap-6 flex-wrap items-center justify-center">
              {articles.map((article, index) => (
                <React.Fragment key={article._id || index}>
                  {expandedArticle === article._id ? (
                    <div
                      className="fixed inset-0 z-50 bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center px-8 py-6 overflow-y-auto"
                      onClick={(e) => {
                        if (e.target === e.currentTarget)
                          setExpandedArticle(null); // Close on clicking the background
                      }}
                    >
                      <div className="relative max-w-5xl w-full h-[70vh] bg-white inner-border-2 inner-border-solid inner-border-black shadow-xl p-6 overflow-y-auto">
                        {/* Rotated corner element */}
                        <div className="absolute h-8 w-8 bg-white top-0 left-0 border-t-4 border-t-white border-l-white border-l-4 border-r-2 border-r-black border-b-2 border-b-black">
                          <div className="absolute inset-0 bg-transparent">
                            <div className="bg-black h-[43px] w-[2px] rotate-45 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                          </div>
                        </div>

                        {/* Article content */}
                        <h2 className="text-2xl font-bold mb-4">
                          {article.videoTitle}
                        </h2>
                        <Markdown
                          remarkPlugins={[remarkGfm]}
                          components={renderers}
                        >
                          {article.content}
                        </Markdown>

                        {/* Action buttons */}
                        <div className="absolute top-4 right-4 flex gap-2">
                          <Star
                            size={26}
                            className={`cursor-pointer transition-colors hover:text-orange-500 duration-200 ${
                              article.favorite
                                ? "text-orange-500"
                                : "text-gray-500"
                            }`}
                            onClick={() =>
                              handleFavorite(article._id, article.favorite)
                            }
                          />
                          <Pen
                            size={26}
                            className="cursor-pointer text-gray-500 hover:text-black transition-colors duration-200"
                            onClick={() => setEditingArticle(article)}
                          />
                          <Share
                            size={26}
                            className="cursor-pointer text-gray-500 hover:text-black transition-colors duration-200"
                            onClick={() => handleShare(article._id)} // Share button
                          />
                          <Trash2
                            size={26}
                            onClick={() => handleDelete(article._id)}
                            className="cursor-pointer text-gray-500 hover:text-black transition-colors duration-200"
                          />
                          <X
                            size={26}
                            onClick={() => setExpandedArticle(null)}
                            className="cursor-pointer text-gray-500 hover:text-black transition-colors duration-200"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="inner-border-2 inner-border-solid inner-border-black bg-white relative flex flex-col py-4 px-5 w-fit max-w-lg drop-shadow-lg transition-all duration-300 transform hover:scale-105 hover:drop-shadow-2xl">
                      <div className="absolute h-8 w-8 bg-white top-0 left-0 z-[55] border-t-4 border-t-white border-l-white border-l-4 border-r-2 border-r-black border-b-2 border-b-black">
                        <div className="absolute inset-0 bg-transparent">
                          <div className="bg-black h-[43px] w-[2px] rotate-45 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                        </div>
                      </div>
                      <div>
                        {article.videoTitle && (
                          <div className="pl-5 mb-2 flex justify-between items-center">
                            {article?.video_thumbnail?.url && (
                              <a
                                href={article.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Image
                                  className="border-2 border-solid border-black"
                                  src={article?.video_thumbnail?.url || ""}
                                  width={article?.video_thumbnail?.width / 2}
                                  height={article?.video_thumbnail?.height / 2}
                                  alt={article.videoTitle}
                                />
                              </a>
                            )}
                            <h3 className="ml-4 text-lg font-medium">
                              <a
                                href={article.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 underline"
                              >
                                Title: {article.videoTitle}
                              </a>
                            </h3>
                          </div>
                        )}
                        <Markdown
                          className={article.videoTitle ? "" : "mt-4"}
                          components={renderers}
                          remarkPlugins={[remarkGfm]}
                        >
                          {article.content.length > 100
                            ? article.content.substring(0, 200) + "..."
                            : article.content}
                        </Markdown>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Created At:{" "}
                        {new Date(article.createdAt).toLocaleString()}
                      </p>
                      <div className="w-full mt-3 flex items-center justify-between">
                        <Button onClick={() => setExpandedArticle(article._id)}>
                          Read Article
                        </Button>
                        <div className="flex self-center gap-2">
                          <Star
                            size={30}
                            className={`cursor-pointer transition-colors hover:text-orange-500 duration-200 ${
                              article.favorite
                                ? "text-orange-500"
                                : "text-gray-500"
                            }`}
                            onClick={() =>
                              handleFavorite(article._id, article.favorite)
                            }
                          />
                          <Pen
                            size={30}
                            className="cursor-pointer text-gray-500 hover:text-black transition-colors duration-200"
                            onClick={() => setEditingArticle(article)}
                          />
                          <Trash2
                            size={30}
                            className={`cursor-pointer transition-colors duration-200 ${
                              hoverState[index]?.trash
                                ? "text-black"
                                : "text-gray-500"
                            }`}
                            onClick={() => handleDelete(article._id)}
                            onMouseEnter={() =>
                              handleMouseEnter(index, "trash")
                            }
                            onMouseLeave={() =>
                              handleMouseLeave(index, "trash")
                            }
                          />
                          <Share
                            size={30}
                            className="cursor-pointer text-gray-500 hover:text-black transition-colors duration-200"
                            onClick={() => handleShare(article._id)} // Share button
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
        {editingArticle && (
          <div
            className="fixed inset-0 z-50 bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center px-8 py-6 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) setEditingArticle(null);
            }}
          >
            <div className="relative max-w-7xl w-full h-[80vh] bg-white inner-border-2 inner-border-solid inner-border-black shadow-xl p-6 overflow-y-auto">
              <div className="absolute h-8 w-8 bg-white top-0 left-0 border-t-4 border-t-white border-l-white border-l-4 border-r-2 border-r-black border-b-2 border-b-black">
                <div className="absolute inset-0 bg-transparent">
                  <div className="bg-black h-[43px] w-[2px] rotate-45 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4">Edit Article</h2>
              <div className="flex h-[calc(100%-120px)]">
                <div className="w-1/2 pr-2">
                  <textarea
                    className="w-full h-full p-2 border-2 border-black resize-none"
                    value={editingArticle.content}
                    onChange={(e) =>
                      setEditingArticle({
                        ...editingArticle,
                        content: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="w-1/2 px-2 border-2 border-black">
                  <h3 className="text-xl font-semibold border-b-black border-b-2 border-b-solid">
                    Preview
                  </h3>
                  <div className="w-full h-[calc(100%-2rem)] p-2 overflow-y-auto">
                    <Markdown
                      remarkPlugins={[remarkGfm]}
                      components={renderers}
                    >
                      {editingArticle.content}
                    </Markdown>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 flex gap-2">
                <Button
                  onClick={() =>
                    handleSave(editingArticle._id, editingArticle.content)
                  }
                >
                  Save
                </Button>
                <Button onClick={() => setEditingArticle(null)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Page;
