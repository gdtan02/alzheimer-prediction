from flask import Blueprint, request, jsonify, current_app
import pandas as pd
import io

from app.services.visualization_service import VisualizationService
from app.core.exceptions import DataPreprocessingError, DataValidationError

visualization_bp = Blueprint('visualizations', __name__)

visualization_service = VisualizationService()

VISUALIZATION_ENDPOINT_MAP = {
    # 'target_distribution': 'get_target_distribution',
    'numerical_features_boxplot': 'get_numerical_features_boxplot',
    'numerical_features_pairplot': 'get_numerical_features_pairplot',
    'numerical_features_violin': 'get_numerical_features_violin',
    'correlation_heatmap': 'get_correlation_heatmap',
    'categorical_vs_target': 'get_categorical_vs_target',
    # 'age_analysis': 'get_age_analysis',
    # 'radar_chart': 'get_radar_chart',
    'feature_importance': 'get_feature_importance',
    # 'combined_dashboard': 'get_combined_dashboard'
}

@visualization_bp.route('/generate/<string:visualization_name>', methods=["POST"])
def generate_single_visualization(visualization_name: str):
    if visualization_name not in VISUALIZATION_ENDPOINT_MAP:
        return jsonify({
            "status": "failed",
            "error": "Invalid visualization specified."
        }), 404
    
    service_method_name = VISUALIZATION_ENDPOINT_MAP[visualization_name]
    return _generate_visualization(service_method_name)


def _generate_visualization(viz_name: str):
    if "file" not in request.files:
        return jsonify({
            "status": "failed",
            "error": "No dataset file provided."
        }), 400
    
    file = request.files["file"]
    model_name = request.form.get("modelName", None)
    
    try:
        # Read CSV data
        csv_data = io.StringIO(file.read().decode('utf-8'))
        df = pd.read_csv(csv_data, skiprows=1)
    
    except pd.errors.EmptyDataError:
        return jsonify({
            "status": "failed",
            "error": "Uploaded CSV file is empty."
        }), 400
    
    except UnicodeDecodeError:
        return jsonify({
            "status": "failed",
            "error": "Failed to decode file."
        }), 400
    
    except Exception as e:
        print("Visualization error: ", str(e))
        return jsonify({
            "status": "failed",
            "error": f"Invalid CSV file format: {str(e)}"
        })
    
    try:
        viz_method = getattr(visualization_service, viz_name)
        base64_image_data = viz_method(df, model_name)

        return jsonify({
            "status": "success",
            "data": {
                "imageData": base64_image_data,
                "contentType": "image/png"
            }
        }), 200
    
    except AttributeError as e:
        print(f"Attribute error when calling {viz_name}: {str(e)}")
        return jsonify({
            "status": "failed",
            "error": "Invalid visualization type."
        }), 400
    
    except DataPreprocessingError as e:
        return jsonify({
            "status": "failed",
            "error": f"Data preprocessing error: {str(e)}"
        })
    
    except Exception as e:
        return jsonify({
            "status": "failed",
            "error": f"An unexpected error occurred when {viz_name}: {str(e)}"
        })