import { MusicRepository } from '../repositories/MusicRepository';
import { logInfo, logError } from '../infra/log/logger';

export class MusicService {
  private musicRepository = new MusicRepository();

  /**
   * Get all active background music
   */
  async getAllActiveMusic() {
    try {
      const music = await this.musicRepository.findAllActive();
      logInfo('Active music retrieved', { count: music.length });
      return music;
    } catch (error: any) {
      logError('Error getting active music', error);
      throw new Error('Failed to get background music');
    }
  }

  /**
   * Get random active music
   */
  async getRandomMusic() {
    try {
      const musicList = await this.musicRepository.findAllActive();
      
      if (musicList.length === 0) {
        return null;
      }

      const randomIndex = Math.floor(Math.random() * musicList.length);
      const selectedMusic = musicList[randomIndex];
      
      logInfo('Random music selected', { 
        title: selectedMusic.title,
        index: randomIndex 
      });
      
      return selectedMusic;
    } catch (error: any) {
      logError('Error getting random music', error);
      throw new Error('Failed to get random music');
    }
  }

  /**
   * Create new background music
   */
  async createMusic(data: {
    title: string;
    artist?: string;
    url: string;
    order?: number;
  }) {
    try {
      const music = await this.musicRepository.create(data);
      logInfo('Music created', { id: music.id, title: music.title });
      return music;
    } catch (error: any) {
      logError('Error creating music', error);
      throw new Error('Failed to create music');
    }
  }

  /**
   * Update background music
   */
  async updateMusic(
    id: string,
    data: Partial<{
      title: string;
      artist: string;
      url: string;
      isActive: boolean;
      order: number;
    }>
  ) {
    try {
      const music = await this.musicRepository.update(id, data);
      logInfo('Music updated', { id: music.id, title: music.title });
      return music;
    } catch (error: any) {
      logError('Error updating music', error);
      throw new Error('Failed to update music');
    }
  }

  /**
   * Delete background music
   */
  async deleteMusic(id: string) {
    try {
      await this.musicRepository.delete(id);
      logInfo('Music deleted', { id });
    } catch (error: any) {
      logError('Error deleting music', error);
      throw new Error('Failed to delete music');
    }
  }
}
