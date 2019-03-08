initPage();

document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.fixed-action-btn');
    var instances = M.FloatingActionButton.init(elems, {direction: 'left'});
  });

$(document).ready(function () {
    $('.collapsible').collapsible();
});

function initPage() {
    getUserList();
}

function getUserList() {
    request('GET', '/user/list', null, (res) => {
        for (let i = 0; i < res.length; i++) {
            $("#userList").append(userElement(res[i]));
        }
        
        $('.materialboxed').materialbox();
    });
}

function userElement(user) {
    return `<li class="max">
                <div class="collapsible-header max">
                    <div class="row no-margin-important inside-max">
                        <div class="col s4">
                            <img class="materialboxed user-image user-list-header-height" 
                                src="${user.avatarImage}">
                        </div>
                        <div class="col s7 offset-s1 center">
                            <div class="full-width user-list-header-height center-vertically-user-name"
                                >${user.displayName}</div>
                        </div>
                    </div>
                </div>
                <div class="collapsible-body no-margin-important inside-max">
                    <div class="row">
                        <div class="col s12 l4">
                            <p class="bold">User name:</p>
                            <p>${user.displayName}</p>
                        </div>
                        <div class="col s12 l4">
                            <p class="bold">Email:</p>
                            <p>${user.email}</p>
                        </div>
                        <div class="col s12 l4">
                            <p class="bold">Balance:</p>
                            <p>${user.balance.toFixed(2)} €</p>
                        </div>
                    </div>
                </div>
            </li>`;
}