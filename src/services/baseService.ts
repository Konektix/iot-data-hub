import { Prisma, PrismaClient } from '../../prisma/client';
import { DefaultArgs } from '../../prisma/client/runtime/library';

export abstract class BaseService {
    protected readonly prismaClient: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;

    constructor(prismaClient: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>) {
        this.prismaClient = prismaClient;
    }
}
