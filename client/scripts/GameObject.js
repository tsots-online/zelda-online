var GameObject = require("../../shared/GameObject");
var ObjectTypes = require("../../shared/ObjectTypes.js");

var linkSpriteHandler = require("./spriteHandlers/link.js");
var projectileHandler = require("./spriteHandlers/projectiles.js");

var UP = 0,
	RIGHT = 1,
	DOWN = 2,
	LEFT = 3;

/**
 * Client side implementation of the Game Object, which also handles displaying sprites
 */
class GameObjectClientImplementation extends GameObject {

	constructor(attributes) {
		attributes = attributes || {};
		super(attributes);
		this.lastSpriteChange = [0, 0, 0, 0];
		this.spriteChangeFrequency = 200;
		this.currentFrame = 0;
		console.log("TYPE", this.type);
		switch(this.type) {
			case ObjectTypes.PLAYER_LINK:
				this.spriteHandler = linkSpriteHandler;
				break;
			case ObjectTypes.SWORD:
				this.spriteHandler = projectileHandler;
				break;
		}
		if (this.type === ObjectTypes.PLAYER_LINK) {
			this.currentSprite = this.spriteHandler.sprites[this.direction][0];
		} else {
			this.currentSprite = this.spriteHandler.sprites[this.type][this.direction][0];
		}
	}

	draw(ctx) {
		var drawPosition = [this.position[0] + this.spriteHandler.ORIGIN[0], this.position[1] + this.spriteHandler.ORIGIN[1]];
		if (this.isInvincible && (new Date()).getTime() % 250 < 150) {
			var inverse = this.getInverseImage();
			ctx.drawImage(inverse, 
							this.currentSprite[0], 
							this.currentSprite[1], 
							this.spriteHandler.WIDTH, 
							this.spriteHandler.HEIGHT, 
							drawPosition[0], 
							drawPosition[1], 
							this.spriteHandler.WIDTH, 
							this.spriteHandler.HEIGHT);

		} else {
			ctx.drawImage(this.spriteHandler.image, 
							this.currentSprite[0], 
							this.currentSprite[1], 
							this.spriteHandler.WIDTH, 
							this.spriteHandler.HEIGHT, 
							drawPosition[0], 
							drawPosition[1], 
							this.spriteHandler.WIDTH, 
							this.spriteHandler.HEIGHT);
		}

		//Show name if it's a player
		if (this.type === ObjectTypes.PLAYER_LINK && this.name) {

			var namePlate = document.getElementById(this.id);

			if (!namePlate) {
				namePlate = document.createElement("div");
				namePlate.id = this.id;
				namePlate.className = "namePlate";
				namePlate.innerHTML = this.name;
				document.getElementById("container").appendChild(namePlate);
			}

			namePlate.style.left = (this.position[0]) + "px";
			namePlate.style.top = (this.position[1] - 24) + "px";

			
		}
	}

	getInverseImage() {
		if (!this.inverseImage) {
			this.inverseImage = document.createElement("canvas");
			this.inverseImage.width = this.spriteHandler.image.width;
			this.inverseImage.height = this.spriteHandler.image.height;
			var ctx = this.inverseImage.getContext("2d");
			ctx.drawImage(this.spriteHandler.image, 0, 0);
			var imgData = ctx.getImageData(0,0,this.inverseImage.width, this.inverseImage.height);
			var data = imgData.data;
			for (var i = 0; i < data.length / 4; i++) {
				data[i*4] = 255 - data[i*4];
				data[i*4 + 1] = 255 - data[i*4 + 1];
				data[i*4 + 2] = 255 - data[i*4 + 2];
			}
			ctx.clearRect(0,0,this.inverseImage.width, this.inverseImage.height);
			ctx.putImageData(imgData, 0, 0);

		}
		return this.inverseImage;
	}


	setDirection(direction) {
		if (this.direction === direction) {
			return;
		}
		this.direction = direction;
		this.currentSprite = this.spriteHandler.sprites[this.direction][this.currentFrame];
		this.lastSpriteChange[this.direction] = 0;
	}

	setAttacking(isAttacking) {
		if (this.isAttacking !== isAttacking) {
			this.isAttacking = isAttacking;
			if (!this.isAttacking) {
				this.swapSpriteFrame();
			}
		}
	}

	update(dt) {
		if (this.isMoving) {
			this.lastSpriteChange[this.direction] += dt;
		}
		if (this.lastSpriteChange[this.direction] >= this.spriteChangeFrequency && this.isMoving) {
			this.swapSpriteFrame();
		}
		if (this.isAttacking) {
			this.showAttackingSprite();
		}
	}

	swapSpriteFrame() {
		this.currentFrame = 1 - this.currentFrame;
		this.currentSprite = this.spriteHandler.sprites[this.direction][this.currentFrame];
		this.lastSpriteChange[this.direction] = 0;
	}

	showAttackingSprite() {
		this.currentSprite = this.spriteHandler.sprites[this.direction][2];
	}
};



module.exports = GameObjectClientImplementation;