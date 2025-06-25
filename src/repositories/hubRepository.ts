import { Prisma, PrismaClient } from '../../prisma/client';
import { DefaultArgs } from '../../prisma/client/runtime/library';
import { Device, DeviceBase, UUID } from '../types';
import { BaseRepository } from './baseRepository';

export class HubRepository extends BaseRepository<'hub'> {
    constructor(prismaClient: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>) {
        super(prismaClient, 'hub');
    }

    async create(id: UUID, devices: DeviceBase[]) {
        return this.getModelClient().create({
            data: {
                id,
                devices: {
                    create: devices,
                },
            },
            include: {
                devices: true,
            },
        });
    }

    async get(id: UUID) {
        return this.getModelClient().findUnique({
            where: { id },
            include: {
                devices: true,
            },
        });
    }

    async getAll() {
        return this.getModelClient().findMany({
            include: {
                devices: true,
            },
        });
    }

    async updateHubDevices(hubId: UUID, devicesToAdd: DeviceBase[], devicesToRemove: Device[]) {
        return await this.getModelClient().update({
            where: { id: hubId },
            data: {
                devices: {
                    createMany: {
                        data: devicesToAdd,
                    },
                    updateMany: {
                        where: {
                            id: {
                                in: devicesToRemove.map((device) => device.id),
                            },
                        },
                        data: {
                            removed: true,
                        },
                    },
                },
            },
            include: {
                devices: true,
            },
        });
    }
}
