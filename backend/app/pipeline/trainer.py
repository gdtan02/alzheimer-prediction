import joblib
import os
import time
import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold, GridSearchCV
from sklearn.svm import SVC
from sklearn.naive_bayes import GaussianNB
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

from app.config import Config
from app.core.exceptions import ModelTrainingError

class ModelTrainer:

    def __init__(self):
        # self.models = {
        #     "svm": SVC(probability=True, random_state=Config.RANDOM_STATE),
        #     "naiveBayes": GaussianNB(),
        #     "decisionTree": DecisionTreeClassifier(random_state=Config.RANDOM_STATE)
        # }
        self.models = {
            "svm": SVC(probability=True, C=1.0, kernel='rbf', gamma=0.1, random_state=Config.RANDOM_STATE),
            "naiveBayes": GaussianNB(),
            "decisionTree": DecisionTreeClassifier(max_depth=5, min_samples_split=5, random_state=Config.RANDOM_STATE)
        }
        
        self.param_grids = {
            "svm": {
                'C': [0.1, 1, 10, 50],
                'gamma': ['scale', 'auto', 0.001, 0.01, 0.1],
                'kernel': ['rbf', 'linear', 'poly']
            },
            "naiveBayes": {
                'var_smoothing': np.logspace(-9, -1, num=10)
            },
            "decisionTree": {
                'criterion': ['gini', 'entropy'],
                'max_depth': [3, 5, 7, 10, None],
                'min_samples_split': [2, 5, 10, 20],
                'min_samples_leaf': [1, 2, 5, 10]
            }
        }
        
        self.best_estimators = {}
        self.cv_results = {}
        self.model_metrics = {}
        self.best_model_name = None
        self.best_model = None

    def train_models(self, X_train, y_train):
        """Train and tune models using grid search cross-validation."""
        # cv = StratifiedKFold(n_splits=Config.CV_SPLITS, shuffle=True, random_state=Config.RANDOM_STATE)

        # for model_name, model in self.models.items():
        #     try:
        #         grid_search = GridSearchCV(
        #             model,
        #             param_grid=self.param_grids[model_name],
        #             cv=cv,
        #             scoring="f1_weighted",
        #             n_jobs=-1,
        #             verbose=1
        #         )

        #         # Fit grid search
        #         start_time = time.time()
        #         grid_search.fit(X_train, y_train)
        #         end_time = time.time()

        #         # Store best models
        #         self.best_estimators[model_name] = grid_search.best_estimator_

        #         # Store cv results
        #         self.cv_results[model_name] = {
        #             "training_time": end_time - start_time,
        #             "best_params": grid_search.best_params_,
        #             "best_f1_weighted_cv_train": grid_search.best_score_
        #         }

        #         print(f"Best F1-score (weighted):for {model_name} (on train CV): {grid_search.best_score_:.4f}")
        #         print(f"Best parameters for {model_name}: {grid_search.best_params_}")
                
        #     except Exception as e:
        #         raise ModelTrainingError(f"Error training {model_name}: {str(e)}")

        for model_name, model in self.models.items():
            try:
                model.fit(X_train, y_train)

            except Exception as e:
                
                print("ERROR=", str(e))
                raise ModelTrainingError(f"Error training {model_name}: {str(e)}")

    def evaluate_models(self, X_test, y_test):
        """Evaluate all trained models on test data."""
        # if not self.best_estimators:
        #     raise ModelTrainingError("No trained models found. Train models first.")
        
        # for model_name, model in self.best_estimators.items():
        #     try:
        #         # Make predictions
        #         y_pred = model.predict(X_test)

        #         # Calculate metrics
        #         metrics = {
        #             "accuracy": accuracy_score(y_test, y_pred),
        #             "precision": precision_score(y_test, y_pred, average="weighted", zero_division=0),
        #             "recall": recall_score(y_test, y_pred, average="weighted", zero_division=0),
        #             "f1Score": f1_score(y_test, y_pred, average="weighted", zero_division=0)
        #         }

        #         self.model_metrics[model_name].update(metrics)

        #     except Exception as e:
        #         raise ModelTrainingError(f"Error evaluating {model_name}: {str(e)}")

        for model_name, model in self.models.items():
            try:
                y_pred = model.predict(X_test)
                # Calculate metrics
                metrics = {
                    "accuracy": accuracy_score(y_test, y_pred),
                    "precision": precision_score(y_test, y_pred, average="weighted", zero_division=0),
                    "recall": recall_score(y_test, y_pred, average="weighted", zero_division=0),
                    "f1Score": f1_score(y_test, y_pred, average="weighted", zero_division=0)
                }

                self.model_metrics[model_name] = metrics

            except Exception as e:
                raise ModelTrainingError(f"Error evaluating {model_name}: {str(e)}")
            
        self.best_model_name = max(self.model_metrics, key=lambda k: self.model_metrics[k]['f1Score'])
        self.best_model = self.models[self.best_model_name]

        self.save_models()

        return self.model_metrics
    
    def get_model_metrics(self):
        return self.model_metrics
    
    def get_best_model(self):
        return self.best_model_name, self.best_model

    def save_models(self):
        """Save all trained models."""
        # if not self.best_estimators:
        #     raise ModelTrainingError("No trained models found. Train models first.")
        
        # Create directory
        os.makedirs(Config.MODEL_DIR, exist_ok=True)

        # Save each model
        # for model_name, model in self.best_estimators.items():
        for model_name, model in self.models.items():
            model_path = None

            if model_name == "svm": 
                model_path = Config.SVM_MODEL_PATH
            elif model_name == "naiveBayes":
                model_path = Config.NB_MODEL_PATH
            elif model_name == "decisionTree":
                model_path = Config.DT_MODEL_PATH

            if model_path:
                joblib.dump(model, model_path)
            
        return {
            "best_model": self.best_model_name,
            "models": self.model_metrics
        }