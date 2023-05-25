from flask import Flask, request, jsonify
from pymongo import MongoClient
from bson.objectid import ObjectId
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


# MongoDB connection
client = MongoClient('mongodb://localhost:27017/')
db = client['local']
collection = db['sample_sheets']

@app.route('/extract-and-store', methods=['POST'])
def extract_and_store_data():
    try:
        # Get the file path and sheet name from the request
        file_path = request.form.get('file_path')
        sheet_name = request.form.get('sheet_name')

        # Read the Excel file and extract the data
        df = pd.read_excel(file_path, sheet_name=sheet_name)

        df = df.replace({pd.NaT: None})

        data = df.to_dict(orient='records')

        # Insert the extracted data into the MongoDB collection
        result = collection.insert_many(data)

        return f"Data extracted and stored in MongoDB. Inserted {len(result.inserted_ids)} documents."
    except Exception as e:
        return f"Error occurred while extracting and storing data: {e}"


# Create
@app.route('/data', methods=['POST'])
def create_data():
    try:
        data = request.get_json()
        result = collection.insert_one(data)
        return jsonify({'message': 'Data created', 'id': str(result.inserted_id)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Read
@app.route('/data', methods=['GET'])
def get_all_data():
    try:
        print("INSIDE GET")
        data = list(collection.find())
        print(data)
        # Convert ObjectId to string representation
        data = [{**item, '_id': str(item['_id'])} for item in data]
        print(jsonify(data))
        return jsonify(data)
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500

@app.route('/data/<data_id>', methods=['GET'])
def get_data(data_id):
    try:
        data = collection.find_one({'_id': ObjectId(data_id)})
        if data:
            # Convert ObjectId to string representation
            data['_id'] = str(data['_id'])
            return jsonify(data)
        else:
            return jsonify({'message': 'Data not found'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Update
@app.route('/data/<data_id>', methods=['PUT'])
def update_data(data_id):
    try:
        data = request.get_json()
        result = collection.update_one({'_id': ObjectId(data_id)}, {'$set': data})
        if result.modified_count > 0:
            return jsonify({'message': 'Data updated'})
        else:
            return jsonify({'message': 'Data not found'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Delete
@app.route('/data/<data_id>', methods=['DELETE'])
def delete_data(data_id):
    try:
        result = collection.delete_one({'_id': ObjectId(data_id)})
        if result.deleted_count > 0:
            return jsonify({'message': 'Data deleted'})
        else:
            return jsonify({'message': 'Data not found'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)