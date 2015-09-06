var courses = [];
var arrayOfSchedules = [];

$(document).ready(function() {


    $.getJSON( '/search', function( data ) {
        $.each(data, function (key, val) {
            courses.push(val);
        });
    });
});

function search(code)
{
    if (!code || code.length != 6)
        return;

    var dept = code.substr(0, 3);
    var deptCode = code.substr(3);
    var classes = [];

    for (var i = 0; i < courses.length; i++)
    {
        if (courses[i].dept.toLowerCase() != dept.toLowerCase())
            continue;
        if (courses[i].code != deptCode)
            continue;
        classes.push(courses[i]);
    }
    return classes;
}

function scheduleBuild()
{
    var classCodes = [];
    var courses = [];
    var resultSet = [];

    var sched = null;
    var i = 0;
    var j = 0;
    var k = 0;
    var x = 0;
    var y = 0;
    var z = 0;

    for (i = 1; i < 7; i++)
    {
        var input = $('input[name=class' + i + ']').val();
        if (input && input.length == 6)
            classCodes.push(input);
    }
    for (i = 0; i < classCodes.length; i++)
    {
        courses.push(search(classCodes[i]));
    }
    //It is 5AM. I am too tired to figure out a better solution LOL sorry
    switch (courses.length)
    {
        case 1:
            for (i = 0; i < courses[0].length; i++)
            {
                sched = createSchedule([courses[0][i]]);
                if (sched != null && sched != false)
                {
                    var res = {'schedule': sched, 'classes': [courses[0][i]]};
                    resultSet.push(res);
                }
            }
            break;
        case 2:
            for (i = 0; i < courses[0].length; i++)
            {
                for (j = 0; j < courses[1].length; j++)
                {
                    sched = createSchedule([courses[0][i], courses[1][j]]);
                    if (sched != null && sched != false)
                    {
                        var res = {'schedule': sched, 'classes': [courses[0][i], courses[1][j]]};
                        resultSet.push(res);
                    }
                }
            }
            break;
        case 3:
            for (i = 0; i < courses[0].length; i++)
            {
                for (j = 0; j < courses[1].length; j++)
                {
                    for (k = 0; k < courses[2].length; k++)
                    {
                        sched = createSchedule([courses[0][i], courses[1][j], courses[2][k]]);
                        if (sched != null && sched != false)
                        {
                            var res = {'schedule': sched, 'classes': [courses[0][i], courses[1][j], courses[2][k]]};
                            resultSet.push(res);
                        }
                    }
                }
            }
            break;
        case 4:
            for (i = 0; i < courses[0].length; i++)
            {
                for (j = 0; j < courses[1].length; j++)
                {
                    for (k = 0; k < courses[2].length; k++)
                    {
                        for (x = 0; x < courses[3].length; x++)
                        {
                            sched = createSchedule([courses[0][i], courses[1][j], courses[2][k]]);
                            if (sched != null && sched != false) {
                                var res = {'schedule': sched, 'classes': [courses[0][i], courses[1][j], courses[2][k], courses[3][x]]};
                                resultSet.push(res);
                            }
                        }
                    }
                }
            }
            break;
        case 5:
            for (i = 0; i < courses[0].length; i++)
            {
                for (j = 0; j < courses[1].length; j++)
                {
                    for (k = 0; k < courses[2].length; k++)
                    {
                        for (x = 0; x < courses[3].length; x++)
                        {
                            for (y = 0; y < courses[4].length; y++)
                            {
                                sched = createSchedule([courses[0][i], courses[1][j], courses[2][k]]);
                                if (sched != null && sched != false)
                                {
                                    var res = {'schedule': sched, 'classes': [courses[0][i], courses[1][j], courses[2][k], courses[3][x], courses[4][y]]};
                                    resultSet.push(res);
                                }
                            }
                        }
                    }
                }
            }
            break;
        case 6:
            for (i = 0; i < courses[0].length; i++)
            {
                for (j = 0; j < courses[1].length; j++)
                {
                    for (k = 0; k < courses[2].length; k++)
                    {
                        for (x = 0; x < courses[3].length; x++)
                        {
                            for (y = 0; y < courses[4].length; y++)
                            {
                                for (z = 0; z < courses[5].length; z++)
                                {
                                    sched = createSchedule([courses[0][i], courses[1][j], courses[2][k]]);
                                    if (sched != null && sched != false)
                                    {
                                        var res = {'schedule': sched, 'classes': [courses[0][i], courses[1][j], courses[2][k], courses[3][x], courses[4][y], courses[5][z]]};
                                        resultSet.push(res);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            break;
        default:
            break;
    }
    displaySchedules(resultSet);
}

function createSchedule(courses)
{
    //var string = '';
    //for (var i = 0; i < courses.length; i++)
    //{
    //    string += courses[i].id + ' ';
    //}
    //console.log(string);
//possible schedule to be built. 5 days a week
    var scheduleArray =  new Array(5);

    //possible schedule to be built. 28 time slots a day
    for (var a = 0; a < scheduleArray.length; a++) {
        scheduleArray[a] = new Array(28);
        //fill all time slots with 0. this means there are no class conflicts
        for (var b = 0; b < scheduleArray[a].length; b++) {
            scheduleArray[a][b] = 0;
        }
    }

    for (var y = 0; y < courses.length ; y++) {
        //there are 5 arrays. one for each day
        for (var e = calculateTimeBlock(courses[y].start); e < calculateTimeBlock(courses[y].end); e++) {
            //add in the time slot to the appropriate day
            var days = courses[y].days;
            if (days.indexOf('M') > -1) {
                if (scheduleArray[0][e] == 1) {
                    return false;
                }
                else
                    scheduleArray[0][e]= 1;
            }
            if (days.indexOf('TU') > -1) {
                if (scheduleArray[1][e] == 1) {
                    return false;
                }
                else
                    scheduleArray[1][e]= 1;
            }
            if (days.indexOf('W') > -1) {
                if (scheduleArray[2][e] == 1) {
                    return false;
                }
                else
                    scheduleArray[2][e]= 1;
            }
            if (days.indexOf('TH') > -1) {
                if (scheduleArray[3][e] == 1) {
                    return false;
                }
                else
                    scheduleArray[3][e]= 1;
            }
            if (days.indexOf('F') > -1) {
                if (scheduleArray[4][e] == 1) {
                    return false;
                }
                else
                    scheduleArray[4][e]= 1;
            }
        }
    }
    return scheduleArray;
}

function calculateTimeBlock(time) {

    // break the time string into parts
    var matches = time.match(/(\d{1,2}):(\d{2})([AP]M)/);

    // time = :00 means its right on the hour, no class ends right on the hour
    // time = :53 means it ends right before the hour, so +1. No class starts at :53.
    // time = :30 means it starts at half hour. No class ends then.
    // anything else is considered half hour (:20 or :23)

    var row = ((

            // convert to 24 hour clock
            (parseInt(matches[1]) + ((matches[3] == 'AM' && parseInt(matches[1]) == 12)
            || (matches[3] == 'PM' && parseInt(matches[1]) != 12) ? 12 : 0))

            + (matches[2] == '00' ? 0 : // starts on the hour
                (matches[2] == '53' || matches[2] == '50') ? 1 :  // ends before the hour
                    .5)
        ) - 8) * 2;

    return row;
}

function displaySchedules(resultSet)
{
    console.log(resultSet);
    for (var x = 0; x < resultSet.length; x++)
    {
        var poop = '';
        for (var y = 0; y < resultSet[x].classes.length; y++)
        {
            poop += resultSet[x].classes[y].id + ' ';
        }
        console.log(poop);
    }
    //Only display first five. I am tired. -BC
    var count = resultSet.length;
    for (var i = 0; i < (count > 5 ? 5 : count); i++)
    {
        var newList = $('<ul>');
        newList.addClass('list-group');

        for (var j = 0; j < resultSet[i].classes.length; j++)
        {
            var newListItem = $('<li>');
            newListItem.addClass('list-group-item selectedClassItem');

            var courseObj = resultSet[i].classes[j];
            var string = courseObj.dept + courseObj.code + ' (' + courseObj.days + ', ' +
                courseObj.start + ' - ' + courseObj.end + ')';

            newListItem.append(string);
            newList.append(newListItem);
        }
        $('#resultDiv').append(newList);
    }
}
