import { Router } from 'express';
import { MusicController } from '../controllers/MusicController';

export function createMusicRoutes(musicController: MusicController): Router {
  const router = Router();

  router.get('/', (req, res, next) =>
    musicController.handleGetAllMusic(req, res, next)
  );

  router.get('/random', (req, res, next) =>
    musicController.handleGetRandomMusic(req, res, next)
  );

  return router;
}
