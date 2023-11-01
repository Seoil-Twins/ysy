import { ContentType } from "../models/contentType.model.js";
import ContentTypeService from "../services/contentType.service.js";

class ContentTypeController {
  private contentTypeService: ContentTypeService;

  constructor(contentTypeService: ContentTypeService) {
    this.contentTypeService = contentTypeService;
  }

  async getContentTypes(): Promise<ContentType[]> {
    const response = await this.contentTypeService.selectAll();
    return response;
  }
}

export default ContentTypeController;
