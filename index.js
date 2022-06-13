gsap.registerPlugin(ScrollTrigger);

var h = window.innerHeight;
var w = window.innerWidth;

if ($(window).height() < 860) {
	$('.fullscreen_message').removeClass('d-none')
} else {
	$('.fullscreen_message').addClass('d-none')
}
$(window).on('resize', function() {
	var win = $(this);
	if (win.height() < 860) {
		$('.fullscreen_message').removeClass('d-none')
	} else {
		$('.fullscreen_message').addClass('d-none')
	}
})

let tl = gsap.timeline({
	scrollTrigger: {
		trigger: ".square_box",
		start: "center center",
		markers: false,
		pin: ".square_box",
		endTrigger: ".square_container",
		end: "bottom center",
		scrub: 0,
		onToggle: self => {
			if (self.isActive) {
				$('.square_container').removeClass('none')
			} else {
				$('.square_container').addClass('none')
			}
		},
		onUpdate: self => {
			console.log(self.progress.toFixed(3));
			if (self.progress.toFixed(3) >= 0.51) {
				$('.hi_msg').addClass('none')
			} else {
				$('.hi_msg').removeClass('none')
			}
		}
	}
});

tl.fromTo(".cover", {
		x: '-9.5rem',
		ease: 'linear',
	},
	{
		x: `${w}`,
		ease: 'linear',
	},
	"squareAni"
)

tl.fromTo(".square", {
		x: '-9.5rem',
		ease: 'linear',
	},
	{
		x: `${w}`,
		ease: 'linear',
		rotation: 480,
	},
	"squareAni"
)

let tl_1 = gsap.timeline({
	scrollTrigger: {
		trigger: ".walking_container",
		start: "top center",
		markers: false,
		pin: ".square_box",
		endTrigger: ".walking_container",
		end: "bottom center",
		scrub: 0
	}
});

tl_1.to(".name span", {
	y: `-10vh`,
	ease: 'strong.inOut'
})

// $('.laptop_img_container img').css('margin-top', `-${h/4}px`);

let tl_2 = gsap.timeline({
	scrollTrigger: {
		trigger: ".laptop_appear_container",
		start: "top bottom",
		markers: false,
		endTrigger: ".laptop_appear_container",
		end: "bottom center",
		scrub: 0,
		onToggle: self => {
			if (self.isActive) {
				$('.intro_text_container').removeClass('none')
			}
		}
	}
});

tl_2.to(".intro_text_container", {
	opacity: 1,
})

let loaded = false
let tl_3 = gsap.timeline({
	scrollTrigger: {
		trigger: ".ending_laptop_appear_container",
		start: "top bottom",
		markers: false,
		endTrigger: ".ending_laptop_appear_container",
		end: "bottom center",
		scrub: 0,
		onUpdate: self => {
            if (self.progress > 0.8 && !loaded) {
                loadImages()
                loaded = true;
            }
			console.log('yay');
		}
	}
});

tl_3.to(".sp_text > .text", {
	y: `-100%`
}, "leave_sp")

tl_3.to(".laptop_img", {
	opacity: 0,
}, "leave_sp")

let tl_4 = gsap.timeline({
	scrollTrigger: {
		trigger: ".ending_laptop_appear_container",
		start: "center bottom",
		markers: false,
		endTrigger: ".ending_laptop_appear_container",
		end: "bottom top",
		scrub: 0,
		onUpdate: self => {
			console.log('yay');
		}
	}
});

tl_4.to(".game_text_container", {
	opacity: 1
})

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

const GU = 32
const RUN_TICK_LIMIT = 1000;
const FLOOR_DECELERATION = 3;
const SPEED_LIMIT_MULTIPLE = 2;
const TERMINAL_VELOCITY = 1;
const PLAYER_HEIGHT = 1.5;
const PLAYER_SPEED = 3;
let GRAVITY = 1;

let coins = 0;

let borders = new Array(480/GU).fill(0).map(() => new Array(640/GU).fill(0))

let spaceUp = 0;



