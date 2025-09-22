import { Router, Request, Response, NextFunction } from 'express';
import { Keycloak } from '../utils';
import { DevicesMessage, Hub, UUID } from '../types';
import { HubService } from '../services/hubService';
import { BaseController } from './baseController';
import { HttpClient } from '../httpClient';

export class HubController extends BaseController {
    private readonly url: string = '/hubs';
    private readonly hubService: HubService;
    private readonly httpClient: HttpClient;

    constructor(keycloak: Keycloak, hubService: HubService, httpClient: HttpClient) {
        super(keycloak);
        this.hubService = hubService;
        this.httpClient = httpClient;
    }

    init(router: Router) {
        router.get(this.url, this.authenticate, this.getHubs);
        router.get(this.url + '/:id', this.getHubById);
        router.post(this.url + '/devices/:id', this.test);
    }

    private getHubs = async (req: Request, res: Response<Hub[]>, next: NextFunction) => {
        try {
            const hubs = await this.hubService.getAll();
            res.send(hubs);
        } catch (error) {
            next(error);
        }
    };

    private getHubById = async (req: Request<{ id: UUID }>, res: Response<Hub | null>, next: NextFunction) => {
        try {
            const { id } = req.params;
            const hub = await this.hubService.getHub(id);
            res.send(hub);
        } catch (error) {
            next(error);
        }
    };

    private test = async (req: Request<{ id: UUID }, string, DevicesMessage>, res: Response, next: NextFunction) => {
        try {
            const access_token = await this.keycloak.getServiceToken();
            const { id } = req.params;
            const devicesMessage = req.body;
            await this.httpClient.updateHubDevicesFromMessage(id, devicesMessage, access_token);
            res.send('Devices uploaded.');
        } catch (error) {
            next(error);
        }
    };
}
