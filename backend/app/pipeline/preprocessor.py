import pandas as pd
import numpy as np
import os
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.utils.validation import check_is_fitted
from scipy.stats import skew
import joblib

from app.config import Config
from app.core.exceptions import DataValidationError, DataPreprocessingError, ModelNotFoundError

class DataPreprocessor:

    def __init__(self):
        self.num_features = Config.NUMERICAL_FEATURES
        self.cat_features = Config.CATEGORICAL_FEATURES
        self.target = Config.TARGET_COLUMN
        self.preprocessor: ColumnTransformer = None

    def prepare_training_data(self, df, test_size = 0.2):
        """Clean the data and split the dataset into training set and testing set and return them respectively."""
        try:
            # Validate the input data
            self._validate_data(df, for_training=True)

            # Clean the data
            cleaned_df = self._clean_data(df, for_training=True)

            # Train-test-split
            df_train, df_test = train_test_split(cleaned_df, test_size=test_size, random_state=Config.RANDOM_STATE, stratify=cleaned_df[self.target])

            return df_train, df_test

        except Exception as e:
            print(f"ERROR: {str(e)}")
            raise DataPreprocessingError("Error while preparing the training data.")
        
    def prepare_prediction_data(self, df):
        """Validate and clean the data and return the cleaned data as dataframe object."""
        try:
            # Validate the input data
            self._validate_data(df, for_training=False)

            # Clean the data
            cleaned_df = self._clean_data(df, for_training=False)

            return cleaned_df
        
        except Exception as e:
            raise DataPreprocessingError("Error while preparing the prediction data.")

    def fit_transform(self, df):
        """Fit the preprocessing pipeline to the data and transform it. Please esure the dataset provided has been cleaned, call the `prepare_training_data` to clean the data first."""
        try: 
            X = df.drop(columns=[self.target], errors='ignore')
            y = df[self.target] if self.target in df.columns else None

            # Create preprocessing pipeline
            self.preprocessor = self._create_preprocessor(X)
            X_transformed = self.preprocessor.fit_transform(X)

            # Convert to DataFrame with column names
            feature_names = self.preprocessor.get_feature_names_out()
            X_processed = pd.DataFrame(X_transformed, index=X.index, columns=feature_names)

            self.save()

            return X_processed, y
        
        except Exception as e:
            print(f"ERROR: {str(e)}")
            raise DataPreprocessingError("Error while 'fit_transform' the dataset.")

    def transform(self, df, for_training=False):
        """Transform new data using fitted preprocessing pipeline. Please ensure the dataset provided has been cleaned."""
        if self.preprocessor is None:
            try: 
                self.preprocessor = self.load()
            except Exception as e:
                raise DataPreprocessingError("Preprocessor must be fitted before transform can be called.")

        try: 
            # Transform the data
            if for_training:      
                X = df.drop(columns=[self.target], errors='ignore')
                y = df[self.target]
            else:
                X = df
                y = None

            X_transformed = self.preprocessor.transform(X)

            # Convert to Dataframe
            feature_names = self.preprocessor.get_feature_names_out()
            X_processed = pd.DataFrame(X_transformed, index=X.index, columns=feature_names)

            return X_processed, y
        
        except Exception as e:
            print("ERROR:", str(e))
            raise DataPreprocessingError("Error while 'transform' the dataset.")
    
    def load(self, filepath=None):
        """Load the preprocessor."""
        if filepath is None:
            filepath = os.path.join(Config.MODEL_DIR, "preprocessor.pkl")

        if not os.path.exists(filepath):
            raise ModelNotFoundError(f"Preprocessor file not found.")
        
        self.preprocessor = joblib.load(filepath)
        return self.preprocessor
    
    def save(self, filepath=None):
        """Save the preprocessor"""
        if self.preprocessor is None:
            raise DataPreprocessingError("Preprocessor must be fitted before it can be saved.")
        
        if filepath is None:
            filepath = os.path.join(Config.MODEL_DIR, "preprocessor.pkl")

        # Ensure directory exists
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        joblib.dump(self.preprocessor, filepath)
        return filepath
    

    def _validate_data(self, df: pd.DataFrame, for_training=False):
        """Validate that the data has all required columns and format."""
        # Check that dataframe is not empty
        if df.empty:
            raise DataValidationError("Input dataframe is empty.")
        
        # Check that dataframe has all required feature columns
        if for_training:
            required_columns = Config.FEATURES_WITH_TARGET
        else:
            required_columns = Config.FEATURES

        missing_columns = [col for col in required_columns if col not in df.columns]

        # If missing, check if 'BIRHTYR' is available when 'AGE' is missing
        if "AGE" in missing_columns and "BIRTHYR" in df.columns:
            missing_columns.remove("AGE")

        if missing_columns:
            raise DataValidationError(f"Missing required columns: {', '.join(missing_columns)}")

    def _calculate_age(self, df):
        """Calculate the age from the birth year."""
        df = df.copy()

        if "BIRTHYR" not in df.columns:
            raise DataValidationError("Cannot calculate age: 'BIRTHYR' column is missing.")
        
        current_year = 2025
        df["AGE"] = current_year - df["BIRTHYR"]

        return df
    
    def _replace_invalid_values_with_na(self, df):
        """Clean the data by replacing invalid values with NaN"""
        df = df.copy()

        replace_na = {
            "SEX": [99, -4],  # Only 1=Male, 2=Female are valid
            "EDUC": [99, -4],  # 99=Unknown, -4=Not applicable
            "UDSBENTC": [95, 96, 97, 98, -4],  # Special codes
            "MOCATRAI": [95, 96, 97, 98, -4],  # Special codes
            "AMNDEM": [-4],  # -4=Not applicable
            "NACCPPAG": [-4],  # -4=Not applicable
            "AMYLPET": [8, -4],  # 8=Unknown/not assessed, -4=Not applicable
            "DYSILL": [-4],  # -4=Not applicable
            "DYSILLIF": [-4],  # -4=Not applicable (keeping 7 and 8 as they are meaningful)
        }

        for col, invalid_vals in replace_na.items():
            if col in df.columns:
                df[col] = df[col].replace(invalid_vals, np.nan)

        return df
    
    def _validate_data_ranges(self, df):
        """Validate values are within expected ranges."""
        validation_ranges = {
            "SEX": [1, 2],
            "EDUC": list(range(0, 37)),  # 0-36
            "UDSBENTC": list(range(0, 18)),  # 0-17
            "MOCATRAI": [0, 1],
            "AMNDEM": [0, 1, 8],  # Including 8 as valid
            "NACCPPAG": [1, 2, 3, 4, 7, 8],
            "AMYLPET": [0, 1],
            "DYSILL": [0, 1],
            "DYSILLIF": [1, 2, 3, 7, 8],  # Including 7, 8 as valid
            "NACCUDSD": [1, 2, 3, 4]
        }

        for col, allowed_values in validation_ranges.items():
            if col in df.columns:
                if len(allowed_values) > 10:  # Continuous range
                    min_val, max_val = min(allowed_values), max(allowed_values)
                    invalid_mask = (df[col] < min_val) | (df[col] > max_val)
                    if invalid_mask.any():
                        df.loc[invalid_mask, col] = df.loc[invalid_mask, col].clip(min_val, max_val)
                else:  # Categorical
                    invalid_mask = ~df[col].isin(allowed_values)
                    if invalid_mask.any():
                        mode_value = df.loc[~invalid_mask, col].mode(dropna=True)[0]
                        df.loc[invalid_mask, col] = mode_value

        return df
    
    def _select_features(self, df, for_training):
        """Select relevant features for Alzheimer's prediction."""
        if for_training:
            selected_columns = Config.FEATURES_WITH_TARGET
        else:
            selected_columns = Config.FEATURES

        available_columns = [col for col in selected_columns if col in df.columns]
        return df[available_columns].copy()

    def _clean_data(self, df, for_training):
        """Clean the data"""
        try:
            # 1. Calculate age
            if "AGE" not in df.columns and "BIRTHYR" in df.columns:
                df = self._calculate_age(df)

            # 2. Replace invalid values
            df = self._replace_invalid_values_with_na(df)

            # 3. Validate data ranges
            df = self._validate_data_ranges(df)

            # 4. Feature selection
            df = self._select_features(df, for_training)
            return df
        
        except Exception as e:
            raise DataValidationError(f"Data cleaning failed: {str(e)}")

    
    def _create_preprocessor(self, X):
        """Preprocessing pipeline for transforming the features"""
        # Check missing values
        missing_cols = X.columns[X.isna().any()].tolist()


        # Determine imputation strategy based on skewness
        median_features = []
        mean_features = []

        for col in missing_cols:
            if col in self.num_features:
                skewness = skew(X[col], axis=0, bias=True, nan_policy="omit")
                if abs(skewness) > 0.5:
                    median_features.append(col)
                else:
                    mean_features.append(col)
        
        # Separate features for different imputation strategies
        numeric_median = [col for col in median_features if col in self.num_features]
        numeric_mean = [col for col in mean_features if col in self.num_features]

        # Create preprocessing steps
        preprocessor_steps = []
        
        if numeric_median:
            preprocessor_steps.append(("num_median", Pipeline(steps=[
                ("median_imputer", SimpleImputer(strategy="median")),
                ("scaler", StandardScaler())
            ]), numeric_median))
        
        if numeric_mean:
            preprocessor_steps.append(("num_mean", Pipeline(steps=[
                ("mean_imputer", SimpleImputer(strategy="mean")),
                ("scaler", StandardScaler())
            ]), numeric_mean))

        if self.cat_features:
            preprocessor_steps.append(("cat", Pipeline(steps=[
                ("mode_imputer", SimpleImputer(strategy="most_frequent")),
                ("onehot", OneHotEncoder(handle_unknown="ignore"))
            ]), self.cat_features))

        
        self.preprocessor = ColumnTransformer(
            preprocessor_steps,
            remainder="passthrough",
            verbose_feature_names_out=False
        )

        return self.preprocessor