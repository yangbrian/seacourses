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

# This is just to make sure the mongo table is correct. which it isn't. for now. :'(
@app.route('/test')
def test():
    client = MongoClient("mongodb://localhost:27017")
    cursor = client.seacourses.courseInfo.find()
    html = "<table>"
    html += "<tr><td>Dept Code</td><td>Name</td><td>ID</td>"

    for document in cursor:
        if len(document["name"]) < 1:
            html += "<tr>"
            html += "<td>" + document["deptCodeNum"] + "</td>"
            html += "<td>" + document["name"] + "</td>"
            html += "<td>" + document["_id"] + "</td>"
            html += "</tr>"
    html += "</table"
    return html

if __name__ == '__main__':
    app.run(debug=True)
