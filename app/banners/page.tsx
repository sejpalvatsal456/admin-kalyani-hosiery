"use client";

import { useEffect, useState } from "react";

interface MediaItem {
  _id: string;
  name: string;
  url: string;
  key: string;
  size: number;
  type: string;
  createdAt: string;
  slot?: string;
  variant?: "carousel" | "single";
  order?: number;
  isActive?: boolean;
}

interface BannerGroup {
  variant: "carousel" | "single";
  items: MediaItem[];
}

interface BannerResponse {
  [slot: string]: BannerGroup;
}

const BANNER_SLOTS = [
  { name: "hero", title: "Hero Carousel", variant: "carousel" },
  { name: "promo1", title: "Promo Banner 1", variant: "single" },
  { name: "promo2", title: "Promo Banner 2", variant: "single" },
  { name: "promo3", title: "Promo Banner 3", variant: "single" },
];

const formatSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(2)) +
    " " +
    sizes[i]
  );
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

export default function BannersPage() {
  const [banners, setBanners] =
    useState<BannerResponse>({});

  const [loading, setLoading] = useState(true);

  const [uploadingBanner, setUploadingBanner] =
    useState<string | null>(null);

  const [deletingBanner, setDeletingBanner] =
    useState<string | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/media?type=banner");

      if (res.ok) {
        const data = await res.json();
        setBanners(data);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (
    e: React.FormEvent<HTMLFormElement>,
    slot: string
  ) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const file = formData.get("file") as File;

    if (!file) return;

    setUploadingBanner(slot);

    try {
      const uploadFormData = new FormData();

      uploadFormData.append("file", file);

      const res = await fetch(
        `/api/media?type=banner&slot=${slot}`,
        {
          method: "POST",
          body: uploadFormData,
        }
      );

      if (res.ok) {
        await fetchBanners();
        (e.target as HTMLFormElement).reset();
      } else {
        alert("Failed to upload banner");
      }
    } catch (error) {
      console.error("Error uploading banner:", error);
      alert("Error uploading banner");
    } finally {
      setUploadingBanner(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) {
      return;
    }

    setDeletingBanner(id);

    try {
      const res = await fetch(`/api/media?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchBanners();
      } else {
        alert("Failed to delete banner");
      }
    } catch (error) {
      console.error("Error deleting banner:", error);
      alert("Error deleting banner");
    } finally {
      setDeletingBanner(null);
    }
  };

  const toggleBanner = async (id: string) => {
    try {
      const res = await fetch(
        `/api/media/toggle?id=${id}`,
        {
          method: "PATCH",
        }
      );

      if (res.ok) {
        await fetchBanners();
      }
    } catch (error) {
      console.error("Error toggling banner:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_35px_60px_-35px_rgba(15,23,42,0.35)]">

        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-8 sm:px-10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🖼</span>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Banner Section
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Manage homepage banners and promotional sections.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-8 sm:px-10 space-y-10">
          {BANNER_SLOTS.map((slotConfig) => {
            const slotData =
              banners[slotConfig.name];

            const items = slotData?.items || [];

            return (
              <section
                key={slotConfig.name}
                className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm"
              >
                {/* Slot Header */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-slate-900">
                    {slotConfig.title}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Slot: {slotConfig.name} • Type:{" "}
                    {slotConfig.variant}
                  </p>
                </div>

                {/* Upload */}
                <form
                  onSubmit={(e) =>
                    handleUpload(e, slotConfig.name)
                  }
                  className="mb-8 flex items-end gap-4"
                >
                  <div className="flex-1">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Select Banner
                    </label>

                    <input
                      type="file"
                      name="file"
                      accept="image/*"
                      required
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={
                      uploadingBanner === slotConfig.name
                    }
                    className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-7 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {uploadingBanner === slotConfig.name
                      ? "Uploading..."
                      : "Upload"}
                  </button>
                </form>

                {/* Grid */}
                {loading ? (
                  <div className="py-12 text-center text-slate-500">
                    Loading banners...
                  </div>
                ) : items.length === 0 ? (
                  <div className="py-12 text-center text-slate-500">
                    No banners uploaded yet.
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {items.map((item, index) => (
                      <div
                        key={item._id}
                        className="group relative rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                      >
                        {/* Image */}
                        <div className="mb-3 overflow-hidden rounded-lg bg-slate-100">
                          <img
                            src={item.url}
                            alt={item.name}
                            className="h-full w-full object-cover"
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
                            {formatSize(item.size)} •{" "}
                            {formatDate(item.createdAt)}
                          </p>

                          {slotConfig.variant ===
                            "carousel" && (
                            <p className="text-xs text-slate-400">
                              Order: {index + 1}
                            </p>
                          )}

                          <p className="text-xs text-slate-400">
                            Status:{" "}
                            {item.isActive
                              ? "Active"
                              : "Inactive"}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex items-center gap-2">
                          <button
                            onClick={() =>
                              toggleBanner(item._id)
                            }
                            className="rounded-full bg-slate-200 px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-300"
                          >
                            {item.isActive
                              ? "Disable"
                              : "Enable"}
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(item._id)
                            }
                            disabled={
                              deletingBanner === item._id
                            }
                            className="rounded-full bg-rose-500 p-2 text-white transition hover:bg-rose-600 disabled:opacity-50"
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
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}