class Box {
    constructor(x, y, id) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.show = true;
        this.my_image = new Image();
        this.my_image.src = 'https://i.ibb.co/ZTypMxF/crate.png'
    }
    remove() {
        let mid_x = Math.floor(this.x / GU);
        let mid_y = Math.floor(this.y / GU);
        this.show = false
        borders[mid_y][mid_x] = 0;
    }
    place(x, y) {
        let mid_x = Math.floor(x / GU);
        let mid_y = Math.floor(y / GU);
        this.x = x;
        this.y = y;
        // console.log("Positions:",this.x, this.y);
        while (borders[mid_y][mid_x] != 0) {
            mid_y++;
            console.log('increased')
        }
        borders[mid_y][mid_x] = this.id;
        this.show = true
    }
    refresh() {
        let mid_x = Math.floor(this.x / GU);
        let mid_y = Math.floor(this.y / GU);
        let bottom_y = Math.floor((this.y + GU) / GU);
        if (borders[bottom_y][mid_x] == 0) {
            // ctx.beginPath()
            // ctx.rect(mid_x * GU, bottom_y * GU, GU, GU)
            // ctx.stroke()
            this.remove();
            this.place(mid_x * GU, bottom_y * GU);
        }
    }
    draw() {
        this.refresh()
        if (this.show) ctx.drawImage(this.my_image, this.x, this.y, GU, GU);
    }
}

let boxes = {2: new Box(7 * GU, 12 * GU, 2), 3: new Box(13 * GU, 8 * GU, 3)};

class Person {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.x_speed = 0;
		this.y_speed = 0;
		this.run_tick = 0;
        this.my_image = new Image();
        this.loading = true;
        this.direction = 1;
        this.my_image.onload = () => {
            this.loading = false
        }
        this.my_image.src = 'https://i.ibb.co/HB5qphH/static.png'
        this.holding = false;
	}
    inc_x_speed(val) {
        if (Math.abs(this.x_speed + val) <= SPEED_LIMIT_MULTIPLE * PLAYER_SPEED) {
            this.x_speed += val;
        }
        let direction = this.x_speed / Math.max(1, Math.abs(this.x_speed));
        if (direction != this.direction && direction != 0) {
            this.direction = direction;
        }
    }
    inc_y_speed(val) {
        if (Math.abs(this.y_speed + val) < 16) {
            this.y_speed += val;
        }
    }
    pickup() {
        if (this.holding == 0) {
            let mid_x = Math.floor((this.x + 0.5 * GU) / GU)
            let bottom_y = Math.floor((this.y + 1.7 * GU) / GU);
            // console.log("pickingup")
            if (borders[bottom_y][mid_x] > 1) {
                this.holding = borders[bottom_y][mid_x];
                boxes[borders[bottom_y][mid_x]].remove()
            }
        }
    }
    drop() {
        if (this.holding > 0) {
            let mid_x = Math.floor((this.x + 0.5 * GU) / GU)
            let mid_y = Math.floor((this.y + GU) / GU);
            // console.log("placing")
            boxes[this.holding].place(mid_x * GU, mid_y * GU);
            this.holding = false
        }
    }
	refresh() {
        console.log(this.direction)
        let direction = this.x_speed / Math.max(1, Math.abs(this.x_speed));
        let bottom_y = Math.floor((this.y + 1.7 * GU) / GU);
        let bottom_y_gravity = Math.floor((this.y + 1.9 * GU) / GU);
        // let real_bottom_y = (this.y + 1.5 * GU) / GU;
        let mid_y = Math.floor((this.y + GU) / GU);
        let top_y = Math.floor(this.y / GU);
        let mid_x = Math.floor((this.x + 0.5 * GU - 0.3 * GU) / GU)
        let mid_x2 = Math.floor((this.x + 0.5 * GU + 0.3 * GU) / GU)
        let mid_x2_raw = ((this.x + 0.5 * GU + 0.3 * GU) / GU)
        let new_grid_x = Math.floor((this.x + 0.5 * GU + this.x_speed) / GU);
        let new_grid_x2 = Math.floor((this.x + 0.7 * this.direction * GU + 0.5 * GU) / GU);

        ctx.beginPath()
        // ctx.rect(new_grid_x * GU, bottom_y * GU, GU, GU)
        // ctx.rect(new_grid_x2 * GU, bottom_y * GU, GU, GU)
        // ctx.rect(mid_x * GU, bottom_y * GU, GU, GU)
        // ctx.rect(mid_x2 * GU, bottom_y * GU, GU, GU)
        // ctx.rect(mid_x * GU, mid_y * GU, GU, GU)
        // ctx.rect(mid_x2 * GU, mid_y * GU, GU, GU)
        // ctx.rect(mid_x * GU, top_y * GU, GU, GU)
        // ctx.rect(mid_x2 * GU, top_y * GU, GU, GU)
        // ctx.rect(new_grid_x2 * GU, bottom_y * GU, GU, GU)
        // ctx.rect(new_grid_x2 * GU, real_bottom_y * GU, GU, GU)
        // ctx.rect(new_grid_x2 * GU, bottom_y_gravity * GU, GU, GU)
        // ctx.rect(new_grid_x2 * GU, bottom_y_gravity * GU, GU, GU)
        // ctx.rect(new_grid_x * GU, mid_y * GU, GU, GU)
        // ctx.rect(new_grid_x2 * GU, mid_y * GU, GU, GU)
        // ctx.rect(new_grid_x * GU, top_y * GU, GU, GU)
        // ctx.rect(new_grid_x2 * GU, top_y * GU, GU, GU)
        ctx.stroke()

        if (borders[bottom_y][mid_x] > 0 || borders[bottom_y][mid_x2] > 0) {
            spaceUp = 1;
        }

        if ((borders[bottom_y][mid_x] > 0) || borders[bottom_y][mid_x2] > 0) {
            this.y_speed = Math.min(this.y_speed, 0);
        }

        if ((borders[bottom_y_gravity][new_grid_x] > 0 || borders[bottom_y_gravity][new_grid_x2] > 0) && this.y_speed > 0) {
            this.x_speed = 0;
        }

        if (borders[mid_y][new_grid_x2] > 0 || borders[top_y][new_grid_x2] > 0 || this.x + this.x_speed >= 610 || this.x + this.x_speed <= 0) {
            this.x_speed = 0;
        }
        
        if (borders[top_y][mid_x] == 1 || borders[top_y][mid_x2] == 1) {
            this.y_speed = 2;
        }

        if (borders[mid_y][mid_x] == -1) {
            coins++;
            console.log("coins:",coins)
            borders[mid_y][mid_x] = 0;
            if (coins >= 3) {
                endgame()
            }
        }

		this.x += this.x_speed;
		this.y += this.y_speed;

        let new_speed = this.x_speed - this.direction * FLOOR_DECELERATION
        if (new_speed / Math.abs(new_speed) == this.direction) {
            this.x_speed -= this.direction * FLOOR_DECELERATION;
        } else {
            this.x_speed = 0;
        }

        let new_y_speed = this.y_speed + GRAVITY;
        if (borders[bottom_y][mid_x] != 1) {
            this.y_speed = new_y_speed;
        } else {
            // this.y_speed = 0;
            // spaceUp = 1;
        }


	}
	draw() {
		this.refresh();
        if (this.direction == -1){ 
            
            // scaleX by -1; this "trick" flips horizontally
            ctx.translate(this.x+GU,this.y);
            ctx.scale(-1,1);
            
            // draw the img
            // no need for x,y since we've already translated
            
            ctx.drawImage(this.my_image,0,0, GU, PLAYER_HEIGHT * GU);
            // always clean up -- reset transformations to default
            ctx.setTransform(1,0,0,1,0,0);
        } else {
            ctx.drawImage(this.my_image, this.x, this.y, GU, PLAYER_HEIGHT * GU);
        }
	}
}

