import { IncomingMessage, Server } from 'node:http';
import { WebSocketServer as WSS, WebSocket, RawData } from 'ws';
import { WebSocketService } from './services/webSocketService';

export class WebSocketServer {
    private readonly webSocketService: WebSocketService;
    private readonly wss: WSS;

    constructor(webSocketService: WebSocketService, httpServer: Server) {
        this.webSocketService = webSocketService;
        this.wss = new WSS({ server: httpServer });

        this.wss.on('connection', (webSocket: WebSocket, request: IncomingMessage) => {
            console.log('Client connected');

            if (!request.url) {
                webSocket.terminate();
                return;
            }

            const url = new URL(request.url, `http://${request.headers.host}`);

            const connectionId = url.searchParams.get('connectionId');

            if (!connectionId) {
                const message = 'Connection id parameter not found in the url. Closing WebSocket connection...';
                console.log(message);
                webSocket.send(message);
                webSocket.terminate();
                return;
            }

            const xForwardedForHeader = request.headers['x-forwarded-for'] || request.socket.remoteAddress;

            if (!xForwardedForHeader) {
                const message = "'x-forwarded-for' header not found. Closing WebSocket connection...";
                console.log(message);
                webSocket.send(message);
                webSocket.terminate();
                return;
            }

            const connection = this.webSocketService.getConnectionById(connectionId);

            if (!connection) {
                const message = 'Connection object not found. Closing WebSocket connection...';
                console.log(message);
                webSocket.send(message);
                webSocket.terminate();
                return;
            }

            if (connection.ipAddress !== xForwardedForHeader) {
                const message = 'IP address different than connection. Closing WebSocket connection...';
                console.log(message);
                webSocket.send(message);
                webSocket.terminate();
                this.webSocketService.removeConnectionById(connectionId);
                return;
            }

            webSocket.on('error', (error: Error) => {
                console.error(
                    `WebSocket error: connectionId: ${connectionId}, userId: ${connection.userId}, ipAddress: ${connection.ipAddress}`
                );
                console.error(error);
            });

            webSocket.on('message', (data: RawData, isBinary: boolean) => {
                console.log('Message received: %s', data);
            });

            webSocket.on('close', (code: number, reason: Buffer) => {
                console.log('connection closed');

                this.webSocketService.removeConnectionById(connectionId);
            });

            webSocket.send('Connection established successfully.');

            connection.webSocket = webSocket;
        });
    }
}
