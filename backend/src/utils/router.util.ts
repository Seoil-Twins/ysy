import { boolean } from "boolean";
import { Request } from "express";

export type ContentType = "form-data" | "json" | undefined;

export const checkFormdataType = (req: Request): ContentType => {
  const contentType = req.headers["content-type"];

  if (contentType?.startsWith("multipart/form-data")) {
    return "form-data";
  } else if (contentType?.startsWith("application/json")) {
    return "json";
  } else {
    return undefined;
  }
};

export const convertBoolean = (value: any): boolean | undefined => {
  return value !== undefined ? boolean(value) : undefined;
};
