/**
 * SeaCourses
 *
 * Brian Yang
 * Brian Chen
 * Kevin Li
 *
 */

$(document).ready(function() {

    // list of courses in the current search set to iterate by index
    var courses = [];

    // for fast searching by ID (key - ID, value - index in courses array)
    var courseIndex = {};

    var table = $('#course-table');
    var countDisplay = $('.count');
    var count = 0;

    var page = 0;

    var recSelected = false;

    // schedule object used for displaying weekly view and selecting courses
    var schedule = new Schedule();
    var scheduleModal = $('#scheduleModal');

    /**
     * Load courses based on search criteria
     * One time load for each set
     * Pages is done entirely via JavaScript
     */
    function loadCourses(search) {

        search = search ? '?' + search : '';

        $.getJSON( '/search/' + search, function( data ) {

            courses = [];

            $.each(data, function (key, val) {
                courses.push(val);
                courseIndex[val.id] = key;
            });

            count = courses.length;
            page = 0;
            displayCourses();

        });
    }

    /**
     * Display courses in table
     */
    function displayCourses() {

        $('.course').remove();

        countDisplay.text((page * 50 + 1) + ' - ' + Math.min((page + 1) * 50, courses.length) + ' of ' + courses.length);


        console.log(schedule.selectedCourses);

        for (var i = page * 50; i < (page + 1) * 50 && i < courses.length; i++) {
            var course = courses[i];

            table.append(
                $('<tr>').addClass('course')
                    .append($('<td>').addClass('id').text(course.id < 10000 ? '-' : course.id))
                    .append($('<td>').addClass('dept').text(course.dept))
                    .append($('<td>').addClass('code').text(course.code))
                    .append($('<td>').addClass('name').text(course.name))
                    .append($('<td>').addClass('prof').text(course.prof))
                    .append($('<td>').addClass('dec').text(course.dec))
                    .append($('<td>').addClass('sbc').text(course.sbcs))
                    .append($('<td>').addClass('type').text(course.type))
                    .append($('<td>').addClass('days').text(course.days))
                    .append($('<td>').addClass('start').text(course.start))
                    .append($('<td>').addClass('end').text(course.end))
                    .append($('<td>').addClass('location').text(course.loc))
                    .css('border-color', course.color)
                    .attr('data-id', course.id)
                    .attr('data-lec', course.lec)
                    .addClass($.inArray(course, schedule.selectedCourses) > -1 ? 'selected-course' : '')
            )
        }
    }

    // initial course load
    loadCourses();

    table.on('click', 'tr.course', function() {

        // is central lecture
        if($(this).attr('data-id') < 10000)
            return;

        $(this).toggleClass('selected-course');

        if ($(this).attr('data-lec') != '') {

            $('tr.course[data-id=' + $(this).attr('data-lec') + ']').toggleClass('selected-course');

            // add the lecture here to account for the fact that it might be on another page
            if ($(this).hasClass('selected-course'))
                schedule.addCourse(courses[courseIndex[$(this).attr('data-lec')]]);
            else
                schedule.removeCourse(courses[courseIndex[$(this).attr('data-lec')]]);

        }


        if ($(this).hasClass('selected-course'))
            schedule.addCourse(courses[courseIndex[$(this).attr('data-id')]]);
        else
            schedule.removeCourse(courses[courseIndex[$(this).attr('data-id')]]);

    });

    $('.next-page').on('click', function() {
        if ((page + 1) * 50 > courses.length)
            return;

        page++;
        displayCourses();
    });

    $('.prev-page').on('click', function() {
        if (page - 1 < 0)
            return;

        page--;
        displayCourses();
    });

    $('#course-search').on('submit', function(e) {
        e.preventDefault();
        loadCourses($(this).serialize());

        $('.course-field').each(function() {
            if ($(this).val() != '')
                $(this).css('background-color', '#bce6ff');
            else
                $(this).css('background-color', '');
        });
    });

    $('.course-field').on('keypress', function(e) {
        if (e.which == 13)
            $('#course-search').submit();
    });

    scheduleModal.on('show.bs.modal', function (e) {
        schedule.showSchedule();
    });

    scheduleModal.on('hide.bs.modal', function (e) {
        $('.schedule-item').remove();
    });
});

/**
 * Schedule visualizer
 * Will assist with time conflict detection later
 * @constructor
 */
function Schedule() {

    this.selectedCourses = [];
    this.reset();
}

/**
 * Reset the schedule
 */
Schedule.prototype.reset = function() {
    this.schedule = [];

    // start with a blank schedule
    for (var i = 0; i < 7; i++) {
        var day = [];
        for (var j = 0; j < 28; j++)
            day.push(0);

        this.schedule.push(day);
    }
};

/**
 * Display the schedule
 */
Schedule.prototype.showSchedule = function() {

    $.each(this.selectedCourses, function(index, value) {
        var startRow = this.calculateTimeBlock(value.start);

        var endRow = this.calculateTimeBlock(value.end);
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
            $item.css('height', 45*(endRow - startRow));

            var $itemInner = $('<div>');
            $itemInner
                .append('<strong>' + value.dept + value.code + '</strong>')
                .append('<br>')
                .append(value.name)
                .append('<br>')
                .append(value.start + " - " + value.end)
                .append('<br>')
                .append(value.prof)
                .append('<br>')
                .append(value.loc)
                .addClass('schedule-item-content');

            $item.append($itemInner);
            $row.find('.schedule-cell:eq(' + col + ')').append($item);
        });


        //}

    }.bind(this));
};

Schedule.prototype.calculateTimeBlock = function(time) {

    // todo: more flexible way of doing this by simply by rounding up

    // break the time string into parts
    var matches = time.match(/(\d{1,2}):(\d{2})([AP]M)/);

    // time = :00 means its right on the hour
    // time = :53 means it ends right before the hour, so +1. No class starts at :53.
    // time = :30 means it starts at half hour. No class ends then.
    // anything else is considered half hour (:20 or :23)

    var pmOffset = (
        parseInt(matches[1]) + (
            (matches[3] == 'AM' && parseInt(matches[1]) == 12) ||
            (matches[3] == 'PM' && parseInt(matches[1]) != 12)
                ? 12 : 0
        )
    );

    return ((

            // convert to 24 hour clock
            (parseInt(matches[1]) + ((matches[3] == 'AM' && parseInt(matches[1]) == 12)
            || (matches[3] == 'PM' && parseInt(matches[1]) != 12) ? 12 : 0))

            + (matches[2] == '00' ? 0 : // starts on the hour
                (matches[2] == '53' || matches[2] == '50') ? 1 :  // ends before the hour
                    .5)
        ) - 8) * 2 + 1;
};

/**
 * Add a course to the schedule
 * @param course course to add
 * @returns {*} the new number of courses, or false if a time conflict
 */
Schedule.prototype.addCourse = function(course) {
    if(!this.hasConflict(course))
        return this.selectedCourses.push(course);
    else
        return false;
};

Schedule.prototype.removeCourse = function(course) {
    this.selectedCourses.splice($.inArray(course, this.selectedCourses), 1);
};


Schedule.prototype.hasConflict = function(course) {
    // todo
};
