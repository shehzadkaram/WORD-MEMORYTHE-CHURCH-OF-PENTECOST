import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

// LINT.IfChange(aistudio_media_plugin)
function aistudioMediaPlugin(): Plugin {
  return {
    name: 'vite-plugin-aistudio-media',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/assets/aistudio/')) {
          const rawPath = req.url.split('?')[0].split('#')[0];
          try {
            const decodedPath = decodeURIComponent(rawPath);
            const relativePath = decodedPath.replace(/^\//, '');
            const aistudioDir = path.resolve(
              __dirname,
              'public',
              'assets',
              'aistudio',
            );
            const filePath = path.resolve(__dirname, 'public', relativePath);
            if (
              filePath.startsWith(aistudioDir + path.sep) &&
              fs.existsSync(filePath) &&
              fs.statSync(filePath).isFile()
            ) {
              const ext = path.extname(filePath).toLowerCase();
              const mimeMap: Record<string, string> = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.webp': 'image/webp',
                '.svg': 'image/svg+xml',
                '.bmp': 'image/bmp',
                '.ico': 'image/x-icon',
                '.mp4': 'video/mp4',
                '.webm': 'video/webm',
                '.ogv': 'video/ogg',
                '.mp3': 'audio/mpeg',
                '.wav': 'audio/wav',
                '.ogg': 'audio/ogg',
                '.pdf': 'application/pdf',
              };
              res.setHeader(
                'Content-Type',
                mimeMap[ext] || 'application/octet-stream',
              );
              res.setHeader('Cache-Control', 'no-cache');
              fs.createReadStream(filePath).pipe(res);
              return;
            }
          } catch {
            // Fall through if URI decoding or file access fails
          }
        }
        next();
      });
    },
  };
}
// LINT.ThenChange(//depot/google3/java/com/google/alkali/boq/makersuite/applet_dev_service/templates/initializers/react_theme/vite.config.ts:aistudio_media_plugin)

// Direct Binary Download Plugin for Windows Setup and Portable executables
function downloadPlugin(): Plugin {
  return {
    name: 'vite-plugin-download-artifacts',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();
        const urlPath = req.url.split('?')[0];
        
        if (urlPath === '/download/setup' || urlPath === '/download/installer') {
          const filePath = path.resolve(__dirname, 'dist-electron', 'WORD MEMORY-Setup-1.0.0.exe');
          if (fs.existsSync(filePath)) {
            const stat = fs.statSync(filePath);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/vnd.microsoft.portable-executable');
            res.setHeader('Content-Length', stat.size);
            res.setHeader('Content-Disposition', 'attachment; filename="WORD MEMORY-Setup-1.0.0.exe"');
            fs.createReadStream(filePath).pipe(res);
            return;
          }
        }
        
        if (urlPath === '/download/portable') {
          const filePath = path.resolve(__dirname, 'dist-electron', 'WORD MEMORY-Portable-1.0.0.exe');
          if (fs.existsSync(filePath)) {
            const stat = fs.statSync(filePath);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/vnd.microsoft.portable-executable');
            res.setHeader('Content-Length', stat.size);
            res.setHeader('Content-Disposition', 'attachment; filename="WORD MEMORY-Portable-1.0.0.exe"');
            fs.createReadStream(filePath).pipe(res);
            return;
          }
        }
        
        next();
      });
    },
  };
}

// WordPocket Server-side Proxy Plugin (bypasses browser CORS securely)
function wordpocketProxyPlugin(): Plugin {
  return {
    name: 'vite-plugin-wordpocket-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/wordpocket/')) {
          const parsedUrl = new URL(req.url, 'http://localhost:3000');
          
          if (parsedUrl.pathname === '/api/wordpocket/chapter') {
            const folder = parsedUrl.searchParams.get('folder');
            const chapter = parsedUrl.searchParams.get('chapter');
            
            if (!folder || !chapter) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Missing folder or chapter parameter' }));
              return;
            }

            const targetUrl = `https://wordpocket.com/lang_texts/ur/${folder}/${chapter}.htm`;
            try {
              const controller = new AbortController();
              const timeout = setTimeout(() => controller.abort(), 12000);
              
              const response = await fetch(targetUrl, {
                signal: controller.signal,
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) WordMemory-Importer/2.0',
                  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                  'Accept-Language': 'ur,en-US,en;q=0.9',
                },
              });
              clearTimeout(timeout);

              if (!response.ok) {
                res.statusCode = response.status;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ 
                  success: false, 
                  error: `HTTP ${response.status} ${response.statusText}`,
                  url: targetUrl 
                }));
                return;
              }

              const html = await response.text();
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ success: true, url: targetUrl, html }));
              return;
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : 'Unknown network error';
              res.statusCode = 502;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: msg, url: targetUrl }));
              return;
            }
          }

          if (parsedUrl.pathname === '/api/wordpocket/proxy') {
            const target = parsedUrl.searchParams.get('url');
            if (!target || (!target.startsWith('https://wordpocket.com/') && !target.startsWith('https://www.wordpocket.com/'))) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Invalid or unauthorized target URL' }));
              return;
            }

            try {
              const controller = new AbortController();
              const timeout = setTimeout(() => controller.abort(), 12000);
              const response = await fetch(target, {
                signal: controller.signal,
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) WordMemory-Importer/2.0',
                  'Accept-Language': 'ur,en-US,en;q=0.9',
                },
              });
              clearTimeout(timeout);
              const html = await response.text();
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ success: true, url: target, html }));
              return;
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : 'Unknown network error';
              res.statusCode = 502;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: msg, url: target }));
              return;
            }
          }
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss(), aistudioMediaPlugin(), downloadPlugin(), wordpocketProxyPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
