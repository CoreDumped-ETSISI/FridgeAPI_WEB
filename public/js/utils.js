function getProfile() {
    var profile;

    request('GET', '/user', null, (res) => {
        profile = res;
        if (user.avatarImage) {
            cleanAndAppend("#photo", '<img class="responsive-img circle" src="' + user.avatarImage + '">');
            $("#userImage").attr("src", user.avatarImage);
        }
        cleanAndAppend(".name", user.displayName);
        cleanAndAppend(".email", user.email);
        cleanAndAppend("#saldo", (Math.round(user.balance * 100) / 100) + ' €');
    });

    return profile;
}