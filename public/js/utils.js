function getProfile() {
    _asyncGetProfile().then(content => function() { 
        completeUsersData(content);
        return content;
    });
}

function completeUsersData(user) {
    if (user.avatarImage) {
        cleanAndAppend("#photo", '<img class="responsive-img circle" src="' + user.avatarImage + '">');
        $("#userImage").attr("src", user.avatarImage);
    }
    cleanAndAppend(".name", user.displayName);
    cleanAndAppend(".email", user.email);
    cleanAndAppend("#saldo", (Math.round(user.balance * 100) / 100) + ' €');
}

function _asyncGetProfile() {
    return new Promise(function (resolve, reject) {
        request('GET', '/user', null, (res) => {
            resolve(res);
        });
    });
}