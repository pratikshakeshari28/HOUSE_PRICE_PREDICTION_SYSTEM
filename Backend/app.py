from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
from pathlib import Path

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin requests for frontend

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / 'models'

print("BASE_DIR:", BASE_DIR)
print("MODEL_DIR:", MODEL_DIR)
print("Model exists:", (MODEL_DIR / 'house_model.pkl').exists())
print("Options exists:", (MODEL_DIR / 'options.pkl').exists())

# Load Saved Artifacts
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
    
    # Process inputs matching model feature structure
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
    return jsonify({'price': round(prediction, 2)})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)