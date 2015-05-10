'use strict';

var loadAllSprites = require("./spriteHandlers/all.js");

var _ = require("lodash");
var io = require("socket.io-client");
var Actions = require("../../shared/Actions.js");
var GameObject = require("./GameObject.js");
var WorldObject = require("./WorldObject.js");
var keyHandler = require("./keyHandler.js");


var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");


loadAllSprites.then(function() {
    console.log("Sprites loaded");
    lastTick = new Date().getTime();
    tick();
});

var gameObjects = [];
var map = [];
var lastTick;


function tick() {
    var now = new Date();
    var dt = now - lastTick;
    lastTick = now;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < map.length; i++) {
        for (var j = 0; j < map[i].length; j++) {
            if (map[i][j]) {
                map[i][j].draw(ctx);
            }
        }
    }


    for (var i = 0; i < gameObjects.length; i++) {
        gameObjects[i].update(dt);
        gameObjects[i].draw(ctx);
    }

    requestAnimationFrame(tick);

}

var server = window.location.href.indexOf("localhost") > -1 ? "http://localhost:5000" : 'http://zelda.kriek.io';
var socket = io(server);
keyHandler.socket = socket;

socket.on(Actions.INITIAL_STATE, function(data) {
    console.log(data);
    for (var i = 0; i < data.players.length; i++) {
    	gameObjects.push(new GameObject({
    		position: data.players[i].position,
    		type: data.players[i].type,
    		direction: data.players[i].direction,
    		id: data.players[i].id
    	}));
    }
    for (var i = 0; i < data.map.length; i++) {
        map.push([]);
        for (var j = 0; j < data.map[i].length; j++) {
            if (data.map[i][j]) {
                map[i].push(new WorldObject(data.map[i][j]));
            } else {
                map[i].push(false);
            }
        }
    }
});

socket.on(Actions.OBJECT_UPDATE, function(data) {
    var object = _.find(gameObjects, function(object) {
        return object.id === data.id;
    });
    object.position = data.position;
    object.isMoving = data.isMoving;
    object.isInvincible = data.isInvincible;
    object.setAttacking(data.isAttacking);
    object.setDirection(data.direction);
});

socket.on(Actions.ADD_OBJECT, function(data) {
    gameObjects.push(new GameObject({
        type: data.type,
        position: data.position,
        direction: data.direction,
        id: data.id
    }));
});

socket.on(Actions.REMOVE_OBJECT, function(id) {
    gameObjects = _.filter(gameObjects, function(object) {
        return object.id !== id;
    });
});

setInterval(function() {
    socket.emit(Actions.HEARTBEAT);
}, 1000);