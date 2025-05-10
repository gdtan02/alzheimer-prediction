import pandas as pd
import numpy as np
import joblib
import os
import time
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

from app.config import Config
from app.core.exceptions import ModelTrainingError, PredictionError
from app.pipeline import DataPreprocessor, ModelTrainer, Predictor
from app.schemas.results import Metrics, TrainResult

class AlzheimersPipeline:
    """Core pipeline for the Alzheimer's Prediction system"""

    def __init__(self):
        self.data_preprocessor = DataPreprocessor()
        self.trainer = ModelTrainer()
        self.predictor = Predictor()

    def train(self, file_path, user_id=None):
        """Train models using the provided dataset"""
        try:
            # start_time = time.time()

            # Load data
            df = pd.read_csv(file_path, skiprows=1)
            df.set_index("NACCID", inplace=True)

            df_train, df_test = self.data_preprocessor.prepare_training_data(df)

            X_train, y_train = self.data_preprocessor.fit_transform(df_train)
            X_test, y_test = self.data_preprocessor.transform(df_test, for_training=True)

            # Train the models
            self.trainer.train_models(X_train, y_train)

            # Evaluate models
            self.trainer.evaluate_models(X_test, y_test)

            # Get model metrics and best model
            model_metrics = self.trainer.get_model_metrics()
            best_model_name, _ = self.trainer.get_best_model()

            # end_time = time.time()


            # Generate training results
            train_results = TrainResult(
                userId=user_id or "user",
                filename="file",
                status="completed",
                models={
                    "svm": Metrics(
                        accuracy=model_metrics["svm"]["accuracy"],
                        precision=model_metrics["svm"]["precision"],
                        recall=model_metrics["svm"]["recall"],
                        f1Score=model_metrics["svm"]["f1Score"]
                    ),
                    "naiveBayes": Metrics(
                        accuracy=model_metrics["naiveBayes"]["accuracy"],
                        precision=model_metrics["naiveBayes"]["precision"],
                        recall=model_metrics["naiveBayes"]["recall"],
                        f1Score=model_metrics["naiveBayes"]["f1Score"]
                    ),
                    "decisionTree": Metrics(
                        accuracy=model_metrics["decisionTree"]["accuracy"],
                        precision=model_metrics["decisionTree"]["precision"],
                        recall=model_metrics["decisionTree"]["recall"],
                        f1Score=model_metrics["decisionTree"]["f1Score"]
                    )
                },
                bestModel=best_model_name
            )

            return train_results.model_dump()
        
        except Exception as e:
            raise ModelTrainingError(str(e))

    def predict_batch(self, file_path, model_name):
        """Predict from CSV"""
        try:
            df = pd.read_csv(file_path, skiprows=1)
            df.set_index("NACCID", inplace=True)
            df_cleaned = self.data_preprocessor.prepare_prediction_data(df)

            X, _ = self.data_preprocessor.transform(df_cleaned)

            self.predictor.set_best_model(best_model_name=model_name)

            prediction_results = self.predictor.predict_batch(X)
            return prediction_results

        except Exception as e:
            raise PredictionError(str(e))
        
    def predict_single(self, patient_data, model_name):
        """Predict for a single patient based on patient data."""
        try:
            df = pd.DataFrame(data=patient_data, index=[0])

            # if "NACCID" not in df.columns:
            #     unique_id = f"ID{int(time.time())}"
            #     df["NACCID"] = unique_id
            #     df.set_index("NACCID", inplace=True)

            cleaned_df = self.data_preprocessor.prepare_prediction_data(df)
            X, _ = self.data_preprocessor.transform(cleaned_df)
        
            self.predictor.set_best_model(best_model_name=model_name)

            prediction_result = self.predictor.predict_single(X)

            return prediction_result
        
        except Exception as e:
            raise PredictionError(str(e))