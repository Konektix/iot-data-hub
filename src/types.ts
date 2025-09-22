import { WebSocket } from 'ws';

export type UUID = string;

export interface DeviceBase {
    ieeeAddress: string;
    vendor: string;
    model: string;
    powerSource: string;
    description: string;
}

export interface Device extends DeviceBase {
    id: UUID;
    addedAt: Date;
    updatedAt: Date;
    removed: boolean;
}

export interface Hub {
    id: UUID;
    addedAt: Date;
    updatedAt: Date;
    devices: Device[];
}

export interface DeviceMessage {
    definition?: {
        description: string;
        vendor: string;
        model: string;
    };
    ieee_address: string;
    power_source?: string;
}

export type DevicesMessage = DeviceMessage[];

export enum MqttMessageType {
    Converters = 'converters',
    Definitions = 'definitions',
    Devices = 'devices',
    Extensions = 'extensions',
    Groups = 'groups',
    Info = 'info',
    State = 'state',
    Logging = 'logging',
}

// Keycloak

export interface ServiceTokenData {
    access_token: string;
    expires_in: number;
    refresh_expires_in: number;
    token_type: 'Bearer';
    'not-before-policy': number;
    scope: string;
}

// WebSocket

export interface WebSocketConnection {
    id: UUID;
    userId: UUID;
    ipAddress: string | string[];
    subscriptions: string[];
    webSocket: WebSocket | null;
}
