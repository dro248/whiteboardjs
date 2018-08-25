'use strict';

var whiteboard = {
	canvas: null,
	context: null,
	color: null,
	mouseOver: false,

	init: () => {
		this.canvas = document.getElementById("whiteboard_canvas")
		this.context = canvas.getContext("2d")
		console.log(canvas)
		console.log(context)

		// Create event listeners
		canvas.addEventListener('onmouseover', (event) => { 
			console.log("mouse over")
			this.mouseOver = true 
		})
		canvas.addEventListener('onmouseout', (event) => { 
			console.log("mouse left")
			this.mouseOver = false 
		})
		canvas.addEventListener('onmousemove', (event) => { 
			console.log("mouse moved!")
			// if (!mouseOver) { return }

			// console.log(event)
		})
	}
}

document.getElementById("whiteboard_canvas").addEventListener('onmouseover', (event) => { 
			console.log("mouse over")
			this.mouseOver = true 
		})

window.onload = () => {
	whiteboard.init()
}