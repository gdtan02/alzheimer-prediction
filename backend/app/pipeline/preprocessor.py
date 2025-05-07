import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from scipy.stats import skew
import joblib

from app.config import Config
from app.core.exceptions import DataValidationError

class DataPreprocessor:

    def __init__(self):
        pass