from typing import List
from flask import Blueprint, request, jsonify, current_app
import pandas as pd
import io

from app.core.exceptions import ModelTrainingError, DataValidationError, PredictionError
from app.services.prediction_service import PredictionService

prediction_bp = Blueprint('prediction', __name__)

# Create services
prediction_service = PredictionService()

@prediction_bp.route('/train', methods=["POST"])
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
            train_results = prediction_service.train_models(filepath)
            
            return jsonify({
                "status": "success",
                "data": train_results
            }), 200
        
        except Exception as e:
            print(f"ERROR: {str(e)}")
            return jsonify({
                "status": "failed",
                "error": str(e)
        }), 400  
    
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
    

@prediction_bp.route("/predict/batch", methods=["POST"])
def predict_batch():
    """Predict for multiple patients using CSV file."""
    try:
        if "file" not in request.files:
            return jsonify({
                "status": "failed",
                "error": "No dataset file provided.",
            }), 400
        
        file = request.files["file"]

        model_name = request.form.get("modelName", None)

        try:
            filepath = io.StringIO(file.read().decode("utf-8"))
            prediction_results = prediction_service.predict_batch(filepath, model_name)

            return jsonify({
                "status": "success",
                "data": prediction_results
            })

        except Exception as e:
            return jsonify({
                "status": "failed",
                "error": str(e)
            }), 400      

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

@prediction_bp.route("/predict/single", methods=["POST"])
def predict_single_patient():
    """Predict for a single patient using form data"""
    try:
        patient_data = request.get_json()
        
        model_name = None
        if "modelName" in patient_data:
            model_name = patient_data.pop("modelName")
            
        prediction_result = prediction_service.predict_single(patient_data, model_name)

        return jsonify({
            "status": "success",
            "data": prediction_result
        }), 200

    except PredictionError as e:
        return jsonify({
            "status": "failed",
            "error": str(e)
        }), 500
    
