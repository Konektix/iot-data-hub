import { Device, DeviceBase, DeviceMessage, DevicesMessage, UUID } from '../types';
import { HubRepository } from '../repositories/hubRepository';
import { DeviceRepository } from '../repositories/deviceRepository';

export class HubService {
    private readonly hubRepository: HubRepository;
    private readonly deviceRepository: DeviceRepository;

    constructor(hubRepository: HubRepository, deviceRepository: DeviceRepository) {
        this.hubRepository = hubRepository;
        this.deviceRepository = deviceRepository;
    }

    // constructor(prismaClient: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>) {
    //     super(prismaClient);
    // }

    // async createHub(id: UUID, devices: Device[]) {
    //     return this.prismaClient.hub.create({
    //         data: {
    //             id,
    //             devices: {
    //                 connect: devices.map(({ id }) => ({ id })),
    //             },
    //         },
    //         select: {
    //             id: true,
    //             devices: {
    //                 select: { id: true },
    //             },
    //         },
    //     });
    // }

    // async createHubWithDevices(hubId: UUID, devices: DeviceBase[]) {
    //     return await this.hubRepository.create(hubId, devices);
    // }

    private getRemovedAndAddedDevices(currentSet: Device[], newSet: DeviceBase[]) {
        const toRemove = currentSet.filter((device: DeviceBase) => {
            return newSet.every(
                (d: DeviceBase) =>
                    d.ieeeAddress !== device.ieeeAddress || d.model !== device.model || d.vendor !== device.vendor
            );
        });

        const toAdd = newSet.filter((device: DeviceBase) => {
            return currentSet.every(
                (d: DeviceBase) =>
                    d.ieeeAddress !== device.ieeeAddress || d.model !== device.model || d.vendor !== device.vendor
            );
        });

        return { toRemove, toAdd };
    }

    private filterOutConnectorAndMapDevices(message: DevicesMessage) {
        return message.reduce<DeviceBase[]>((acc, device) => {
            if (!device.definition) {
                return acc;
            }

            const {
                definition: { description, vendor, model },
                ieee_address,
                power_source,
            } = device;

            return [
                ...acc,
                {
                    ieeeAddress: ieee_address,
                    vendor,
                    model,
                    powerSource: power_source ?? '',
                    description,
                },
            ];
        }, []);
    }

    async createOrUpdateHubAndDevicesFromMessage(hubId: UUID, message: DevicesMessage) {
        const hub = await this.hubRepository.get(hubId);

        const devices = this.filterOutConnectorAndMapDevices(message);

        if (!hub) {
            return await this.hubRepository.create(hubId, devices);
        }

        const { toRemove, toAdd } = this.getRemovedAndAddedDevices(hub.devices, devices);

        return await this.hubRepository.getModelClient().update({
            where: { id: hubId },
            data: {
                devices: {
                    createMany: {
                        data: toAdd,
                    },
                    updateMany: {
                        where: {
                            id: {
                                in: toRemove.map((device) => device.id),
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

    // async getHub(id: UUID) {
    //     return await this.hubRepository.get(id);
    // }

    // async deleteHubAndRelatedDevices(id: UUID) {
    //     const deleteDevices = this.deviceRepository.getModelClient().deleteMany({
    //         where: {
    //             hubId: id,
    //         },
    //     });

    //     const deleteHub = this.hubRepository.getModelClient().delete({
    //         where: {
    //             id,
    //         },
    //     });

    //     return await this.hubRepository.getClient().$transaction([deleteDevices, deleteHub]);
    // }
}
