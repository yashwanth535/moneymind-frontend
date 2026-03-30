import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaClipboard,
  FaHome,
  FaPlay,
  FaTrash,
  FaTv,
} from "react-icons/fa";

function extractYouTubeId(input) {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const withProtocol = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const url = new URL(withProtocol);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.replace(/^\//, "").split("/")[0];
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    if (host.endsWith("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

      const pathMatch = url.pathname.match(
        /\/(embed|shorts|live)\/([a-zA-Z0-9_-]{11})/
      );
      if (pathMatch) return pathMatch[2];
    }
  } catch {
    return null;
  }
  return null;
}

const Yt = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [playInput, setPlayInput] = useState("");
  const [saveInput, setSaveInput] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [saveSection, setSaveSection] = useState("watch-now");
  const [videoId, setVideoId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedLinks, setSavedLinks] = useState([]);
  const [serverMessage, setServerMessage] = useState("");

  const apiBase = import.meta.env.VITE_API_URL || "";

  const loadSavedLinks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/yt`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Could not load saved videos.");
      setSavedLinks(Array.isArray(data.links) ? data.links : []);
    } catch (apiError) {
      setServerMessage(apiError.message);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  const applyUrl = useCallback(
    (raw) => {
      const id = extractYouTubeId(raw);
      if (id) {
        setVideoId(id);
        setError("");
        setSearchParams({ v: id }, { replace: true });
        return true;
      }
      setError("Could not read a valid YouTube link or video ID.");
      return false;
    },
    [setSearchParams]
  );

  useEffect(() => {
    loadSavedLinks();
  }, [loadSavedLinks]);

  useEffect(() => {
    const vParam = searchParams.get("v");
    const urlParam = searchParams.get("url");
    if (vParam && /^[a-zA-Z0-9_-]{11}$/.test(vParam)) {
      setVideoId(vParam);
      setError("");
      return;
    }
    if (urlParam) {
      applyUrl(decodeURIComponent(urlParam));
    }
  }, [searchParams, applyUrl]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!playInput.trim()) {
      setError("Paste a YouTube URL or video ID.");
      return;
    }
    applyUrl(playInput);
  };

  const embedSrc = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`
    : null;

  const sections = useMemo(
    () => ({
      "watch-now": savedLinks.filter((item) => item.section === "watch-now"),
      "watch-later": savedLinks.filter((item) => item.section === "watch-later"),
    }),
    [savedLinks]
  );

  const handleSave = async (e) => {
    e.preventDefault();
    setServerMessage("");

    if (!saveInput.trim()) {
      setServerMessage("Please paste a YouTube URL or video ID.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/yt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: saveInput.trim(),
          title: customTitle.trim(),
          section: saveSection,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to save URL.");

      setSaveInput("");
      setCustomTitle("");
      setServerMessage("URL saved successfully.");
      setSavedLinks((prev) => [data.link, ...prev]);
    } catch (apiError) {
      setServerMessage(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setServerMessage("");
    try {
      const res = await fetch(`${apiBase}/yt/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to remove URL.");
      setSavedLinks((prev) => prev.filter((item) => item._id !== id));
      setServerMessage("URL removed.");
    } catch (apiError) {
      setServerMessage(apiError.message);
    }
  };

  const moveSection = async (id, nextSection) => {
    setServerMessage("");
    try {
      const res = await fetch(`${apiBase}/yt/${id}/section`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: nextSection }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to move URL.");
      setSavedLinks((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, section: data.link.section } : item
        )
      );
      setServerMessage(`Moved to ${nextSection.replace("-", " ")}.`);
    } catch (apiError) {
      setServerMessage(apiError.message);
    }
  };

  const copyToClipboard = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setServerMessage("Link copied.");
    } catch {
      setServerMessage("Could not copy link.");
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-orange-100 to-orange-50 relative overflow-hidden">
      <div className="relative z-10 flex flex-col flex-1">
        <header className="bg-white/10 backdrop-blur-md text-gray-800 border-b border-white/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/40 hover:bg-white/60 text-gray-800 text-sm font-medium transition-colors"
                aria-label="Go back"
              >
                <FaArrowLeft />
                Back
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/40 hover:bg-white/60 text-gray-800 text-sm font-medium transition-colors"
                aria-label="Home"
              >
                <FaHome />
                Home
              </button>
            </motion.div>
            <motion.h1
              className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-orange-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Watch on YouTube
            </motion.h1>
          </div>
        </header>

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
          <motion.form
            onSubmit={handleSubmit}
            className="mb-8"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.35 }}
          >
            <label htmlFor="yt-url" className="block text-sm font-medium text-gray-700 mb-2">
              Paste YouTube URL or video ID
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="yt-url"
                type="text"
                value={playInput}
                onChange={(e) => setPlayInput(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 min-w-0 px-4 py-3 rounded-xl border border-orange-200/80 bg-white/70 text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                autoComplete="off"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-md hover:from-orange-600 hover:to-orange-700 transition-all shrink-0"
              >
                <FaPlay className="text-sm" />
                Load video
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
          </motion.form>

          {embedSrc && (
            <motion.div
              className="rounded-2xl overflow-hidden shadow-xl border border-white/40 bg-black/5 aspect-video w-full"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <iframe
                title="YouTube video player"
                src={embedSrc}
                className="w-full h-full min-h-[200px]"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </motion.div>
          )}

          <motion.section
            className="mt-10 rounded-2xl bg-white/60 border border-orange-100 shadow-lg p-4 sm:p-6"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <h2 className="text-lg font-bold text-gray-800 mb-3">Save URL to cloud list</h2>
            <form onSubmit={handleSave} className="grid gap-3">
              <input
                type="text"
                value={saveInput}
                onChange={(e) => setSaveInput(e.target.value)}
                placeholder="Paste URL to save for phone/laptop sync"
                className="w-full px-4 py-3 rounded-xl border border-orange-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <div className="grid sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Optional custom title"
                  className="sm:col-span-2 px-4 py-3 rounded-xl border border-orange-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <select
                  value={saveSection}
                  onChange={(e) => setSaveSection(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-orange-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="watch-now">Watch now</option>
                  <option value="watch-later">Watch later</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-fit inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold disabled:opacity-60"
              >
                <FaPlay className="text-xs" />
                {loading ? "Saving..." : "Save URL"}
              </button>
            </form>
            {serverMessage && <p className="mt-2 text-sm text-gray-700">{serverMessage}</p>}
          </motion.section>

          <section className="mt-8 grid md:grid-cols-2 gap-6">
            {["watch-now", "watch-later"].map((sectionKey) => (
              <div
                key={sectionKey}
                className="rounded-2xl bg-white/60 border border-orange-100 shadow-lg p-4"
              >
                <h3 className="text-base font-bold text-gray-800 mb-3 capitalize">
                  {sectionKey.replace("-", " ")}
                </h3>
                <div className="space-y-3">
                  {sections[sectionKey].map((item) => (
                    <div
                      key={item._id}
                      className="rounded-xl border border-orange-100 bg-white p-3 shadow-sm"
                    >
                      <div className="flex gap-3">
                        <img
                          src={item.thumbnailUrl}
                          alt={item.title}
                          className="w-24 h-16 object-cover rounded-md border"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-gray-800 line-clamp-2">
                            {item.title || "YouTube Video"}
                          </p>
                          <p className="text-xs text-gray-500 truncate mt-1">{item.url}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => applyUrl(item.url)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-orange-500 text-white hover:bg-orange-600"
                        >
                          <FaTv />
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(item.url)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
                        >
                          <FaClipboard />
                          Copy
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            moveSection(
                              item._id,
                              item.section === "watch-now" ? "watch-later" : "watch-now"
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                          Move
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200"
                        >
                          <FaTrash />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  {!loading && sections[sectionKey].length === 0 && (
                    <p className="text-sm text-gray-500">No URLs in this section yet.</p>
                  )}
                </div>
              </div>
            ))}
          </section>

          {!embedSrc && !error && (
            <p className="text-center text-gray-500 text-sm mt-8">
              Paste a link above to play the video here without leaving the site.
            </p>
          )}
        </main>
      </div>
    </div>
  );
};

export default Yt;
