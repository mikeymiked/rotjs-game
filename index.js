'use strict';

function randomNumber(min, max) { 
    return Math.floor(Math.random() * (max - min) + min);
}

function roll(dice, sides) {
    let total = 0;
    for (let i = 0; i < dice; i++) {
        total += Math.floor(Math.random() * sides + 1);
    }
    return total;
}

class Wall {
    constructor (x, y) {
        this.tile = '#';
        this.x = x;
        this.y = y;
        this.type = 'wall';
        this.color = 'white';
        this.bgcolor = ['Gray', 'DimGray'][Math.floor(Math.random() * 2)];
    }
}

class Floor {
    constructor (x, y) {
        this.tile = '.';
        this.x = x;
        this.y = y;
        this.type = 'floor';
        this.color = 'white';
        this.bgcolor = 'black';
    }
}

class Player {
    constructor (x, y, game) {
        this.x = x;
        this.y = y;
        this.game = game;
        this.type = 'player';
        this.tile = '@';
        this.color = 'yellow';
        this.bgcolor = 'black';
    
        this._draw = function () {
            this.game.display.drawOver(this.x, this.y, this.tile, 'yellow');
        }

        this.act = function () {
            return new Promise (resolve => {
                // let player = this;
                const handler = (e) => {
                    if (e.key == 'w') {
                        this.move(0, -1);
                        document.removeEventListener('keyup', handler);
                        resolve();
                    }
                    if (e.key == 'd') {
                        this.move(1, 0);
                        document.removeEventListener('keyup', handler);
                        resolve();
                    }
                    if (e.key == 's') {
                        this.move(0, 1);
                        document.removeEventListener('keyup', handler);
                        resolve();
                    }
                    if (e.key == 'a') {
                        this.move(-1, 0);
                        document.removeEventListener('keyup', handler);
                        resolve();
                    }
                }
                document.addEventListener('keyup', handler);
            });
        }

        this.move = function (xOffset, yOffset) {
            // if (this.game.map[`${this.x + xOffset},${this.y + yOffset}`][0].type !== 'wall') {
            if (this.game.map[`${this.x + xOffset},${this.y + yOffset}`].filter(e => e.type == 'wall').length <= 0) {
                let key = `${this.x},${this.y}`;
                this.game.map[key].splice(this.game.map[key].indexOf(this), 1);
                this.x += xOffset;
                this.y += yOffset;
                key = `${this.x},${this.y}`;
                this.game.map[key].push(this);
            }
        }
        
        this.game.map[`${x},${y}`].push(this);
        //this._draw();
    }
}

class Game {
    constructor () {
        this.init = function () {
            ROT.RNG.setSeed(Date.now()); 
            this.display = null;
            this.digger = null;
            this.player = null;
            this.w = 60;
            this.h = 30;
            this.map = {};
            this.floorCells = [];
            this.rooms = [];
            this.scheduler = new ROT.Scheduler.Simple();
            //this.engine = new ROT.Engine(this.scheduler);
            
            this.display = new ROT.Display({width:this.w, height:this.h, fontSize:16, fontFamily:'Monospace', forceSquareRatio:true, layout:"rect"});
            this.display.getContainer().setAttribute('id', "game-canvas");
            this.scheduler = new ROT.Scheduler.Simple();
            //this.engine = new ROT.Engine(this.scheduler);
            document.body.appendChild(this.display.getContainer());
            this._generateMap();
            this.mainLoop();
        }

        this.mainLoop = async function () {
            while (true) {
                let actor = this.scheduler.next();
                if (!actor) { break; }
                await actor.act();
                this._drawMap();
            }
        }
        
        this._generateMap = function () {
            this.digger = new ROT.Map.Digger(this.w, this.h, {dugPercentage:0.35, roomHeight:[3,10], roomWidth:[3,10]});
            let callback = function (x, y, value) {
                let key = `${x},${y}`;
                if (value == 1) {
                    this.map[key] = [new Wall(x, y)];
                } else {
                    this.map[key] = [new Floor(x, y)];
                    this.floorCells.push(key);
                }
            }
            this.digger.create(callback.bind(this));
            this.rooms = this.digger.getRooms();
            this.player = new Player(Math.floor(Math.random() * (this.rooms[0]._x2 - this.rooms[0]._x1) + this.rooms[0]._x1), Math.floor(Math.random() * (this.rooms[0]._y2 - this.rooms[0]._y1) + this.rooms[0]._y1), this);
            this.scheduler.add(this.player, true);
            this._drawMap();
        }
        
        this._drawMap = function () {
            for (let key in this.map) {
                let parts = key.split(',');
                let x = parseInt(parts[0]);
                let y = parseInt(parts[1]);

                this.map[key].forEach(o => {
                    this.display.draw(x, y, o.tile, o.color, o.bgcolor);
                });
                /*if (this.map[key][0].tile == '#') {
                    let color = randomNumber(150, 201);
                    this.display.draw(x, y, this.map[key][0].tile, 'White', ['Gray', 'DimGray'][Math.floor(Math.random() * 2)]);
                } else {
                    this.display.draw(x, y, this.map[key][0].tile, 'Gray');
                }*/
            }
            
            /*let drawDoor = function (x,y) {
                if (!(x % 3)) {
                    this.display.draw(x, y, '+', 'DarkGoldenrod', 'SaddleBrown');
                }
            }
            this.rooms = this.digger.getRooms();
            for (let i = 0; i < this.rooms.length; i++) {
                this.rooms[i].getDoors(drawDoor.bind(this));
            }*/
        }
    }
}

let game = new Game();
game.init();
