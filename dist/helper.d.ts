declare class HumioHelper {
    static checkToDateNow(toDateCheck: any): boolean;
    static getPanelType(queryStr: string): string;
    static parseDateFrom(date: any): "2d" | "7d" | "30d" | "90d" | "180d" | "1y" | "2y" | "5y" | "1d" | "1m" | "5m" | "15m" | "30m" | "1h" | "3h" | "6h" | "12h" | "24h";
}
export default HumioHelper;
