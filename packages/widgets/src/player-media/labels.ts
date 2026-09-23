export type PlayerMediaKind = "photo" | "video" | "stream";

export interface PlayerMediaAdminLabels {
  captionPlaceholder: string;
  share: string;
  add: string;
  remove: string;
  empty: string;
  errorUrl: string;
  errorTooMany: string;
  errorUnknown: string;
  urlPlaceholderPhoto: string;
  urlPlaceholderVideo: string;
  urlPlaceholderStream: string;
}

export const DEFAULT_PLAYER_MEDIA_ADMIN_LABELS: PlayerMediaAdminLabels = {
  captionPlaceholder: "Caption",
  share: "Public",
  add: "Add",
  remove: "Delete",
  empty: "Nothing here yet. Add your first entry above.",
  errorUrl: "Enter a full http(s) address.",
  errorTooMany: "You reached the maximum number of entries.",
  errorUnknown: "This entry could not be saved.",
  urlPlaceholderPhoto: "https://… image address",
  urlPlaceholderVideo: "https://… YouTube, Twitch or Vimeo address",
  urlPlaceholderStream: "https://twitch.tv/your-channel",
};

export interface PlayerMediaManagerLabels {
  emptyPhoto: string;
  emptyVideo: string;
  emptyStream: string;
}

export const DEFAULT_PLAYER_MEDIA_MANAGER_LABELS: PlayerMediaManagerLabels = {
  emptyPhoto: "No picture shared yet.",
  emptyVideo: "No video shared yet.",
  emptyStream: "No stream declared yet.",
};
