if process.env.NODETIME_ACCOUNT_KEY?
  require('nodetime').profile
    accountKey: process.env.NODETIME_ACCOUNT_KEY,
    appName: 'nerved'

console.log 'hi'
