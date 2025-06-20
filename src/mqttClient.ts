import { connect, MqttClient as Client } from 'mqtt';
import { DevicesMessage } from './types';
import { HubService } from './services/hubService';

export class MqttClient {
    private readonly mqttClient: Client;

    constructor(brokerUrl: string, hubService: HubService) {
        this.mqttClient = connect(brokerUrl);

        this.mqttClient.subscribe('#', (error) => {
            if (error) {
                console.error(error);
            }
        });

        this.mqttClient.on('message', async (topic, message) => {
            const splitted = topic.split('/');

            const hubId = splitted[0];
            const messageType = splitted[splitted.length - 1];

            if (messageType === 'devices') {
                const messageJson = JSON.parse(message.toString()) as DevicesMessage;
                await hubService.createOrUpdateHubAndDevicesFromMessage(hubId, messageJson);
            }
        });
    }

    async close() {
        await this.mqttClient.endAsync();
    }
}
