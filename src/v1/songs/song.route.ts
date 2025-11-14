import express from "express";
import { SongController } from "./song.controller";
import { verifyCreateSongFields } from "./song.middleware";

const router = express.Router();

router.get("/", SongController.getAllSongs);
router.get("/:id", SongController.getSongById);
router.post("/", verifyCreateSongFields, SongController.createSong);

export default router;
