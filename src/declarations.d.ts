declare global {
    namespace NodeJS {
        interface ProcessEnv {
            KEYCLOAK_URL: string;
            KEYCLOAK_REALM: string;
            KEYCLOAK_CLIENT: string;
        }
    }
}
export {};
