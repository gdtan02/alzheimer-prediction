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
  NACCID: string;
  NACCUDSD: number;
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
export const MOCK_PREDICTION_RESULTS: PredictionResult[] = [
  { NACCID: "ID0412", NACCUDSD: 1 },
  { NACCID: "ID0523", NACCUDSD: 2 },
  { NACCID: "ID0634", NACCUDSD: 3 },
  { NACCID: "ID0745", NACCUDSD: 1 },
  { NACCID: "ID0856", NACCUDSD: 2 },
  { NACCID: "ID0967", NACCUDSD: 4 },
  { NACCID: "ID1078", NACCUDSD: 2 },
  { NACCID: "ID1189", NACCUDSD: 1 },
  { NACCID: "ID1290", NACCUDSD: 3 },
  { NACCID: "ID1301", NACCUDSD: 2 },
  { NACCID: "ID1412", NACCUDSD: 1 },
  { NACCID: "ID1523", NACCUDSD: 2 },
  { NACCID: "ID1634", NACCUDSD: 1 },
  { NACCID: "ID1745", NACCUDSD: 3 },
  { NACCID: "ID1856", NACCUDSD: 2 },
  { NACCID: "ID1967", NACCUDSD: 1 },
  { NACCID: "ID2078", NACCUDSD: 4 },
  { NACCID: "ID2189", NACCUDSD: 2 },
  { NACCID: "ID2290", NACCUDSD: 1 },
  { NACCID: "ID2301", NACCUDSD: 3 },
  { NACCID: "ID2412", NACCUDSD: 2 },
  { NACCID: "ID2523", NACCUDSD: 1 },
  { NACCID: "ID2634", NACCUDSD: 3 },
  { NACCID: "ID2745", NACCUDSD: 2 },
  { NACCID: "ID2856", NACCUDSD: 1 }
];