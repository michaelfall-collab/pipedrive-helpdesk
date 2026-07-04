import { runMigrations } from './database/migrate.js';
import app from './app.js';

const PORT = process.env.PORT ?? '3000';
const STARTUP_RETRY_ATTEMPTS = 60;
const STARTUP_RETRY_DELAY_MS = 1000;

async function waitForDatabase(): Promise<void> {
  for (let attempt = 1; attempt <= STARTUP_RETRY_ATTEMPTS; attempt++) {
    try {
      await runMigrations();
      return;
    } catch (error) {
      if (attempt === STARTUP_RETRY_ATTEMPTS) throw error;

      const message = error instanceof Error ? error.message : String(error);
      console.warn(
        `Database is not ready yet (${attempt}/${STARTUP_RETRY_ATTEMPTS}): ${message}`,
      );
      await new Promise<void>((resolve) =>
        setTimeout(resolve, STARTUP_RETRY_DELAY_MS),
      );
    }
  }
}

await waitForDatabase();
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
