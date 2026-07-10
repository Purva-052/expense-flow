import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import helmet from 'helmet';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Security and CORS
  app.use(helmet());
  app.enableCors();

  // Enable global validation using class-validator
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // strip out properties that don't have decorators
    forbidNonWhitelisted: true, // throw an error if non-whitelisted properties are provided
    transform: true, // automatically transform payloads to be objects typed according to their DTO classes
  }));

  // Enable global response formatting interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Enable global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('ExpenseFlow API')
    .setDescription('The ExpenseFlow API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);

  app.use(
    '/reference',
    apiReference({
      theme: 'purple',
      spec: {
        content: document,
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
