/*
002 * Licensed to the Apache Software Foundation (ASF) under one or more
003 * contributor license agreements.  See the NOTICE file distributed with
004 * this work for additional information regarding copyright ownership.
005 * The ASF licenses this file to You under the Apache License, Version 2.0
006 * (the "License"); you may not use this file except in compliance with
007 * the License.  You may obtain a copy of the License at
008 *
009 *      http://www.apache.org/licenses/LICENSE-2.0
010 *
011 * Unless required by applicable law or agreed to in writing, software
012 * distributed under the License is distributed on an "AS IS" BASIS,
013 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
014 * See the License for the specific language governing permissions and
015 * limitations under the License.
016 */


/* global mouseX, mouseY, triangle, loadImage, key, collideLineCircle, arc, PI, VIDEO, PIE, ml5, image, textSize, windowWidth, createCapture, windowHeight, color, strokeWeight, line, fill, collideRectCircle, ellipse, random, fill, text, keyCode, UP_ARROW, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW, createCanvas, colorMode, HSB, frameRate, background, width, height, noStroke, stroke, noFill, rect*/

let backgroundColor;
let video;
let flipVideo;

//let flipVideo;
let label = 'waiting...';
let classifier;
let keyGIF, key, key2;


let platform, player, platform2;
let onPlatform = false;
let gravity;
let onObstacle = false;
let obstacle1, obstacle2, obstacle3, obstacle4, obstacle5;
let obstacles = [];
let backgroundIMG;
let door;

let totalKeys = 0;
let level = 1;
let levelLocked = false;
//VIDEO FUNCTIONS
function preload() {
  classifier = ml5.imageClassifier('https://teachablemachine.withgoogle.com/models/wNui2YOxC/' + 'model.json') //ml5.imageClassifier('https://teachablemachine.withgoogle.com/models/Fx_0EVY0Y/' + 'model.json');
}

function classifyVideo() {
  //flipVideo = ml5.flipImage(video)
  // console.log('====== classifyVideo called')
  classifier.classify(video, gotResults);
}

function gotResults(error, results) {
  // console.log('====== gotResults called')
  if (error) {
    console.log('====== ERROR!!!!!')
    console.error(error)
    return
  }
  label = results[0].label
  //console.log('====== ' + label)
  classifyVideo()
}

//p5 FUNCTIONS
function setup() {
  // Canvas & color settings
  backgroundIMG = loadImage("https://cdn.glitch.com/37c179bd-2451-4fca-b6f0-5d96fb809d13%2F219417.jpg?v=1596053552356")
  keyGIF = loadImage("https://cdn.glitch.com/37c179bd-2451-4fca-b6f0-5d96fb809d13%2F82d984fcd46cafb.gif?v=1596051542669")
  createCanvas(1200, 600);
  colorMode(HSB, 360, 100, 100);
  backgroundColor = 95;
  gravity = 3;
  
  //Video settings
  video = createCapture(VIDEO);
  video.hide();
  flipVideo = ml5.flipImage(video)
  classifyVideo()
  
  //Object settings
  platform2 = new Platform(100, height-50, label);
  platform = new Platform(width/2, height/2, label);
  player = new Player(width/2, height/2-150);
  
  frameRate(120);
}

function draw() {
  image(backgroundIMG, 0, 0, width, height)
  //VIDEO INFO
  //image(video, 0, 0)
  // textSize(32);
  // fill(255);
  // text(label, 10, 50);
  
  //label = 'rRamp';
  //PLAYER
  player.show();
  
  //OBSTACLES
  levelSet();
  drawLevel1();
  door.checkHitPlayer();
  door.show();
  
  //PLATFORM
  platform.show(label);
  platform.checkHitPlatform();
  
  //FINAL: PLAYER.MOVE
  player.move();
}

function mousePressed() {
  //Reset player
  player = new Player(mouseX, mouseY);
}

//CUSTOM FUNCTIONS

class Platform {
  constructor(x, y, type) {
    this.type = type;
    this.previousType = type;
    this.x = x;
    this.y = y;
    this.w = 300;
    this.h = 150;
    this.hit = false;  
  }
  
