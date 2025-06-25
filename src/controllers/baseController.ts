import { Router } from 'express';

export abstract class BaseController {
    abstract init(apiRouter: Router): void;
}
