import { AlbumImage } from "./albumImage.model.js";
import { Album } from "./album.model.js";
import { Calendar } from "./calendar.model.js";
import { ContentType } from "./contentType.model.js";
import { Couple } from "./couple.model.js";
import { Favorite } from "./favorite.model.js";
import { Inquiry } from "./inquiry.model.js";
import { InquiryImage } from "./inquiryImage.model.js";
import { Notice } from "./notice.model.js";
import { NoticeImage } from "./noticeImage.model.js";
import { Role } from "./role.model.js";
import { Solution } from "./solution.model.js";
import { SolutionImage } from "./solutionImage.model.js";
import { User } from "./user.model.js";
import { UserRole } from "./userRole.model.js";
import { DatePlace } from "./datePlace.model.js";
import { DatePlaceImage } from "./datePlaceImage.model.js";
import { Admin } from "./admin.model.js";

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

    // ------------------------------------------ Admin : User ---------------------------------------- //
    User.hasOne(Admin, {
      foreignKey: "userId",
      as: "admin"
    });

    Admin.hasOne(User, {
      foreignKey: "userId",
      as: "user",
      onDelete: "CASCADE",
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

    // ------------------------------------------ ContentType to DatePlace ---------------------------------------- //
    DatePlace.hasMany(ContentType, {
      foreignKey: "contentTypeId",
      as: "contentType"
    });

    ContentType.belongsTo(DatePlace, {
      foreignKey: "contentTypeId",
      as: "datePlace",
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });

    // ------------------------------------------ DatePlace to DatePlace Image ---------------------------------------- //
    DatePlace.hasMany(DatePlaceImage, {
      foreignKey: "contentId",
      as: "datePlaceImages"
    });

    DatePlaceImage.belongsTo(DatePlace, {
      foreignKey: "contentId",
      as: "datePlace"
    });

    // ------------------------------------------ User, DatePlace,  Favorite ---------------------------------------- //
    User.belongsToMany(DatePlace, {
      through: Favorite,
      foreignKey: "userId",
      as: "favorites"
    });

    DatePlace.belongsToMany(User, {
      through: Favorite,
      foreignKey: "contentId",
      as: "users"
    });
  }
};
