import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files from src directory
  app.useStaticAssets(join(__dirname));

  // Enable CORS
  app.enableCors();

  await app.listen(3000);
  console.log('Vocabulary app running at http://localhost:3000');
}
bootstrap();
