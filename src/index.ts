import { App } from './app';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const app = new App();

(async () => {
  await app.start(PORT);
})(); 