import { DevicesMessage, UUID } from './types';

export class HttpClient {
    constructor() {}

    updateHubDevicesFromMessage = async (hubId: UUID, devicesMessage: DevicesMessage, accessToken?: string) => {
        const url = `http://hub-manager:3000/api/hubs/${hubId}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(devicesMessage),
            });

            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            await response.json();
        } catch (error: any) {
            console.log(error);
            throw error;
        }
    };
}
