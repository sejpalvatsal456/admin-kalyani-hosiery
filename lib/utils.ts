import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugToText(slug: string): string {
  return slug
    .trim()
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function textToSlug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}