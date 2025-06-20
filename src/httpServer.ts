import { PrismaClient } from '@prisma/client';
import Express, { Application, Router } from 'express';
import { HubRepository } from './repositories/hubRepository';
import { DeviceRepository } from './repositories/deviceRepository';
import { HubService } from './services/hubService';
import { HubController } from './controllers/hubController';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';

(async () => {
    const app: Application = Express();

    const prismaClient = new PrismaClient();
    const hubRepository = new HubRepository(prismaClient);
    const deviceRepository = new DeviceRepository(prismaClient);
    const hubService = new HubService(hubRepository, deviceRepository);
    const hubController = new HubController(hubService);

    await prismaClient.$connect();

    const router = Router();

    hubController.init(router);

    app.use('/api', router);

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(compression());
    // app.use(cors({ origin: 'http://abc.com' }));
    app.use(cors());

    const server = app.listen(3000, () => {
        console.log('HTTP server started.');
    });

    process.on('SIGTERM', async () => {
        console.log('SIGTERM signal received: closing HTTP server');

        await prismaClient.$disconnect();

        server.close(() => {
            console.log('HTTP server closed');
        });
    });
})();
