class HttpError extends Error {
    private readonly statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
    }
}

export class BadRequestError extends HttpError {
    constructor(message: string = 'Bad request.') {
        super(message, 400);
    }
}

export class UnauthorizedError extends HttpError {
    constructor(message: string = 'Unauthorized.') {
        super(message, 401);
    }
}

export class ForbiddenError extends HttpError {
    constructor(message: string = 'Forbidden.') {
        super(message, 403);
    }
}

export class NotFoundError extends HttpError {
    constructor(message: string = 'Not found.') {
        super(message, 404);
    }
}

export class InternalServerError extends HttpError {
    constructor(message: string = 'Internal server error.') {
        super(message, 500);
    }
}
