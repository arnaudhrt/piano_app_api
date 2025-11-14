import { HttpStatusCode } from "@/shared/models/errors";
import { ApiError } from "@/shared/utils/errorHandler";
import { Logger } from "@/shared/utils/logger";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";

interface EventBody {
  event_data: object;
  discounts_data: object[];
  ticket_types_data: object[];
}

const createSongSchema = z.object({
  name: z.string().min(1),
  artist: z.string().min(1),
  midi_file: z.string().min(1),
  cover_image: z.string().min(1),
  difficulty: z.string().min(1),
});

export const verifyCreateSongFields = (req: Request, res: Response, next: NextFunction): void => {
  try {
    createSongSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const apiError = new ApiError(new Date().toISOString(), "Validation error on create song fields");
      Logger.error(apiError, { fields: error.errors });
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "Some fields are missing or invalid",
        data: error.errors,
      });
      return;
    }

    const apiError = new ApiError(new Date().toISOString(), "Unable to verify song fields");
    Logger.error(apiError);

    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Unable to verify fields, please control your request",
    });
    return;
  }
};
