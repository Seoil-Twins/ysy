abstract class AbstractError extends Error {
    public statusCode!: number;

    constructor(...args: any) {
        super(...args);
    }
}

export default AbstractError;
