export function calculateTokenSavings(
  messageCount: number,
  summaryLength: number
) {
  const fullHistoryTokens = Math.ceil(messageCount * 15);
  const summaryTokens = Math.ceil(summaryLength / 4);
  const savings =
    fullHistoryTokens > 0
      ? Math.round(
          ((fullHistoryTokens - summaryTokens) / fullHistoryTokens) * 100
        )
      : 0;

  return { fullHistoryTokens, summaryTokens, savings };
}
