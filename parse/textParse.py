"""
    SeaCourses
    ~~~~~~~~~~~~~~
    An alternate course search and planning app for Stony Brook University

    :author: Brian Yang and Brian Chen

    textParse.py - this script will read the text file (converted from a pdf) of SBU course listings,
        parse each line into relevant information, and write into mongodb
"""
from pymongo import MongoClient


# Generate a different color for each dept
# Used for the table border
def generate_color(dept):
    # double length of string for a wider range of colors
    dept += dept

    hashcode = 0

    for i in dept:
        hashcode = ord(i) + ((hashcode << 5) - hashcode)

    color = "{0:x}".format((hashcode & 0xFFFFFF))
    return "00000"[0:6 - len(color)] + color


def is_3letter_word(str):
    if len(str) != 3:
        return False
    else:
        return str.isalpha()


def is_3numbers(str):
    if len(str) != 3:
        return False
    else:
        return str.isnumeric()


def is_5numbers(str):
    if len(str) != 5:
        return False
    else:
        return str.isnumeric()


def save_to_db(data):
    if data['deptCodeNum'] != '':
        # Connect to mongodb client
        client = MongoClient('localhost', 27017)

        # Get the database
        db = client.seacourses

        # Get the collection
        collection = db.s16courses

        # Save a new document into the collection
        collection.insert_one(data)

        # if len(data['name']) == 0:
        # if data['deptCodeNum'] == 'AAS327':
        print(data)

# Open the text doc with all the class information
textDoc = open('../schedules/spring2016.txt', 'r')

currentData = {'_id': 0, 'deptCodeNum': '', 'name': '', 'prof': '', 'days': '', 'startTime': '', 'endTime': '',
               'room': '', 'dec': '', 'sbcs': '', 'type': '', 'prereqs': '', 'credits': '', 'centralLink': 0}
hasCentral = False
centralCount = 0

for i in range(0, 10000):
    # Bad practice above, I know. I'm too lazy to change to a "while there is a next line" thing...lol
    textString = textDoc.readline()
    split = textString.split()
    length = len(split)
    if length > 1:
        # Disregard everything after a '#', until a DEPT code comes up
        # '_id' refers to the course code. It will be the unique key for mongoDB
        # if split[0].find('#') != -1:
        #     currentData = {'_id': 0, 'deptCodeNum': '', 'name': '', 'prof': '', 'days': '', 'startTime': '',
        #                    'endTime': '',
        #                    'room': '', 'dec': '', 'sbcs': '', 'type': '', 'prereqs': '', 'credits': '', 'centralLink': 0}

        # Department code - start of a new class
        if is_3letter_word(split[0]) and is_3numbers(split[1]):
            hasCentral = False

            deptCodeNum = split[0] + split[1]
            if currentData['deptCodeNum'] != deptCodeNum:
                currentData = {'_id': 0, 'deptCodeNum': deptCodeNum, 'name': '', 'prof': '', 'days': '',
                               'startTime': '', 'endTime': '', 'loc': '', 'dec': '', 'sbcs': '', 'type': '',
                               'prereqs': '',
                               'credits': ''}
                if length > 2:
                    # Has the DEC on the same line
                    if (len(split[2]) == 1 and textString.find('Credit') == -1) or len(split[2]) == 2:
                        currentData['dec'] = split[2]
                        nextLine = textDoc.readline()
                        while len(nextLine.split()) == 0:
                            nextLine = textDoc.readline()
                        index = nextLine.find('Advisory') if nextLine.find('Advisory') != -1 else nextLine.find(
                            'Prerequisite')
                        if index == -1:
                            currentData['name'] = nextLine
                        else:
                            currentData['name'] = nextLine[:index]
                            currentData['prereqs'] = '' if nextLine.find('Advisory') != -1 else nextLine[index + 15:]
                            # print(currentData)
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

        # Has a central lecture (multiple labs/recits, one lecture class)
        elif split[0].find('LEC') != -1:
            centralCount += 1
            hasCentral = True

            time = split[3]
            startTime = time[:time.find('-')]
            endTime = time[time.find('-')+1:]
            prof = ''
            if len(split) > 6:
                for z in range(7, len(split)):
                    prof += split[z] + ' '

            newData = {'_id': centralCount,
                       'deptCodeNum': currentData['deptCodeNum'],
                       'name': currentData['name'],
                       'type': 'LEC ' + split[1],
                       'section': split[1],
                       'days': split[2],
                       'startTime': startTime,
                       'endTime': endTime,
                       'loc': '',
                       'prof': prof,
                       'room': '',
                       'dec': currentData['dec'],
                       'sbcs': currentData['sbcs'],
                       'prereqs': '',
                       'credits': '',
                       'centralLink': '',
                       'color': generate_color(currentData['deptCodeNum'][:3])}

            count = 4
            while split[count].isupper() and split[count] != 'TBA':
                newData['loc'] = newData['loc'] + split[count] + ' '
                count += 1
            if split[count].isnumeric():
                newData['loc'] += split[count]
                count += 1
            if len(newData['loc']) == 0:
                newData['loc'] = 'TBA'

            # print(newData['deptCodeNum'] + " " + newData['loc'])

            newData['loc'] = newData['loc'].title()
            newData['color'] = '#' + generate_color(newData['deptCodeNum'][:3])
            save_to_db(newData)

        # Credit and SBC Line
        elif split[0].find('Credit') != -1:
            currentData['credits'] = split[1]
            for k in range(3, len(split)):
                currentData['sbcs'] += split[k]

        # Prereqs line
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
            if hasCentral:
                currentData['centralLink'] = centralCount
            if currentData['endTime'].find('PM') != -1:
                if currentData['endTime'] == '12:50PM' or currentData['endTime'] == '12:23PM' or currentData['endTime'] == '12:55PM':
                    currentData['startTime'] += 'AM'
                else:
                    currentData['startTime'] += 'PM'
            else:
                currentData['startTime'] += 'AM'

            if length > 4 and textString.find('TBA') == -1:
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

            currentData['loc'] = currentData['loc'].title()
            currentData['color'] = '#' + generate_color(currentData['deptCodeNum'][:3])
            save_to_db(currentData)
print("Done!")
