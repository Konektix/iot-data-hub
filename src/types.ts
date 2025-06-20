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
