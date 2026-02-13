import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { join } from 'path';
import { basicAuthMiddleware, printEntities } from 'src/common/utils';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  app.use(cookieParser());

  const env = process.env.CORS_ORIGIN ?? '';
  const allowedOrigins: string[] = env
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (allowedOrigins.length === 0) {
    console.warn(
      'CORS is not enabled because CORS_ORIGIN is empty. Cross-origin browser requests will be blocked by default.',
    );
  }

  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : false,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
      'Origin',
    ],
    exposedHeaders: ['Content-Disposition'],
  });
  const swaggerProtect =
    (process.env.SWAGGER_PROTECT ?? 'true').toLowerCase() === 'true';
  const swaggerUser = process.env.SWAGGER_USER;
  const swaggerPass = process.env.SWAGGER_PASSWORD;

  if (swaggerProtect && (!swaggerUser || !swaggerPass)) {
    console.warn(
      'SWAGGER_PROTECT is true but SWAGGER_USER/PASSWORD missing. Swagger will be disabled.',
    );
  } else {
    // Apply Basic Auth to both the UI route and the JSON spec route
    if (swaggerProtect) {
      const guard = basicAuthMiddleware(swaggerUser!, swaggerPass!);
      app.use('/api/docs', guard);
      app.use('/api-docs', guard); // optional alias if you change path later
      app.use('/api-json', guard); // Swagger JSON
      app.use('/api/docs-json', guard); // swagger-ui assets JSON (depending on setup)
    }

    const config = new DocumentBuilder()
      .setTitle('Phone Shop API')
      .setDescription('Phone Shop POS API documentation')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          in: 'header',
          name: 'Authorization',
          description: 'Use: Bearer <access_token>',
        },
        'access-token',
      )
      .addSecurityRequirements('access-token')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  await app.init();
  printEntities(app);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = Number(process.env.PORT ?? 5000);
  await app.listen(port);
}

bootstrap()
  .then(() => {
    console.log(`Application is running on: ${process.env.PORT ?? 5000}`);
  })
  .catch((error) => {
    console.error('Error during application bootstrap:', error);
  });
