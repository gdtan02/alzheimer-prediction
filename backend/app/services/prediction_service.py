import os
import pandas as pd

from app.core.pipeline import AlzheimersPipeline
from app.core.exceptions import (
    DataValidationError, 
    DataPreprocessingError, 
    ModelNotFoundError, 
    ModelTrainingError, 
    PredictionError
)
from app.schemas.results import TrainResult, PredictionResult, Metrics
from app.config import Config

class PredictionService:
    """Service for handling prediction requests and integrating with ML pipeline."""

    def __init__(self):
        self.pipeline = AlzheimersPipeline()

    def train_models(self, file, user_id=None):
        try:
            train_results = self.pipeline.train(file, user_id)

            return train_results
        
        except Exception as e:
            print(f"Training error: {str(e)}")
            raise ModelTrainingError(f"Training error: {str(e)}")
        
    def predict_batch(self, file, model_name=None):
        try:
            prediction_results = self.pipeline.predict_batch(file, model_name)

            return prediction_results
        
        except Exception as e:
            raise PredictionError(f"Prediction error: {str(e)}")
        
    def predict_single(self, patient_data, model_name=None):
        try:
            prediction_result = self.pipeline.predict_single(patient_data, model_name)

            return prediction_result
        
        except Exception as e:
            raise PredictionError(f"Prediction error: {str(e)}")