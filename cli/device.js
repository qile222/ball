let reg = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
module.exports = {
    platform: reg.test(navigator.userAgent) ? 'mobile' : 'pc',
}