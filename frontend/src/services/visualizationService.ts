import { auth } from "@/config/firebase";
import { VisualizationResponse, VisualizationResult } from '@/types/visualization';
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/config/firebase";


const API_BASE_URL = "http://localhost:5000/api";

// Visualization endpoints
const VISUALIZATION_ENDPOINTS = [
    { name: 'numerical_features_boxplot', label: 'Numerical Features Boxplot' },
    { name: 'numerical_features_pairplot', label: 'Numerical Features Pairplot' },
    { name: 'numerical_features_violin', label: 'Numerical Features Violin' },
    { name: 'correlation_heatmap', label: "Correlation between Features" },
    { name: 'categorical_vs_target', label: 'Categorical vs Target' },
    { name: 'feature_importance', label: 'Feature Importance' }
  ];

export const VisualizationService = {

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

    // Generate all visualizations
    async generateAllVisualizations(file: File): Promise<VisualizationResult[]> {
        const results: VisualizationResult[] = [];

        // Make the requests
        const promises = VISUALIZATION_ENDPOINTS.map(async (endpoint) => {
            try {
                console.log(`Generating ${endpoint.label}...`);

                const bestModel = await this.getBestModel();

                const response: VisualizationResponse = await this.generateVisualization(endpoint.name, file, bestModel);

                if (response.status === "success") {
                    const imageData = response.imageData;
                    const contentType = response.contentType;
                    
                    // Convert base64 to blob
                    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
                    const byteCharacters = atob(base64Data);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: contentType });
                    
                    // Create object URL for the blob
                    const imageUrl = URL.createObjectURL(blob);

                    return {
                        name: endpoint.name,
                        label: endpoint.label,
                        imageUrl,
                        error: ''
                    }
                }
            } catch (error) {
                console.error(`Failed to generate ${endpoint.label}:`, error);
                return {
                    name: endpoint.name,
                    label: endpoint.label,
                    imageUrl: '',
                    error: error instanceof Error ? error.message : "Unknown error"
                };
            }
        });

        // Wait for all visualizations to complete
        const visualizationResults = await Promise.allSettled(promises);

        visualizationResults.forEach((result) => {
            if (result.status == "fulfilled") {
                if (result.value != undefined)
                    results.push(result.value);
            }
        });

        return results
    },

    // Generate a single visualization
    async generateVisualization(endpoint: string, file: File, bestModel: string): Promise<VisualizationResponse> {
        try {
            // Get current user token
            const token = await auth.currentUser?.getIdToken();

            // Create form data
            const formData = new FormData();
            formData.append('file', file);
            formData.append('modelName', bestModel)
            
            // Make API request
            const response = await fetch(`${API_BASE_URL}/visualizations/generate/${endpoint}`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to generate visualizations.");
            }

            const result = await response.json();

            console.log("Result=", result)

            const visualizationResponse: VisualizationResponse = {
                status: "success",
                imageData: result.data.imageData,
                contentType: result.data.contentType,
                error: ""
            }

            return visualizationResponse;            
        } catch (error) {
            console.error("Visualization error: ", error);
            
            const visualizationResponse: VisualizationResponse = {
                status: "failed",
                imageData: '',
                contentType: '',
                error: `Visualization error: ${error}`
            }
            return visualizationResponse;
        }
    },


    // Cleanup visualization URLs when component unmounts
    cleanupVisualizationUrls(visualizations: VisualizationResult[]) {
        visualizations.forEach(viz => {
            if (viz.imageUrl && viz.imageUrl.startsWith('blob:')) {
                URL.revokeObjectURL(viz.imageUrl);
            }
        });
    }
}