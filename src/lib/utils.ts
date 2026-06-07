import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

export const SERVICE_TYPES = [
  "App Consulting",
  "LLM Platform Consulting",
  "Music Review",
  "Virtual Music Lesson",
  "Drum Lesson",
  "Music Lesson",
  "Music Evaluation",
  "Music Catalog Evaluation",
  "Music Catalog Sales",
  "Artist Endorsement Evaluation",
  "Endorsement Deal Review",
  "Endorsement & Sponsorship Evaluation",
  "Business Consultation",
  "Music Critique & Feedback",
  "Career Coaching",
  "Life Coaching",
  "Financial Advice",
  "Legal Advice (General)",
  "Mental Health Support",
  "Relationship Advice",
  "Fitness & Nutrition Coaching",
  "Tech Support",
  "Real Estate Advice",
  "Marketing Strategy",
  "Social Media Consulting",
  "Investment Guidance",
  "Resume Review",
  "Interview Coaching",
  "Creative Writing Feedback",
  "Public Speaking Coaching",
  "Brand Strategy",
  "Startup Mentorship",
  "Academic Tutoring",
  "Language Lessons",
  "Parenting Advice",
  "Photography Critique",
  "Fashion & Style Advice",
  "Podcast Coaching",
  "Art Critique",
  "Script & Screenplay Review",
  "Song & A&R Feedback",
  "Spiritual Guidance",
] as const

export type ServiceType = (typeof SERVICE_TYPES)[number]
