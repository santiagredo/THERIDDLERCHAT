import { NestFactory } from '@nestjs/core';
import * as express from "express";
import * as path from 'path';

import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Serve html
    const staticFilePath = "../../frontend/dist"
    app.use(express.static(path.join(__dirname, staticFilePath)));

    await app.listen(3000);
}
bootstrap();
