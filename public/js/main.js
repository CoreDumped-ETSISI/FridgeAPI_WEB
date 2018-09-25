$(document).ready(function () {
    $('.modal').modal();
    $('.fixed-action-btn').floatingActionButton();
    $('.sidenav').sidenav();
    $('select').formSelect();
    $('.collapsible').collapsible();
});

function request(method, path, data, next) {
    let req_params = {
        "async": true,
        "crossDomain": true,
        "url": path,
        "method": method,
        "headers": {
            "content-type": "application/x-www-form-urlencoded"
        },
        "data": data
    };

    $.ajax(req_params).done(function (response) {
        next(response)
    }).fail(function (xhr, textStatus, errorThrown) {
        let err = {
            code: xhr.status,
            res: JSON.parse(xhr.responseText),
            message: textStatus,
            error: errorThrown
        };
        if (err.code === 401) redirect('/login');
        M.toast({html: err.res.message, classes: "red"});
    });
}

function reload(delay) {
    if (!delay)
        window.location.reload();
    else
        setTimeout(() => window.location.reload(), delay);
}

function redirect(path) {
    window.location.replace(path);
}

function delayedRedirect(path, delay) {
    setTimeout(() => window.location.replace(path), delay);
}

function cleanAndAppend(where, what) {
    $(where).empty();
    $(where).append(what);
}