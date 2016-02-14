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

                // convert course days to number array
                var courseDays = [];
                var days = val.days;
                if (days.indexOf('SU') > -1)
                    courseDays.push(0);
                if (days.indexOf('M') > -1)
                    courseDays.push(1);
                if (days.indexOf('TU') > -1)
                    courseDays.push(2);
                if (days.indexOf('W') > -1)
                    courseDays.push(3);
                if (days.indexOf('TH') > -1)
                    courseDays.push(4);
                if (days.indexOf('F') > -1)
                    courseDays.push(5);
                if (days.indexOf('S') > -1)
                    courseDays.push(6);

                val.daysNum = courseDays;
                val.credits = parseInt(val.credits);

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
                    .addClass(courseSelected(course) ? 'selected-course' : '')
            )
        }
    }

    /**
     * Check if course is already selected
     * @param course course object
     * @returns {boolean} course selected
     */
    function courseSelected(course) {
        if ($.inArray(course, schedule.selectedCourses)  > -1)
            return true;

        var selected = false;
        $.each(schedule.selectedCourses, function (index, value) {
            if (value.id == course.id) {
                selected = true;
                return false;
            }
        });

        return selected;
    }

    // initial course load
    loadCourses();

    table.on('click', 'tr.course', function() {

        // is central lecture
        if($(this).attr('data-id') < 10000) {
            notifications.show('Please select a recitation/lab section instead.')
            return;
        }

        $(this).toggleClass('selected-course');





        var lecRow;
        if ($(this).attr('data-lec') != '') {


            var lecture = courses[courseIndex[$(this).attr('data-lec')]];

            // lecture selected by another recitation already
            if (courseSelected(lecture)) {
                $('tr.course[data-lec=' + $(this).attr('data-lec')  + ']').removeClass('selected-course');
            } else {

            }

            lecRow = $('tr.course[data-id=' + $(this).attr('data-lec') + ']');

            if (!lecRow || !lecRow.hasClass('selected-course')) {

                if (lecRow)
                    lecRow.toggleClass('selected-course');

                // add the lecture here to account for the fact that it might be on another page
                if ($(this).hasClass('selected-course')) {

                    if (!schedule.addCourse(lecture)) {
                        if (lecRow)
                            lecRow.toggleClass('selected-course');
                        return; // don't even bother doing recitation then
                    }
                } else
                    schedule.removeCourse(courses[courseIndex[$(this).attr('data-lec')]]);


            } else {


                $('tr.course[data-lec' + ']')
            }

        }

        if ($(this).hasClass('selected-course')) {
            if (!schedule.addCourse(courses[courseIndex[$(this).attr('data-id')]])) {
                $(this).toggleClass('selected-course');

                if ($(this).attr('data-lec') != '') {
                    // remove the added lecture section
                    lecRow.toggleClass('selected-course');
                    schedule.removeCourse(courses[courseIndex[$(this).attr('data-lec')]]);
                }
            }
        } else
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
    this.creditsDisplay = $('#credit-count');
    this.credits = 0;
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
        var columns = value.daysNum;


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

/**
 * Calculate half hour time block (indexed from 8 am)
 * @param time time to calculate
 * @returns {number} time block for the given time
 */
Schedule.prototype.calculateTimeBlock = function(time) {

    // break the time string into parts
    var matches = time.match(/(\d{1,2}):(\d{2})([AP]M)/);

    // skip 12 blocks if PM
    var pmOffset = (
        parseInt(matches[1]) + (
            (matches[3] == 'AM' && parseInt(matches[1]) == 12) ||
            (matches[3] == 'PM' && parseInt(matches[1]) != 12)
                ? 12 : 0
        )
    );

    // on the hour or half hour
    // 0 - [:00], 0.5 - (:00, :30], 1 - (:30, :00)
    var halfHour = 1;
    if (matches[2] == 0) {
        halfHour = 0;
    } else if (matches[2] <= 30 && matches[2] > 0) {
        halfHour = 0.5;
    }

    // -8 because the earliest time displayed is 8 am
    // double because each block is broken into two (half hour intervals)
    // +1 because the first row in the HTML is actually the header
    return (pmOffset + halfHour -  8) * 2 + 1;
};

/**
 * Add a course to the schedule
 * @param course course to add
 * @returns {*} the new number of courses, or false if a time conflict
 */
Schedule.prototype.addCourse = function(course) {
    if(!this.hasConflict(course)) {
        this.selectedCourses.push(course);

        this.credits += course.credits;
        this.creditsDisplay.text(this.credits);

        return true;
    } else {
        notifications.show('<strong>' + course.dept + course.code + ' (' + course.type + ') </strong>conflicts with an existing course.', 'danger');
        return false;
    }
};

Schedule.prototype.removeCourse = function(course) {
    this.selectedCourses.splice($.inArray(course, this.selectedCourses), 1);

    this.credits -= course.credits;
    this.creditsDisplay.text(this.credits);
};

/**
 * Check if a new course conflicts with any added courses
 * @param newCourse new course being added
 * @returns {boolean} true if conflict found, false otherwise
 */
Schedule.prototype.hasConflict = function(newCourse) {

    var courseStart = this.calculateTimeBlock(newCourse.start);
    var courseEnd = this.calculateTimeBlock(newCourse.end);

    var noConflict = true;

    $.each(this.selectedCourses, function(index, course) {

        // check for intersection of days arrays
        if ((function() {
                var a = course.daysNum;
                var b = newCourse.daysNum;

                // filter over the shorter of the two
                if (b.length > a.length) {
                    var t = b;
                    b = a;
                    a = t;
                }

                return a.filter(function (e) {
                    if (b.indexOf(e) !== -1)
                        return true;
                })
            })
        ) {
            var start = this.calculateTimeBlock(course.start);
            var end = this.calculateTimeBlock(course.end);

            // check for time interval overlap
            return (
                noConflict = !(
                        (courseEnd > start && courseEnd < end) ||
                        (courseStart < start && courseEnd > start) ||
                        (courseStart > start && courseStart < end) ||
                        (courseStart == start) ||
                        (courseEnd == end)
                    )
            );

        }
    }.bind(this));

    return !noConflict;

};

/**
 * Notification Manager handles notifications
 * @param notifications notification DOM element
 * @constructor
 */
function NotificationManager(notifications) {
    this.notifications = notifications;

    this.notifications.on('click', '.alert', function() {
        $(this).stop().remove();
    });
}

/**
 *
 * @param msg {string} notification message, html accepted but links won't be clickable because clicking triggers closing it
 * @param color {string} success, info, warning, or danger
 * @param time {int} time in seconds (default: 5)
 */
NotificationManager.prototype.show = function(msg, color, time) {
    color = color || 'info';
    time = time || 5;

    var $notification =
        $('#default-notification').clone()
            .attr('id', '')
            .addClass('alert-' + color)
            .html(msg);

    this.notifications.append($notification);

    $notification.animate({
        'left': 0,
        'opacity': 1
    }, 500).delay(time * 1000).animate({
        'left': '100%',
        'opacity': 0
    }, 500, "linear", function() {
        $(this).remove();
    });

    return $notification;
};

NotificationManager.prototype.stopAll = function() {
    this.notifications.children().stop().remove();
};
