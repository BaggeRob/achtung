import startServer from './server'
import makeStore from './store'
import {update} from './game/action_creators'


const store = makeStore()
const io = startServer(store)


const GAMEAREA = [500, 500]


// calculate physics and game state. loop at same interval as clients
let lastInv = +new Date()
function physicsUpdate() {
	const now = +new Date()
	const delta = (now - lastInv)/1000
	lastInv = now
	
	store.dispatch(update(delta, GAMEAREA))
	
}


// push state to clients. loop at 45ms interval
let prevState = store.getState()
function serverUpdate() {
	const newState = store.getState()
	if (!newState.equals(prevState)) {
		io.emit('gameState', makeOutput(newState))
		prevState = newState
	}
}


function makeOutput(state) {
	const players = state.get('players').map((v, k) => {
		return v
			.set('id', k)
			.set('leftKey', 'foo')
			.set('rightKey', 'foo')
			.set('keyDesc', 'foo')
	}).toArray()
	
	return state
			.set('players', players)
			.set('mode', 'Online')
			.set('gamearea', GAMEAREA)
			.toJS()
	
}


setInterval(physicsUpdate, 1000/35) // 35 fps, same as on client
setInterval(serverUpdate, 45)