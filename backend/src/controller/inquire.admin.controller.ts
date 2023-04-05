import BadRequestError from "../error/badRequest.error";
import { FilterOptions, IInquireResponseWithCount, PageOptions, SearchOptions } from "../model/inquire.model";
import InquireAdminService from "../service/inquire.admin.service";
import InquireService from "../service/inquire.service";
import InquireImageService from "../service/inquireImage.service";

class InquireAdminController {
    private inquireService: InquireService;
    private inquireAdminService: InquireAdminService;
    private inquireImageService: InquireImageService;

    constructor(inquireService: InquireService, inquireAdminService: InquireAdminService, inquireImageService: InquireImageService) {
        this.inquireService = inquireService;
        this.inquireAdminService = inquireAdminService;
        this.inquireImageService = inquireImageService;
    }

    async getInquires(pageOptions: PageOptions, searchOptions: SearchOptions, filterOptions: FilterOptions) {
        const result: IInquireResponseWithCount = await this.inquireAdminService.select(pageOptions, searchOptions, filterOptions);
        if (result.count <= 0) throw new BadRequestError("Not found inquires");

        return result;
    }
}

export default InquireAdminController;
