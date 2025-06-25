import { Prisma, PrismaClient } from '../../prisma/client';
import { DefaultArgs } from '../../prisma/client/runtime/library';
import { UUID } from '../types';
import { BaseRepository } from './baseRepository';

export class DeviceRepository extends BaseRepository<'device'> {
    constructor(prismaClient: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>) {
        super(prismaClient, 'device');
    }

    async getAllDevicesByHubId(hubId: UUID) {
        return await this.getModelClient().findMany({ where: { hubId } });
    }

    async deleteDevices(ids: UUID[]) {
        return await this.getModelClient().deleteMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });
    }

    // async create(device: DeviceBase) {
    //     return this.getModelClient().create({ data: { ...device, hubId: undefined } });
    // }

    // async createMany(devices: DeviceBase[]) {
    //     return this.getModelClient().createMany({
    //         data: devices,
    //     });
    // }
}
