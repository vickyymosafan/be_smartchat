import { Request, Response, NextFunction } from 'express';
import { MusicService } from '../services/MusicService';
import { sendSuccess, sendError } from '../utils/responseUtils';

export class MusicController {
  private musicService = new MusicService();

  /**
   * Get all active background music
   * GET /api/music
   */
  async handleGetAllMusic(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const music = await this.musicService.getAllActiveMusic();
      sendSuccess(res, { music });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get random active music
   * GET /api/music/random
   */
  async handleGetRandomMusic(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const music = await this.musicService.getRandomMusic();
      
      if (!music) {
        sendError(res, 'NO_MUSIC', 'No active music available', 404);
        return;
      }
      
      sendSuccess(res, { music });
    } catch (error) {
      next(error);
    }
  }
}
