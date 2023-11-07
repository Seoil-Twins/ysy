import { AlbumImage } from "../models/albumImage.model.js";
import AlbumService from "../services/album.service.js";
import AlbumImageAdminService from "../services/albumImage.admin.service.js";
import AlbumImageService from "../services/albumImage.service.js";
import { FilterOptions, ResponseAlbumImage, SearchOptions, SortItem } from "../types/albumImage.type.js";
import { PageOptions } from "../utils/pagination.util.js";

class AlbumImageAdminController {
  private ERROR_LOCATION_PREFIX = "albumImage";
  private albumService: AlbumService;
  private albumImageService: AlbumImageService;
  private albumImageAdminService: AlbumImageAdminService;

  constructor(albumService: AlbumService, albumImageService: AlbumImageService, albumImageAdminService: AlbumImageAdminService) {
    this.albumService = albumService;
    this.albumImageService = albumImageService;
    this.albumImageAdminService = albumImageAdminService;
  }

  async getImages(pageOptions: PageOptions<SortItem>, searchOptions: SearchOptions, filterOptions: FilterOptions): Promise<ResponseAlbumImage> {
    const results: ResponseAlbumImage = await this.albumImageAdminService.selectAll(pageOptions, searchOptions, filterOptions);
    return results;
  }
}

export default AlbumImageAdminController;