let player = new Person(2 * GU, 11 * GU);

let leftPressed = false;
let rightPressed = false;
let spacePressed = false;
let pPressed = false;

function keyDownHandler(e) {
    if (e.key == 'd') {
        rightPressed = true;
    } else if (e.key == 'a') {
        leftPressed = true;
    } else if (e.key == ' ') {
        spacePressed = true;
    } else if (e.key == 'p') {
        pPressed = true;
    } else if (e.key == 'r') {
        resetgame()
    }
}

function keyUpHandler(e) {
    if (e.key == 'd') {
        rightPressed = false;
    } else if (e.key == 'a') {
        leftPressed = false;
    } else if (e.key == ' ') {
        spacePressed = false;
    } else if (e.key == 'p') {
        pPressed = false;
    }
}

for (let i = 0; i < 480/GU; i+=(480/GU) - 1) {
    for (let j = 0; j < 640/GU; j++) {
        borders[i][j] = 1;
    }
}
// for (let i = 0; i < 480/GU; i++) {
//     for (let j = 0; j < 640/GU; j+=(640/GU) - 1) {
//         borders[i][j] = 1;
//     }
// }

borders[12][10] = 1;

for (let i = (480/GU) - 1; i >= 10; i--) {
    for (let j = (640/GU) - 1; j >= 16; j--) {
        borders[i][j] = 1;
    }
}

for (let i = 0; i < 10; i++) {
    borders[8][i] = 1;
}

borders[9][9] = 1;
for (let i = 2; i < 5; i++) {
    borders[8][i] = 0;
}

for (let i = 3; i < 6; i++) {
    borders[5][i] = 1;
}

borders[4][4] = -1;
borders[7][0] = -1;
borders[5][19] = -1;
borders[9][19] = 1;

let boxes_keys = Object.keys(boxes)

let brick_img = new Image();
let background = new Image();
let coin = new Image();
coin.src = 'https://i.ibb.co/LSKf6kJ/coin.png'
background.src = 'https://i.ibb.co/997G3PP/background.png'
brick_img.src = 'https://i.ibb.co/h9WsJwf/brick.png'


