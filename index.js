'use strict'

const createChannel = require('multicast-channel')

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

const channel = createChannel()
channel.on('error', (err) => {
	error = err
	rerender()
})
channel.on('message', (msg, from) => {
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
