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

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await fetch("/api/media");
      if (res.ok) {
        const data = await res.json();
        setMedia(data);
      }
    } catch (error) {
      console.error("Error fetching media:", error);
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

      const res = await fetch("/api/media", {
        method: "POST",
        body: uploadFormData,
      });

      if (res.ok) {
        const newMedia = await res.json();
        setMedia([newMedia, ...media]);
        (e.target as HTMLFormElement).reset();
      } else {
        alert("Failed to upload media");
      }
    } catch (error) {
      console.error("Error uploading:", error);
      alert("Error uploading media");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this media?")) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/media?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMedia(media.filter((m) => m._id !== id));
      } else {
        alert("Failed to delete media");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Error deleting media");
    } finally {
      setDeleting(null);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_35px_60px_-35px_rgba(15,23,42,0.35)]">
        <div className="border-b border-slate-200 px-6 py-8 sm:px-10">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Media Library</h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage your uploaded media files stored in the cloud.
          </p>
        </div>

        <div className="px-6 py-8 sm:px-10">
          {/* Upload Form */}
          <section className="mb-8 rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Upload New Media</h2>
            <form onSubmit={handleUpload} className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Select File</label>
                <input
                  type="file"
                  name="file"
                  accept="image/*,video/*"
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

          {/* Media Grid */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Uploaded Media ({media.length})</h2>
            {media.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No media uploaded yet. Upload your first file above.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {media.map((item) => (
                  <div key={item._id} className="group relative rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                    <div className="mb-3 overflow-hidden rounded-lg bg-slate-100">
                      {item.type.startsWith("image/") ? (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400">
                          <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-slate-900 truncate" title={item.name}>
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {formatSize(item.size)} • {formatDate(item.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(item._id)}
                      disabled={deleting === item._id}
                      className="absolute top-2 right-2 rounded-full bg-rose-500 p-1.5 text-white opacity-0 transition group-hover:opacity-100 hover:bg-rose-600 disabled:opacity-50"
                      title="Delete media"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}