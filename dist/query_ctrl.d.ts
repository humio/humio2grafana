import { QueryCtrl } from 'app/plugins/sdk';
import './css/query-editor.css!';
declare class HumioQueryCtrl extends QueryCtrl {
    static templateUrl: string;
    $http: any;
    $scope: any;
    $q: any;
    $location: any;
    hostUrl: string;
    repositories: any[];
    datasource: any;
    target: any;
    panelCtrl: any;
    constructor($scope: any, $injector: any, $http: any, $q: any, $location: any);
    getHumioLink(): string;
    onChangeInternal(): void;
    showHumioLink(): boolean;
    _serializeQueryOpts(obj: any): string;
    _getHumioRepositories(): any;
}
export default HumioQueryCtrl;
