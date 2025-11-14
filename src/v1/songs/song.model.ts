export interface SongModel {
  id: string;
  name: string;
  artist: string;
  cover_image: string;
  difficulty: string;
  midi_file: string;
  created_at: string;
  updated_at: string;
}

export type CreateSongModel = Omit<SongModel, "id" | "created_at" | "updated_at">;
