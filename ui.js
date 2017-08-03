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
		const now = Date.now()

		let out = ''
		if (this.messages.length > 0) {
			for (let msg of this.messages) {
				if (msg.sending) out += '⌛ '
				out += [
					chalk.gray(ms(now - msg.when)),
					chalk.green(msg.from),
					msg.content
				].join(' ') + '\n'
			}
		} else out += chalk.gray('no messages') + '\n'

		out += this.input
		// todo: this.error

		this.out.write(this.clear + out)
		this.clear = cli.clear(out)
	}
}

const defaults = {
	messages: [],
	input: '',
	open: false,
	error: null,
	send: () => {}
}

const createUI = (send) => {
	const ui = Object.assign(Object.create(UI), defaults)
	ui.send = send

	const render = (open, messages, err) => {
		ui.open = open
		ui.messages = messages
		ui.error = err
		ui.render()
	}

	wrap(ui)
	return render
}

module.exports = createUI
