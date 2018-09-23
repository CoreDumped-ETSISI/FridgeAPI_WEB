initPage();

function initPage() {
    getProfile();
    getPaymentList();
}

function getProfile() {
    request('GET', '/user', null, (res) => {
        user = res;
        if (user.avatarImage)
            cleanAndAppend("#photo", '<img class="responsive-img circle" src="' + user.avatarImage + '">');
        cleanAndAppend(".name", user.displayName);
        cleanAndAppend(".email", user.email);
        cleanAndAppend("#saldo", (Math.round(user.balance * 100) / 100) + ' €');
    });
}

function date_sort(elem){

}

function getPaymentList() {
    request('GET', '/payment', null, (res) => {
        for (let i = 0; i < res.length; i++) {
            $("#paymentList").append(paymentElement(res[i]));
        }
    });
}

function paymentElement(payment) {
    const datetime = new Date(payment.timestamp).toLocaleString('es-ES');
    let temp = '<li>' +
        '<div class="collapsible-header"><i class="material-icons">attach_money</i>' + datetime + ' Amount: ' + payment.amount + ' €</div>' +
        '<div class="collapsible-body">';
    if (payment.amount < 2.01){
        temp += '<img src="https://media.giphy.com/media/rA3nL8T8B3zDa/giphy.gif">'
    } else if (payment.amount < 5.01){
        temp += '<img src="https://thumbs.gfycat.com/YoungCandidCrossbill-size_restricted.gif">'
    } else if (payment.amount < 8.01){
        temp += '<img src="https://media.giphy.com/media/26xBLBOpi3BXJvUg8/giphy.gif">'
    } else if (payment.amount < 12.01){
        temp += '<img src="http://l56spuxk1t14k3seci6s2bja-wpengine.netdna-ssl.com/wp-content/uploads/GIF/2014/09/Raining-Money-GIF.gif">'
    } else if (payment.amount < 20.01){
        temp += '<img src="https://media.giphy.com/media/gTURHJs4e2Ies/giphy.gif">'
    } else {
        temp += '<img src="https://media3.giphy.com/media/VTxmwaCEwSlZm/200.gif">'
    }
    temp += '</div></li>';

    return temp;
}