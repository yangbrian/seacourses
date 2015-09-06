/**
 * Main script for SeaCourses
 */
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

/**
 * Schedule visualizer
 * Will assist with time conflict detection later
 * @constructor
 */
function Schedule() {

    this.schedule = [];

    // start with a blank schedule
    for (var i = 0; i < 7; i++) {
        var day = [];
        for (var j = 0; j < 28; j++)
            day.push(0);

        this.schedule.push(day);
    }



    $.each(selectedCourses, function(index, value) {
        var startRow = calculateTimeBlock(value.start);

        var endRow = calculateTimeBlock(value.end);
        var columns = [];

        var days = value.days;
        if (days.indexOf('SU') > -1)
            columns.push(0);
        if (days.indexOf('M') > -1)
            columns.push(1);
        if (days.indexOf('TU') > -1)
            columns.push(2);
        if (days.indexOf('W') > -1)
            columns.push(3);
        if (days.indexOf('TH') > -1)
            columns.push(4);
        if (days.indexOf('F') > -1)
            columns.push(5);
        if (days.indexOf('S') > -1)
            columns.push(6);


        /**
         * Fill in the class boxes
         */
        //for (var i = startRow; i < endRow; i++) {
            var $row = $('.schedule-row:eq(' + startRow + ')');

            $.each(columns, function(index, col) {
                var $item = $('<div>');
                $item.addClass('schedule-item');
                $item.css('height', 30*(endRow - startRow));

                var $itemInner = $('<div>');
                $itemInner.append(value.dept);
                $itemInner.append(value.code);
                $itemInner.append('<br>');
                $itemInner.append(value.name);
                $item.append($itemInner);
                $row.find('.schedule-cell:eq(' + col + ')').append($item);
            });


        //}

    });

}

function hideSearchField(obj)
{
    jQuery(obj).next().find('input').val('');
    jQuery(obj).parent().hide();
}

function search()
{
    var dept = $('input[name=departmentField]').val();
    var deptCode = $('input[name=courseCodeField]').val();
    var name = $('input[name=courseNameField]').val();
    var dec = $('input[name=decField]').val();
    var sbc = $('input[name=sbcField]').val();
    var prof = $('input[name=professorField]').val();
    var days = $('input[name=daysField]').val();
    var start = $('input[name=startField]').val();
    var end = $('input[name=endField]').val();

    searchedCourses = [];

    for (var i = 0; i < courses.length; i++)
    {
        var split = [];
        var j = 0;
        var hit = true;

        if (dept && dept != '')
            if (courses[i].dept.toLowerCase() != dept.toLowerCase())
                continue;

        if (deptCode && deptCode != '')
            if (courses[i].code != deptCode)
                continue;

        if (name && name != '')
            if (courses[i].name.toLowerCase() != jQuery(name).text())
                continue;

        if (prof && prof != '')
            if (courses[i].prof && courses[i].prof.length > 0 && courses[i].prof.toLowerCase().trim() != prof.toLowerCase().trim())
                continue;

        if (start && start != '')
            if (courses[i].start != start)
                continue;

        if (end && end != '')
            if (courses[i].end != end)
                continue;

        if (dec && dec != '')
        {
            split = dec.split();
            hit = true;
            for (j = 0; j < split.length; j++)
            {
                if (courses[i].dec.indexOf(split[j]) == -1)
                {
                    hit = false;
                    break;
                }
            }
            if (!hit)
                continue;
        }

        if (sbc && sbc != '')
        {
            split = sbc.split();
            hit = true;
            for (j = 0; j < split.length; j++)
            {
                if (courses[i].sbcs.indexOf(split[j]))
                {
                    hit = false;
                    break;
                }
            }
            if (!hit)
                continue;
        }

        if (days && days != '')
        {
            //I'm hard coding. too tired for this.
            if (days.toLowerCase().indexOf('m') != -1)
                if (courses[i].days.indexOf('m') == -1)
                    continue;
            if (days.toLowerCase().indexOf('tu') != -1)
                if (courses[i].days.indexOf('tu') == -1)
                    continue;
            if (days.toLowerCase().indexOf('w') != -1)
                if (courses[i].days.indexOf('w') == -1)
                    continue;
            if (days.toLowerCase().indexOf('th') != -1)
                if (courses[i].days.indexOf('th') == -1)
                    continue;
            if (days.toLowerCase().indexOf('f') != -1)
                if (courses[i].days.indexOf('f') == -1)
                    continue;
        }

        searchedCourses.push(courses[i]);
    }
    redrawCourseTable();
}