  getYPosForXPos(xPos) {
    if (this.type === 'lRamp') {
      //LEFT RAMP
      let slope = 1 * this.h/this.w;
      return slope*xPos + this.y;
    } else if (this.type === 'rRamp') {      
      //RIGHT RAMP
      let slope = -1 * this.h/this.w;
      return slope*xPos + this.y;
    } else {
      //BRIDGE
      return this.y;
    }
  }
  
  show(type) {
    noFill();
    strokeWeight(5);
    stroke(15, 51, 34);
    this.previousType = this.type;
    this.type = label;
    
    if (this.type === 'lRamp') {
      //LEFT RAMP
      line((this.x)-this.w, (this.y)-this.h, (this.x)+this.w, (this.y)+this.h);
    } else if (this.type === 'rRamp') {
      //RIGHT RAMP
      line((this.x)-this.w, (this.y)+this.h, (this.x)+this.w, (this.y)-this.h);
    } else {
      //BRIDGE
      line((this.x)-this.w, this.y, (this.x)+this.w, this.y);
    }
  }
  
  checkHitPlatform() {
    this.hit = false;
    
    if (this.type === 'lRamp') {
      //LEFT RAMP
      this.hit = collideLineCircle((this.x)-this.w, (this.y)-this.h, (this.x)+this.w, (this.y)+this.h, player.x, player.y, player.size*1.5);
      if (this.hit || (this.hit && onObstacle)) {
        
        // console.log("hit: " + this.hit)
        // console.log("onObstacle: " + onObstacle)
        // if ((this.hit && onObstacle)){
        //   console.log("===== THE PLATFORM IS HIT AND THE OBSTACLE IS HIT")
        // } else {
        //   console.log("==== The platform is hit")
        // }
        
        if (player.direction === 'L') {
          player.changeDirection(-3, -gravity);
        } else if (player.direction === 'R') {
          player.changeDirection(3, 0);
        }
      }
    } else if (this.type === 'rRamp') {
      //RIGHT RAMP
      this.hit = collideLineCircle((this.x)-this.w, (this.y)+this.h, (this.x)+this.w, (this.y)-this.h, player.x, player.y, player.size*1.5);
      if (this.hit || (this.hit && onObstacle)) {
        if (player.direction === 'R') {
          player.changeDirection(3, -gravity);
        } else if (player.direction === 'L') {
          player.changeDirection(-3, 0);
        }
      }
      
    } else {
      //BRIDGE
      this.hit = collideLineCircle((this.x)-this.w, (this.y), (this.x)+this.w, (this.y), player.x, player.y, player.size*1.5);
      if (this.hit || (this.hit && onObstacle)) {
        player.changeDirection(player.xSpeed, 0);
      }
    }
    
    //Check to see if the player is already on the platform during a change. Then, keep the player with the platform as it changes types.
//     if (this.type != this.previousType && this.hit) {
//       //Find which quadrant the player is on the ramp of during a transition, and calculate using the middle and endpoints accordingly
//       let midpointX = this.x;
//       let playerX = player.x;
//       let endpointX, endpointY;
      
//       // if (player.x >= this.x && player.y >= this.y) {
//       //   endpointX = this.x+this.w;
//       //   endpointY = this.y+this.h;
//       // } else if (player.x < this.x && player.y >= this.y) {
//       //   endpointX = this.x-this.w;
//       //   endpointY = this.y+this.h;
//       // } else if (player.x >= this.x && player.y < this.y) {
//       //   endpointX = this.x+this.w;
//       //   endpointY = this.y-this.h;
//       // } else if (player.x < this.x && player.y < this.y) {
//       //   endpointX = this.x-this.w;
//       //   endpointY = this.y-this.h;
//       // }
      
//       let newPlayerY = this.getYPosForXPos(player.x); 
//       console.log(newPlayerY);
//       player.y = newPlayerY + player.size*1.5;
//       this.previousType = this.type;
//     }
    
  }
}

class Player {
  constructor(startX, startY) {
    this.x = startX;
    this.y = startY;
    this.size = 30;
    this.xSpeed = 3;
    this.ySpeed = gravity;
    this.direction = 'R';
    
    this.lowerBound = {
      x: this.x,
      y: this.y + this.size/2,
      size: 10,
    }
    
    this.rightBound = {
      x: this.x + this.size/2,
      y: this.y,
      size: 10,
    }
    
    this.leftBound = {
      x: this.x - this.size/2,
      y: this.y,
      size: 10,
    }
    
  }
  
