/**
 * SeaCourses
 */

$(document).ready(function() {

    var courses = [];
    var table = $('#course-table');
    var countDisplay = $('.count');
    var count = 0;

    var page = 0;

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

        for (var i = page * 50; i < (page + 1) * 50 && i < courses.length; i++) {
            var course = courses[i];
            table.append(
                $('<tr>').addClass('course')
                    .append($('<td>').addClass('id').text(course.id))
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
            )
        }
    }

    // initial course load
    loadCourses();

    table.on('click', 'tr.course', function() {
       $(this).toggleClass('selected-course');
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
});
