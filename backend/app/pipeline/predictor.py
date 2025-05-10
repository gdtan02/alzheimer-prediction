from typing import List
import joblib
import os
import pandas as pd
import time

from app.config import Config
from app.core.exceptions import PredictionError
from app.pipeline.preprocessor import DataPreprocessor
from    app.schemas.results import PredictionResult

class Predictor:

    def __init__(self):
        self.models = {}
        self.best_model_name = None
        self.best_model = None

    def load_models(self):
        """Load trained models."""
        try:
            # Load SVM model
            if os.path.exists(Config.SVM_MODEL_PATH):
                self.models["svm"] = joblib.load(Config.SVM_MODEL_PATH)
                
            # Load Naive Bayes model
            if os.path.exists(Config.NB_MODEL_PATH):
                self.models["naiveBayes"] = joblib.load(Config.NB_MODEL_PATH)
                
            # Load Decision Tree model
            if os.path.exists(Config.DT_MODEL_PATH):
                self.models["decisionTree"] = joblib.load(Config.DT_MODEL_PATH)
                
            # Load metrics
            metrics_path = os.path.join(Config.MODEL_DIR, "model_metrics.pkl")
            if os.path.exists(metrics_path):
                self.model_metrics = joblib.load(metrics_path)
                
            return True
            
        except Exception as e:
            raise PredictionError(f"Error loading models: {str(e)}")

    def set_best_model(self, best_model_name=None):
        try:
            self.load_models()   # Load the pretrained models

            self.best_model_name = best_model_name
            self.best_model =  self.models[self.best_model_name]

        except Exception as e:
            raise PredictionError(f"Fail to set the best model: {str(e)}")
        
    def predict_single(self, X):
        """Predict for a single patient."""
        try:
            # Ensure models are loaded
            if not self.models or not self.best_model_name or not self.best_model_name not in self.models:
                self.load_models()

            if not self.best_model:
                raise PredictionError(f"Fail to make predictions. The best model is not configured.")

            prediction = self.best_model.predict(X)[0]

            result: PredictionResult = PredictionResult(
                NACCID=str(X.index[0]),
                AGE=int(X["AGE"][0]),
                SEX=int(1 if X["SEX_1.0"][0] == 1 else 2),
                NACCUDSD=int(prediction)
            )

            return result.model_dump()
        
        except Exception as e:
            raise PredictionError(f"Error making prediction: {str(e)}")
        
    def predict_batch(self, X):
        """Predict from CSV"""
        try:
            # Ensure models are loaded
            if not self.models or not self.best_model_name or not self.best_model_name not in self.models:
                self.load_models()

            if not self.best_model:
                raise PredictionError(f"Fail to make predictions. The best model is not configured.")

            # Make predictions
            predictions = self.best_model.predict(X)

            results: List[PredictionResult] = []
            for idx, prediction in enumerate(predictions):
                result = PredictionResult(
                    NACCID=str(X.index[idx]),
                    AGE=int(X["AGE"][idx]),
                    SEX=int(1 if X['SEX_1.0'][idx] == 1 else 2),
                    NACCUDSD=int(prediction)
                ).model_dump()
                results.append(result)
            
            return results

        except Exception as e:
            raise PredictionError(f"Error making prediction: {str(e)}")

