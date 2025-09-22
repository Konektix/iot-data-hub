// import Express from 'express';
// import { PrismaClient, Prisma } from '@prisma/client';
// import bodyParser from 'body-parser';
// import { DefaultArgs } from '@prisma/client/runtime/library';

import dotenv from 'dotenv';
import { PrismaClient } from '../prisma/client';
import { HubRepository } from './repositories/hubRepository';
import { DeviceRepository } from './repositories/deviceRepository';
import { HubService } from './services/hubService';
import { HubController } from './controllers/hubController';
import { HttpServer } from './httpServer';
import { MqttClient } from './mqttClient';
import { Keycloak } from './utils';
import { HttpClient } from './httpClient';
import { WebSocketServer } from './webSocketServer';
import { WebSocketController } from './controllers/webSocketController';
import { WebSocketService } from './services/webSocketService';

dotenv.config();

(async () => {
    const { KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT, KEYCLOAK_SECRET } = process.env;
    const prismaClient = new PrismaClient();
    await prismaClient.$connect();
    const hubRepository = new HubRepository(prismaClient);
    const deviceRepository = new DeviceRepository(prismaClient);
    const hubService = new HubService(hubRepository, deviceRepository);
    const keycloak = new Keycloak(KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT, KEYCLOAK_SECRET);

    const httpClient = new HttpClient();
    const hubController = new HubController(keycloak, hubService, httpClient);
    const webSocketService = new WebSocketService();
    const webSocketController = new WebSocketController(keycloak, webSocketService);

    const httpServer = new HttpServer([hubController, webSocketController], async () => {
        await prismaClient.$disconnect();
    });

    const webSocketServer = new WebSocketServer(webSocketService, httpServer.server);

    const MQTT_BROKER_URL = 'mqtt://mqtt-broker:1883'; // 'mqtt://192.168.0.156:1883';

    // new MqttClient(MQTT_BROKER_URL, hubService, httpClient);
})();
