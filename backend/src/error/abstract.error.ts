abstract class AbstractError extends Error {
    public statusCode!: number;
    public errorCode!: number;

    constructor(...args: any) {
        super(...args);
    }
}

export default AbstractError;
