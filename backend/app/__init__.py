from flask import Flask
from flask_cors import CORS
import logging
import os

from app.config import Config
from app.routes import prediction_bp, visualization_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    config_class.init_app(app)

    CORS(app)

    # Register blueprints
    app.register_blueprint(prediction_bp, url_prefix="/api")

    app.register_blueprint(visualization_bp, url_prefix="/api/visualizations")

    return app
