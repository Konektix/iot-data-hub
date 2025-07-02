import { PrismaClient, Prisma } from '../../prisma/client';
import { DefaultArgs } from '../../prisma/client/runtime/library';
import { DeviceService } from '../../src/services/deviceService';
import { DeviceRepository } from '../../src/repositories/deviceRepository';

describe('DeviceService', () => {
    let prismaClient: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;
    let deviceRepository: DeviceRepository;
    let deviceService: DeviceService;
    const hubId = '00000000-0000-0000-0000-00000000';

    beforeAll(async () => {
        prismaClient = new PrismaClient();
        deviceRepository = new DeviceRepository(prismaClient);
        deviceService = new DeviceService(deviceRepository);

        await prismaClient.$connect();

        await prismaClient.hub.create({
            data: { id: hubId },
        });
    });

    afterAll(async () => {
        await prismaClient.hub.delete({
            where: { id: hubId },
        });

        await prismaClient.$disconnect();
    });

    it('dummy test', () => {});

    // describe('creating a device', () => {
    //     it('should create a new device successfully', async () => {
    //         const ieeeAddress = '123';
    //         const vendor = 'vendor_1';
    //         const model = 'model_1';
    //         const powerSource = 'battery';

    //         const device = await deviceService.createDevice({ ieeeAddress, vendor, model, powerSource });

    //         expect(device.ieeeAddress).toEqual(ieeeAddress);
    //         expect(device.vendor).toEqual(vendor);
    //         expect(device.model).toEqual(model);
    //         expect(device.powerSource).toEqual(powerSource);
    //         // expect(device.hubId).toEqual(hubId);
    //     });

    //     afterEach(async () => {
    //         await prismaClient.device.deleteMany({
    //             where: {
    //                 hubId,
    //             },
    //         });
    //     });
    // });
});
