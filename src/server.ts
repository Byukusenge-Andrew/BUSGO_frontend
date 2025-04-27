import { APP_BASE_HREF } from '@angular/common';
import { renderApplication } from '@angular/platform-server';
import { Provider } from '@angular/core';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './main.server';
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get('*.*', express.static(browserDistFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Angular engine
  server.get('*', async (req, res, next) => {
    try {
      const { protocol, originalUrl, baseUrl, headers } = req;
      const document = await renderApplication(bootstrap, {
        document: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        platformProviders: [{ provide: APP_BASE_HREF, useValue: baseUrl }]
      });
      res.send(document);
    } catch (err) {
      next(err);
    }
  });

  return server;
}

// Start the server if this is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = process.env['PORT'] || 4000;
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}
