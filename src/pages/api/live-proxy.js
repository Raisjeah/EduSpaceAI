import { WebSocket } from 'ws';
import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

let wss;

export default function handler(req, res) {
  if (!res.socket.server.wss) {
    console.log('Initializing Secure WebSocket Proxy Server...');
    wss = new WebSocketServer({ noServer: true });
    res.socket.server.wss = wss;

    res.socket.server.on('upgrade', async (request, socket, head) => {
      const { pathname } = new URL(request.url, `http://${request.headers.host}`);

      if (pathname === '/api/live-proxy') {
        // Authenticate the user before upgrading
        try {
          const cookies = cookie.parse(request.headers.cookie || '');
          const token = cookies.eduspace_session;

          if (!token) {
            console.log('Live Proxy Auth Error: No token found');
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
            return;
          }

          const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            issuer: 'eduspace-ai',
            audience: 'eduspace-app'
          });

          if (!decoded.userId) {
            console.log('Live Proxy Auth Error: Invalid token payload');
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
            return;
          }

          // Successful Auth -> Handle Upgrade
          wss.handleUpgrade(request, socket, head, (ws) => {
            console.log(`Live Proxy: Client ${decoded.userId} connected`);

            const apiKey = process.env.GEMINI_API_KEY;
            const geminiUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`;

            const geminiWs = new WebSocket(geminiUrl);

            ws.on('message', (data) => {
              if (geminiWs.readyState === WebSocket.OPEN) {
                geminiWs.send(data);
              }
            });

            geminiWs.on('message', (data) => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(data);
              }
            });

            ws.on('close', () => {
              console.log('Live Proxy: Client disconnected');
              geminiWs.close();
            });

            geminiWs.on('close', () => {
              console.log('Live Proxy: Gemini disconnected');
              ws.close();
            });

            geminiWs.on('error', (err) => {
              console.error('Live Proxy: Gemini Error', err);
              ws.close();
            });

            ws.on('error', (err) => {
              console.error('Live Proxy: Client Error', err);
              geminiWs.close();
            });
          });
        } catch (authError) {
          console.error('Live Proxy Auth Error:', authError.message);
          socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
          socket.destroy();
        }
      }
    });
  }

  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};
