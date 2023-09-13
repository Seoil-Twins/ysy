import { AlbumImage } from "./albumImage.model";
import { Album } from "./album.model";
import { Calendar } from "./calendar.model";
import { ContentType } from "./contentType.model";
import { Couple } from "./couple.model";
import { Culture } from "./culture.model";
import { Favorite } from "./favorite.model";
import { Inquiry } from "./inquiry.model";
import { InquiryImage } from "./inquiryImage.model";
import { Notice } from "./notice.model";
import { NoticeImage } from "./noticeImage.model";
import { Restaurant } from "./restaurant.model";
import { Role } from "./role.model";
import { Shopping } from "./shopping.model";
import { Solution } from "./solution.model";
import { SolutionImage } from "./solutionImage.model";
import { Sports } from "./sports.model";
import { TouristSpot } from "./touristSpot.model";
import { User } from "./user.model";
import { UserRole } from "./userRole.model";
import { VenuesImage } from "./venuesImage.model";

/**
 *  hasMany => 1 : N
 *  belongsTo => 1 : 1 or N : 1
 *
 *  주의 : as의 값과 getXXX의 값이 같아야함
 *  ex) as: "users" getUsers() => Good!
 *      as: "user" getusers() => Error is not a function
 */

export default {
  config: () => {
    // ------------------------------------------ UserRole : User ---------------------------------------- //
    User.hasOne(UserRole, {
      foreignKey: "userId",
      as: "userRole",
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });

    UserRole.hasOne(User, {
      foreignKey: "userId",
      as: "users"
    });

    // ------------------------------------------ UserRole to Role ---------------------------------------- //
    Role.hasMany(UserRole, {
      foreignKey: "roleId",
      as: "userRole"
    });

    UserRole.belongsTo(Role, {
      foreignKey: "roleId",
      as: "role",
      onDelete: "SET NULL",
      onUpdate: "CASCADE"
    });

    // ------------------------------------------ User to Couple ---------------------------------------- //
    Couple.hasMany(User, {
      foreignKey: "cupId",
      as: "users"
    });

    User.belongsTo(Couple, {
      foreignKey: "cupId",
      as: "couple",
      onDelete: "SET NULL",
      onUpdate: "CASCADE"
    });

    // ------------------------------------------ Album to Couple ---------------------------------------- //
    Couple.hasMany(Album, {
      foreignKey: "cupId",
      as: "albums"
    });

    Album.belongsTo(Couple, {
      foreignKey: "cupId",
      as: "couple",
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });

    // ------------------------------------------ Album to AlbumImage --------------------------------------- //
    Album.hasMany(AlbumImage, {
      foreignKey: "albumId",
      as: "albumImages"
    });

    AlbumImage.belongsTo(Album, {
      foreignKey: "albumId",
      as: "album",
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });

    // ------------------------------------------ Calendar to Couple ---------------------------------------- //
    Couple.hasMany(Calendar, {
      foreignKey: "cupId",
      as: "calendars"
    });

    Calendar.belongsTo(Couple, {
      foreignKey: "cupId",
      as: "couple",
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });

    // ------------------------------------------ Inquiry to User ---------------------------------------- //
    User.hasMany(Inquiry, {
      foreignKey: "userId",
      as: "Inquires"
    });

    Inquiry.belongsTo(User, {
      foreignKey: "userId",
      as: "user",
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });

    // ------------------------------------------ InquiryImage to Inquiry ---------------------------------------- //
    Inquiry.hasMany(InquiryImage, {
      foreignKey: "inquiryId",
      as: "inquiryImages"
    });

    InquiryImage.belongsTo(Inquiry, {
      foreignKey: "inquiryId",
      as: "Inquiry",
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });

    // ------------------------------------------ Solution : Inquiry ---------------------------------------- //
    Inquiry.hasOne(Solution, {
      foreignKey: "inquiryId",
      as: "solution"
    });

    Solution.hasOne(Inquiry, {
      foreignKey: "inquiryId",
      as: "Inquiry",
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });

    // ------------------------------------------ Solution to User ---------------------------------------- //
    User.hasMany(Solution, {
      foreignKey: "uploaderId",
      as: "solutions"
    });

    Solution.belongsTo(User, {
      foreignKey: "uploaderId",
      as: "uploader",
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });

    // ------------------------------------------ SolutionImage to Solution ---------------------------------------- //
    Solution.hasMany(SolutionImage, {
      foreignKey: "solutionId",
      as: "solutionImages"
    });

    SolutionImage.belongsTo(Solution, {
      foreignKey: "solutionId",
      as: "solution",
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });

    // ------------------------------------------ Notice to NoticeImage ---------------------------------------- //
    Notice.hasMany(NoticeImage, {
      foreignKey: "noticeId",
      as: "noticeImages"
    });

    NoticeImage.belongsTo(Notice, {
      foreignKey: "noticeId",
      as: "notice",
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });

    // ------------------------------------------ Notice to User ---------------------------------------- //
    User.hasMany(Notice, {
      foreignKey: "uploaderId",
      as: "notices"
    });

    Notice.belongsTo(User, {
      foreignKey: "uploaderId",
      as: "uploader",
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });

    // ------------------------------------------ ContentType to Restaurant ---------------------------------------- //
    Restaurant.hasMany(ContentType, {
      foreignKey: "contentTypeId",
      as: "contentType"
    });

    ContentType.belongsTo(Restaurant, {
      foreignKey: "contentTypeId",
      as: "restaurant",
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });

    // ------------------------------------------ ContentType to TouristSpot ---------------------------------------- //
    TouristSpot.hasMany(ContentType, {
      foreignKey: "contentTypeId",
      as: "contentType"
    });

    ContentType.belongsTo(TouristSpot, {
      foreignKey: "contentTypeId",
      as: "touristSpot",
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });

    // ------------------------------------------ ContentType to Culture ---------------------------------------- //
    Culture.hasMany(ContentType, {
      foreignKey: "contentTypeId",
      as: "contentType"
    });

    ContentType.belongsTo(Culture, {
      foreignKey: "contentTypeId",
      as: "culture",
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });

    // ------------------------------------------ ContentType to Sports ---------------------------------------- //
    Sports.hasMany(ContentType, {
      foreignKey: "contentTypeId",
      as: "contentType"
    });

    ContentType.belongsTo(Sports, {
      foreignKey: "contentTypeId",
      as: "sports",
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });

    // ------------------------------------------ ContentType to Shopping ---------------------------------------- //
    Shopping.hasMany(ContentType, {
      foreignKey: "contentTypeId",
      as: "contentType"
    });

    ContentType.belongsTo(Shopping, {
      foreignKey: "contentTypeId",
      as: "shopping",
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });

    // ------------------------------------------ VenuesImage to Restaurant, TouristSpot, Culture, Sports, Shopping ---------------------------------------- //
    Restaurant.hasMany(VenuesImage, {
      foreignKey: "contentId",
      as: "images"
    });

    TouristSpot.hasMany(VenuesImage, {
      foreignKey: "contentId",
      as: "images"
    });

    Culture.hasMany(VenuesImage, {
      foreignKey: "contentId",
      as: "images"
    });

    Sports.hasMany(VenuesImage, {
      foreignKey: "contentId",
      as: "images"
    });

    Shopping.hasMany(VenuesImage, {
      foreignKey: "contentId",
      as: "images"
    });

    VenuesImage.belongsTo(Restaurant, {
      foreignKey: "contentId",
      as: "restaurantImages"
    });

    VenuesImage.belongsTo(TouristSpot, {
      foreignKey: "contentId",
      as: "touristSpotImages"
    });

    VenuesImage.belongsTo(Culture, {
      foreignKey: "contentId",
      as: "cultureImages"
    });

    VenuesImage.belongsTo(Shopping, {
      foreignKey: "contentId",
      as: "shoppingImages"
    });

    VenuesImage.belongsTo(Sports, {
      foreignKey: "contentId",
      as: "sportsImages"
    });

    // ------------------------------------------ User to Favorite ---------------------------------------- //
    User.hasMany(Favorite, {
      foreignKey: "userId",
      as: "favorites"
    });

    Favorite.belongsTo(User, {
      foreignKey: "userId",
      as: "user",
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });

    // ------------------------------------------ Favorite to Restaurant, TouristSpot, Culture, Sports, Shopping ---------------------------------------- //
    Restaurant.hasMany(Favorite, {
      foreignKey: "contentId",
      as: "id"
    });

    TouristSpot.hasMany(Favorite, {
      foreignKey: "contentId",
      as: "id"
    });

    Culture.hasMany(Favorite, {
      foreignKey: "contentId",
      as: "id"
    });

    Sports.hasMany(Favorite, {
      foreignKey: "contentId",
      as: "id"
    });

    Shopping.hasMany(Favorite, {
      foreignKey: "contentId",
      as: "id"
    });

    Favorite.belongsTo(Restaurant, {
      foreignKey: "contentId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });

    Favorite.belongsTo(TouristSpot, {
      foreignKey: "contentId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });

    Favorite.belongsTo(Culture, {
      foreignKey: "contentId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });

    Favorite.belongsTo(Sports, {
      foreignKey: "contentId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });

    Favorite.belongsTo(Shopping, {
      foreignKey: "contentId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });
  }
};
