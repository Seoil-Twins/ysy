import NotFoundError from "../error/notFound.error";
import { Calendar, FilterOptions, ICalendarResponseWithCount, PageOptions, SearchOptions } from "../model/calendar.model";

import CalendarAdminService from "../service/calendar.admin.service";
import CalendarService from "../service/calendar.service";

class CalendarAdminController {
    private calendarService: CalendarService;
    private calendarAdminService: CalendarAdminService;

    constructor(calendarService: CalendarService, calendarAdminService: CalendarAdminService) {
        this.calendarService = calendarService;
        this.calendarAdminService = calendarAdminService;
    }

    async getCalendars(pageOptions: PageOptions, searchOptions: SearchOptions, filterOptions: FilterOptions): Promise<ICalendarResponseWithCount> {
        const result: ICalendarResponseWithCount = await this.calendarAdminService.select(pageOptions, searchOptions, filterOptions);
        if (result.count <= 0) throw new NotFoundError(`Not found calendars`);

        return result;
    }
}

export default CalendarAdminController;
