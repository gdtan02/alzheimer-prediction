import { auth } from "@/config/firebase";
import Papa from "papaparse";

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

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

      const results = await response.json();

      return results.data;
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

      const results = await response.json();

      return results.data;
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
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to predict for patient.");
      }

      const results = await response.json();

      if (results && typeof results.data !== 'undefined') {
        return results.data as PredictionResult;
        
      } else if (results && typeof (results as PredictionResult).NACCID !== 'undefined') {
        return results as PredictionResult;

      } else {
        console.error("Unexpected response structure after successful call:", results);
        
        throw new Error("Received unexpected data structure from server after successful call.");
      }

    } catch (error) {
      console.log("Prediction error: ", error);
      throw error;
    }
  },

  // Validate CSV files
  async validateCsvFile(file: File, forTraining: boolean): Promise<boolean> {
    try {
      return new Promise((resolve, reject) => {
        Papa.parse(file, {
          preview: 2,
          complete: (results) => {
            try {

              const data = results.data.slice(1);  // Skip firs trow

              const headers = data[0] ? Object.values(data[0]) : [];

              // Check required fields for patient data
              const requiredFields = [
                'BIRTHYR', 'SEX', 'EDUC', 'UDSBENTC', 'MOCATRAI', 'AMNDEM', 'NACCPPAG', 'AMYLPET', 'DYSILL', 'DYSILLIF'
              ];

              if (forTraining) {
                requiredFields.push("NACCUDSD");
              }

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

