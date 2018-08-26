'use strict';

var whiteboard, hammer

class Whiteboard {

	constructor() {
		console.info("Whiteboard constructor()");
		this.canvas = document.getElementById("whiteboard_canvas");
		this.context = this.canvas.getContext("2d");
		this.color = 'red'
		this.touchActive = false
		this.lastTouchPoint = null

		// Create event listeners
		this.canvas.addEventListener('touchstart', (event) => 	{ this.handleTouchStart(event) })
		this.canvas.addEventListener('touchend', (event) => 	{ this.handleTouchEnd(event) })
		this.canvas.addEventListener('touchmove', (event) => 	{ this.handleTouchMove(event) })
		this.canvas.addEventListener('touchcancel', (event) => 	{ this.handleTouchCancel(event) })

		// On init, resize the canvas to fit the window
		this.resize(window, this.canvas)
	}

	handleTouchStart(event){
		console.log("touchstart")
		this.touchActive = true 
		let touch = this.getTouchList(event)[0]
		this.lastTouchPoint = touch
	}

	handleTouchEnd(event){
		console.log("touchend")
		this.touchActive = false 
		this.lastTouchPoint = null
	}

	handleTouchMove(event){
		let touchList = this.getTouchList(event)

		// NOTE: We only want to draw if we have ONE draw point
		if(touchList.length === 0 || touchList.length > 1){
			return
		}

		event.preventDefault()

		if (this.touchActive){
			this.draw(touchList[0], this.canvas, this.color, this.lastTouchPoint)
		}
	}

	handleTouchCancel(event){
		// TODO
		console.warn("TouchCancel() Triggered!")
	}

	resize() {
		// Resize the whiteboard to fill the window
		this.canvas.height = window.innerHeight
		this.canvas.width = window.innerWidth
		
		console.log('canvas height: ' + String(this.canvas.height))
		console.log('canvas width: ' + String(this.canvas.width))
	}

	draw(touch, canvas, color) {


		if (!this.lastTouchPoint){
			console.error("You're hitting me!")
			this.lastTouchPoint = touch
			return
		}


		console.info("draw line: " + color)
		console.log("touch")
		console.log(touch)
		console.log("lastTouchPoint")
		console.log(this.lastTouchPoint)

		console.log("canvas")
		console.log(canvas)


		let ctx = canvas.getContext("2d");
		ctx.beginPath();
		ctx.moveTo(this.lastTouchPoint.clientX, this.lastTouchPoint.clientY);
		ctx.lineTo(touch.clientX, touch.clientY);
		// ctx.moveTo(0,0);
		// ctx.lineTo(1500, 1500);
		ctx.stroke();

		this.lastTouchPoint = touch
	}

	getTouchList(event){
		// Returns an Array of touch objects

		console.log(event['changedTouches'])

		if (!event['changedTouches']){
			return
		}

		let touches = []
		for (let i = 0; i < event.changedTouches.length; i++){
			touches.push(event['changedTouches'][String(i)])
		}
		return touches
	}
}



window.addEventListener("load", () => {
	whiteboard = new Whiteboard()
})

window.addEventListener("resize", () => {
	if (whiteboard){
		whiteboard.resize(window)
	}
});