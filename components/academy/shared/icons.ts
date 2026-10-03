import type { IconName } from "@/components/ui/Icon";
import type { FeatureIcon, SocialLink } from "@/lib/academy/types";

export const featureIcons: Record<FeatureIcon, IconName> = {
  video: "play",
  exam: "exam",
  progress: "progress",
  support: "chat",
  certificate: "award",
  schedule: "calendar",
  materials: "book",
  community: "users",
  device: "device",
};

export const featureIcon = (icon?: FeatureIcon): IconName => (icon ? featureIcons[icon] : "sparkle");

export const socialLabels: Record<SocialLink["platform"], string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  x: "X",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  telegram: "Telegram",
};
