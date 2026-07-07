import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable global validation using class-validator
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // strip out properties that don't have decorators
    forbidNonWhitelisted: true, // throw an error if non-whitelisted properties are provided
    transform: true, // automatically transform payloads to be objects typed according to their DTO classes
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
