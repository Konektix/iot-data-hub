import { Router, Request, Response, NextFunction } from 'express';
import { BaseController } from './baseController';
import { Keycloak } from '../utils';
import { BadRequestError, InternalServerError, UnauthorizedError } from '../errors';
import { Subscription, WebSocketConnection } from '../types';
import { WebSocketService } from '../services/webSocketService';
import { UUID } from 'crypto';

export class WebSocketController extends BaseController {
    private readonly url: string = '/subscriptions';
    private readonly webSocketService: WebSocketService;

    constructor(keycloak: Keycloak, webSocketService: WebSocketService) {
        super(keycloak);
        this.webSocketService = webSocketService;
    }

    init(router: Router) {
        router.post(this.url, this.authenticate, this.subscribe);
        router.put(this.url + '/:id', this.authenticate, this.updateSubscriptions);
        router.delete(this.url + '/:id', this.authenticate, this.unsubscribe);
    }

    private destructReq = <T, U>(req: Request<T, any, U>) => {
        if (!req.user) {
            throw new UnauthorizedError('No authenticated user data.');
        }

        const { sub: userId } = req.user;

        if (!userId) {
            throw new InternalServerError('Sub value not found in user data.');
        }

        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        if (!ipAddress) {
            throw new BadRequestError('Ip address not found.');
        }

        const { params, body } = req;

        return { userId, ipAddress, params, body };
    };

    private subscribe = async (
        req: Request<unknown, Omit<WebSocketConnection, 'webSocket'>, { subscriptions: Subscription[] }>,
        res: Response<Omit<WebSocketConnection, 'webSocket'>>,
        next: NextFunction
    ) => {
        console.log('subscribe');
        console.log(req.body);

        try {
            const {
                userId,
                ipAddress,
                body: { subscriptions },
            } = this.destructReq(req);

            const webSocketConnection = this.webSocketService.createConnection(userId, ipAddress, subscriptions);

            const { webSocket, ...rest } = webSocketConnection;

            res.send(rest);
        } catch (error) {
            next(error);
        }
    };

    private updateSubscriptions = (
        req: Request<{ id: UUID }, WebSocketConnection, Pick<WebSocketConnection, 'subscriptions'>>,
        res: Response<WebSocketConnection>,
        next: NextFunction
    ) => {
        try {
            const {
                userId,
                ipAddress,
                params: { id },
                body: { subscriptions },
            } = this.destructReq(req);

            const webSocketConnection = this.webSocketService.updateSubscriptions(id, userId, ipAddress, subscriptions);

            res.send(webSocketConnection);
        } catch (error) {
            next(error);
        }
    };

    private unsubscribe = (req: Request<{ id: UUID }, WebSocketConnection>, res: Response, next: NextFunction) => {
        try {
            const {
                userId,
                ipAddress,
                params: { id },
            } = this.destructReq(req);

            this.webSocketService.removeConnection(id, userId, ipAddress);

            res.send();
        } catch (error) {
            next(error);
        }
    };
}
