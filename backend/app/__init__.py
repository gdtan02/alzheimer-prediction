from flask import Flask
from flask_cors import CORS
import logging
import os

from app.config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    config_class.init_app(app)

    CORS(app)

    # Register blueprints
