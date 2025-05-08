import joblib
import time
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.svm import SVC
from sklearn.naive_bayes import GaussianNB
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report

from app.config import Config
from app.core.exceptions import ModelTrainingError
from app.pipeline.preprocessor import DataPreprocessor

class ModelTrainer:

    def __init__(self):
        pass