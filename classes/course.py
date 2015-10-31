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
        self.color = self.generateColor(self.dept + self.dept)

    def generateColor(self, dept):
        hashcode = 0

        for i in dept:
            hashcode = ord(i) + ((hashcode << 5) - hashcode)

        color = "{0:x}".format((hashcode & 0x00FFFFFF))
        return "00000"[0:6 - len(color)] + color
