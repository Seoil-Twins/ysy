import { Album } from "./album.model";
import { Couple } from "./couple.model";
import { User } from "./user.model";

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
        Couple.hasMany(User, {
            foreignKey: "cupId",
            as: "users"
        });

        User.belongsTo(Couple, {
            foreignKey: "cupId",
            onDelete: "SET NULL",
            as: "couples"
        });

        Couple.hasMany(Album, {
            foreignKey: "cupId",
            as: "albums"
        });

        Album.belongsTo(Couple, {
            foreignKey: "cupId",
            onDelete: "CASCADE",
            as: "couples"
        });
    }
};
