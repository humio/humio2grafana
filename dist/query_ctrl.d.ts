import { QueryCtrl } from 'app/plugins/sdk';
import IDatasource from './Interfaces/IDatasource';
import ITarget from './Interfaces/ITarget';
import './css/query-editor.css!';
declare class HumioQueryCtrl extends QueryCtrl {
    static templateUrl: string;
    $http: any;
    $scope: any;
    $q: any;
    $location: any;
    hostUrl: string;
    repositories: any[];
    datasource: IDatasource;
    target: ITarget;
    panelCtrl: any;
    constructor($scope: any, $injector: any, $http: any, $q: any, $location: any);
    getHumioLink(): string;
    showHumioLink(): boolean;
    onChangeInternal(): void;
    private _getHumioRepositories;
    private _composeQueryArgs;
    private _serializeQueryArgs;
}
export default HumioQueryCtrl;
