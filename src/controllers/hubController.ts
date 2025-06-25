import { Router, Request, Response, NextFunction } from 'express';
import { Hub, UUID } from '../types';
import { HubService } from '../services/hubService';
import { BaseController } from './baseController';

export class HubController extends BaseController {
    private readonly url: string = '/hubs';
    private readonly hubService: HubService;

    constructor(hubService: HubService) {
        super();
        this.hubService = hubService;
    }

    init(router: Router) {
        router.get(this.url, this.getHubs);
        router.get(this.url + '/:id', this.getHubById);
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
}
