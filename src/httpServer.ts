import Express, { Application, Router } from 'express';
import compression from 'compression';
import cors from 'cors';
import { BaseController } from './controllers/baseController';
import { Server } from 'node:http';

export class HttpServer {
    private readonly app: Application;
    public readonly server: Server;

    constructor(controllers: BaseController[], onTerminate: () => void) {
        this.app = Express();
        this.app.set('trust proxy', 1);
        this.app.use(Express.json());
        this.app.use(Express.urlencoded({ extended: true }));
        this.app.use(compression());
        // this.app.use(cors({ origin: 'http://abc.com' }));
        this.app.use(cors());

        const router = Router();

        controllers.forEach((controller) => controller.init(router));

        this.app.use('/api', router);

        this.server = this.app.listen(3000, () => {
            console.log('HTTP server started.');
        });

        process.on('SIGTERM', async () => {
            console.log('SIGTERM signal received: closing HTTP server');

            onTerminate();

            this.server.close(() => {
                console.log('HTTP server closed');
            });
        });
    }
}
