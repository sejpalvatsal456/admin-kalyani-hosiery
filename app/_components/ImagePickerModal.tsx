"use client";

import React, { useEffect, useState } from "react";

interface MediaItem {
  _id: string;
  name: string;
  url: string;
  key: string;
  size: number;
  type: string;
  createdAt: string;
}

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (cdnUrl: string) => void;
  selectedImageUrl?: string;
}

export default function ImagePickerModal({
  isOpen,
  onClose,
  onSelect,
  selectedImageUrl,
}: ImagePickerModalProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string | undefined>(selectedImageUrl);
  const [error, setError] = useState<string | null>(null);

  // 🔥 Upload states
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      setSelectedUrl(selectedImageUrl);
    }
  }, [isOpen, selectedImageUrl]);

  const fetchMedia = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/media");
      if (res.ok) {
        const data = await res.json();
        setMedia(data);
      } else {
        setError("Failed to load media images");
      }
    } catch (err) {
      console.error(err);
      setError("Error loading images");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Upload handler
  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Upload failed");
      }

      // ✅ Auto select uploaded image
      setSelectedUrl(data.url);

      // 🔄 Refresh media list
      await fetchMedia();

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSelect = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      
      <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-xl">

        {/* 🔹 Header */}
        <div className="border-b border-slate-200 px-6 py-4 sm:px-8 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            Select or Upload Image
          </h2>

          {/* 🔥 Upload Button */}
          <label className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition">
            {uploading ? "Uploading..." : "Upload"}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
            />
          </label>
        </div>

        {/* 🔹 Body */}
        <div className="px-6 py-6 sm:px-8 max-h-[50vh] overflow-y-scroll">
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-slate-300 border-t-blue-500 rounded-full"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {media.map((item) => (
                <button
                  key={item._id}
                  onClick={() => setSelectedUrl(item.url)}
                  className={`relative rounded-xl overflow-hidden transition ${
                    selectedUrl === item.url
                      ? "ring-2 ring-blue-500"
                      : "ring-1 ring-slate-200 hover:ring-slate-300"
                  }`}
                >
                  <img
                    src={item.url}
                    className="w-full object-cover"
                  />

                  {selectedUrl === item.url && (
                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                      <div className="bg-blue-600 text-white rounded-full p-1 text-xs">
                        ✓
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 🔹 Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full border border-slate-300 bg-white text-sm"
          >
            Cancel
          </button>

          <button
            onClick={handleSelect}
            disabled={!selectedUrl}
            className="px-5 py-2 rounded-full bg-blue-600 text-white text-sm disabled:bg-gray-300"
          >
            Select Image
          </button>
        </div>
      </div>
    </div>
  );
}