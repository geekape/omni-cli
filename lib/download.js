const download = require('download-git-repo')
const path = require('path')
const ora = require('ora')

module.exports = function (target, branchName = 'taro') {
  target = path.join(target || '.', '.download-temp')
  const url = `https://github.com:geekape/omni-cli-templates#${branchName}`
  const spinner = ora(`正在下载项目模板，源地址：${url}`)
  spinner.start()
  return new Promise((resolve, reject) => {
    download(url,
      target, { clone: true }, (err) => {
        if (err) {
          spinner.fail()
          reject(err)
        } else {
          // 下载的模板存放在一个临时路径中，下载完成后，可以向下通知这个临时路径，以便后续处理
          spinner.succeed()
          resolve(target)
        }
      })
  })
}
