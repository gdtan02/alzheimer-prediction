class AlzheimersMLException(Exception):
    """Base class for all exception classes"""
    pass

class DataValidationError(AlzheimersMLException):
    pass

class ModelTrainingError(AlzheimersMLException):
    pass

class PredictionError(AlzheimersMLException):
    pass

class ModelNotFoundError(AlzheimersMLException):
    pass

class ConfigurationError(AlzheimersMLException):
    pass