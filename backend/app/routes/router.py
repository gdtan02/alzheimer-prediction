from flask import Blueprint, request, jsonify, current_app
import pandas as pd
import io

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
            print("filepath=", filepath)
        
        except Exception as e:
            return jsonify({
            "status": "failed",
            "error": str(e)
        }), 400

        train_results = {
            "id": "TEST",
            "userId": "admin",
            "filename": "test",
            "status": "completed",
            "models": {
                "svm": {
                    "f1Score": 0.102942,
                    "accuracy": 0.102381,
                    "precision": 0.104848,
                    "recall": 0.102381
                },
                "naiveBayes": {
                    "f1Score": 0.766033,
                    "accuracy": 0.756614,
                    "precision": 0.858554,
                    "recall": 0.756614,
                },
                "decisionTree": {
                    "f1Score": 0.961434,
                    "accuracy": 0.957672,"precision": 0.965769,
                    "recall": 0.957672
                }
            },
            "bestModel": "decisionTree"
        }

        return jsonify({
            "status": "success",
            "data": train_results
        }), 200
    
    except Exception as e:
        return jsonify({
            "status": "failed",
            "error": str(e)
        }), 400