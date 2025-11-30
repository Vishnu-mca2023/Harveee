import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiSearch, FiEdit, FiTrash2, FiLogOut, FiUsers } from "react-icons/fi";
import AOS from "aos";
import "aos/dist/aos.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;
  const [editUser, setEditUser] = useState(null);
  const [editData, setEditData] = useState({});
  const [deleteUserId, setDeleteUserId] = useState(null);

  // Initialize AOS
  useEffect(() => {
    AOS.init({ duration: 600, once: true });
  }, []);

  // Load Users
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:5000/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true, // needed for refresh token cookie
        });

        // If backend sent new token, update localStorage
        if (res.headers["x-access-token"]) {
          const newToken = res.headers["x-access-token"];
          localStorage.setItem("token", newToken);
          setToken(newToken);
        }

        if (!res.data.success) {
          toast.error(res.data.message || "Access denied");
          return;
        }

        const sorted = res.data.users.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setUsers(sorted);
      } catch (err) {
        if (err.response) {
          console.error(err.response.data);
          if (err.response.status === 401) {
            toast.error("Session expired, please login again");
            localStorage.removeItem("token");
            navigate("/");
          } else {
            toast.error(err.response.data.message || "Failed to load users");
          }
        } else {
          console.error(err);
          toast.error("Network or server error");
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) loadUsers();
  }, [token, navigate]);

  // Helper: Profile image
  const getProfileImage = (img) => {
    if (!img) return "https://via.placeholder.com/50";
    const fixed = img.replace(/\\/g, "/");
    if (fixed.startsWith("uploads/")) return `http://localhost:5000/${fixed}`;
    if (fixed.startsWith("/uploads")) return `http://localhost:5000${fixed}`;
    if (fixed.startsWith("http")) return fixed;
    return "https://via.placeholder.com/50";
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const s = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s) ||
      u.phone?.toLowerCase().includes(s) ||
      u.address?.toLowerCase().includes(s) ||
      u.state?.toLowerCase().includes(s) ||
      u.city?.toLowerCase().includes(s)
    );
  });

  // Pagination
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const changePage = (p) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p);
  };

  // Edit user
  const openEdit = (user) => {
    setEditUser(user);
    setEditData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      state: user.state,
      city: user.city,
    });
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/users/${editUser._id}`,
        editData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) =>
        prev.map((u) => (u._id === editUser._id ? { ...u, ...editData } : u))
      );
      setEditUser(null);
      toast.success("User updated!");
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${deleteUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== deleteUserId));
      setDeleteUserId(null);
      toast.success("User deleted!");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.info("Logged out!");
    navigate("/");
  };

  if (loading)
    return (
      <div className="h-screen flex justify-center items-center text-xl font-semibold text-gray-700">
        Loading users...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <ToastContainer />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold flex items-center gap-2" data-aos="fade-down">
          <FiUsers className="text-blue-600" /> Admin Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          <FiLogOut /> Logout
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md mx-auto" data-aos="fade-right">
        <FiSearch className="absolute top-3 left-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search by Name, Email, Phone..."
          className="w-full p-3 pl-10 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto" data-aos="fade-up">
        <table className="w-full bg-white rounded-xl shadow">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3 text-left">Photo</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Address</th>
              <th className="p-3 text-left">State</th>
              <th className="p-3 text-left">City</th>
              <th className="p-3 text-left">Created</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((u, i) => (
              <tr
                key={u._id}
                className="border-b hover:bg-gray-50 transition"
                data-aos="fade-up"
                data-aos-delay={i * 50}
              >
                <td className="p-3">
                  <img
                    src={getProfileImage(u.profileImage)}
                    className="w-12 h-12 rounded-full border object-cover"
                    alt=""
                  />
                </td>
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.phone}</td>
                <td className="p-3">{u.address}</td>
                <td className="p-3">{u.state}</td>
                <td className="p-3">{u.city}</td>
                <td className="p-3">{new Date(u.createdAt).toLocaleString("en-IN")}</td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => openEdit(u)}
                    className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 flex items-center gap-1"
                  >
                    <FiEdit /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteUserId(u._id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
                  >
                    <FiTrash2 /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {currentUsers.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center p-6 text-gray-500">
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-5 gap-2">
        <button onClick={() => changePage(currentPage - 1)} className="px-4 py-2 bg-gray-200 rounded">
          Prev
        </button>
        {[...Array(totalPages).keys()].map((n) => (
          <button
            key={n}
            onClick={() => changePage(n + 1)}
            className={`px-4 py-2 rounded ${
              currentPage === n + 1 ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {n + 1}
          </button>
        ))}
        <button onClick={() => changePage(currentPage + 1)} className="px-4 py-2 bg-gray-200 rounded">
          Next
        </button>
      </div>

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-96 shadow" data-aos="zoom-in">
            <h2 className="text-2xl font-semibold mb-4">Edit User</h2>
            {Object.keys(editData).map((key) => (
              <input
                key={key}
                name={key}
                value={editData[key]}
                onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
                className="w-full p-2 border rounded mb-3"
                placeholder={key}
              />
            ))}
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => setEditUser(null)} className="px-4 py-2 bg-gray-300 rounded">
                Cancel
              </button>
              <button onClick={handleUpdate} className="px-4 py-2 bg-blue-600 text-white rounded">
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteUserId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-80 shadow" data-aos="zoom-in">
            <h2 className="text-2xl font-semibold">Confirm Delete</h2>
            <p className="text-gray-600 mt-2">This action cannot be undone.</p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setDeleteUserId(null)} className="px-4 py-2 bg-gray-300 rounded">
                Cancel
              </button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
