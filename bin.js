#!/usr/bin/env node
'use strict'

const mri = require('mri')

const createChat = require('.')
const createUI = require('./ui')

const pkg = require('./package.json')

const argv = mri(process.argv.slice(2), {
	boolean: ['help', 'h', 'version', 'v']
})

if (argv.help || argv.h) {
	process.stdout.write(`
Usage:
    local-network-chat
Examples:
    local-network-chat
\n`)
	process.exit(0)
}

if (argv.version || argv.v) {
	process.stdout.write(`local-network-chat v${pkg.version}\n`)
	process.exit(0)
}

const send = (msg) => chat.send(msg)

const ui = createUI(send)
const chat = createChat(ui)
