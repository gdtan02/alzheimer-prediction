import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Model paths
    MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'saved_models')
    SVM_MODEL_PATH = os.path.join(MODEL_DIR, "svm_model.pkl")
    NB_MODEL_PATH = os.path.join(MODEL_DIR, "nb_model.pkl")
    DT_MODEL_PATH = os.path.join(MODEL_DIR, "decision_tree_model.pkl")

    # ML pipeline settings
    RANDOM_STATE = 1
    TEST_SIZE = 0.2
    CV_SPLITS = 3

    # Feature configuration
    FEATURES = ['AGE', 'EDUC', 'UDSBENTC', 'SEX', 'MOCATRAI', 'AMNDEM', 'NACCPPAG', 'AMYLPET', 'DYSILL', 'DYSILLIF']
    FEATURES_WITH_TARGET = ['AGE', 'EDUC', 'UDSBENTC', 'SEX', 'MOCATRAI', 'AMNDEM', 'NACCPPAG', 'AMYLPET', 'DYSILL', 'DYSILLIF', 'NACCUDSD']
    NUMERICAL_FEATURES = ['AGE', 'EDUC', 'UDSBENTC']
    CATEGORICAL_FEATURES = ['SEX', 'MOCATRAI', 'AMNDEM', 'NACCPPAG', 'AMYLPET', 'DYSILL', 'DYSILLIF']
    TARGET_COLUMN = 'NACCUDSD'

    # Data validation settings
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
    ALLOWED_EXTENSIONS = {'csv'}

    # Logging
    LOG_LEVEL = 'INFO'
    LOG_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs')

    @staticmethod
    def init_app(app):
        # Create necessary directories
        os.makedirs(Config.MODEL_DIR, exist_ok=True)
        os.makedirs(Config.LOG_DIR, exist_ok=True)

