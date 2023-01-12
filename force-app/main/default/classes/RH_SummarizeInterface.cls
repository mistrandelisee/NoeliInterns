public Interface RH_SummarizeInterface {
    List<AggregateResult> getSummary(Map<String, Object> args);
    List<RH_Summarizer.summaryWrapper> formatAggregate(List<AggregateResult> aggs,Map<String, Object> args);
}