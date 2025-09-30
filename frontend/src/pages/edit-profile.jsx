import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { useEffect, useRef, useState } from "react";
import { FiArrowLeft, FiCamera } from "react-icons/fi";
import Avatar from "../components/common/Avatar";
import api from "../services/api";

const EditProfile = () => {
  const navigate = useNavigate();

  const { user, updateUser } = useAuthStore();

  const [formData, setFormData] = useState({
    username: user?.username || "",
    fullName: user?.fullName || "",
    bio: user?.bio || "",
    email: user?.email || "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [removeImage, setRemoveImage] = useState(false);

  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      setError("");
      setRemoveImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let profileImageUrl = user?.profileImageUrl;

      if (profileImage) {
        const imageFormData = new FormData();
        imageFormData.append("file", profileImage);

        const uploadResponse = await api.post(
          "/api/upload/profile",
          imageFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        profileImageUrl = uploadResponse.data.url;
      } else if (removeImage) {
        profileImage = null;
      }

      const updateData = {
        ...formData,
        profileImageUrl,
      };

      const response = await api.put("/api/users/profile", updateData);

      if (response.data.accessToken && response.data.refreshToken) {
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }

      const updatedUser = {
        ...user,
        username: response.data.username,
        fullName: response.data.fullName,
        bio: response.data.bio,
        email: response.data.email,
        profileImageUrl: response.data.profileImageUrl,
      };

      updateUser(updatedUser);

      navigate(`/profile/${response.data.username}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setPreviewUrl(user?.profileImageUrl || null);
    setRemoveImage(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-300 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => navigate(`/profile/${user?.username}`)}
              className="text-gray-700 hover:text-black"
              disabled={loading}
            >
              <FiArrowLeft size={24} />
            </button>
            <h1 className="font-semibold text-lg">Edit Profile</h1>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="text-blue-500 font-semibold hover:text-blue-600 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </header>

        {/* Form */}
        <div className="bg-white">
          <form onSubmit={handleSubmit} className="p-4">
            {/* Profile Image */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24">
                      <Avatar user={user} size="xlarge" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
                >
                  <FiCamera size={16} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
            </div>

            {profileImage && (
              <div className="flex justify-center mb-4">
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-red-500 text-sm hover:underline"
                >
                  Cancel Selection
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter username"
                  pattern="^[a-zA-Z0-9_]{3,30}$"
                  title="Username must be 3-30 characters and contain only letters, numbers, and underscores"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Username must be unique and contain only letters, numbers, and
                  underscores
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;