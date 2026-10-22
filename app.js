// cPanel Phusion Passenger Startup Entry Point
// Sree Hari Realty Promoters - Unified Server Runner

const { createServer } = require('http');
const path = require('path');
const fs = require('fs');
const { fork } = require('child_process');

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Safe port handling for cPanel Passenger (handles numeric port or Unix domain socket pipe)
const port = process.env.PORT || 3000;

function serveErrorPage(res, title, details) {
  res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Sree Hari Realty - Startup Diagnostic</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; margin: 0; }
          .card { max-width: 650px; margin: 40px auto; background: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid #334155; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
          h2 { color: #f87171; margin-top: 0; font-size: 22px; }
          .msg { font-size: 15px; color: #94a3b8; line-height: 1.6; }
          .step-box { background: #0f172a; padding: 18px 24px; border-radius: 12px; margin: 20px 0; border: 1px solid #1e293b; }
          ol { margin: 0; padding-left: 20px; line-height: 2; color: #cbd5e1; }
          strong { color: #38bdf8; }
          pre { background: #020617; padding: 12px; border-radius: 8px; overflow-x: auto; color: #e2e8f0; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>⚠️ ${title}</h2>
          <div class="msg">${details}</div>
          <div class="step-box">
            <h3 style="color:#e2e8f0;margin-top:0;">Next Steps in cPanel:</h3>
            <ol>
              <li>In cPanel, open <strong>Setup Node.js App</strong></li>
              <li>Make sure Node.js version is set to <strong>20.x</strong> (or 18.x)</li>
              <li>Click the <strong>Run NPM Install</strong> button</li>
              <li>Click the <strong>Restart</strong> button at the top</li>
            </ol>
          </div>
        </div>
      </body>
    </html>
  `);
}

// 1. Check if node_modules exists
const rootNodeModules = path.join(__dirname, 'node_modules');
if (!fs.existsSync(rootNodeModules)) {
  const server = createServer((req, res) => {
    serveErrorPage(res, 'Dependencies Not Installed (node_modules missing)',
      '<p>The application packages have not been installed on your cPanel server yet.</p><p>Please click the <strong>Run NPM Install</strong> button in your cPanel <em>Setup Node.js App</em> page.</p>');
  });
  server.listen(port, () => {
    console.log(`> Diagnostic server running on port ${port}`);
  });
} else {
  // 2. Start Express Backend
  const backendEntry = path.join(__dirname, 'backend/dist/server.js');
  let backendProcess = null;

  function startBackend() {
    if (fs.existsSync(backendEntry)) {
      try {
        if (process.platform === 'linux') {
          try {
            require('child_process').execSync('pkill -f "backend/dist/server.js" || true', { stdio: 'ignore' });
          } catch {}
        }
        backendProcess = fork(backendEntry, [], {
          cwd: path.join(__dirname, 'backend'),
          env: {
            ...process.env,
            PORT: '5000',
            NODE_ENV: 'production',
            NODE_PATH: rootNodeModules
          }
        });

        backendProcess.on('exit', (code) => {
          if (code !== 0 && code !== null) {
            console.warn(`Backend process exited with code ${code}. Restarting in 5s...`);
            setTimeout(startBackend, 5000);
          }
        });

        console.log('✓ Express backend child process started on port 5000');
      } catch (err) {
        console.error('Error starting backend process:', err);
      }
    }
  }

  startBackend();

  // 3. Start Next.js
  try {
    const next = require('next');
    const { parse } = require('url');

    const app = next({ dev: false, dir: __dirname });
    const handle = app.getRequestHandler();

    app.prepare()
      .then(() => {
        const server = createServer(async (req, res) => {
          try {
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
          } catch (err) {
            console.error('Error handling request:', req.url, err);
            res.statusCode = 500;
            res.end('Internal Server Error');
          }
        });

        server.listen(port, () => {
          console.log(`> Sree Hari Realty Next.js application ready on port ${port}`);
        });
      })
      .catch((err) => {
        console.error('Failed to prepare Next.js application:', err);
        const server = createServer((req, res) => {
          serveErrorPage(res, 'Next.js Initialization Error',
            `<p><strong>Error:</strong> ${err.message}</p><pre>${err.stack}</pre>`);
        });
        server.listen(port);
      });
  } catch (requireErr) {
    console.error('Failed to require next:', requireErr);
    const server = createServer((req, res) => {
      serveErrorPage(res, 'Required Module Missing',
        `<p><strong>Error:</strong> ${requireErr.message}</p><p>Please click <strong>Run NPM Install</strong> in cPanel.</p>`);
    });
    server.listen(port);
  }
}

// Graceful cleanup - ensure child backend process is terminated
function cleanupAndExit() {
  if (backendProcess) {
    try {
      backendProcess.kill('SIGTERM');
      setTimeout(() => {
        try { backendProcess.kill('SIGKILL'); } catch {}
      }, 1000);
    } catch {}
  }
  process.exit(0);
}

process.on('SIGTERM', cleanupAndExit);
process.on('SIGINT', cleanupAndExit);
process.on('exit', () => {
  if (backendProcess) {
    try { backendProcess.kill('SIGKILL'); } catch {}
  }
});
