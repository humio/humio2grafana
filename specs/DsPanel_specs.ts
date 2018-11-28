import {describe, it, expect} from './lib/common';
import { getValueFieldName } from '../src/DsPanel';

const dataWithFieldOrder = {
    "done": true,
    "events": [
        {
            "_count": "0",
            "_bucket": "1543314285000",
            "loglevel": "WARN"
        },
        {
            "_count": "0",
            "_bucket": "1543314285000",
            "loglevel": "ERROR"
        },
    ],
    "metaData": {
        "isAggregate": true,
        "filterQuery": {
            "queryString": "*",
            "end": 1543314587074,
            "showQueryEventDistribution": false,
            "isLive": false,
            "start": 1543314287074
        },
        "workDone": 2,
        "processedBytes": 2026624,
        "pollAfter": 1570,
        "eventCount": 303,
        "queryStart": 1543314287074,
        "timeMillis": 5469325,
        "totalWork": 2,
        "queryEnd": 1543314587074,
        "extraData": {
            "series": "loglevel",
            "timechart": "true",
            "bucket_last_bucket": "1543314585000",
            "bucket_span_humanized": "3 seconds",
            "bucket_span_millis": "3000",
            "groupby_fields": "loglevel",
            "ui:suggested-widget": "time-chart",
            "bucket_first_bucket": "1543314285000"
        },
        "fieldOrder": [
            "loglevel"
        ],
        "processedEvents": 5940
    }
}

const dataWithoutFieldOrder = {
    "done": false,
    "events": [
        {
            "error": "0",
            "_bucket": "1543311435000"
        },
        {
            "error": "0",
            "_bucket": "1543311438000"
        }
    ],
    "metaData": {
        "isAggregate": true,
        "filterQuery": {
            "queryString": "loglevel=ERROR",
            "end": 1543311735057,
            "showQueryEventDistribution": false,
            "isLive": false,
            "start": 1543311435057
        },
        "workDone": 3,
        "processedBytes": 1797120,
        "pollAfter": 4788,
        "eventCount": 101,
        "queryStart": 1543311435057,
        "timeMillis": 16,
        "totalWork": 4,
        "queryEnd": 1543311735057,
        "extraData": {
            "timechart": "true",
            "bucket_last_bucket": "1543311735000",
            "bucket_span_humanized": "3 seconds",
            "bucket_span_millis": "3000",
            "ui:suggested-widget": "time-chart",
            "bucket_first_bucket": "1543311435000"
        },
        "processedEvents": 5248
    }
}

describe('getValueFieldName', function() {
    it('does not use the series as value field', () => {
        expect(getValueFieldName(dataWithFieldOrder)).to.equal('_count');
    });

    it('determines the value field from the fields in the events', () => {
        expect(getValueFieldName(dataWithoutFieldOrder)).to.equal('error');
    });
});