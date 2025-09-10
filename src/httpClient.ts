import { DevicesMessage, UUID } from './types';

export class HttpClient {
    constructor() {}

    updateHubDevicesFromMessage = async (hubId: UUID, devicesMessage: DevicesMessage) => {
        const url = `http://hub-manager:3000/api/hubs/${hubId}`;

        console.log(url);
        console.log(devicesMessage);
        console.log(typeof devicesMessage);

        const response = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(devicesMessage),
        });

        // console.log('Actual request headers:');
        // console.log(response.);

        return await response.json();
    };
}
