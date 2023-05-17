from bson import objectid, json_util
from flask import Flask, Response, request, json, jsonify
from pymongo import MongoClient
import logging as log

# set up logging
log.basicConfig(
    filename='app.log', 
    filemode='a', 
    level=log.DEBUG, 
    format='%(asctime)s %(levelname)s:\n%(message)s\n'
)

app = Flask(__name__)

# MongoDB Connection
db = MongoClient('mongodb://localhost:27017/')
db = db['local']
collection = db['sample_sheets']


class MongoAPI:
    def __init__(self):
        # self.client = MongoClient("mongodb://localhost:27017/")
        self.db = db
        self.collection = collection
        self.logger = log.getLogger(__name__)

    def read_all(self):
        self.logger.debug('Reading All Data')
        documents = self.collection.find()
        output = [
            {
                item: data[item] if item != '_id' else str(data[item]) for item in data
            }
            for data in documents
        ]
        return output

    def read_one(self, document_id):
        self.logger.debug(f'Reading Data for ID: {document_id}')
        document_id = objectid.ObjectId(document_id)
        document = self.collection.find_one({'_id': document_id})
        if document:
            output = {item: document[item] if item != '_id' else str(document[item]) for item in document}
            return output
        else:
            return {'Status': 'Document not found.'}

    def write(self, data):
        self.logger.debug('Writing Data')
        response = self.collection.insert_one(data)
        output = {'Status': 'Successfully Inserted',
                  'Document_ID': str(response.inserted_id)}
        return output

    def update(self, document_id, data):
        self.logger.debug(f'Updating Data for ID: {document_id}')
        document_id = objectid.ObjectId(document_id)
        document = self.collection.find_one({'_id': document_id})
        if not document:
            return {'Status': 'Document not found.'}
        filt = {'_id': document_id}
        updated_data = {"$set": data}
        response = self.collection.update_one(filt, updated_data)
        output = {'Status': 'Successfully Updated' if response.modified_count > 0 else "Nothing was updated."}
        return output

    def delete(self, document_id):
        self.logger.debug(f'Deleting Data for ID: {document_id}')
        document_id = objectid.ObjectId(document_id)
        response = self.collection.delete_one({'_id': document_id})
        output = {'Status': 'Successfully Deleted' if response.deleted_count > 0 else "Document not found."}
        return output



@app.route('/')
def base():
    return Response(response=json.dumps({"Status": "Running"}),
                    status=200,
                    mimetype='application/json')



# create a route to read all documents
@app.route('/read/', methods=['GET'])
def read():
    print("Reading Data")
    response = MongoAPI().read_all()
    # print(response)
    return Response(response=json.dumps(response),
                        status=200,
                        mimetype='application/json')


# create a route to read one document based on its ID
@app.route('/read/<document_id>/', methods=['GET'])
def read_one(document_id):
    print("Finding Document with Document ID:", document_id)
    # print(document_id)
    response = MongoAPI().read_one(document_id)
    return Response(response=json.dumps(response),
                    status=200,
                    mimetype='application/json')


@app.route('/write/', methods=['POST'])
def write():
    print("Writing Data")
    data = request.form.to_dict()  # convert multidict to dict
    # data = request.get_json()  # extract JSON data from request body
    print(data)
    response = MongoAPI().write(data)  # store data in MongoDB collection
    return Response(response=json.dumps(response),
                    status=201,
                    mimetype='application/json')


# create a route to update one document based on its ID
@app.route('/update/<document_id>/', methods=['PUT'])
def update(document_id):
    print("Updating Data with Document ID:", document_id)
    data = request.form.to_dict() # convert multidict to dict
    print(data)
    response = MongoAPI().update(document_id, data)  # update document in MongoDB collection
    return Response(response=json.dumps(response),
                    status=200,
                    mimetype='application/json')


# create a route to delete one document based on its ID
@app.route('/delete/<document_id>/', methods=['DELETE'])
def delete(document_id):
    print("Deleting Data with Document ID:", document_id)
    response = MongoAPI().delete(document_id)
    return Response(response=json.dumps(response),
                    status=202,
                    mimetype='application/json')



if __name__ == "__main__":
    app.run(debug=True, use_reloader=True, host='0.0.0.0', port=5001)