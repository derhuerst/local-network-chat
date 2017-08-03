'use strict'

const createChannel = require('multicast-channel')
const createUI = require('./ui')

const createChat = (name, render) => {
	// state

	let messages = []
	let open = false
	let error = null

	// helpers

	const compareMessages = (a) => (b) => {
		return a.content === b.content && a.when === b.when && a.from === b.from
	}
	const sortByWhen = (a, b) => a.when - b.when

	// chat logic

	const channel = createChannel({name})
	channel.on('error', (err) => {
		error = err
		rerender()
	})
	channel.on('message', (msg, from) => {
		const stop = handlePingPong(msg)
		if (stop) return

		msg = Object.assign({from}, msg)
		if (messages.find(compareMessages(msg))) return
		messages = messages.concat(msg).sort(sortByWhen)
		rerender()
	})

	const send = (content) => {
		const onSent = () => {
			msg.sending = false
			rerender()
		}

		let msg = {content, when: Date.now()}
		channel.send(msg, onSent)
		msg = Object.assign({from: channel.id, sending: true}, msg)

		messages.push(msg)
		rerender()
	}

	// ping logic

	let peers = []

	const handlePingPong = (msg, from) => {
		if (!peers.includes(from)) peers.push(from)

		if (msg.ping === true) {
			channel.send({pong: true})
			return true
		}
		if (msg.pong === true) return true
		return false
	}

	const ping = () => {
		peers = []
		channel.send({ping: true})
		setTimeout(rerender, 1000)
	}

	channel.once('open', () => {
		ping()
		setInterval(ping, 10 * 1000)
	})

	// connect ui

	const rerender = () => {
		render(open, messages, error, peers.length)
	}

	return {send}
}

module.exports = createChat
