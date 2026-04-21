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
      console.error("Error fetching media:", err);
      setError("Error loading images. Please try again.");
    } finally {
      setLoading(false);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-4xl rounded-3xl border border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-4 sm:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">Select Image from Media</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
              aria-label="Close modal"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-8 sm:px-8">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-500"></div>
                <p className="mt-4 text-sm text-slate-500">Loading images...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex h-64 items-center justify-center">
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-center">
                <p className="text-sm text-rose-700">{error}</p>
                <button
                  onClick={fetchMedia}
                  className="mt-3 inline-flex items-center justify-center rounded-full border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : media.length === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center">
                <p className="text-sm text-slate-500">No images found in media library.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {media.map((item) => (
                <button
                  key={item._id}
                  onClick={() => setSelectedUrl(item.url)}
                  className={`group relative overflow-hidden rounded-2xl transition ${
                    selectedUrl === item.url
                      ? "ring-2 ring-blue-500 ring-offset-2"
                      : "ring-1 ring-slate-200 hover:ring-slate-300"
                  }`}
                >
                  {/* Image Container */}
                  <div className="aspect-square overflow-hidden bg-slate-100">
                    <img
                      src={item.url}
                      alt={item.name}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  </div>

                  {/* Overlay on selection */}
                  {selectedUrl === item.url && (
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-500 bg-opacity-20">
                      <div className="rounded-full bg-blue-500 p-2">
                        <svg
                          className="h-5 w-5 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Filename tooltip */}
                  <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-slate-900 px-2 py-1 text-xs text-white transition group-hover:translate-y-0">
                    {item.name}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 sm:px-8">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSelect}
              disabled={!selectedUrl}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              Select Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
