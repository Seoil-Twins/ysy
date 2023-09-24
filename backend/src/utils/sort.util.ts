import { OrderItem } from "sequelize";

export const createSortOptions = (sort: string): OrderItem => {
  let result: OrderItem = ["createdTime", "DESC"];

  switch (sort) {
    case "r":
      result = ["createdTime", "DESC"];
      break;
    case "o":
      result = ["createdTime", "ASC"];
      break;
    case "f":
      result = ["views", "DESC"];
      break;
    case "t":
      result = ["title", "ASC"];
      break;
    case "cd":
      result = ["cupId", "DESC"];
      break;
    case "ca":
      result = ["cupId", "ASC"];
      break;
    default:
      result = ["createdTime", "DESC"];
      break;
  }

  return result;
};
