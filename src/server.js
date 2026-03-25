import { spawn } from 'node:child_process';

/**
 * Start the Slidev dev server and wait until it's ready.
 * Returns { process, port, stop() }.
 */
export async function startServer(projectDir, port = 3030, slidesFile = 'slides.md') {
  const actualPort = await findAvailablePort(port);

  const child = spawn('npx', ['slidev', slidesFile, '--port', String(actualPort)], {
    cwd: projectDir,
    stdio: 'pipe',
    detached: true,
  });

  let startupError = '';
  child.stderr.on('data', (chunk) => {
    startupError += chunk.toString();
  });

  child.on('error', (err) => {
    if (err.code === 'ENOENT') {
      throw new Error('Slidev not found. Run this from within a Slidev project.');
    }
  });

  // Wait for the server to be ready
  await waitForServer(`http://localhost:${actualPort}`, 60000);

  return {
    process: child,
    port: actualPort,
    async stop() {
      try {
        // Kill the entire process group
        process.kill(-child.pid, 'SIGTERM');
      } catch {
        // Process may already be dead
        try {
          child.kill('SIGTERM');
        } catch {
          // ignore
        }
      }
    },
  };
}

async function findAvailablePort(startPort) {
  for (let port = startPort; port < startPort + 10; port++) {
    try {
      const response = await fetch(`http://localhost:${port}`);
      // Port is in use
      continue;
    } catch {
      // Port is available (connection refused)
      return port;
    }
  }
  throw new Error(`No available port found in range ${startPort}-${startPort + 9}`);
}

async function waitForServer(url, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await fetch(url);
      return; // Server is up
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error(`Slidev dev server did not start within ${timeoutMs / 1000}s`);
}
