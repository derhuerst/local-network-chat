'use strict'

const createChannel = require('multicast-channel')
const randomId = require('crypto-random-string')

const compareMessages = (a) => (b) => {
	return a.content === b.content && a.when === b.when && a.from === b.from
}
const sortByWhen = (a, b) => a.when - b.when

const createChat = (name, render) => {
	// state

	let messages = []
	let open = false
	let error = null

	// chat logic

	const channel = createChannel({name})
	channel.on('error', (err) => {
		error = err
		rerender()
	})
	channel.on('message', (msg, from) => {
		const stop = handlePingPong(msg)
		if (stop || !msg || !msg.id || !msg.from || !msg.content) return
		if (messages.find(msg2 => msg2.id === msg.id)) return

		msg = Object.assign({from}, msg, {when: Date.now()})
		messages.push(msg)
		rerender()
	})

	const send = (content) => {
		const onSent = () => {
			msg.sending = false
			rerender()
		}

		let msg = {
			id: randomId(10),
			from: channel.id,
			content,
			when: Date.now()
		}
		channel.send(msg, onSent)
		msg = Object.assign({sending: true}, msg)

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
