import { auth } from "@/config/firebase";
import Papa from "papaparse";

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http:localhost:5000/api';

// Model performance metrics
export interface ModelMetrics {
    f1Score: number;
    accuracy: number;
    precision: number;
    recall: number;
}

// Training results
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

// Prediction results
export interface PredictionResult {
  NACCID: string;
  NACCUDSD: number;
}

// Patient data for single prediction
export interface PatientData {
  birthyr: number;
  sex: string;
  educ: number;
  udsbentc: string;
  mocatrai: string;
  amndem: string;
  naccppag: string;
  amylpet: string;
  dysill: string;
  dysillif: string;
}

export const PredictionService = {

  // Train model
  async trainModel(file: File): Promise<TrainingResult> {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Get current user token
      const token = await auth.currentUser?.getIdToken();

      // Make API request
      const response = await fetch(`${API_BASE_URL}/train`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to train models.");
      }

      return await response.json();
    } catch (error) {
      console.log("Training error: ", error);
      throw error;
    }
  },

  // Dataset upload - Predict from CSV
  async predictFromCSV(file: File): Promise<PredictionResult[]> {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Get current user token
      const token = await auth.currentUser?.getIdToken();

      // Make API request
      const response = await fetch(`${API_BASE_URL}/predict/batch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to predict from dataset.");
      }

      return await response.json();
    } catch (error) {
      console.log("Prediction error: ", error);
      throw error;
    }
  },

  // Predict single patient
  async predictSinglePatient(patientData: PatientData): Promise<PredictionResult> {
    try {
      // Get current user token
      const token = await auth.currentUser?.getIdToken();

      // Make API request
      const response = await fetch(`${API_BASE_URL}/predict/single`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(patientData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to predict for patient.");
      }

      return await response.json();
    } catch (error) {
      console.log("Prediction error: ", error);
      throw error;
    }
  },

  // Validate CSV files
  async validateCsvFile(file: File): Promise<boolean> {
    try {
      return new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          preview: 5,
          complete: (results) => {
            try {
              // Get headers
              const headers = results.meta.fields || [];

              // Check required fields for patient data
              const requiredFields = [
                'birthyr', 'sex', 'educ', 'udsbentc', 'mocatrai', 'amndem', 'naccppag', 'amylpet', 'dysill', 'dysillif'
              ];

              // Check if all required fields are present
              const hasAllRequiredFields = requiredFields.every(field => headers.includes(field));

              resolve(hasAllRequiredFields);
            } catch (err) {
              reject(err);
            }
          }
        });
      });
    } catch (error) {
      console.log("Validation error: ", error)
      throw error;
    }
  }
};


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