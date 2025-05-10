import { auth } from "@/config/firebase";
import Papa from "papaparse";
import { collection, addDoc, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/config/firebase";

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
  BIRTHYR: number;
  SEX: number;
  EDUC: number;
  UDSBENTC: number;
  MOCATRAI: number;
  AMNDEM: number;
  NACCPPAG: number;
  AMYLPET: number;
  DYSILL: number;
  DYSILLIF: number;
}

export const PredictionService = {

  // Fetch best model name from Firestore
  async getBestModel(): Promise<string> {
    try {
      // Query Firestore for the user's model settings
      const modelsRef = collection(db, 'models');
      const q = query(
        modelsRef,
        orderBy('timestamp', 'desc'),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return data.bestModel || 'decisionTree'; // Default to decisionTree if not specified
      }
      
      return 'decisionTree'; // Default model
    } catch (error) {
      console.error('Error getting best model:', error);
      return 'decisionTree'; // Default model on error
    }
  },

  // Train model
  async trainModel(file: File): Promise<TrainingResult> {
    try {
      // Get current user token
      const token = await auth.currentUser?.getIdToken();

      // Create form data
      const formData = new FormData();
      formData.append('file', file);

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

      // Save to Firestore
      try {
        await addDoc(collection(db, 'models', ), {
          ...results.data,
          timestamp: new Date()
        });
      } catch (firestoreError) {
        console.error('Error saving to Firestore:', firestoreError);
        // We don't throw here to avoid blocking the response to the user
      }

      return results.data;
    } catch (error) {
      console.log("Training error: ", error);
      throw error;
    }
  },

  // Dataset upload - Predict from CSV
  async predictFromCSV(file: File): Promise<PredictionResult[]> {
    try {
      // Get best model for this user
      const bestModel = await this.getBestModel();

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('modelName', bestModel);

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

      // Get best model for this user
      const bestModel = await this.getBestModel();

      const requestData = {
        ...patientData,
        modelName: bestModel
      }

      // Make API request
      const response = await fetch(`${API_BASE_URL}/predict/single`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
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

