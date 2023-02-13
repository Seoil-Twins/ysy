import NotFoundError from "../error/notFound";

import logger from "../logger/logger";
import { NoticeImage } from "../model/noticeImage.model";
import { Notice } from "../model/notice.model";

const controller = {
    getNotices: async (count: number, page: number): Promise<Notice[]> => {
        console.log(count, page);
        const offset = (page - 1) * count;
        logger.debug(`count : ${count}, page : ${page}, offset: ${offset}`);

        const notices: Notice[] = await Notice.findAll({
            include: [
                {
                    model: NoticeImage,
                    as: "noticeImages",
                    attributes: { exclude: ["noticeId"] }
                }
            ],
            offset: offset,
            limit: count
        });

        if (notices.length <= 0) throw new NotFoundError("Not Found Notice");

        logger.debug(`Get Notice Data => ${JSON.stringify(notices)}`);
        return notices;
    }
};

export default controller;
