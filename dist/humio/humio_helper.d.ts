import { WidgetType } from '../Types/WidgetType';
declare class HumioHelper {
    static dateIsNow(toDateCheck: any): boolean;
    static queryIsLive($location: any, date: any): boolean;
    static automaticPanelRefreshHasBeenActivated($location: any): boolean;
    static widgetType(data: any, target: any): WidgetType;
    static isTableQuery(target: any): boolean;
    static parseDateFrom(date: string): "2d" | "7d" | "30d" | "90d" | "180d" | "1y" | "2y" | "5y" | "1d" | "1m" | "5m" | "15m" | "30m" | "1h" | "3h" | "6h" | "12h" | "24h";
}
export default HumioHelper;