function redrawCourseTable() {
    //Wipe out the current table rows
    $.each($('.tableCourses'), function(index, value) {
        value.remove();
    });
    for (var i = 0; i < searchedCourses.length; i++)
    {
        parseCourses(searchedCourses[i]);
    }
}

function showAllCourses() {
    //Wipe out the current table rows
    $.each($('.tableCourses'), function(index, value) {
        value.remove();
    });
    for (var i = 0; i < courses.length; i++)
    {
        parseCourses(courses[i]);
    }
}

function parseCourses(obj) {
    var newTableRow = $('<tr>');
    newTableRow.addClass('tableCourses');
    var newTableCheck = $('<td>');
    newTableCheck.addClass('tableCheck');
    var newTableId = $('<td>');
    newTableId.addClass('tableId');
    var newTableDepartment = $('<td>');
    newTableDepartment.addClass('tableDepartment');
    var newTableCourseCode = $('<td>');
    newTableCourseCode.addClass('tableCourseCode');
    var newTableCourseName = $('<td>');
    newTableCourseName.addClass('tableCourseName');
    var newTableDEC = $('<td>');
    newTableDEC.addClass('tableDEC');
    var newTableSBC = $('<td>');
    newTableSBC.addClass('tableSBC');
    var newTableProfessor = $('<td>');
    newTableProfessor.addClass('tableProfessor');
    var newTableType = $('<td>');
    newTableType.addClass('tableType');
    var newTableDays = $('<td>');
    newTableDays.addClass('tableDays');
    var newTableStart = $('<td>');
    newTableStart.addClass('tableStart');
    var newTableEnd = $('<td>');
    newTableEnd.addClass('tableEnd');

    newTableCheck.append($('<input type="checkbox" id="checkbox_' + obj.id + '" onclick="toggleClass(' + obj.id + ');">'));
    newTableId.append(obj.id);
    newTableDepartment.append(obj.dept);
    newTableCourseCode.append(obj.code);
    newTableCourseName.append(obj.name);
    newTableDEC.append(obj.dec);
    newTableSBC.append(obj.sbcs);
    newTableProfessor.append(obj.prof);
    newTableType.append(obj.type);
    newTableDays.append(obj.days);
    newTableStart.append(obj.start);
    newTableEnd.append(obj.end);

    newTableRow.append(newTableCheck);
    newTableRow.append(newTableId);
    newTableRow.append(newTableDepartment);
    newTableRow.append(newTableCourseCode);
    newTableRow.append(newTableCourseName);
    newTableRow.append(newTableDEC);
    newTableRow.append(newTableSBC);
    newTableRow.append(newTableProfessor);
    newTableRow.append(newTableType);
    newTableRow.append(newTableDays);
    newTableRow.append(newTableStart);
    newTableRow.append(newTableEnd);

    $('#bigTable').append(newTableRow);
}

var courses = [];
var selectedCourses = [];
var searchedCourses = [];
var arrayOfSchedules = new Array();
var possibilities = 1;
$(document).ready(function() {


    $.getJSON( '/search', function( data ) {
        $.each( data, function( key, val ) {
            courses.push(val);
        });

        //selectedCourses.push(courses[0]);
        //selectedCourses.push(courses[1]);
        //selectedCourses.push(courses[2]);
        //selectedCourses.push(courses[3]);

        //createSchedule();

        $('.searchField').hide();

        $('#searchBox').change(function() {
            var $valueOfDiv= $(this).find('option:selected').val();
            $('#' + $valueOfDiv + 'Search').toggle();
            $('#searchBox').val('selectDropDown');
        });

        $('#clearButton').click(function() {
            var fields = $('.searchField');
            fields.find("input").val("");
            fields.hide();
        });

        var i;
        for (i = 0; i < 2000; i++) {
            parseCourses(courses[i]);
        }

        jQuery(document).on('keydown', 'input.inputField', function(e){
            if (e.which === 13)
            {
                search();
            }
        });

        $('#bigTable').on('click', 'tr.tableCourses', function() {
            console.log("Click");
            $(this).find('[type=checkbox]').click();
        });
    });

    $('#scheduleModal').on('show.bs.modal', function (e) {
        new Schedule();
    });

    $('#scheduleModal').on('hide.bs.modal', function (e) {
        $('.schedule-item').remove();
    });
});

