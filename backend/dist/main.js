"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const express = require("express");
const path = require("path");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const staticFilePath = "../../frontend/dist";
    app.use(express.static(path.join(__dirname, staticFilePath)));
    await app.listen(3000);
}
bootstrap();
//# sourceMappingURL=main.js.map