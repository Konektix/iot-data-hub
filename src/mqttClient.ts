import { connect, MqttClient as Client } from 'mqtt';
import { WebSocketServer } from 'ws';
import { DevicesMessage, MqttMessageType } from './types';
import { HubService } from './services/hubService';
import { HttpClient } from './httpClient';

export class MqttClient {
    private readonly mqttClient: Client;

    constructor(brokerUrl: string, hubService: HubService, httpClient: HttpClient) {
        //, webSocketServer: WebSocketServer) {
        this.mqttClient = connect(brokerUrl);
        // this.mqttClient = connect(brokerUrl, { createWebsocket});

        this.mqttClient.on('connect', (packet) => {
            console.log('Client connected to mqtt broker.');

            this.mqttClient.subscribe('#', (error) => {
                if (error) {
                    console.error(error);
                }
            });
        });

        this.mqttClient.on('error', (error) => {
            console.log('MQTT client error');
            console.log(error);
        });

        this.mqttClient.on('message', async (topic, message) => {
            const splitted = topic.split('/');

            const hubId = splitted[0];
            const messageType = splitted[splitted.length - 1];

            console.log(`Received message from the hub (hubId: ${hubId}, type: ${messageType})`);

            if (messageType === MqttMessageType.Devices) {
                console.log('Sending the message to the hub manager.');
                const messageJson = JSON.parse(message.toString()) as DevicesMessage;
                // await hubService.createOrUpdateHubAndDevicesFromMessage(hubId, messageJson);
                try {
                    await httpClient.updateHubDevicesFromMessage(hubId, messageJson);
                    console.log('Message sent.');
                } catch (error) {
                    console.log(error);
                }
            }
        });
    }

    async close() {
        await this.mqttClient.endAsync();
    }
}
