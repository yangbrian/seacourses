/**
 * Main script for SeaCourses
 */

var page = 0;
//var count;
//
//function loadCourses(sort, order) {
//    var search = document.getElementsByClassName("search-box");
//    var params = {};
//    for (var i = 0; i < search.length; i++) {
//        if (search[i].value != '')
//            params[search[i].getAttribute("data-type")] = search[i].value;
//    }
//
//    // sort by columns
//    if (sort) {
//        params["sort"] = sort;
//        params["order"] = order;
//    }
//
//    var xhr = new XMLHttpRequest();
//    xhr.onreadystatechange = function() {
//        if (xhr.readyState == 4) {
//            displayTable(xhr.response)
//        }
//    };
//
//    var queries = "?limit=10&page=" + page;
//
//    for (var key in params)
//        queries += "&" + key + "=" + params[key];
//
//    xhr.open('GET', 'fetch.php' + queries, true);
//
//    xhr.timeout = 7000;
//    xhr.ontimeout = function() {
//        alert("We failed");
//    };
//    xhr.send();
//}
//
//document.addEventListener("DOMContentLoaded", initPage);
//
//function initPage() {
//    loadCourses();
//    var searchBoxes = document.getElementsByClassName("search-box");
//    for (var i = 0; i < searchBoxes.length; i++) {
//        console.log("Events");
//        searchBoxes[i].oninput = function() {
//            page = 0;
//            loadCourses();
//        }
//    }
//
//    document.getElementById("previous-page").onclick = previousPage;
//    document.getElementById("next-page").onclick = nextPage;
//}
//
//function displayTable(courses) {
//
//    courses = JSON.parse(courses);
//    var table = document.getElementById("course-table");
//    table.innerHTML = "";
//
//    count = courses[0];
//
//    var resultCount = document.getElementById("result-count");
//    resultCount.innerHTML = courses[0] + " total results</a>";
//
//    document.getElementById("previous-page").innerHTML = page != 0 ? "Previous" : "";
//    document.getElementById("next-page").innerHTML = (page + 1) * 10 < count ? "Next" : "";
//
//    console.log(page + ", " + (page*10) + " , " + count);
//
//    for (var i = 1; i< courses.length; i++) {
//        var row = document.createElement("div");
//        row.id = "row-" + i;
//        row.className = "course-row";
//
//        for (var info in courses[i]) {
//            if (info != "description") {
//                var cell = document.createElement("div");
//                cell.id = "cell-" + info + "-" + i;
//                cell.className = "course-cell";
//
//                cell.innerHTML = courses[i][info];
//                row.appendChild(cell);
//            }
//        }
//
//        table.appendChild(row);
//    }
//}
//
//function nextPage() {
//    page++;
//    loadCourses();
//}
//
//function previousPage() {
//    page--;
//    loadCourses();
//}
//
//
//
//

var courses = [];
var searchedCourses = [];
$(document).ready(function() {
    $.getJSON( '/search', function( data ) {
        $.each( data, function( key, val ) {
            courses.push(val);
        });
    });
    searchedCourses = courses;
});

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