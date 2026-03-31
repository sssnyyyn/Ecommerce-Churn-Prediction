export interface PredictionResult {
  churnProbability: number;
  confidence: number;
  models: {
    logisticRegression: number;
    randomForest: number;
    xgBoost: number;
  };
  importance: {
    feature: string;
    impact: number;
  }[];
}

export interface DashboardStats {
  totalCustomers: number;
  churnRate: number;
  avgLTV: number;
  churnDistribution: { range: string; count: number }[];
  featureImportance: { name: string; value: number }[];
}

export interface CustomerData {
  recency: number;
  frequency: number;
  monetary: number;
  tenure: number;
}
