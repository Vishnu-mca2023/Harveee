import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Header from "./Header";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * UserBoard.jsx
 *
 * - Reduced card sizes
 * - Card title color -> purple
 * - AOS animations added to cards (fade-up with stagger)
 * - Responsive grid changed for better fit
 * - Extra small improvements (loading states, image fallback, edit UX)
 *
 * NOTE: This file purposely includes helpful comments and a few small utilities.
 */

/* ----------------------------- Helpers / Utilities ---------------------------- */

/**
 * safeGet - safe getter for nested values with fallback
 * @param {any} val
 * @param {any} fallback
 */
const safeGet = (val, fallback = "") => (val === undefined || val === null ? fallback : val);

/**
 * formatShort - shortens description for card preview
 * @param {string} text
 * @param {number} max
 */
const formatShort = (text = "", max = 140) => {
  if (!text) return "";
  return text.length > max ? text.slice(0, max).trim() + "..." : text;
};

/* ----------------------------- Main Component ---------------------------- */

const UserBoard = () => {
  // user and content state
  const [user, setUser] = useState(null);
  const [contents, setContents] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [isFetchingContents, setIsFetchingContents] = useState(false);

  const postsPerPage = 6;
  const token = localStorage.getItem("token");

  // Initialize AOS once
  useEffect(() => {
    AOS.init({ duration: 700, easing: "ease-out", once: true });
    // refresh AOS whenever contents change
  }, []);

  // Load user info
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch (err) {
        console.error("Load user error:", err);
        toast.error("Error loading user data");
      }
    };
    if (token) loadUser();
    else {
      // If no token, redirect to login (or simply notify)
      // window.location.href = "/"; // comment out to avoid unexpected redirect
    }
  }, [token]);

  // Load contents
  useEffect(() => {
    const loadContents = async () => {
      setIsFetchingContents(true);
      try {
        const res = await axios.get("http://localhost:5000/api/content", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setContents(Array.isArray(res.data.contents) ? res.data.contents : []);
        // Re-init AOS to pick up new elements
        setTimeout(() => {
          AOS.refresh();
        }, 100);
      } catch (err) {
        console.error("Load contents error:", err);
        toast.error("Error loading contents");
      } finally {
        setIsFetchingContents(false);
      }
    };
    if (user) loadContents();
  }, [user, token]);

  // Logout
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // Submit add / update content
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) return toast.error("Title & Description are required");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (image) formData.append("image", image);

    setLoading(true);
    try {
      let res;
      if (editingId) {
        // Update existing
        res = await axios.put(`http://localhost:5000/api/content/${editingId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        setContents((prev) => prev.map((c) => (c._id === editingId ? res.data.content : c)));
        toast.success("Content updated successfully!");
        setEditingId(null);
      } else {
        // Create new
        res = await axios.post("http://localhost:5000/api/content", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setContents((prev) => [res.data.content, ...prev]);
        toast.success("Content added successfully!");
      }

      // reset
      setTitle("");
      setDescription("");
      setImage(null);
      const f = document.getElementById("fileInput");
      if (f) f.value = "";
      setShowForm(false);

      // refresh AOS for animation on newly added card
      setTimeout(() => AOS.refresh(), 200);
    } catch (err) {
      console.error("Save content error:", err);
      toast.error(err.response?.data?.message || "Error saving content");
    } finally {
      setLoading(false);
    }
  };

  // Edit handler populates the form
  const handleEdit = (content) => {
    setEditingId(content._id);
    setTitle(content.title || "");
    setDescription(content.description || "");
    setImage(null);

    if (!showForm) {
      setShowForm(true);
      // clear file input when opening
      setTimeout(() => {
        const f = document.getElementById("fileInput");
        if (f) f.value = "";
      }, 100);
    } else {
      const f = document.getElementById("fileInput");
      if (f) f.value = "";
    }

    // scroll to form on small screens
    const el = document.querySelector("form");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // Delete action
  const handleDelete = async () => {
    if (!deleteId) return;

    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/content/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setContents((prev) => prev.filter((c) => c._id !== deleteId));
      setDeleteId(null);
      toast.success("Content deleted successfully!");
      setTimeout(() => AOS.refresh(), 200);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Error deleting content");
    } finally {
      setLoading(false);
    }
  };

  // Pagination compute
  const indexOfLast = currentPage * postsPerPage;
  const indexOfFirst = indexOfLast - postsPerPage;
  const currentPosts = useMemo(
    () => (Array.isArray(contents) ? contents.slice(indexOfFirst, indexOfLast) : []),
    [contents, indexOfFirst, indexOfLast]
  );
  const totalPages = Math.max(1, Math.ceil(contents.length / postsPerPage));

  if (!user)
    return (
      <div className="h-screen flex justify-center items-center text-xl">
        Loading user...
      </div>
    );

  /* ----------------------------- Visual helpers ---------------------------- */

  // Reduced card sizes and image heights controlled here for easy tuning.
  const CARD_MIN_HEIGHT = "min-h-[300px]"; // previously 350
  const IMAGE_HEIGHT = "h-40"; // previously h-48

  // AOS animation variants to rotate through for variety
  const aosVariants = ["fade-up", "zoom-in", "fade-up-right", "fade-up-left"];

  /* ----------------------------- Render ---------------------------- */

  return (
    <div className="min-h-screen bg-purple-50">
      <Header user={user} onLogout={handleLogout} />

      <main className="p-6 max-w-6xl mx-auto">
        {/* HEADER BAR */}
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-l-4 border-purple-600 gap-4">
          <div>
            <h2 className="text-xl font-bold text-purple-700">Add New Content</h2>
            <p className="text-sm text-gray-600 mt-1">
              Create short tech posts, articles or announcements. Max 800 chars.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-700 hidden sm:block">Signed in as: <span className="font-semibold">{safeGet(user.name, "User")}</span></div>

            <button
              onClick={() => {
                setEditingId(null);
                setShowForm((s) => !s);
                setTitle("");
                setDescription("");
                setImage(null);
                const f = document.getElementById("fileInput");
                if (f) f.value = "";
              }}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
              aria-expanded={showForm}
            >
              <FiPlus />
              <span>{showForm ? "Close" : "Add Content"}</span>
            </button>
          </div>
        </div>

        {/* FORM */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="bg-white p-6 rounded-lg shadow-md mb-6"
            role="region"
            aria-label={editingId ? "Update Content Form" : "Add Content Form"}
          >
            <h2 className="text-lg font-semibold mb-3 text-gray-700">
              {editingId ? "Update Content" : "Add New Content"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3" id="contentForm">
              <label className="block">
                <span className="text-sm text-gray-600">Title</span>
                <input
                  type="text"
                  placeholder="Title"
                  value={title}
                  maxLength={100}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 mt-1 mb-1 border rounded-lg focus:ring-2 focus:ring-purple-400"
                  required
                />
                <span className="text-xs text-gray-400">Max 100 characters</span>
              </label>

              <label className="block">
                <span className="text-sm text-gray-600">Description</span>
                <textarea
                  placeholder="Description"
                  value={description}
                  maxLength={800}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 mt-1 mb-1 border rounded-lg focus:ring-2 focus:ring-purple-400 min-h-[120px] resize-none"
                  required
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{description.length}/800</span>
                  <span>Supports optional image</span>
                </div>
              </label>

              <label className="block">
                <span className="text-sm text-gray-600">Image (optional)</span>
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0])}
                  className="mt-2"
                  aria-label="Upload image"
                />
              </label>

              {editingId && !image && (
                <p className="text-sm text-gray-500 mb-3">
                  Current image will remain if you don’t upload a new one.
                </p>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-60"
                >
                  {loading ? "Saving..." : editingId ? "Update Content" : "Add Content"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setTitle("");
                    setDescription("");
                    setImage(null);
                    const f = document.getElementById("fileInput");
                    if (f) f.value = "";
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Loading indicator when fetching contents */}
        {isFetchingContents && (
          <div className="text-center text-gray-600 mb-4">Loading contents...</div>
        )}

        {/* CONTENT CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {currentPosts.length === 0 && !isFetchingContents && (
            <div className="col-span-full bg-white p-6 rounded-lg shadow text-center text-gray-600">
              No content yet. Click "Add Content" to create your first post.
            </div>
          )}

          {currentPosts.map((c, index) => {
            const variant = aosVariants[index % aosVariants.length];
            return (
              <motion.article
                key={c._id}
                data-aos={variant}
                data-aos-delay={index * 80}
                className={`bg-white rounded-2xl overflow-hidden shadow-md border border-gray-200 flex flex-col ${CARD_MIN_HEIGHT} transform transition hover:scale-[1.012]`}
                role="article"
                aria-labelledby={`card-title-${c._id}`}
              >
                {/* Image */}
                {c.image ? (
                  <img
                    src={`http://localhost:5000/${c.image}`}
                    alt={c.title}
                    className={`w-full object-cover ${IMAGE_HEIGHT}`}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        "https://via.placeholder.com/600x400?text=No+Image";
                    }}
                  />
                ) : (
                  <div className={`w-full bg-gradient-to-tr from-purple-100 to-purple-50 flex items-center justify-center ${IMAGE_HEIGHT}`}>
                    <span className="text-sm text-purple-600 font-semibold">No image</span>
                  </div>
                )}

                {/* Body */}
                <div className="p-4 flex flex-col flex-1">
                  <h3
                    id={`card-title-${c._id}`}
                    className="font-bold text-lg mb-2 text-purple-700 leading-tight"
                    title={c.title}
                  >
                    {c.title}
                  </h3>

                  <p className="text-gray-700 text-sm flex-1">
                    {formatShort(c.description, 150)}
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-xs">By: <span className="font-medium">{c.user?.name || "Unknown"}</span></p>
                      <p className="text-gray-400 text-xs mt-1">{new Date(c.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(c)}
                        className="flex items-center gap-2 bg-purple-500 text-white px-3 py-1 rounded-lg hover:bg-purple-600 transition"
                        aria-label={`Edit ${c.title}`}
                      >
                        <FiEdit2 />
                        <span className="hidden sm:inline">Edit</span>
                      </button>

                      <button
                        onClick={() => setDeleteId(c._id)}
                        className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
                        aria-label={`Delete ${c.title}`}
                      >
                        <FiTrash2 />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center items-center mt-6 gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition disabled:opacity-50"
            aria-label="Previous page"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-2 rounded transition ${
                currentPage === i + 1 ? "bg-purple-600 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
              aria-current={currentPage === i + 1 ? "page" : undefined}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition disabled:opacity-50"
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </main>

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg border-l-4 border-red-500">
            <h2 className="text-lg font-bold mb-4 text-red-500">Confirm Delete</h2>
            <p className="mb-4">Are you sure you want to delete this content?</p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
    </div>
  );
};

export default UserBoard;
