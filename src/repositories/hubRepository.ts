import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { DeviceBase, UUID } from '../types';
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
            select: {
                id: true,
                addedAt: true,
                updatedAt: true,
                devices: true,
            },
        });
    }
}
