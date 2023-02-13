import NotFoundError from "../error/notFound";

import logger from "../logger/logger";
import { NoticeImage } from "../model/noticeImage.model";
import { Notice } from "../model/notice.model";

const controller = {
    /**
     * 공지사항을 가져옵니다.
     * @param count 보여질 개수
     * @param page 페이지 수
     * @returns A {@link Notice}[]
     */
    getNotices: async (count: number, page: number): Promise<Notice[]> => {
        const offset = (page - 1) * count;

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
