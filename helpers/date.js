
function formatDate(date) {
    return [date.getDate(),
        date.getMonth() + 1,
    date.getFullYear()].join('/') + ' ' +
        [date.getHours(),
        date.getMinutes(),
        date.getSeconds()].join(':');
}

module.exports = {
    formatDate
}