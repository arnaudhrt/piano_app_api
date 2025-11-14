import { Request, Response } from "express";
import { ErrorHandler, ApiError } from "@/shared/utils/errorHandler";
import { HttpStatusCode } from "@/shared/models/errors";
import { SongData } from "./song.data";
import { Logger } from "@/shared/utils/logger";
import { CreateSongModel } from "./song.model";

export class SongController {
  public static async getAllSongs(req: Request, res: Response): Promise<void> {
    try {
      const songs = await SongData.getAllSongs();

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: songs,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "SongController", method: "getAllSongs" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async getSongById(req: Request, res: Response): Promise<void> {
    try {
      const songId = req.params.id;
      const song = await SongData.getSongById(songId);

      if (!song) {
        throw new ApiError(new Date().toISOString(), "Event not found", HttpStatusCode.INTERNAL_SERVER_ERROR);
      }

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: song,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "SongController", method: "getSongById" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async createSong(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body as CreateSongModel;
      const id = await SongData.createSong(body);

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        data: {
          song_id: id,
        },
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "SongController", method: "createSong" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }
}
