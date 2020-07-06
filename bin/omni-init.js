#!/usr/bin/env node
const program = require('commander')
const path = require('path')
const fs = require('fs')
const glob = require('glob') // npm i glob -D
const download = require('../lib/download')
const inquirer = require('inquirer')
const latestVersion = require('latest-version')
const generator = require('../lib/generator')
const chalk = require('chalk')
const logSymbols = require('log-symbols')

program.usage('<project-name>').parse(process.argv)

/**
 * 获得初始化项目名称
 */
let projectName = (function() {
  let name = program.args[0]
  if (!name) {
    program.help()
  }
  return name
})()

/**
 * 判断名称是否同名
 */
function nextPromise() {
  const list = glob.sync('*')  // 遍历当前目录
  if (list.length) {
    // 当前目录不为空
    if (list.filter(name => {
      const fileName = path.resolve(process.cwd(), path.join('.', name))
      let isDir = fs.statSync(fileName).isDirectory()
      return name.indexOf(projectName) !== -1 && isDir
    }).length !== 0) {
      console.log(`项目${projectName}已经存在`)
      return undefined
    }
    return Promise.resolve(projectName)

  } else {
    return Promise.resolve(projectName)
  }
}


function main() {
  let next = nextPromise()

  if (!next) {
    return
  }

  next.then(projectRoot => {
    if (projectRoot !== '.') {
      fs.mkdirSync(projectRoot)
    }
    return projectRoot
  })
    .then(projectRoot => {
      return inquirer.prompt([
        {
          name: 'projectName',
          message: '项目的名称',
          default: projectRoot
        }, {
          name: 'projectVersion',
          message: '项目的版本号',
          default: '1.0.0'
        }, {
          name: 'projectDescription',
          message: '项目的简介',
          default: `A project named ${projectRoot}`
        },
        {
          type: 'list',
          message: '请选择一种脚手架:',
          name: 'fruit',
          choices: [
            "Taro",
            "UniAPP",
          ],
          filter: function (val) { // 使用filter将回答变为小写
            return val.toLowerCase()
          }
        }
      ]).then(val => {
        return download(projectRoot, val.fruit).then(target => {
          return {
            name: projectRoot,
            root: projectRoot,
            downloadTemp: target
          }
        })
      })

    })
    .then(context => {
      console.log(logSymbols.success, chalk.green('创建成功:)'))
      console.log()
      console.log(chalk.green('cd ' + context.root + '\nnpm install'))
    }).catch(err => {
      console.error(logSymbols.error, chalk.red(`创建失败：${error.message}`))
    })
}

main()