  show() {
    fill(195, 25, 90);
    stroke(0);
    strokeWeight(1);
    ellipse(this.x, this.y, this.size, this.size);
  }
  
  move() {
    this.x += this.xSpeed;
    this.y += this.ySpeed;
    
    //Re-assign the bounding boxes values
    this.lowerBound = {
      x: this.x,
      y: this.y + this.size,
    }
    
    this.rightBound = {
      x: this.x + this.size,
      y: this.y,
    }
    
    this.leftBound = {
      x: this.x - this.size,
      y: this.y,
    }
    
    //Calling handleGravity after movement
    this.handleGravity();
    
    //Set direction to the correct value
    if (this.xSpeed >= 0) {
      this.direction = 'R';
    } else {
      this.direction = 'L';
    }
    
    //If the player somehow goes below the floor limit, set it back above the floor
    if (this.y > height-10-this.size) {
      this.y = height-10 - this.size;
    }
    
  }
  
  changeDirection(xChange, yChange) {
    this.xSpeed = xChange;
    this.ySpeed = yChange;
  }
  
  handleGravity() {
    //IF the player is NOT touching the platform(s), AND it is NOT touching an obstacle, then allow gravity; OTHERWISE, if it IS touching an obstacle, make the ySpeed 0.
    if (!platform.hit && !platform2.hit) {
      this.ySpeed = gravity;
    }
    if (onObstacle && !platform.hit && !platform2.hit) {
      this.ySpeed = 0;
    }
  }
  
}

class Obstacles {
  constructor(x, y, w, h, type) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.type = type;
    this.hit = false;
  }
  
  show() {
    fill(color(15, 51, 34));
    strokeWeight(5);
    stroke(15, 51, 34);
    if (this.type != 'rObRamp' && this.type != 'lObRamp') {
      rect(this.x, this.y, this.width, this.height);
    } else if (this.type === 'rObRamp') {
      triangle(this.x, this.y, (this.x-this.width), (this.y + this.height), this.x, (this.y + this.height))
      //line(this.x, this.y, this.x-this.width, this.y+this.height)
    } else if (this.type === 'lObRamp') {
      triangle(this.x, this.y, (this.x+this.width), (this.y + this.height), this.x, (this.y + this.height))
    }
  }
  
  checkHitPlayer() {
    if (this.type != 'rObRamp' && this.type != 'lObRamp') {
      this.hit = collideRectCircle(this.x, this.y, this.width, this.height, player.x, player.y, player.size*1.5);
      if (this.hit) {
        if (this.type === 'floor') {
          //Continue moving horizontally, not vertically
          player.changeDirection(player.xSpeed, 0);
        } else if (this.type === 'wall') {
          //Bounce in the opposite direction
          player.changeDirection(-player.xSpeed, player.ySpeed);
        } 
      }
    } else {
      if (this.type === 'rObRamp') {
        this.hit = collideLineCircle(this.x, this.y, (this.x)-this.width, (this.y)+(this.height - player.size), player.x, player.y, player.size*1.5);
        if (this.hit) {
          if (player.direction === 'L') {
            player.changeDirection(-3, gravity);
          } else if (player.direction === 'R') {
            player.changeDirection(3, -gravity);
          }
        }
      } else if (this.type === 'lObRamp') {
        this.hit = collideLineCircle(this.x, this.y, (this.x)+this.width, (this.y)+(this.height - player.size), player.x, player.y, player.size*1.5);
        if (this.hit) {
          if (player.direction === 'L') {
            player.changeDirection(-3, -gravity);
          } else if (player.direction === 'R') {
            player.changeDirection(3, gravity);
          }
        }
      }
    }
  }
}

class Key {
  constructor(x, y) {
    this.img = keyGIF;
    this.x = x;
    this.y = y;
    this.w = 30;
    this.h = 30;
    this.hasKey = false;
    this.hit = false;
  }
  
  show() {
    if (!this.hasKey) {
      image(this.img, this.x, this.y, this.w, this.h);
    }
  }
  
