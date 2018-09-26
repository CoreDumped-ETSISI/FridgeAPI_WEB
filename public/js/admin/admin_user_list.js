
loadUserList();

function loadUserList() {
    request('GET', '/user/list', null, (res) => {
        for (let i = 0; i < res.length; i++) {
            $("#userList").append('<tr>' +
                '<td><img  class="materialboxed" width="250" src="' + res[i].avatarImage + '" style="width:48px;"></td>' +
                '<td>' + res[i].email + '</td>' +
                '<td>' + res[i].displayName + '</td>' +
                '<td>' + res[i].balance.toFixed(2) + ' €</td>' +
                '</tr>');
        }
        $('.materialboxed').materialbox();
    });
}