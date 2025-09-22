import { Router, Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors';
import { Keycloak } from '../utils';

export abstract class BaseController {
    protected readonly keycloak: Keycloak;

    constructor(keycloak: Keycloak) {
        this.keycloak = keycloak;
    }

    abstract init(apiRouter: Router): void;

    protected authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedError('Access token not found.');
        }

        const token = authHeader.split(' ')[1];

        try {
            const payload = await this.keycloak.verifyToken(token);

            req.user = payload;
            next();
        } catch (err: any) {
            console.error('JWT verification failed: ', err.message);
            throw new UnauthorizedError('Invalid or expired token.');
        }
    };
}
