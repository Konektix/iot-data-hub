import Express, { Application, Router } from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import { BaseController } from './controllers/baseController';
import { Keycloak } from './utils';

export class HttpServer {
    private readonly app: Application;

    constructor(controllers: BaseController[], keycloak: Keycloak, onTerminate: () => void) {
        this.app = Express();
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());
        this.app.use(compression());
        // this.app.use(cors({ origin: 'http://abc.com' }));
        this.app.use(cors());

        this.app.use(keycloak.middleware());

        const router = Router();

        controllers.forEach((controller) => controller.init(router, keycloak));

        this.app.use('/api', router);

        const server = this.app.listen(3000, () => {
            console.log('HTTP server started.');
        });

        process.on('SIGTERM', async () => {
            console.log('SIGTERM signal received: closing HTTP server');

            onTerminate();

            server.close(() => {
                console.log('HTTP server closed');
            });
        });
    }
}
