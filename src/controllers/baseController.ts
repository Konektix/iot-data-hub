import { Router } from 'express';
import { Keycloak } from 'keycloak-connect';

export abstract class BaseController {
    abstract init(apiRouter: Router, keycloak: Keycloak): void;
}
