import { connect, MqttClient as Client } from 'mqtt';
import { DevicesMessage, MqttMessageType } from './types';
import { HubService } from './services/hubService';
import { HttpClient } from './httpClient';
import { WebSocketService } from './services/webSocketService';

export class MqttClient {
    private readonly mqttClient: Client;
    private readonly webSocketService: WebSocketService;

    constructor(brokerUrl: string, hubService: HubService, httpClient: HttpClient, webSocketService: WebSocketService) {
        //, webSocketServer: WebSocketServer) {
        this.mqttClient = connect(brokerUrl);
        this.webSocketService = webSocketService;
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
                try {
                    const messageJson = JSON.parse(message.toString()) as DevicesMessage;
                    await httpClient.updateHubDevicesFromMessage(hubId, messageJson);
                    console.log('Message sent.');
                } catch (error) {
                    console.log(error);
                }
            } else if (messageType === MqttMessageType.State) {
                const connections = this.webSocketService.getConnectionsWithHubStateSubscription(hubId);
                this.webSocketService.send(message, connections);
            } else if (
                MqttMessageType.Converters === messageType ||
                MqttMessageType.Definitions === messageType ||
                MqttMessageType.Extensions === messageType ||
                MqttMessageType.Groups === messageType ||
                MqttMessageType.Info === messageType ||
                MqttMessageType.Logging === messageType
            ) {
                console.log(`Received message ${messageType} for hub ${hubId}`);
            } else if (messageType.startsWith('0x')) {
                const connections = this.webSocketService.getConnectionsWithMeasurementSubscription(messageType);
                this.webSocketService.send(message, connections);
            } else {
                console.warn(`Unknown message type ${messageType} for hub ${hubId}`);
            }
        });
    }

    async close() {
        await this.mqttClient.endAsync();
    }
}
