import { DeviceBase, UUID } from '../types';
import { DeviceRepository } from '../repositories/deviceRepository';

export class DeviceService {
    private readonly deviceRepository: DeviceRepository;

    constructor(deviceRepository: DeviceRepository) {
        this.deviceRepository = deviceRepository;
    }

    // async createDevice(device: DeviceBase) {
    //     return this.deviceRepository.create(device);
    // }

    // async createDevices(devices: DeviceBase[]) {
    //     return this.deviceRepository.createMany(devices);
    // }

    async getAllDevicesByHubId(hubId: UUID) {
        return await this.deviceRepository.getAllDevicesByHubId(hubId);
    }

    // async deleteDevices(ids: UUID[]) {
    //     return await this.deviceRepository.getModelClient().deleteMany({
    //         where: {
    //             id: {
    //                 in: ids,
    //             },
    //         },
    //     });
    // }
}
