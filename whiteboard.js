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
		this.db = new Database(this)
		this.pos_offset = { x: this.canvas.getBoundingClientRect().left, y: this.canvas.getBoundingClientRect().top }

		// Create touch event listeners
		this.canvas.addEventListener('touchstart', (event) => 	{ this.handleTouchStart(event) })
		this.canvas.addEventListener('touchend', (event) => 	{ this.handleTouchEnd(event) })
		this.canvas.addEventListener('touchmove', (event) => 	{ this.handleTouchMove(event) })
		this.canvas.addEventListener('touchcancel', (event) => 	{ this.handleTouchCancel(event) })

		// Create mouse event listeners
		this.canvas.addEventListener('mousedown', (event) => { this.handleTouchStart(event) })
		this.canvas.addEventListener('mouseup', (event) => { this.handleTouchEnd(event) })
		this.canvas.addEventListener('mouseleave', (event) => { this.handleTouchEnd(event) })
		this.canvas.addEventListener('mousemove', (event) => {
			if (this.touchActive) {
				this.handleTouchMove(event)
			}
		})

		this.canvas.addEventListener('mouseover', (event) => 	{ 
			if (this.drawState === 'pencil') {
				this.canvas.style.cursor = "url('img/dot.png'), crosshair"
				// this.canvas.style.cursor = "crosshair"
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

		this.pencilButton.classList.add('activeButton')
		this.eraserButton.classList.remove('activeButton')
	}
	
	handleEraserButtonClick(event){
		console.log("Eraser Button Click")
		this.drawState = 'eraser'

		
		this.eraserButton.classList.add('activeButton')
		this.pencilButton.classList.remove('activeButton')
	}

	handleTouchStart(event){
		console.log("handleTouchStart called!")
		console.log((event instanceof MouseEvent))
		let eventType = (event instanceof MouseEvent) ? "mouse" : "touch"

		console.log(event)
		
		// Attempt to catch gestures such as pinch. We want to deal with them ourselves
		if(eventType === "touch" && event.touches.length > 1){
			console.warn("Caught pinch/gesture")
			event.preventDefault()

			// if we are catching a gesture, we want to block drawing
			this.touchActive = false
			return
		}

		this.touchActive = true 
		let touch = (eventType === "touch") ? this.getTouchList(event)[0] : { clientX: event.clientX, clientY: event.clientY }
		this.lastTouchPoint = touch

		// Create a Stroke object and add the given point coordinates to it
		this.currentStroke = new Stroke(this.color)
		this.currentStroke.addPoint(touch.clientX - this.pos_offset.x, touch.clientY - this.pos_offset.y)
		console.log("Creating a new stroke object")
		console.log(this.currentStroke)
	}

	handleTouchEnd(event){
		this.touchActive = false 
		this.lastTouchPoint = null

		// TODO: send stroke to DB
		this.db.insert(this.currentStroke)

		// Set currentStroke to empty status, ready to create a new stroke
		this.currentStroke = null
	}

	handleTouchMove(event){
		let touchType = (event instanceof MouseEvent) ? "mouse" : "touch"
		let touchList = this.getTouchList(event)

		// NOTE: We only want to draw if we have ONE draw point
		if(touchType === "touch" && (touchList.length === 0 || touchList.length > 1)){
			return
		}
		event.preventDefault()

		let touch = (touchType === "mouse") ? { clientX: event.clientX, clientY: event.clientY } : touchList[0]

		if (this.touchActive){
			// Add point to Stroke object
			// this.currentStroke.addPoint(touch.clientX - this.pos_offset.x, touch.clientY - this.pos_offset.y)
			this.currentStroke.addPoint(touch.clientX, touch.clientY)

			// Draw to this point
			this.draw(touch, this.canvas, this.color, this.lastTouchPoint)
		}
	}

	handleTouchCancel(event){
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
		console.log("drawStoke()")

		if (stroke === null) return

		console.log(stroke)		
		let pointList = stroke.pointList
		for (let i = 0; i < pointList.length; i++){
			let touch = { clientX: pointList[i].x, clientY: pointList[i].y }
			// For the first point... line start logic
			if (i === 0){		
				console.log(event)
				this.touchActive = true 
				this.lastTouchPoint = 
				this.color = stroke.color
			}

			// line drawing logic
			else {
				// Draw to this point
				this.draw(touch, this.canvas, this.color, this.lastTouchPoint)
			}

			// On last point... line end logic
			if (i >= pointList.length-1){
				this.touchActive = false
				this.lastTouchPoint = null
			}
		}
	}

	getTouchList(event){
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
	color: "green",
	pointList: [
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

			try {
				console.log("drawing stroke! SUCCESS!!!")
				this.whiteboardRef.drawStroke(snapshot.val())
			}
			catch(e){
				console.log("error caught in db")
				console.log(e)
			}
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