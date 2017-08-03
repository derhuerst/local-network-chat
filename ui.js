'use strict'

const stripAnsi = require('strip-ansi')
const chalk = require('chalk')
const termSize = require('window-size').get
const ms = require('ms')
const wrap = require('prompt-skeleton')
const cli = require('cli-styles')

const UI = {
	abort: function () {
		this.close()
	},
	submit: function () {
		if (!this.input) return
		this.send(stripAnsi(this.input))
		this.input = ''
		this.render()
	},

	_: function (key) {
		this.input += key
		this.render()
	},
	delete: function () {
		this.input = this.input.slice(0, -1)
		this.render()
	},

	clear: '',
	render: function (first) {
		const {width, height} = termSize()

		let out = ''
		if (this.messages.length > 0) {
			const messages = this.messages.slice(-height + 2)
			const now = Date.now()

			for (let msg of messages) {
				if (msg.sending) out += '⌛ '
				out += [
					chalk.gray(ms(now - msg.when)),
					chalk.green(msg.from),
					msg.content
				].join(' ') + '\n'
			}
		} else out += chalk.gray('no messages') + '\n'

		const peers = this.nrOfPeers + ' peers'
		const err = this.error && this.error.message
		if (err) out += err.slice(0, width - peers.length - 1) + ' '
		out += chalk.yellow(peers) + '\n'

		if (this.input) out += chalk.underline(this.input)
		else out += chalk.gray('type a message…')

		this.out.write(this.clear + out)
		this.clear = cli.clear(out)
	}
}

const defaults = {
	messages: [],
	input: '',
	open: false,
	error: null,
	nrOfPeers: 0,
	send: () => {}
}

const createUI = (send) => {
	const ui = Object.assign(Object.create(UI), defaults)
	ui.send = send

	const render = (open, messages, err, nrOfPeers) => {
		ui.open = open
		ui.messages = messages
		ui.error = err
		ui.nrOfPeers = nrOfPeers
		ui.render()
	}

	wrap(ui)
	return render
}

module.exports = createUI
