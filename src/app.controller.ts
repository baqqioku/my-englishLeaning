import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';

const audioCache = new Map<string, Buffer>();

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('tts')
  async tts(
    @Query('word') word: string,
    @Query('accent') accent: string,
    @Res() res: Response,
  ) {
    if (!word) {
      res.status(400).send('word is required');
      return;
    }

    const type = accent === '1' ? 1 : 2;
    const key = `${type}:${word}`;
    const cached = audioCache.get(key);

    if (cached) {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(cached);
      return;
    }

    const upstream = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=${type}`;
    try {
      const response = await fetch(upstream);
      if (!response.ok) {
        res.status(502).send('upstream audio failed');
        return;
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      if (audioCache.size > 500) audioCache.clear();
      audioCache.set(key, buffer);
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(buffer);
    } catch (error) {
      res.status(502).send('audio fetch failed');
    }
  }
}
