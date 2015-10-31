/**
 * SeaCourses
 */

$(document).ready(function() {

    var courses = [];
    var table = $('#course-table');

    $.getJSON( '/search', function( data ) {
        $.each(data, function (key, val) {
            courses.push(val);
        });

        $.each(courses, function (index, course) {
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
                    .css('border-color', '#' + course.color)
            )

        });
    });

    table.on('click', 'tr.course', function() {
       $(this).toggleClass('selected-course');
    });

});