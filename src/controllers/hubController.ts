import { Router, Request, Response, NextFunction } from 'express';
import { Hub, UUID } from '../types';
import { HubService } from '../services/hubService';

export class HubController {
    private readonly url: string = '/hubs';
    private readonly hubService: HubService;

    constructor(hubService: HubService) {
        this.hubService = hubService;
    }

    init(router: Router) {
        router.get(this.url, this.getHubs);
        router.get(this.url + '/:id', this.getHubById);
    }

    private async getHubs(req: Request, res: Response<Hub[]>, next: NextFunction) {
        try {
            const hubs = await this.hubService.getAll();
            res.send(hubs);
        } catch (error) {
            next(error);
        }
    }

    private async getHubById(req: Request<{ id: UUID }>, res: Response<Hub | null>, next: NextFunction) {
        try {
            const { id } = req.params;
            const hub = await this.hubService.getHub(id);
            res.send(hub);
        } catch (error) {
            next(error);
        }
    }
}
