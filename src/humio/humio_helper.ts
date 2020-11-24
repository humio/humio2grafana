import { WidgetType } from '../Types/WidgetType';

class HumioHelper {
  static dateIsNow(toDateCheck: any) {
    if (typeof toDateCheck === 'string') {
      return toDateCheck.match(/^(now[^-]|now$)/) != null;
    } else {
      return false;
    }
  }

  static queryIsLive(location: Location, date: any) {
    return HumioHelper.automaticPanelRefreshHasBeenActivated(location) && HumioHelper.dateIsNow(date);
  }

  static automaticPanelRefreshHasBeenActivated(location: Location) {
    return (location ? location.search.includes('refresh=') || null : null) != null;
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

  static isTableQuery(target: any): boolean {
    return typeof target.humioQuery === 'string'
      ? new RegExp(/(table\()(.+)(\))/).exec(target.humioQuery) !== null
      : false;
  }

  static parseLiveFrom(date: string): string {
    if (date.includes('/')) {
      throw new Error(`Humio does not support live queries to start at ${date}.`);
    }

    return date.replace('now-', '').replace('M', 'mon');
  }
}

export default HumioHelper;
