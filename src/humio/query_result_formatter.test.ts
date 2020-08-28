import QueryResultFormatter from "./query_result_formatter";



describe("Regular Query Formatting", () => {
    
    it('returns an empty list if no events are given', () => {
        var res = {"data": {"events": []}}
        var target = {}


        QueryResultFormatter.formatQueryResponses([res], [target]).then(res => expect(res).toEqual({"data": [], "error": undefined}));
    });
    
}
) 

describe("AnnotationQuery Formatting", () => {
    
    it('returns an empty list if no events are given', () => {
        QueryResultFormatter.formatAnnotationQueryResponse({"events": []}, "").then(res => expect(res).toEqual([]));
    });

    it('returns an empty list if no events are given', () => {
        var testFieldText = "IamATestField"
        QueryResultFormatter.formatAnnotationQueryResponse({"events": [{"@timestamp": 0, "test": testFieldText}]}, "{test}").then(res => expect(res).toEqual([{"time": 0, "text": testFieldText}]));
    });
    

}
) 

