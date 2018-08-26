'use strict';

var whiteboard;

class Whiteboard {

	constructor() {
		console.info("Whiteboard constructor()");
		this.canvas = document.getElementById("whiteboard_canvas");
		this.context = this.canvas.getContext("2d");
		this.color = null
		this.mouseOver = false

		// Create event listeners
		this.canvas.addEventListener('onmouseover', (event) => { 
			console.log("mouse over")
			this.mouseOver = true 
		})
		this.canvas.addEventListener('onmouseout', (event) => { 
			console.log("mouse left")
			this.mouseOver = false 
		})
		this.canvas.addEventListener('onmousemove', (event) => { 
			console.log("mouse moved!")
			// if (!mouseOver) { return }

			// console.log(event)
		})

		this.resize(window, this.canvas)
	}


	resize() {
		this.canvas.height = window.innerHeight
		this.canvas.width = window.innerWidth
		
		console.log('canvas height: ' + String(this.canvas.height))
		console.log('canvas width: ' + String(this.canvas.width))
	}
}



window.addEventListener("load", () => {
	whiteboard = new Whiteboard()
})

window.addEventListener("resize", () => {
	if (whiteboard){
		// debugger;
		whiteboard.resize(window)
	}
});