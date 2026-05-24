export interface Movie {
  title: string;
  year: number;
  region: string;
  genre: string;
  synopsis: string;
  match_reason: string;
  confidence_score: number;
  imdb_rating: string;
  imdb_url: string;
  image_url: string;
}

export interface InteractionSounds {
  click_sound: string;
  hover_sound: string;
  ambience: string;
}

export interface UiMetadata {
  environment_3d: string;
  color_palette: string[];
  interaction_sounds: InteractionSounds;
}

export interface QueryResponse {
  action_type: "mood_matcher" | "movie_finder";
  movies: Movie[];
  ui_metadata: UiMetadata;
}

export type RegionType = "Hollywood" | "Bollywood" | "Korean" | "Chinese" | "Japanese";

export type MoodType = "funny" | "sad" | "action" | "thriller" | "sci-fi" | "horror" | "romance";

export interface PresetMood {
  id: MoodType;
  label: string;
  icon: string;
  color: string;
}

export interface PresetRegion {
  id: RegionType;
  label: string;
  flag: string;
}