var coin_state = 0;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 480/GU; i++) {
        for (let j = 0; j < 640/GU; j++) {
            if (borders[i][j] == 1) {
                ctx.drawImage(brick_img, j * GU, i * GU, GU, GU)
                // ctx.beginPath()
                // ctx.fillStyle = '#A7DDA7'
                // ctx.rect(j * GU, i * GU, GU, GU)
                // ctx.stroke()
            } else if (borders[i][j] == -1) {
                ctx.translate(j * GU, i * GU);
                ctx.drawImage(coin, 0, Math.cos(coin_state) * 1.2 + 0.5,GU, GU);
                ctx.setTransform(1,0,0,1,0,0);
            }
        }
    }
    coin_state += 0.1;
    if (coin_state > 2 * Math.pi) {
        coin_state = 0
    }
    // if (coin_state > 0.4 * GU) {
    //     coin_state = (coin_state - 0.1 * GU);
    // } else {
    //     coin_state = (coin_state - 0.1 * GU);
    // }
    if (leftPressed || rightPressed || spacePressed) {
        if (leftPressed) {
            player.inc_x_speed(-PLAYER_SPEED);
        }
        if (rightPressed) {
            player.inc_x_speed(PLAYER_SPEED);
        }
        if (spacePressed && spaceUp == 1) {
            spaceUp = 0
            player.inc_y_speed(-13);
        }
    }
    if (pPressed) {
        player.pickup()
    } else {
        player.drop()
    }
    for (let i = 0; i < boxes_keys.length; i++) {
        boxes[boxes_keys[i]].draw()
    }
    player.draw()
}



var drawInterval; 
var click = 0;

let intro = new Array()
for (let i = 0; i < 5; i++) {
    intro.push(new Image());
}

function startgame() {
    ctx.drawImage(intro[0], 0, 0, canvas.width, canvas.height)
    $('canvas').click(() => {
        click++;
        if (click == 5) {
            drawInterval = setInterval(draw, 15);
            document.addEventListener("keydown", keyDownHandler, false);
            document.addEventListener("keyup", keyUpHandler, false);
        } else if (Math.ceil(click) == click) {
            console.log("click:",click)
            ctx.drawImage(intro[click], 0, 0, canvas.width, canvas.height);
        }
    });
}

function resetgame() {
    coins = 0;
    borders = new Array(480/GU).fill(0).map(() => new Array(640/GU).fill(0))
    spaceUp = 0;
    boxes = {2: new Box(7 * GU, 12 * GU, 2), 3: new Box(13 * GU, 8 * GU, 3)};
    player = new Person(2 * GU, 11 * GU);
    leftPressed = false;
    rightPressed = false;
    spacePressed = false;
    pPressed = false;
    for (let i = 0; i < 480/GU; i+=(480/GU) - 1) {
        for (let j = 0; j < 640/GU; j++) {
            borders[i][j] = 1;
        }
    }
    // for (let i = 0; i < 480/GU; i++) {
    //     for (let j = 0; j < 640/GU; j+=(640/GU) - 1) {
    //         borders[i][j] = 1;
    //     }
    // }

    borders[12][10] = 1;

    for (let i = (480/GU) - 1; i >= 10; i--) {
        for (let j = (640/GU) - 1; j >= 16; j--) {
            borders[i][j] = 1;
        }
    }

    for (let i = 0; i < 10; i++) {
        borders[8][i] = 1;
    }

    borders[9][9] = 1;
    for (let i = 2; i < 5; i++) {
        borders[8][i] = 0;
    }

    for (let i = 3; i < 6; i++) {
        borders[5][i] = 1;
    }

    borders[4][4] = -1;
    borders[7][0] = -1;
    borders[5][19] = -1;
    borders[9][19] = 1;
}

function endgame() {
    clearInterval(drawInterval)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "2rem Monospace";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("Victory", canvas.width/2, canvas.height/2);
    document.removeEventListener("keydown", () => {})
    document.removeEventListener("keyup", () => {})
}

intro[4].onload = () => {
    startgame();
};

function loadImages() {
    intro[0].src = 'https://i.ibb.co/RS6p4LD/intro-first.png'
    intro[1].src = 'https://i.ibb.co/MS7gkpZ/intro-second.png'
    intro[2].src = 'https://i.ibb.co/QFdnKDf/intro-third.png'
    intro[3].src = 'https://i.ibb.co/gF5Rxgh/intro-fourth.png'
    intro[4].src = 'https://i.ibb.co/xC6XSqq/intro-fifth.png'
}