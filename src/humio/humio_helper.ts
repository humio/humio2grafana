import { WidgetType } from '../Types/WidgetType';

class HumioHelper {
  static queryIsLive(location: Location, range: any) {
    return (
      'raw' in range &&
      HumioHelper.automaticPanelRefreshHasBeenActivated(location) &&
      HumioHelper.dateIsNow(range.raw.to) &&
      HumioHelper.isAllowedRangeForLive(range.raw.from)
    );
  }

  static parseLiveFrom(date: string): string {
    if (!this.isAllowedRangeForLive(date)) {
      throw new Error(`Humio does not support live queries to start at ${date}.`);
    }

    return date.replace('now-', '').replace('M', 'mon');
  }

  private static dateIsNow(toDateCheck: any) {
    if (typeof toDateCheck === 'string') {
      return toDateCheck.match(/^(now[^-]|now$)/) != null;
    } else {
      return false;
    }
  }

  private static automaticPanelRefreshHasBeenActivated(location: Location) {
    return (location ? location.search.includes('refresh=') || null : null) != null;
  }

  static isAllowedRangeForLive(date: string): boolean {
    return !date.includes('/');
  }

  static widgetType(data: any, target: any) {
    if (data.metaData.extraData.timechart === 'true') {
      return WidgetType.timechart;
    }
    if (this.isTableQuery(target)) {
      return WidgetType.table;
    }
    if (data.metaData.extraData['ui:suggested-widget'] === 'world-map') {
      return WidgetType.worldmap;
    } else {
      return WidgetType.untyped;
    }
  }

  private static isTableQuery(target: any): boolean {
    return typeof target.humioQuery === 'string'
      ? new RegExp(/(table\()(.+)(\))/).exec(target.humioQuery) !== null
      : false;
  }
}

export default HumioHelper;
