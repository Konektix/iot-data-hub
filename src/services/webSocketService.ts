import { BadRequestError, NotFoundError } from '../errors';
import { UUID, WebSocketConnection } from '../types';
import { randomUUID } from 'crypto';

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

    public createConnection = (userId: UUID, ipAddress: string | string[], subscriptions: string[]) => {
        const connection: WebSocketConnection = {
            id: randomUUID(),
            userId,
            ipAddress,
            subscriptions,
            webSocket: null,
        };

        this.connections.push(connection);

        return connection;
    };

    public updateSubscriptions = (id: UUID, userId: UUID, ipAddress: string | string[], subscriptions: string[]) => {
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
}
