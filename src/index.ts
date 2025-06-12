import Express from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import bodyParser from 'body-parser';
import { DefaultArgs } from '@prisma/client/runtime/library';

export const prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs> = new PrismaClient();

prisma
    .$connect()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch((err) => {
        console.error('Unable to connect to the database:', err);
    });

const app = Express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/save-log', async (req, res) => {
    try {
        await prisma.log.create({
            data: {
                value: 12,
            },
        });

        res.send('Log saved');
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get('/logs', async (req, res) => {
    try {
        const messages = await prisma.log.findMany();
        res.send(messages);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.listen(3000);
