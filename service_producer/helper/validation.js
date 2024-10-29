
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+(\.[^\s@]+)+$/
    return emailRegex.test(email) && !/\.{2,}/.test(email)
}


module.exports = { validateEmail }