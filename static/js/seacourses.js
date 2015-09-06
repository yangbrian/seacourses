/**
 * Main script for SeaCourses
 */

var courses = [];
var selectedCourses = [];
var searchedCourses = [];
$(document).ready(function() {
    $.getJSON( '/search', function( data ) {
        $.each( data, function( key, val ) {
            courses.push(val);
        });
        
        selectedCourses.push(courses[0]);
        selectedCourses.push(courses[1]);
        selectedCourses.push(courses[2]);
        selectedCourses.push(courses[3]);
    });
});

function calculateTimeBlock(time) {

    var matches = time.match(/(\d{1,2}):(\d{2})([AP]M)/);
    var row = ((
            (parseInt(matches[1]) + ((matches[3] == 'AM' && parseInt(matches[1]) == 12)
            || (matches[3] == 'PM' && parseInt(matches[1]) != 12) ? 12 : 0))
            + (matches[2] == '00' ? 0 :.5)
        ) - 8) * 2;

    return row;
}

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
    });


}

function search()
{
    var dept = 'ESE';
    var deptCode = '123';
    var name = '';
    var dec = '';
    var sbc = '';
    var prof = '';
    var days = '';
    var start = '';
    var end = '';

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
            if (courses[prof].toLowerCase().trim() != prof.toLowerCase().trim())
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
}

function parseCourses(i) {
    var obj = courses[i];

    var newTableRow = $('<tr>');
    newTableRow.addClass('tableCourses');
    var newTableCheck = $('<td>');
    newTableCheck.addClass('tableCheck');
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
    var newTableDays = $('<td>');
    newTableDays.addClass('tableDays');
    var newTableStart = $('<td>');
    newTableStart.addClass('tableStart');
    var newTableEnd = $('<td>');
    newTableEnd.addClass('tableEnd');

    newTableCheck.append($('<input type="checkbox" id="checkbox_' + obj.id + '" onclick="toggleClass(' + obj.id + ');">'));
    newTableDepartment.append(obj.dept);
    newTableCourseCode.append(obj.code);
    newTableCourseName.append(obj.name);
    newTableDEC.append(obj.dec);
    newTableSBC.append(obj.sbcs);
    newTableProfessor.append(obj.prof);
    newTableDays.append(obj.days);
    newTableStart.append(obj.start);
    newTableEnd.append(obj.end);

    newTableRow.append(newTableCheck);
    newTableRow.append(newTableDepartment);
    newTableRow.append(newTableCourseCode);
    newTableRow.append(newTableCourseName);
    newTableRow.append(newTableDEC);
    newTableRow.append(newTableSBC);
    newTableRow.append(newTableProfessor);
    newTableRow.append(newTableDays);
    newTableRow.append(newTableStart);
    newTableRow.append(newTableEnd);

    $('#bigTable').append(newTableRow);
}

var courses = [];
var selectedCourses = [];
var searchedCourses = [];
$(document).ready(function() {
    $.getJSON( '/search', function( data ) {
        $.each( data, function( key, val ) {
            courses.push(val);
        });

        //selectedCourses.push(courses[0]);
        //selectedCourses.push(courses[1]);
        //selectedCourses.push(courses[2]);
        //selectedCourses.push(courses[3]);

        $('.searchField').hide();

        $('#searchBox').change(function() {
            var $valueOfDiv= $(this).find('option:selected').val();
            $('#' + $valueOfDiv + 'Search').toggle();
            $('#searchBox').val('selectDropDown');
        });

        $('#clearButton').click(function() {
            $('.searchField').hide();
        });

        $('.searchField').hide();

        var i;
        for (i = 0; i < 2000; i++) {
            parseCourses(i);
        }

        $('#searchBox').change(function() {
            var $valueOfDiv= $(this).find('option:selected').val();
            $('#' + $valueOfDiv + 'Search').toggle();
            $('#searchBox').val('selectDropDown');
        });

        $('#clearButton').click(function() {
            $('.searchField').hide();
        });
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

        listElement.addClass('list-group-item selectedClassItem');
        listElement.append($('<button type="button" class="btn" name="' + course.id + '" onclick="removeSelectedCLass(this);">&#10006</button>'));
        string += course.dept + course.code + ' - ' + course.name;
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