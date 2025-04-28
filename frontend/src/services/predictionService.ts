// Model performance metrics
export interface ModelMetrics {
    f1Score: number;
    accuracy: number;
    precision: number;
    recall: number;
}

// Prediction results
export interface TrainingResult {
    id?: string;
    userId: string;
    filename: string;
    status: "processing" | "completed" | "failed";
    models: {
        svm: ModelMetrics;
        naiveBayes: ModelMetrics;
        decisionTree: ModelMetrics;
    };
    bestModel: "svm" | "naiveBayes" | "decisionTree";
    errorMessage?: string;
}

export interface PredictionResult {
    id?: string;
    userId: string;
    filename: string;
    status: "processing" | "completed" | "failed";
    models: {
        svm: ModelMetrics;
        naiveBayes: ModelMetrics;
        decisionTree: ModelMetrics;
    };
    bestModel: "svm" | "naiveBayes" | "decisionTree";
    errorMessage?: string;
}

// Mock data for demonstration purposes
export const MOCK_RESULTS: TrainingResult = {
  userId: '',
  filename: '',
  status: 'completed',
  models: {
    svm: {
      f1Score: 0.942942,
      accuracy: 0.952381,
      precision: 0.934848,
      recall: 0.952381
    },
    naiveBayes: {
      f1Score: 0.766033,
      accuracy: 0.756614,
      precision: 0.858554,
      recall: 0.756614
    },
    decisionTree: {
      f1Score: 0.961434,
      accuracy: 0.957672,
      precision: 0.965769,  
      recall: 0.957672
    }
  },
  bestModel: 'decisionTree'
};

// TO BE IMPLEMENTED