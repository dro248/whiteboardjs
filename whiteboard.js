'use strict';

var whiteboard;

window.addEventListener('gesturestart', (event) => {
	console.log('pinch caught!!!')
})

class Whiteboard {

	constructor() {
		console.info("Whiteboard constructor()");
		this.canvas = document.getElementById("whiteboard_canvas");
		this.context = this.canvas.getContext("2d");
		this.color = '#000000'
		this.drawState = 'pencil'	// [ 'pencil' | 'eraser' ]
		this.touchActive = false
		this.lastTouchPoint = null
		this.currentStroke = null
		this.db = new Database()
		this.pos_offset = { x: this.canvas.getBoundingClientRect().left, y: this.canvas.getBoundingClientRect().top }

		// Create event listeners
		this.canvas.addEventListener('touchstart', (event) => 	{ this.handleTouchStart(event) })
		this.canvas.addEventListener('touchend', (event) => 	{ this.handleTouchEnd(event) })
		this.canvas.addEventListener('touchmove', (event) => 	{ this.handleTouchMove(event) })
		this.canvas.addEventListener('touchcancel', (event) => 	{ this.handleTouchCancel(event) })
		this.canvas.addEventListener('mouseover', (event) => 	{ 
			if (this.drawState === 'pencil') {
				this.canvas.style.cursor = "none"
			}
			if (this.drawState === 'eraser') {
				console.log("eraser hover")
				this.canvas.style.cursor = "auto"
			}
		})

		// add eventListeners
		this.pencilButton = document.getElementById('pencilButton')
		this.eraserButton = document.getElementById('eraserButton')
		this.colorPicker = document.getElementById("colorpickerButton")

		this.pencilButton.addEventListener('click', (event) => { this.handlePencilButtonClick(event) })
		this.eraserButton.addEventListener('click', (event) => { this.handleEraserButtonClick(event) })
		this.colorPicker.addEventListener('change', (event) => { this.color = String(this.colorPicker.value) })

		// On init, resize the canvas to fit the window
		this.resize(window, this.canvas)
	}

	handlePencilButtonClick(event){
		console.log("Pencil Button Click")
		this.drawState = 'pencil'
	}
	handleEraserButtonClick(event){
		console.log("Eraser Button Click")
		this.drawState = 'eraser'
	}

	handleTouchStart(event){
		console.log("touchstart")

		console.log(event.touches.length)

		// Attempt to catch gestures such as pinch. We want to deal with them ourselves
		if(event.touches.length > 1){
			console.warn("Caught pinch/gesture")
			event.preventDefault()

			// if we are catching a gesture, we want to block drawing
			this.touchActive = false
			return
		}


		this.touchActive = true 
		let touch = this.getTouchList(event)[0]
		this.lastTouchPoint = touch

		// Create a Stroke object and add the given point coordinates to it
		this.currentStroke = new Stroke(this.color)
		this.currentStroke.addPoint(touch.clientX - this.pos_offset.x, touch.clientY - this.pos_offset.y)
		console.log("Creating a new stroke object")
		console.log(this.currentStroke)
	}

	handleTouchEnd(event){
		console.log("touchend")
		this.touchActive = false 
		this.lastTouchPoint = null

		// TODO: send stroke to DB
		this.db.insert(this.currentStroke)

		// Set currentStroke to empty status, ready to create a new stroke
		this.currentStroke = null
		console.log("setting stroke to null")
	}

	handleTouchMove(event){
		let touchList = this.getTouchList(event)

		// NOTE: We only want to draw if we have ONE draw point
		if(touchList.length === 0 || touchList.length > 1){
			return
		}
		event.preventDefault()

		if (this.touchActive){
			// Add point to Stroke object
			this.currentStroke.addPoint(touchList[0].clientX - this.pos_offset.x, touchList[0].clientY - this.pos_offset.y)

			// Draw to this point
			this.draw(touchList[0], this.canvas, this.color, this.lastTouchPoint)
		}
	}

