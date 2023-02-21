import { Album } from "./album.model";
import { Calendar } from "./calendar.model";
import { Couple } from "./couple.model";
import { Inquire } from "./inquire.model";
import { InquireImage } from "./inquireImage.model";
import { Notice } from "./notice.model";
import { NoticeImage } from "./noticeImage.model";
import { Role } from "./role.model";
import { Solution } from "./solution.model";
import { SolutionImage } from "./solutionImage.model";
import { User } from "./user.model";
import { UserRole } from "./userRole.model";

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
            as: "userRole"
        });

        UserRole.hasOne(User, {
            foreignKey: "userId",
            onDelete: "CASCADE",
            as: "users"
        });

        // ------------------------------------------ UserRole to Role ---------------------------------------- //
        Role.hasMany(UserRole, {
            foreignKey: "roleId",
            as: "userRole"
        });

        UserRole.belongsTo(Role, {
            foreignKey: "roleId",
            onUpdate: "CASCADE",
            as: "role"
        });

        // ------------------------------------------ User to Couple ---------------------------------------- //
        Couple.hasMany(User, {
            foreignKey: "cupId",
            as: "users"
        });

        User.belongsTo(Couple, {
            foreignKey: "cupId",
            onDelete: "SET NULL",
            as: "couple"
        });

        // ------------------------------------------ Album to Couple ---------------------------------------- //
        Couple.hasMany(Album, {
            foreignKey: "cupId",
            as: "albums"
        });

        Album.belongsTo(Couple, {
            foreignKey: "cupId",
            onDelete: "CASCADE",
            as: "couple"
        });

        // ------------------------------------------ Calendar to Couple ---------------------------------------- //
        Couple.hasMany(Calendar, {
            foreignKey: "cupId",
            as: "calendars"
        });

        Calendar.belongsTo(Couple, {
            foreignKey: "cupId",
            onDelete: "CASCADE",
            as: "couple"
        });

        // ------------------------------------------ Inquire to User ---------------------------------------- //
        User.hasMany(Inquire, {
            foreignKey: "userId",
            as: "inquires"
        });

        Inquire.belongsTo(User, {
            foreignKey: "userId",
            onDelete: "CASCADE",
            as: "user"
        });

        // ------------------------------------------ InquireImage to Inquire ---------------------------------------- //
        Inquire.hasMany(InquireImage, {
            foreignKey: "inquireId",
            as: "inquireImages"
        });

        InquireImage.belongsTo(Inquire, {
            foreignKey: "inquireId",
            onDelete: "CASCADE",
            as: "inquire"
        });

        // ------------------------------------------ Solution : Inquire ---------------------------------------- //
        Inquire.hasOne(Solution, {
            foreignKey: "inquireId",
            as: "solution"
        });

        Solution.hasOne(Inquire, {
            foreignKey: "inquireId",
            as: "inquire"
        });

        // ------------------------------------------ SolutionImage to Solution ---------------------------------------- //
        Solution.hasMany(SolutionImage, {
            foreignKey: "solutionId",
            as: "solutionImages"
        });

        SolutionImage.belongsTo(Solution, {
            foreignKey: "solutionId",
            onDelete: "CASCADE",
            as: "solution"
        });

        // ------------------------------------------ SolutionImage to Solution ---------------------------------------- //
        Notice.hasMany(NoticeImage, {
            foreignKey: "noticeId",
            as: "noticeImages"
        });

        NoticeImage.belongsTo(Notice, {
            foreignKey: "noticeId",
            onDelete: "CASCADE",
            as: "notice"
        });
    }
};
