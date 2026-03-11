import React from "react";
import { Camera, UploadCloud } from "lucide-react";
import { useAvatarUpload } from "../hooks/useAvatarUpload";

export default function AvatarUploader({ userId }) {
  const {
    previewUrl,
    avatarUrl,
    error,
    uploading,
    successMessage,
    handleFileChange,
    handleUpload,
  } = useAvatarUpload(userId);

  const displayedAvatar =
    previewUrl || avatarUrl || "/default-avatar.png";

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 w-96 max-w-full">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-amber-900">Edit Profile Photo</h3>
        <p className="text-sm text-gray-500 mt-1">
          Choose a new profile image for your account.
        </p>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative group">
          <img
            src={displayedAvatar}
            alt="Profile avatar"
            className="h-28 w-28 rounded-full object-cover border-4 border-amber-100 shadow-md"
          />

          <div className="absolute inset-0 rounded-full bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera size={20} className="text-white" />
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm font-medium text-gray-700">
            PNG or JPG, up to 5MB
          </p>
        </div>

        <label className="mt-5 w-full cursor-pointer">
          <div className="w-full rounded-xl border border-dashed border-amber-300 bg-amber-50 hover:bg-amber-100 transition-colors px-4 py-4 text-center">
            <UploadCloud size={20} className="mx-auto text-amber-700 mb-2" />
            <span className="text-sm font-medium text-amber-800">
              Choose image
            </span>
          </div>

          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="mt-5 w-full rounded-xl bg-amber-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? "Uploading..." : "Save Profile Photo"}
        </button>

        {error && (
          <div className="mt-4 w-full rounded-lg bg-red-50 border border-red-200 px-3 py-2">
            <p className="text-sm font-medium text-red-600">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 w-full rounded-lg bg-green-50 border border-green-200 px-3 py-2">
            <p className="text-sm font-medium text-green-600">{successMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}