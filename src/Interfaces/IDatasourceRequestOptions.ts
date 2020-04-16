interface DatasourceRequestOptions {
    method: string;
    url: string;
    data?: {
        [key: string]: any;
    };
}

export default DatasourceRequestOptions;