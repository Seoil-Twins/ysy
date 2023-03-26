import joi from "joi";

/**
 * schema를 기반으로 payload를 검증합니다.
 * @param payload 검증할 JSON 데이터
 * @param schema 검증 방식에 대한 Joi.Object
 * @returns A {@link joi.ValidationResult}
 */
const validator = (payload: JSON, schema: joi.Schema): joi.ValidationResult => {
    const result: joi.ValidationResult = schema.validate(payload, {
        abortEarly: false,
        allowUnknown: true
    });

    return result;
};

export default validator;
