import eventsJson from "@/config/events.json";
import galleryJson from "@/config/gallery.json";
import predictionsJson from "@/config/predictions.json";
import themeJson from "@/config/theme.json";
import travelJson from "@/config/travel.json";
import weddingJson from "@/config/wedding.json";
import type {
  EventConfig,
  GalleryConfig,
  PredictionsConfig,
  ThemeConfig,
  TravelConfig,
  WeddingConfig
} from "@/lib/types";

export const weddingConfig     = weddingJson     as WeddingConfig;
export const eventsConfig      = eventsJson      as EventConfig[];
export const travelConfig      = travelJson      as TravelConfig;
export const galleryConfig     = galleryJson     as GalleryConfig;
export const themeConfig       = themeJson       as ThemeConfig;
export const predictionsConfig = predictionsJson as PredictionsConfig;

export const navigationLinks = themeConfig.navigation;
