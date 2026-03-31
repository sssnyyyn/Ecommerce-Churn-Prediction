import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock ML Logic
  const predictChurn = (data: any) => {
    // Simple heuristic-based prediction to simulate ML models
    // Features: Recency (days), Frequency (orders), Monetary (total spend), Tenure (days)
    const { recency, frequency, monetary, tenure } = data;
    
    // Normalize/Scale (Simplified)
    const rScore = Math.min(recency / 30, 1); // Higher recency = higher churn
    const fScore = Math.max(1 - (frequency / 10), 0); // Lower frequency = higher churn
    const mScore = Math.max(1 - (monetary / 1000), 0); // Lower monetary = higher churn
    const tScore = Math.max(1 - (tenure / 365), 0); // Lower tenure = higher churn

    // Logistic Regression Simulation
    const lrProb = (rScore * 0.4 + fScore * 0.3 + mScore * 0.2 + tScore * 0.1);
    
    // Random Forest Simulation (Non-linear)
    const rfProb = (rScore > 0.7 ? 0.8 : 0.2) * 0.5 + (fScore > 0.5 ? 0.6 : 0.1) * 0.5;
    
    // XGBoost Simulation (Gradient boosting feel)
    const xgProb = Math.min(lrProb * 1.1, 1);

    const finalProb = (lrProb + rfProb + xgProb) / 3;
    
    // Feature Importance (SHAP-like)
    const importance = [
      { feature: '최근 구매일(Recency)', impact: rScore * 0.45 },
      { feature: '구매 빈도(Frequency)', impact: fScore * 0.25 },
      { feature: '누적 구매액(Monetary)', impact: mScore * 0.20 },
      { feature: '가입 기간(Tenure)', impact: tScore * 0.10 },
    ].sort((a, b) => b.impact - a.impact);

    return {
      churnProbability: Math.round(finalProb * 100),
      confidence: 85 + Math.random() * 10,
      models: {
        logisticRegression: Math.round(lrProb * 100),
        randomForest: Math.round(rfProb * 100),
        xgBoost: Math.round(xgProb * 100)
      },
      importance
    };
  };

  // API Routes
  app.post("/api/predict", (req, res) => {
    const result = predictChurn(req.body);
    res.json(result);
  });

  app.get("/api/dashboard-stats", (req, res) => {
    // Generate some mock aggregate data
    res.json({
      totalCustomers: 1240,
      churnRate: 24.5,
      avgLTV: 450,
      churnDistribution: [
        { range: '0-20%', count: 450 },
        { range: '20-40%', count: 320 },
        { range: '40-60%', count: 210 },
        { range: '60-80%', count: 180 },
        { range: '80-100%', count: 80 },
      ],
      featureImportance: [
        { name: '최근 구매일', value: 42 },
        { name: '구매 빈도', value: 28 },
        { name: '누적 구매액', value: 18 },
        { name: '가입 기간', value: 12 },
      ]
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
