function deleteCredentials() {
    request('GET', '/logout', null, (res) => {
        redirect("/login");
    })
}