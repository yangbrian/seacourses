"""
    SeaCourses
    ~~~~~~~~~~~~~~
    An alternate course search and planning app for Stony Brook University

    :author: Brian Chen, Kevin Li, Brian Yang
"""

from flask import Flask, render_template, jsonify, Response
from pymongo import MongoClient
import json
from classes.course import Course

app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello World!'

@app.route('/search')
def connect():
    client = MongoClient("mongodb://localhost:27017")
    cursor = client.seacourses.courseInfo.find()

    courses = []
    for course in cursor:
        courses.append(Course(course))

    def serialize(obj):
        return obj.__dict__

    return Response(response=json.dumps(courses, default=serialize),
                    status=200,
                    mimetype="application/json")

# This is just to make sure the mongo table is correct. which it isn't. for now. :'(
@app.route('/test')
def test():
    # client = MongoClient("mongodb://localhost:27017")
    # cursor = client.seacourses.courseInfo.find()
    # html = "<table>"
    # html += "<tr><td>Dept Code</td><td>Name</td><td>ID</td>"
    #
    # for document in cursor:
    #     if len(document["name"]) < 1:
    #         html += "<tr>"
    #         html += "<td>" + document["deptCodeNum"] + "</td>"
    #         html += "<td>" + document["name"] + "</td>"
    #         html += "<td>" + document["_id"] + "</td>"
    #         html += "</tr>"
    # html += "</table"
    # return html
    client = MongoClient("mongodb://localhost:27017")
    return render_template('index.html',
                           courses=client.seacourses.courseInfo.find())

@app.route('/schedule')
def schedule():
    return render_template('schedule.html')

if __name__ == '__main__':
    app.run(debug=True)