function toggleClass(obj)
{
    var course = searchCourseByID(obj);
    var index = selectedCourses.indexOf(course);
    if (index != -1)
        selectedCourses.splice(index, 1);
    else
        selectedCourses.push(course);
    redrawSelectedClasses();
}

function searchCourseByID(id)
{
    for (var i = 0; i < courses.length; i++)
    {
        if (courses[i].id == id)
            return courses[i];
    }
    return null;
}

function redrawSelectedClasses()
{
    $.each($('.selectedClassItem'), function(index, value){
        value.remove();
    });
    for (var i = 0; i < selectedCourses.length; i++)
    {
        var course = selectedCourses[i];
        var listElement = $('<li>');
        var string = '';

        listElement.addClass('selectedClassItem');
        listElement.append($('<button type="button" class="btn btn-danger" name="' + course.id + '" onclick="removeSelectedCLass(this);">&#10006</button>'));
        string += course.dept + course.code + ' - ' + course.name;
        string += '<br/>' + course.days + " " + course.start + "-" + course.end;
        listElement.append(string);

        $('#classList').append(listElement);
    }
}

function removeSelectedCLass(obj)
{
    var name = obj.name;
    selectedCourses.splice(selectedCourses.indexOf(searchCourseByID(name)), 1);
    $('#checkbox_' + name).attr('checked', false);
    jQuery(obj).parent().remove();
}


function createSchedule(courseIDs) {
    //array made for testing
    //var testCourses = new Array(3);
    //for (var z = 0; z < testCourses.length; z++) {
    //    testCourses[z] = courses[z];
    //    //console.log(courses[z]);
    //}

    var testCourses = new Array();
    for (var i = 0; i < courseIDs.length; i++) {
        testCourses.push(searchCourseByID(courseIDs[i]));
    }

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

    for (var y = 0; y < testCourses.length ; y++) {
        //there are 5 arrays. one for each day
        for (var e = calculateTimeBlock(testCourses[y].start); e < calculateTimeBlock(testCourses[y].end); e++) {
            //add in the time slot to the appropriate day
            var days = testCourses[y].days;
            if (days.indexOf('M') > -1) {
                if (scheduleArray[0][e] == 1) {
                    return;
                }
                else
                    scheduleArray[0][e]= 1;
            }
            if (days.indexOf('TU') > -1) {
                if (scheduleArray[1][e] == 1) {
                    return;
                }
                else
                    scheduleArray[1][e]= 1;
            }
            if (days.indexOf('W') > -1) {
                if (scheduleArray[2][e] == 1) {
                    return;
                }
                else
                    scheduleArray[2][e]= 1;
            }
            if (days.indexOf('TH') > -1) {
                if (scheduleArray[3][e] == 1) {
                    return;
                }
                else
                    scheduleArray[3][e]= 1;
            }
            if (days.indexOf('F') > -1) {
                if (scheduleArray[4][e] == 1) {
                    return;
                }
                else
                    scheduleArray[4][e]= 1;
            }

        }

    }
    arrayOfSchedules[possibilities-1] = scheduleArray;
}

function getAllDeptCodes()
{
    var codes = [];
    for (var i = 0; i < courses.length; i++)
    {
        if (codes.indexOf(courses[i].dept) == -1)
            codes.push(courses[i].dept);
    }
    return codes;
}

//function generateCourses() {
//    searchQueries = new Array();
//    var multiCount = 1;
//    //var numbSearch;
//    //for (var b = 0; b < numbSearch; b++) {
//    //    searchQueries[b] = new Array();
//    //}
//    for (var a = 0; a < searchQueries.length; a++) {
//        multiCount = multiCount * searchQueries[a].length;
//    }
//}