interface DatasourceRequestOptions {
    method: string;
    url: string;
    headers?: any;
    data?: {
        [key: string]: any;
    };
}

export default DatasourceRequestOptions;