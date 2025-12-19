import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthenticatedSocketIoAdapter } from './infrastructure/adapters/socket-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new AuthenticatedSocketIoAdapter(app));
  await app.listen(3000);
}
bootstrap();
