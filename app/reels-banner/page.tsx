"use client";

import { useState, useEffect } from "react";

interface MediaItem {
  _id: string;
  name: string;
  url: string;
  key: string;
  size: number;
  type: string;
  createdAt: string;
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

export default function ReelsBannerPage() {
  const [reels, setReels] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    try {
      const res = await fetch("/api/media?type=reel");
      if (res.ok) {
        const data = await res.json();
        setReels(data);
      }
    } catch (error) {
      console.error("Error fetching reels:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;

    if (!file) return;

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const res = await fetch("/api/media?type=reel", {
        method: "POST",
        body: uploadFormData,
      });

      if (res.ok) {
        const newReel = await res.json();
        setReels([newReel, ...reels]);
        (e.target as HTMLFormElement).reset();
      } else {
        alert("Failed to upload reel");
      }
    } catch (error) {
      console.error("Error uploading:", error);
      alert("Error uploading reel");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reel?")) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/media?id=${id}&type=reel`, {
        method: "DELETE",
      });

      if (res.ok) {
        setReels(reels.filter((r) => r._id !== id));
      } else {
        alert("Failed to delete reel");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Error deleting reel");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* ── Reels Section ── */}
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_35px_60px_-35px_rgba(15,23,42,0.35)]">
          <div className="border-b border-slate-200 px-6 py-8 sm:px-10">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎬</span>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Reels</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Upload and manage your short video reels stored in the cloud.
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-8 sm:px-10">
            {/* Upload Form */}
            <section className="mb-8 rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-slate-900">Upload New Reel</h2>
              <form onSubmit={handleUpload} className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Select Video File
                  </label>
                  <input
                    type="file"
                    name="file"
                    accept="video/*"
                    required
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <button
                  type="submit"
                  disabled={uploading}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-7 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </form>
            </section>

            {/* Reels Grid */}
            <section>
              <h2 className="mb-6 text-xl font-semibold text-slate-900">
                Uploaded Reels ({loading ? "…" : reels.length})
              </h2>

              {loading ? (
                <div className="py-12 text-center text-slate-500">Loading reels…</div>
              ) : reels.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  No reels uploaded yet. Upload your first video above.
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {reels.map((item) => (
                    <div
                      key={item._id}
                      className="group relative rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                    >
                      {/* Video Player */}
                      <div className="mb-3 overflow-hidden rounded-lg bg-slate-900">
                        <video
                          src={item.url}
                          controls
                          className="h-full w-full rounded-lg object-cover"
                        />
                      </div>

                      {/* Meta */}
                      <div className="space-y-1">
                        <h3
                          className="truncate text-sm font-medium text-slate-900"
                          title={item.name}
                        >
                          {item.name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {formatSize(item.size)} • {formatDate(item.createdAt)}
                        </p>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(item._id)}
                        disabled={deleting === item._id}
                        className="absolute right-2 top-2 rounded-full bg-rose-500 p-1.5 text-white opacity-0 transition group-hover:opacity-100 hover:bg-rose-600 disabled:opacity-50"
                        title="Delete reel"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        {/* ── Banner Section (Under Construction) ── */}
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_35px_60px_-35px_rgba(15,23,42,0.35)]">
          <div className="border-b border-slate-200 px-6 py-8 sm:px-10">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🖼</span>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                  Banner Section
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Manage your promotional banners and display ads.
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-8 sm:px-10">
            <div className="flex flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-slate-300 bg-slate-50 px-8 py-20 text-center">
              <span className="mb-4 text-6xl">🚧</span>
              <h2 className="text-2xl font-semibold text-slate-800">Under Construction</h2>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                The Banner section is coming soon. Upload and manage banners for your platform here.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}