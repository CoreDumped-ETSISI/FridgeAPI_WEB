const items = {
    mail: 'Email',
    pass: 'Password',
    name: 'Name',
    nameOrPrice: 'Name or price',
    productName: 'Product name',
    price: 'Price'
}

const objs = {
    user: 'User',
    email: 'Email',
    offer: 'Offer',
    product: 'Product',
    payment: 'Payment',
    purchase: 'Purchase',
    productOrOffer: 'Product or offer',
}

const errorMessages = {
    intServErr: 'Internal server error',
    notValid: 'not valid',
    notFound: 'not found',
    passEmpty: 'Password field is empty',
    wrongEmailPass: 'Wrong email or password',
    mailVerifRequired: 'Email verification required',
    imageNotValid: 'Invalid image',
    repeatedMail: 'Already exist a user with this email',
    nameOrPassRequired: 'Name or password required',
    productsRequired: 'Products are required',
    dataRequired: 'Required data to update',
    userOfEmailNotExists: 'Not exist a user with this email',
}

const successMessages = {
    userCreated: 'User created',
    userModified: 'User modified',
    success: 'Success',
    offerDeleted: 'Offer deleted succesfully',
}

const userStatus = {
    created: 'Created',
    verified: 'Verified',
}

const cookieTag = {
    token: 'token',
}

module.exports = {
    errMsgs: errorMessages,
    userStatus: userStatus,
    items: items,
    msg200: successMessages,
    objs: objs,
    cT: cookieTag,
}