	handleTouchCancel(event){
		// TODO
		console.warn("TouchCancel() Triggered!")

		// Nullify the currentStroke
		this.currentStroke = null
	}

	resize() {
		// Resize the whiteboard to fill the window
		this.canvas.height = window.innerHeight
		this.canvas.width = window.innerWidth
		
		console.log('canvas height: ' + String(this.canvas.height))
		console.log('canvas width: ' + String(this.canvas.width))
	}

	draw(touch, canvas, color) {
		/*
		Handles TouchEvents (TODO: and MouseEvents), turning them into drawn input

		The way we are drawing is taking 2 points and drawing a line between them.
		These points are taken from the TouchEvents that are generated when a finger/stylus touches the (touch)screen.
		When a new TouchEvent happens, we take the coordinates from the previous touch event and draw a line to the current one.
		However, the problem we run into (hence this if clause) is on the first point. We don't have a previous point from which
		to draw a line. Hence, we simply update our lastTouchPoint variable and skip the drawing portion.
		*/
		if (!this.lastTouchPoint){
			console.error("You're hitting me!")
			this.lastTouchPoint = touch
			return
		}

		// draw with pencil
		if (this.drawState === 'pencil'){
			let ctx = canvas.getContext("2d");
			ctx.strokeStyle= color;
			ctx.beginPath();
			ctx.moveTo(this.lastTouchPoint.clientX - this.pos_offset.x, this.lastTouchPoint.clientY - this.pos_offset.y);
			ctx.lineTo(touch.clientX - this.pos_offset.x, touch.clientY - this.pos_offset.y);
			ctx.stroke();
			this.lastTouchPoint = touch
		}

		else if (this.drawState === 'eraser'){
			console.log("drawing with the eraser!!")
		}
	}

	drawStroke(stroke, canvas) {

	}

	getTouchList(event){
		// Returns an Array of touch objects

		// console.log(event['changedTouches'])

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


class Stroke {
/*
A Stroke object contains an ordered list of the coordinates of all of the points within it (ordered by time).
It also contains the color of the given stroke which must be a CSS recognized color (e.g. "green", rgb, #0ff222, etc.)
Ex:
Stroke = {
	color: "green"
	[
		{x: 1, y: 5},
		{x: 4, y: 9},
		{x: 8, y: 13}
	]
}
*/
	constructor(color){
		this.pointList = []
		this.color = (color) ? color : "#000000"	// Default
	}
	addPoint(xVal, yVal){
		// This method takes integral values for xVal, yVal
		this.pointList.push({x: xVal, y: yVal})
	}
	getPointList(){
		return this.pointList
	}
}


/*
The Database class defines a module that connects with a database.
In this case, the database that I am using is Firebase.
*/
class Database {
	constructor(whiteboardRef){
		this.config = {
			apiKey: "AIzaSyDYA1kKfsT4HTd5piGCDO8049BSHtfdARU",
			authDomain: "whiteboard-a1ed9.firebaseapp.com",
			databaseURL: "https://whiteboard-a1ed9.firebaseio.com",
			projectId: "whiteboard-a1ed9",
			storageBucket: "whiteboard-a1ed9.appspot.com",
			messagingSenderId: "329235127806"
		};
		firebase.initializeApp(this.config);


		this.whiteboardRef = whiteboardRef
		this.db = firebase.database()

		// Create a db listener
		let strokeRef = this.db.ref('stroke/')	
		strokeRef.on('value', (snapshot) => {
			console.log("Heller!! New Data from DB!!! Success!!")
			console.log(snapshot.val())
		})
	}

	insert(item){
		this.db.ref('stroke').set(item, (error) => {
	  		if (error) {
	  			console.log("insert FAILED!!!!")
	  		}
	  		else{
	  			console.log("insert SUCCESS!!!")
	  		}
	  	})
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