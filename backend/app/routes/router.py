from typing import List
from flask import Blueprint, request, jsonify, current_app
import pandas as pd
import io

from app.core.exceptions import ModelTrainingError, DataValidationError, PredictionError
from app.pipeline import Predictor
from app.schemas import TrainResult, Metrics, PredictionResult

route_bp = Blueprint('router', __name__)

@route_bp.route('/train', methods=["POST"])
def train_models():
    try:
        if "file" not in request.files:
            return jsonify({
                "status": "failed",
                "error": "No dataset file provided.",
            }), 400
        
        file = request.files["file"]

        try:
            filepath = io.StringIO(file.read().decode('utf-8'))
        
        except Exception as e:
            return jsonify({
                "status": "failed",
                "error": str(e)
        }), 400

        # FIXME: Mock results only
        train_results: TrainResult = TrainResult(
            userId = "admin",
            filename = file.name,
            status = "completed",
            models = {
                "svm": Metrics(
                    f1Score=0.942942,
                    accuracy=0.952381,
                    precision=0.934848,
                    recall=0.952381
                ),
                "naiveBayes": Metrics(
                    f1Score=0.766033,
                    accuracy=0.756614,
                    precision=0.858554,
                    recall=0.756614
                ),
                "decisionTree": Metrics(
                    f1Score=0.961434,
                    accuracy=0.957672,
                    precision=0.965769,
                    recall=0.957672
                )
            },
            bestModel="decisionTree"
        )


        return jsonify({
            "status": "success",
            "data": train_results.model_dump()
        }), 200
    
    except ModelTrainingError as e:
        return jsonify({
            "status": "failed",
            "error": str(e)
        }), 500
    
    except DataValidationError as e:
        return jsonify({
            "status": "failed",
            "error": str(e)
        }), 400
    
    except Exception as e:
        return jsonify({
            "status": "failed",
            "error": "An unexpected server error occurred."
        }), 500
    

@route_bp.route("/predict/batch", methods=["POST"])
def predict_batch():
    """Predict for multiple patients using CSV file."""
    try:
        if "file" not in request.files:
            return jsonify({
                "status": "failed",
                "error": "No dataset file provided.",
            }), 400
        
        file = request.files["file"]

        try:
            filepath = io.StringIO(file.read().decode("utf-8"))

        except Exception as e:
            return jsonify({
                "status": "failed",
                "error": str(e)
            }), 400
        
        # FIXME: Mock results only
        prediction_results: List[PredictionResult] = [
            PredictionResult(NACCID="ID0412", NACCUDSD=1).model_dump(),
            PredictionResult(NACCID="ID0523", NACCUDSD=2).model_dump(),
            PredictionResult(NACCID="ID0634", NACCUDSD=3).model_dump(),
            PredictionResult(NACCID="ID0745", NACCUDSD=1).model_dump(),
            PredictionResult(NACCID="ID0856", NACCUDSD=2).model_dump(),
            PredictionResult(NACCID="ID0967", NACCUDSD=4).model_dump(),
            PredictionResult(NACCID="ID1078", NACCUDSD=2).model_dump(),
            PredictionResult(NACCID="ID1189", NACCUDSD=1).model_dump(),
            PredictionResult(NACCID="ID1290", NACCUDSD=3).model_dump()
        ]

        return jsonify({
            "status": "success",
            "data": prediction_results
        })

    except PredictionError as e:
        return jsonify({
            "status": "failed",
            "error": str(e)
        }), 500
    
    except Exception as e:
        return jsonify({
            "status": "failed",
            "error": "An unexpected server error occurred."
        }), 500

@route_bp.route("/predict/single", methods=["POST"])
def predict_single_patient():
    """Predict for a single patient using form data"""
    try:
        patient_data = request.get_json()
        print("data=", patient_data)

        # Validate patient data

        # Make prediction
        predictor = Predictor()
        # result = predictor.predict(patient_data)

        prediction_result: PredictionResult = PredictionResult(NACCID="ID0412", NACCUDSD=1)

        return jsonify({
            "status": "success",
            "data": prediction_result.model_dump()
        }), 200

    except PredictionError as e:
        return jsonify({
            "status": "failed",
            "error": str(e)
        }), 500
    
