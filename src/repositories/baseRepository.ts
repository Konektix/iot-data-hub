import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';

// type a = Prisma.TypeMap['model']['Device']['payload'];
// type b = Prisma.Dele;

export abstract class BaseRepository<T extends Uncapitalize<Prisma.ModelName>> {
    private readonly prismaClient: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;
    private readonly modelName: T;

    constructor(prismaClient: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, modelName: T) {
        this.prismaClient = prismaClient;
        this.modelName = modelName;
        // const a = prismaClient[modelName];
    }

    getClient() {
        return this.prismaClient;
    }

    getModelClient() {
        return this.prismaClient[this.modelName];
    }
}
