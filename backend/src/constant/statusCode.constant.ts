export const STATUS_CODE = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
} as const;

export const ERROR_CODE = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
    FAILED_UPLOAD: 50010
} as const;

export const TOURAPI_CODE = {
    YES: "Y",
    MobileAPP: "AppTest",
    MobileOS: "ETC",
    type: "json",
    sort: "A",
    EMPTY: "",
} as const;

/*
    keyof typeof StatusCode
    key의 typeof 값을 가져오는데 as const로 인해서 키의 타입 값들이 string이 아닌 OK, CREATED처럼 나옴.
    
    typeof StatusCode[keyof typeof StatusCode]
    type에는 자바스크립트 타입만 들어갈 수 있기때문에 typeof를 선언
    object["OK"] = 200
    이걸 union 방식으로 뿌려줌 (200 | 201 | ...)
*/
// type StatusCode = typeof StatusCode[keyof typeof StatusCode];
