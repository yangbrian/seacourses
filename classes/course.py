__author__ = 'brian'


class Course:
    def __init__(self, course):
        self.id = course['_id']
        self.dept = course['deptCodeNum'][:3]
        self.code = course['deptCodeNum'][3:]
        self.name = course['name']
        self.prof = course['prof']
        self.start = course['startTime']
        self.end = course['endTime']
        self.credits = course['credits']
        self.type = course['type']
        self.loc = course['loc']
        self.days = course['days']
        self.dec = course['dec']
        self.sbcs = course['sbcs']
        self.color = course['color']
        self.lec = course.get('centralLink', '')
