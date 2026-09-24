import os
import pickle
from pathlib import Path
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd

load_dotenv()

app = Flask(__name__)
CORS(app)

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / 'models'

HOST = os.getenv('HOST', '127.0.0.1')
PORT = int(os.getenv('PORT', 5000))
DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'

print("BASE_DIR:", BASE_DIR)
print("MODEL_DIR:", MODEL_DIR)
print("Model exists:", (MODEL_DIR / 'house_model.pkl').exists())
print("Options exists:", (MODEL_DIR / 'options.pkl').exists())

with open(MODEL_DIR / 'house_model.pkl', 'rb') as f:
    model = pickle.load(f)

with open(MODEL_DIR / 'options.pkl', 'rb') as f:
    options = pickle.load(f)

@app.route('/api/options', methods=['GET'])
def get_options():
    return jsonify(options)

@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.get_json()
    
    input_data = pd.DataFrame([{
        'Area': float(data['Area']),
        'Bedrooms': int(data['Bedrooms']),
        'Bathrooms': int(data['Bathrooms']),
        'Floors': int(data['Floors']),
        'YearBuilt': int(data['YearBuilt']),
        'Location': data['Location'],
        'Condition': data['Condition'],
        'Garage': data['Garage'],
        'HouseAge': 2026 - int(data['YearBuilt']),
        'TotalRooms': int(data['Bedrooms']) + int(data['Bathrooms'])
    }])

    prediction = model.predict(input_data)[0]
    return jsonify({'price': round(float(prediction), 2)})

if __name__ == '__main__':
    app.run(host=HOST, port=PORT, debug=DEBUG)