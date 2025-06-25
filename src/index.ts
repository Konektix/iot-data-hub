// import Express from 'express';
// import { PrismaClient, Prisma } from '@prisma/client';
// import bodyParser from 'body-parser';
// import { DefaultArgs } from '@prisma/client/runtime/library';

import { PrismaClient } from '../prisma/client';
import { HubRepository } from './repositories/hubRepository';
import { DeviceRepository } from './repositories/deviceRepository';
import { HubService } from './services/hubService';
import { HubController } from './controllers/hubController';
import { HttpServer } from './httpServer';
import { MqttClient } from './mqttClient';

// export const prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs> = new PrismaClient();

// prisma
//     .$connect()
//     .then(() => {
//         console.log('Connection has been established successfully.');
//     })
//     .catch((err) => {
//         console.error('Unable to connect to the database:', err);
//     });

// const app = Express();

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// app.get('/save-log', async (req, res) => {
//     try {
//         await prisma.log.create({
//             data: {
//                 value: 12,
//             },
//         });

//         res.send('Log saved');
//     } catch (error) {
//         res.status(500).send(error);
//     }
// });

// app.get('/logs', async (req, res) => {
//     try {
//         const messages = await prisma.log.findMany();
//         res.send(messages);
//     } catch (error) {
//         res.status(500).send(error);
//     }
// });

// app.listen(3000);

(async () => {
    const prismaClient = new PrismaClient();
    await prismaClient.$connect();
    const hubRepository = new HubRepository(prismaClient);
    const deviceRepository = new DeviceRepository(prismaClient);
    const hubService = new HubService(hubRepository, deviceRepository);
    const hubController = new HubController(hubService);

    new HttpServer([hubController], async () => {
        await prismaClient.$disconnect();
    });

    const MQTT_BROKER_URL = 'mqtt://mqtt-broker:1883'; // 'mqtt://192.168.0.156:1883';

    new MqttClient(MQTT_BROKER_URL, hubService);
})();
