function RecommendationPanel({ recommendations }) {
  if (!recommendations?.length) {
    return null;
  }

  return (
    <section className="recommendation-panel">
      <div className="section-heading">
        <span className="section-label">Smart Farming Advice</span>
      </div>
      <div className="recommendation-list">
        {recommendations.map((message) => (
          <div key={message} className="recommendation-item">
            {message}
          </div>
        ))}
      </div>
    </section>
  );
}

export default RecommendationPanel;
