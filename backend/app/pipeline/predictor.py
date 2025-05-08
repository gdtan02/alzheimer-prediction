import joblib
import pandas as pd
import time

from app.config import Config
from app.core.exceptions import PredictionError
from app.pipeline.preprocessor import DataPreprocessor

class Predictor:

    def __init__(self):
        pass