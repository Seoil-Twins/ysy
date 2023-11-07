import NoticeSerivce from "../services/notice.service.js";

import { PageOptions, ResponseNotice } from "../types/noitce.type.js";

class NoticeController {
  private noticeService: NoticeSerivce;

  constructor(noticeService: NoticeSerivce) {
    this.noticeService = noticeService;
  }

  async getNotices(pageOptions: PageOptions): Promise<ResponseNotice> {
    const notices: ResponseNotice = await this.noticeService.selectAll(pageOptions);
    return notices;
  }
}

export default NoticeController;
