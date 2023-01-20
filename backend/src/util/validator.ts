import joi from "joi";

const validator = (payload: JSON, schema: joi.Schema) => {
    const result: joi.ValidationResult = schema.validate(payload, {
        abortEarly: false,
        allowUnknown: true
    });

    return result;
};

export default validator;
