"""
    SeaCourses
    ~~~~~~~~~~~~~~
    An alternate course search and planning app for Stony Brook University

    :author: Brian Yang and Brian Chen
"""

from flask import Flask
from pymongo import MongoClient

app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello World!'

@app.route('/db')
def connect():
    client = MongoClient("mongodb://localhost:27017")
    cursor = client.seacourses.courseInfo.find()
    for document in cursor:
        print(document["name"] + document["_id"])
    return 'Hola2!'

if __name__ == '__main__':
    app.run(debug=True)