  checkHitKey() {
    this.hit = collideRectCircle(this.x, this.y, this.w, this.h, player.x, player.y, 20);
    if (this.hit) {
      console.log("COLLISION OCCURENCE");
      this.hasKey = true;
    }
  }
}

class Exit {
  constructor(x, y) {
    this.img = loadImage("https://cdn.glitch.com/37c179bd-2451-4fca-b6f0-5d96fb809d13%2Funnamed.jpg?v=1596056155141");
    this.x = x;
    this.y = y;
    this.w = 20;
    this.h = 40;
    this.hit = false;
  }
  show() {
    image(this.img, this.x, this.y, this.w, this.h);
  }
  
  checkHitPlayer() {
    this.hit = collideRectCircle(this.x, this.y, this.x+this.w, this.y+this.h, player.x, player.y, player.size);
    
    if (level === 1) {
      if (this.hit && key.hasKey) {
        level++;
        levelLocked = false;
        console.log(level);
      }  
    } 
    
  }

}

//LEVEL FUNCTIONALITY
function levelSet() {
  //This function must only be called once and then locked
  if (levelLocked === false) {
    if (level === 1) {
      obstacles.push(new Obstacles(0, height-20, width, 20, 'floor'));
      obstacles.push(new Obstacles(width-20, 0, 20, 2000, 'wall'));
      obstacles.push(new Obstacles(0, 0, 20, 2000, 'wall'));
      obstacles.push(new Obstacles(width-230, 200, 200, 0, 'floor'));
      obstacles.push(new Obstacles(width-230, 205, 200, 100, 'wall'));
      obstacles.push(new Obstacles(50, 200, 200, 0, 'floor'));
      obstacles.push(new Obstacles(50, 205, 200, 100, 'wall'));
      obstacles.push(new Obstacles(250, 405, 200, 200, 'rObRamp'));
      obstacles.push(new Obstacles(250, 410, 0, 200, 'wall'));
      obstacles.push(new Obstacles(width-300, 480, 100, 100, 'rObRamp'));
      obstacles.push(new Obstacles(width-295, 480, 100, 100, 'lObRamp'));
      
      console.log("LEVEL 1");
      key = new Key(obstacles[5].x+30, obstacles[5].y-30);
      door = new Exit(width-70, height-70);
      
      player.x = 50;
      player.y = height-150;
    }
    if (level === 2) {
      obstacles = [];
      obstacles.push(new Obstacles(0, height-20, width, 20, 'floor'));
      obstacles.push(new Obstacles(width-20, 0, 20, 2000, 'wall'));
      obstacles.push(new Obstacles(0, 0, 20, 2000, 'wall'));
      obstacles.push(new Obstacles(width/2, height/2+50, 20, 100, 'wall'));
      obstacles.push(new Obstacles(width/2, height/2+140, width, 20, 'floor'));
      obstacles.push(new Obstacles(width-150, height/2-100, 20, 180, 'wall'));
      obstacles.push(new Obstacles(250, 400, 200, 200, 'rObRamp'));
      obstacles.push(new Obstacles(252, 405, 200, 200, 'lObRamp'));
      obstacles.push(new Obstacles(250, 410, 0, 200, 'wall'));
      obstacles.push(new Obstacles(width-200, height/2-120, 100, 20, 'floor'));
      
      console.log("LEVEL 2"); 
      key = new Key(obstacles[5].x+40, obstacles[5].y+140);
      door = new Exit(width-70, height-70);
      platform = new Platform(width/2+30, height/2-30, label);
      // platform.h += 30;
      // platform.w += 30;
      player.x = obstacles[3].x+player.size+30;
      player.y = obstacles[3].y+player.size;
    }
    levelLocked = true;
  }
}

function drawLevel1() {
  for (let i = 0; i < obstacles.length; i++) {
    obstacles[i].show();
    obstacles[i].checkHitPlayer();
  }
  
  key.show();
  key.checkHitKey();
}

function drawLevel2() {
  for (let i = 0; i < obstacles.length; i++) {
    obstacles[i].show();
    obstacles[i].checkHitPlayer();
  }
  
  key.show();
  key.checkHitKey();
}