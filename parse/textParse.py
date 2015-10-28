"""
    SeaCourses
    ~~~~~~~~~~~~~~
    An alternate course search and planning app for Stony Brook University

    :author: Brian Yang and Brian Chen

    textParse.py - this script will read the text file (converted from a pdf) of SBU course listings,
        parse each line into relevant information, and write into mongodb
"""
import csv
from pymongo import MongoClient

def is3LetterWord(str):
    if len(str) != 3:
        return False
    else:
        return str.isalpha()

def is3Numbers(str):
    if len(str) != 3:
        return False
    else:
        return str.isnumeric()

def is5Numbers(str):
    if len(str) != 5:
        return False
    else:
        return str.isnumeric()

def saveToDatabase(data):
    #Connect to mongodb client
    client = MongoClient('localhost', 27017)

    #Get the database
    db = client.seacourses

    #Get the collection
    collection = db.s16courses

    #Save a new document into the collection
    collection.insert_one(data)

    # if len(data['name']) == 0:
    # if data['deptCodeNum'] == 'AAS327':
    #     print(data)

# Open the text doc with all the class information
textDoc = open('../schedules/spring2016.txt', 'r')
currentData = {'_id': 0, 'deptCodeNum': '', 'name': '', 'prof': '', 'days': '', 'startTime': '', 'endTime': '',
               'room': '', 'dec': '', 'sbcs': '', 'type': '', 'prereqs': '', 'credits': ''}
for i in range(0, 10000):
    # Bad practice above, I know. I'm too lazy to change to a "while there is a next line" thing...lol
    textString = textDoc.readline()
    split = textString.split()
    length = len(split)
    if length > 1:
        # Disregard everything after a '#', until a DEPT code comes up
        # '_id' refers to the course code. It will be the unique key for mongoDB
        if split[0].find('#') != -1:
            currentData = {'_id': 0, 'deptCodeNum': '', 'name': '', 'prof': '', 'days': '', 'startTime': '', 'endTime': '',
                           'room': '', 'dec': '', 'sbcs': '', 'type': '', 'prereqs': '', 'credits': ''}

        # Department code - start of a new class
        elif is3LetterWord(split[0]) and is3Numbers(split[1]):
            deptCodeNum = split[0] + split[1]
            if currentData['deptCodeNum'] != deptCodeNum:
                currentData = {'_id': 0, 'deptCodeNum': deptCodeNum, 'name': '', 'prof': '', 'days': '',
                               'startTime': '', 'endTime': '', 'loc': '', 'dec': '', 'sbcs': '', 'type': '', 'prereqs': '',
                               'credits': ''}
                if length > 2:
                    if (len(split[2]) == 1 and textString.find('Credit') == -1) or len(split[2]) == 2:
                        currentData['dec'] = split[2]
                        nextLine = textDoc.readline()
                        while len(nextLine.split()) == 0:
                            nextLine = textDoc.readline()
                        index = nextLine.find('Advisory') if nextLine.find('Advisory') != -1 else nextLine.find('Prerequisite')
                        if index == -1:
                            currentData['name'] = nextLine
                        else:
                            currentData['name'] = nextLine[:index]
                            currentData['prereqs'] = '' if nextLine.find('Advisory') != -1 else nextLine[index + 15:]
                            print(currentData)
                    else:
                        currentData['name'] = ''
                        count = 2
                        while count < length and split[count].find('Credit') == -1:
                            currentData['name'] = currentData['name'] + split[count] + ' '
                            count += 1
                        if count < length and split[count].find('Credit') != -1:
                            currentData['credits'] = split[count + 1]

                else:
                    nextLine = textDoc.readline()
                    if len(nextLine.split()) == 1:
                        currentData['dec'] = nextLine
                        currentData['name'] = textDoc.readline()
                    else:
                        currentData['name'] = nextLine

        # Credit and SBC Line
        elif split[0].find('Credit') != -1:
            currentData['credits'] = split[1]
            for k in range(3, len(split)):
                currentData['sbcs'] += split[k]

        #Prereqs line
        elif split[0].find('Prereq') != -1:
            for k in range(1, len(split)):
                currentData['prereqs'] += split[k] + ' '

        # Course Code Time...
        elif len(split[0]) == 5 and split[0].isnumeric() and currentData['deptCodeNum'] != '':
            # Clear all fields first...
            currentData['_id'] = ''
            currentData['type'] = ''
            currentData['days'] = ''
            currentData['startTime'] = ''
            currentData['endTime'] = ''
            currentData['prof'] = ''
            currentData['loc'] = ''

            currentData['_id'] = split[0]
            currentData['type'] = split[1] + ' ' + split[2]
            currentData['days'] = split[3]
            currentData['startTime'] = split[4][0:5]
            currentData['endTime'] = split[4][6:]
            if currentData['endTime'].find('PM') != -1:
                if currentData['endTime'] == '12:50PM' or currentData['endTime'] == '12:23PM' or currentData['endTime'] == '12:55PM':
                    currentData['startTime'] += 'AM'
                else:
                    currentData['startTime'] += 'PM'
            else:
                currentData['startTime'] += 'AM'


            if length > 4:
                if not split[5].isupper():
                    currentData['prof'] = split[5]
                elif split[5] != 'TBA':
                    count = 5
                    while split[count].isupper() and split[count] != 'TBA':
                        currentData['loc'] = currentData['loc'] + split[count] + ' '
                        count += 1
                    if split[count].isnumeric():
                        currentData['loc'] += split[count]
                        count += 1
                    for word in split[count:]:
                        currentData['prof'] += word + ' '
            saveToDatabase(currentData)
print("Done!")