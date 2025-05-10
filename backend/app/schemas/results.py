from typing import Dict, Optional
from uuid import UUID, uuid4
from pydantic import BaseModel

class Metrics(BaseModel):
    f1Score: float
    accuracy: float
    precision: float
    recall: float

class TrainResult(BaseModel):
    id: UUID = uuid4()
    userId: Optional[str] = ""
    filename: Optional[str] = ""
    status: str
    models: Dict[str, Metrics]
    bestModel: str

class PredictionResult(BaseModel):
    NACCID: str
    AGE: int
    SEX: int
    NACCUDSD: int