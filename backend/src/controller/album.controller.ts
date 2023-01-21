import randomString from "randomstring";
import { Op } from "sequelize";

import sequelize from "../model";
import { Album, IRequestCreate } from "../model/album.model";

const folderName = "albums";

const controller = {
    addAlbum: async (data: IRequestCreate): Promise<void> => {
        await Album.create({
            cupId: data.cupId,
            title: data.title
        });
    }
};

export default controller;
