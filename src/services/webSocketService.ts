import { BadRequestError, NotFoundError } from '../errors';
import { Subscription, SubscriptionName, UUID, WebSocketConnection } from '../types';
import { randomUUID } from 'crypto';
import { WebSocket } from 'ws';

export class WebSocketService {
    private readonly connections: WebSocketConnection[] = [];

    constructor() {}

    private areIpAddressesEqual = (firstIpAddress: string | string[], secondIpAddress: string | string[]) => {
        if (
            typeof firstIpAddress === 'string' &&
            typeof secondIpAddress === 'string' &&
            firstIpAddress === secondIpAddress
        ) {
            return true;
        } else if (Array.isArray(firstIpAddress) && Array.isArray(secondIpAddress)) {
            const firstSet = new Set(firstIpAddress);
            const secondSet = new Set(secondIpAddress);
            return firstSet.size == secondSet.size && firstIpAddress.every((item) => secondSet.has(item));
        }

        return false;
    };

    private getConnection = (id: UUID, userId: UUID, ipAddress: string | string[]) => {
        const index = this.connections.findIndex((c) => c.id === id);

        if (index === -1) {
            throw new NotFoundError(`WebSocket connection with id: ${id} not found.`);
        }

        const connection = this.connections[index];

        if (connection.userId !== userId) {
            throw new BadRequestError("Wrong connection's userId.");
        }

        if (!this.areIpAddressesEqual(connection.ipAddress, ipAddress)) {
            throw new BadRequestError("Wrong connection's IP address.");
        }

        return { connection, index };
    };

    public createConnection = (userId: UUID, ipAddress: string | string[], subscriptions: Subscription[]) => {
        const validSubscriptions = subscriptions.reduce<Subscription[]>((acc, subscription) => {
            if (subscription.name === SubscriptionName.HubState) {
                // TODO: Validate if the user is allowed to read this hub
            } else if (subscription.name === SubscriptionName.Measurement) {
                // TODO: Validate if the user is allowed to read the device
            }

            return [...acc, subscription];
        }, []);

        const connection: WebSocketConnection = {
            id: randomUUID(),
            userId,
            ipAddress,
            subscriptions: validSubscriptions,
            webSocket: null,
        };

        this.connections.push(connection);

        return connection;
    };

    public updateSubscriptions = (
        id: UUID,
        userId: UUID,
        ipAddress: string | string[],
        subscriptions: Subscription[]
    ) => {
        const { connection } = this.getConnection(id, userId, ipAddress);

        connection.subscriptions = subscriptions;

        return connection;
    };

    public removeConnection = (id: UUID, userId: UUID, ipAddress: string | string[]) => {
        const { index } = this.getConnection(id, userId, ipAddress);

        this.connections.splice(index, 1);
    };

    public removeConnectionById = (id: UUID) => {
        const index = this.connections.findIndex((c) => c.id === id);
        this.connections.splice(index, 1);
    };

    public getConnectionById = (id: UUID) => {
        return this.connections.find((c) => c.id === id);
    };

    // public getConnectionsWithSubscription = (name: SubscriptionName) => {
    //     const filteredConnections = this.connections.filter((connection) => {
    //         connection.subscriptions.some((s) => {
    //             if (s.name !== subscription.name) {
    //                 return false;
    //             }

    //             if (
    //                 s.name === SubscriptionName.HubState &&
    //                 subscription.name === SubscriptionName.HubState &&
    //                 s.hubId === subscription.hubId
    //             ) {
    //                 return true;
    //             }

    // 			if (s.name === SubscriptionName.Measurements && subscription.name === SubscriptionName.Measurements && s.device)
    //         });
    //     });
    // };

    public getConnectionsWithHubStateSubscription = (hubId: UUID) => {
        return this.connections.filter((connection) => {
            return connection.subscriptions.some(
                (subscription) => subscription.name === SubscriptionName.HubState && subscription.hubId === hubId
            );
        });
    };

    public getConnectionsWithMeasurementSubscription = (ieeeAddress: string) => {
        return this.connections.filter((connection) => {
            return connection.subscriptions.some(
                (subscription) =>
                    subscription.name === SubscriptionName.Measurement &&
                    subscription.device.ieeeAddress === ieeeAddress
            );
        });
    };

    public send = (data: Parameters<WebSocket['send']>[0], connections: WebSocketConnection[] = this.connections) => {
        connections.forEach((connection) => {
            if (connection.webSocket === null) {
                console.error(`WebSocket connection ${connection.id} is null`);
                return;
            }

            connection.webSocket.send(data);
        });
    };
}
