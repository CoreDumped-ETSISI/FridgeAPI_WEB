loadUserList();

function loadUserList() {
    request('GET', '/user/list', null, (res) => {
        for (let i = 0; i < res.length; i++) {
            $("#comboUsers").append('<option value="' + res[i]._id + '" data-icon="' + res[i].avatarImage +'" class="right">' + res[i].displayName + ' (' + res[i].email + ')' + '</option>');
        }
        $('select').formSelect();
    });
}

function sendPayment() {
    const e = document.getElementById("comboUsers");
    const idUser = e.options[e.selectedIndex].value;
    const money = $('#cashToAdd').val();
    const data = {
        "userId": idUser,
        "amount": money
    };
    request('POST', '/payment', data, (res) => {
        M.toast({html: 'Payment done', classes: "green"});
    });
}