//The bulk of the Application

// Global inLev Settings to Init with
columns = 8;
positions = 8;
appSelect = 0;
simSelect = 0;
intSelect = 0;
ballSpeed = 0.05;
columnDist = 150;
posDist = 150;
ballSize = 50;
singleballSelect = 63;
theta = 0;
prevY = 0;
selectedBallID = 0;

widthX = (columns - 1) * columnDist;
widthZ = (columns - 1) * columnDist;
heightY = (positions - 1) * posDist;

// Orbit Controls
orbitYPosition = 500;
visualizeRays = false;

wav_offset = 900;
multiTempSetOnce = false;

millis = Date.now();
scriptedBeginTime = millis;
scriptedDuration = 0;
currentFrame = [];




//Web Socket client
if (typeof(io) != "undefined") {
    var socket = io.connect('http://localhost:3000');
    socket.on('connect', function(data) {
        socket.emit('TurnMeOn', {
            x: 1,
            y: 2
        });
    });
}

//Materials
var materialDefault = new THREE.MeshLambertMaterial({color: 0xcccccc});

//Sequencer Materials
var materialLive = new THREE.MeshLambertMaterial({color: 0x17EFFA});
var materialPlay = new THREE.MeshLambertMaterial({color: 0x0A7CDB});

//STATS
var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms, 2: mb
var statsms = new Stats();
statsms.setMode(1); // 0: fps, 1: ms, 2: mb
// align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '5px';
stats.domElement.style.bottom = '5px';
statsms.domElement.style.position = 'absolute';
statsms.domElement.style.left = '90px';
statsms.domElement.style.bottom = '5px';

document.body.appendChild(stats.domElement);
document.body.appendChild(statsms.domElement);
rayObject = [];

var raycaster = new THREE.Raycaster(); //3D Array rays Intersection Point discovery
var raycasterh = new THREE.Raycaster(); //Used to detect Hovered Ball
var raycasterDrag = new THREE.Raycaster(); //Used to detect Clicked / Drag Ball (Touch)

var mouse = new THREE.Vector2(),
    INTERSECTED;

////////////////////// " LEV " ////////////////////////////

function InLev(xsize, zsize, ysize, scene) {

    // Selection
    this.plane = null;
    this.selection = null;
    this.offset = new THREE.Vector3();

    this.xsize = xsize;
    this.zsize = zsize;
    this.ysize = ysize;
    this.columnDistance = columnDist;
    this.positionDistance = posDist;

    // all the balls go here
    this.allBalls = new THREE.Group();
    this.balls = new Array(xsize * zsize * ysize);
    ballsDefYPos = new Array(xsize * zsize * ysize);
    ballsRemoveYPos = new Array(xsize * zsize * ysize);

    //  var geometry = new THREE.BoxGeometry( ballSize*2, ballSize*2, ballSize*2 );
    var geometry = new THREE.SphereGeometry(ballSize, ballSize, ballSize);
    //          var material = new THREE.MeshNormalMaterial( { transparent: true, opacity: 0.5 } );


    makeBalls(this.xsize, this.zsize, this.columnDistance, geometry,
        materialDefault, this.allBalls, this.balls);

    // :)
    function makeBalls(xsize, zsize, columnDist, geometry, material,
        container, balls) {
        var i = 0;
        for (var x = 0; x < xsize; x++) {
            for (var z = 0; z < zsize; z++) {
                for (var y = 0; y < ysize; y++) {
                    var ypos = y * posDist;
                    var thing = new THREE.Mesh(geometry, material);
                    thing.position.y = ypos;
                    thing.position.x = x * columnDist - ((columnDist *
                        columns) / 2) + (columnDist / 2);
                    thing.position.z = z * columnDist - ((columnDist *
                        columns) / 2) + (columnDist / 2);
                    container.add(thing);
                    balls[i] = thing;
                    ballsDefYPos[i] = ypos;
                    balls[i].userData = {  play : true, live: false };
                    ballsRemoveYPos[i] = ypos + (positions + 1) *
                        posDist - (ypos / (ysize / 1.7));;
                    i++;
                }
            }
        }
    }

    // deal with strings
    this.allStrings = new THREE.Group();
    var stringHeight = ((ysize * this.positionDistance) + this.positionDistance);
    var stringGeometry = new THREE.CylinderGeometry(1, 1, stringHeight, 32);
    var stringMaterial = new THREE.MeshBasicMaterial({
        color: 0 * 666666
    });
    makeLayer(((this.positionDistance * positions) / 2) + (this.positionDistance /
            (positions - 1)), this.xsize, this.zsize, this.columnDistance,
        stringGeometry, stringMaterial, this.allStrings)


    // ABSTRACTION at work :-D! This function creates a layer of either balls or strings
    function makeLayer(ypos, xsize, zsize, columnDist, geometry, material, container) {
        var i = 0;
        for (var x = 0; x < xsize; x++) {
            for (var z = 0; z < zsize; z++) {
                var thing = new THREE.Mesh(geometry, material);
                thing.position.y = ypos;
                thing.position.x = (i % xsize) * columnDist - ((columnDist * columns) / 2) + (columnDist / 2);
                thing.position.z = Math.floor(i / xsize) * columnDist - ((columnDist * columns) / 2) + (columnDist / 2);
                container.add(thing);
                i++;
            }
        }

    }

    //Plane for drag
    this.plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(2000, 2000, 8, 8), new THREE.MeshBasicMaterial({color: 0xcccccc}));
    this.plane.visible = false;

    // make the top block
    var blockGeometry = new THREE.BoxGeometry(1, 1, 1);
    var blockMaterial = new THREE.MeshLambertMaterial({
        color: 0xdddddd,
        shading: THREE.SmoothShading,
        transparent: true,
        opacity: 0.96
    });
    this.block = new THREE.Mesh(blockGeometry, blockMaterial);
    columnActDist = this.columnDistance * columns;
    this.block.position.set(0, (this.positionDistance * positions) + ((this
        .positionDistance * positions) / 2), 0);
    this.block.scale.set(xsize * this.columnDistance, this.positionDistance *
        positions, zsize * this.columnDistance);

    orbitYPosition = ((this.ysize * posDist) - posDist) / 2;
    controls.target.y = orbitYPosition;
    controls.object.lookAt(controls.target);

    if (scene)
        this.addToScene(scene);




}
InLev.prototype.addToScene = function(scene) {
    scene.add(this.plane);
    scene.add(this.allBalls);
    scene.add(this.allStrings);
    scene.add(this.block);
}


InLev.prototype.setColumnDistance = function(dist) {
    this.columnDistance = dist;
}
InLev.prototype.setPositionDistance = function(dist) {
    this.positionDistance = dist;
}
InLev.prototype.getBallById = function(n) {
    if ((n < 0) || (n > this.xsize * this.zsize * this.ysize))
        return null;
    return this.balls[n];
}

InLev.prototype.getPlane = function(n) {
    var plane = [];
    for (var i = 0; i < this.ysize * this.zsize * this.xsize; i++) {
        if (i % this.ysize == n) {
            plane.push(i)
        }
    }
    return plane
}

function in_list(needle, hay) {
    var i, len;

    for (i = 0, len = hay.length; i < len; i++) {
        if (hay[i] == needle) {
            return true;
        }
    }

    return false;
}

InLev.prototype.getCrossA = function(n, m) {
    var plane = lev.getPlane(n);
    var crossA = [];
    for (var i = 0; i < 5; i++) {
        crossA.push(plane[i + (m * 5)] + 5);
    }
    return crossA
}

InLev.prototype.getCrossB = function(n, m) {
    var plane = lev.getPlane(n);
    var crossB = [];
    for (var i = 0; i < 5; i++) {
        crossB.push(plane[i * 5] + m * 5 + 5);
    }
    return crossB
}

InLev.prototype.getBall = function(x, z, y) {
    if ((x > this.xsize) || (z > this.zsize) || (y > this.ysize) || (x < 0) ||
        (z < 0) || (y < 0))
        return null;
    return this.getColumn(x, z)[y];
}

InLev.prototype.getColumn = function(x, z) {
    if ((x > this.xsize) || (z > this.zsize) || (x < 0) || (z < 0))
        return null;

    var column = new Array(this.ysize);
    for (var i = 0; i < column.length; i++) {

        column[i] = this.balls[(x * this.zsize * this.ysize) + (z * this.ysize) + i];

    }


    return column;

}
InLev.prototype.getLayer = function(n) {
    if ((n < 0) || (n >= this.ysize))
        return null;
    return this.balls.slice().splice(n * this.xsize * this.zsize, this.xsize *
        this.zsize);
}
InLev.prototype.getBallIdXYZ = function(x, z, y) {
    if ((x > this.xsize) || (z > this.zsize) || (y > this.ysize) || (x < 0) ||
        (z < 0) || (y < 0))
        return null;

    for (var n = 0; n < lev.balls.length; n++) {
        if (lev.getBall(x, z, y) == lev.getBallById(n))
            return n;
    }
}

InLev.prototype.getBallId = function(ball) {
    for (var n = 0; n < lev.balls.length; n++) {
        if (ball == lev.getBallById(n))
            return n;
    }
}


InLev.prototype.sendBallPositions = function() {
    for (var n = singleballSelect; n < singleballSelect+1; n++) {
        var oldY = parseInt(lev.getBallById(n).position.y);
        var newY = parseInt(transformRange(oldY, 0, (positions * 2 * posDist), 0, 200));
        var command = "B" + zeroFill(n, 3) + zeroFill(newY, 3);
        // console.log(command);
        if (newY != prevY){
            if (socket){
              socket.emit('ballCommand', command)
            }
            console.log(command);

        }
        prevY = newY;
    }
}

////////////////////////////////////////////////////////////////////////////////

var renderer, camera, scene, controls;
var cameraLimit = 2000;

var inlev;
var testLayer;

var dark = new THREE.MeshPhongMaterial({
    color: 0xdddddd,
    shininess: 30
});


function init() {

    renderer = new THREE.WebGLRenderer({
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x333333, 1);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight,
        1, 10000);
    camera.position.z = 2000;
    camera.position.y = 300;
    camera.position.x = 900;

    controls = new THREE.OrbitControls(camera, renderer.domElement);

    scene = new THREE.Scene();

    scene.add(new THREE.AmbientLight(0x444444));

    // Set up the InLev
    lev = new InLev(columns, columns, positions, scene);

    var light1 = new THREE.DirectionalLight(0xffffff, 0.75);
    light1.position.set(0, -1, 0);
    scene.add(light1);

    var light2 = new THREE.DirectionalLight(0xffffff, 1.5);
    light2.position.set(1, 1, 1);
    scene.add(light2);


    scene.fog = new THREE.Fog(0x333333, 1, 7000);

    lev.getBallById(singleballSelect).material = new THREE.MeshBasicMaterial({
        color: 0xff0000
    });

}

function resetInlev() {
    var obj, i;
    for (i = scene.children.length - 1; i >= 0; i--) {
        obj = scene.children[i];
        scene.remove(obj);
    }
    lev = new InLev(columns, columns, positions, scene);

    var light1 = new THREE.DirectionalLight(0xffffff, 0.75);
    light1.position.set(0, -1, 0);
    scene.add(light1);

    var light2 = new THREE.DirectionalLight(0xffffff, 1.5);
    light2.position.set(1, 1, 1);
    scene.add(light2);


}


function remove(objects) {

    for (var i = 0; i < objects.length; i++) {
        scene.remove(objects[i]);
    }

}



// some test methods. you can call these from the javascript console
function selectLayer(n) {
    var testLayer = lev.getLayer(n);
    for (var i = 0; i < testLayer.length; i++)
        testLayer[i].material = new THREE.MeshBasicMaterial({
            color: 0xff0000
        });
}

function selectColumn(x, z) {
    var testcol = lev.getColumn(x, z);
    for (var i = 0; i < testcol.length; i++)
        testcol[i].material = new THREE.MeshBasicMaterial({
            color: 0xff0000
        });
}

function selectColumnByBall(ball) {
    column = lev.getColumn(0, 0);
    // for (var i = 0; i < lev.balls.length; i++) {
    //     if (ball.position.x == lev.getBallById(i).position.x && ball.position.y == lev.getBallById(i).position.y){
    //       column.push(lev.getBallById(i));
    //     }
    // }
    return column;
}

function selectBallById(n) {
    lev.getBallById(n).material = new THREE.MeshBasicMaterial({
        color: 0xff0000
    });
    lev.getBallById(n).position.y = 0;
}

function selectBall(x, z, y) {
    lev.getBall(x, z, y).material = new THREE.MeshBasicMaterial({
        color: 0xff0000
    });
}

function selectPlane(n) {
    for (var i = 0; i < lev.getPlane(n).length; i++) {
        selectBallById(lev.getPlane(n)[i])
    }
}

function clearSelect() {
    for (var i = 0; i < lev.balls.length; i++) {
        lev.getBallById(i).material = new THREE.MeshNormalMaterial();;
    }
}


// MANIPULATE BALL FUNCTIONS

function moveAllto(n) {
    for (var i = 0; i < lev.balls.length; i++) {
        lev.getBallById(i).position.y = n;
    }
}

function moveAlltoDefault() {
    var stepDistance = parseInt(1500 * ballSpeed);
    var i = 0;

    for (var x = 0; x < lev.xsize; x++) {
        for (var z = 0; z < lev.zsize; z++) {
            for (var y = 0; y < lev.ysize; y++) {

                var curPosition = lev.getBall(x, z, y).position.y;

                if (curPosition < ballsDefYPos[i] - stepDistance + 1) {
                    lev.getBall(x, z, y).position.y = curPosition +
                        stepDistance;
                }
                if (curPosition > ballsDefYPos[i] + stepDistance - 1) {
                    lev.getBall(x, z, y).position.y = curPosition -
                        stepDistance;
                }
                if (curPosition < ballsDefYPos[i] + stepDistance - 1 &&
                    curPosition > ballsDefYPos[i] - stepDistance + 1) {
                    lev.getBall(x, z, y).position.y = ballsDefYPos[i]
                }

                i++;
            }
        }
    }
}

function moveAlltoPos(n) {

    var i = 0;
    var stepDistance = parseInt(1000 * ballSpeed);
    for (var x = 0; x < lev.xsize; x++) {
        for (var z = 0; z < lev.zsize; z++) {
            for (var y = 0; y < lev.ysize; y++) {

                if (i != 72) {

                    //If larger than all positions, move to box;
                    if (n > positions) {
                        var newPosition = ballsDefYPos[i] + (positions + 1) *
                            posDist - (ballsDefYPos[i] / (lev.ysize / 1.7));
                    } else {
                        var newPosition = (lev.ysize + 1) * posDist +
                            ballsDefYPos[i];
                    }

                    var curPosition = lev.getBallById(i).position.y;
                    if (curPosition < newPosition - stepDistance + 1) {
                        lev.getBall(x, z, y).position.y = curPosition +
                            stepDistance;
                    }
                    if (curPosition > newPosition + stepDistance - 1) {
                        lev.getBall(x, z, y).position.y = curPosition -
                            stepDistance;
                    }
                    if (curPosition < newPosition + stepDistance - 1 &&
                        curPosition > newPosition - stepDistance + 1) {
                        lev.getBall(x, z, y).position.y = newPosition
                    }

                }

                i++;
            }
        }
    }
}


function moveToFrame(next) {
    var nextFramePos = next;
    var i = 0;
    var stepDistance = parseInt(1000 * ballSpeed);

    for (var x = 0; x < lev.xsize; x++) {
        for (var z = 0; z < lev.zsize; z++) {
            for (var y = 0; y < lev.ysize; y++) {

                //If larger than all positions, move to box;

                if (nextFramePos[i] > ((lev.ysize + 1) * posDist)) {
                    nextFramePos[i] = ballsRemoveYPos[i];
                }
                var curPosition = lev.getBallById(i).position.y;
                var newPosition = nextFramePos[i];

                if (curPosition < newPosition - stepDistance + 1) {
                    lev.getBall(x, z, y).position.y = curPosition +
                        stepDistance;
                }
                if (curPosition > newPosition + stepDistance - 1) {
                    lev.getBall(x, z, y).position.y = curPosition -
                        stepDistance;
                }
                if (curPosition < newPosition + stepDistance - 1 &&
                    curPosition > newPosition - stepDistance + 1) {
                    lev.getBall(x, z, y).position.y = newPosition
                }

                i++;
            }
        }
    }
}


//COLUMNS ADD + REMOVE + MOVE
function getBallsInColumn(x, z) {
    var count = 0;
    for (var y = 0; y < lev.ysize; y++) {
        var p = lev.getBall(x, z, y).position.y;
        var zeroP = (positions) * posDist;
        if (p <= zeroP) {
            console.log(p);
            count++
        }
    }
    return count;
}

function getPositionsInColumn(x, z) {
    var currPositions = [];
    for (var y = 0; y < lev.ysize; y++) {
        var p = lev.getBall(x, z, y).position.y;
        var zeroP = (positions) * posDist;
        if (p <= zeroP) {
            currPositions.push(p);
        }
    }
    return currPositions;
}


function getCurrentFramePositions() {
    var currPositions = [];
    for (var x = 0; x < lev.xsize; x++) {
        for (var z = 0; z < lev.zsize; z++) {
            for (var y = 0; y < lev.ysize; y++) {
                var p = lev.getBall(x, z, y).position.y;
                var zeroP = (positions) * posDist;
                if (p <= zeroP) {
                    currPositions.push(p);
                }
            }
        }
    }
    return currPositions;
}



function getFrame() {
        var i = 0;
        var frame = [];

                for (var x = 0; x < lev.xsize; x++) {
                    for (var z = 0; z < lev.zsize; z++) {
                        for (var y = 0; y < lev.ysize; y++) {
                          frame.push(lev.getBall(x, z, y).position.y);
                          i++;
                        }
                    }
                }

        return frame;
}

function genrateRandomNext() {

        var i = 0;
        positionCount = 1;
        startPosition = 0;
        prevLength = 0;
        var randomFrame = [];

        for (var x = 0; x < lev.xsize; x++) {
            for (var z = 0; z < lev.zsize; z++) {
                for (var y = 0; y < lev.ysize; y++) {

                    num2 = posDist + startPosition - (ballSize / 2); //150
                    num1 = startPosition + (ballSize / 2); //25

                    isHole = Math.random();
                    if (isHole < 0.5) {
                        randomFrame.push(Math.floor(Math.random() * (num2 -
                            num1)) + num1 + 1);
                    } else {
                        randomFrame.push(5000);
                    }

                    if ((positionCount) < lev.ysize) {
                        positionCount++;
                        startPosition = startPosition + posDist;

                    } else {


                        var holes = 0;
                        var thelength = randomFrame.length;
                        for (var f = thelength - 1; f >= thelength - lev.ysize; f--) {
                            if (randomFrame[f] == 5000) {
                                holes++;
                                randomFrame.splice(f, 1);
                            }
                        }

                        //moveall holes to end
                        for (var p = 0; p < holes; p++) {
                            randomFrame.push(5000);
                        }

                        prevLength = randomFrame.length;
                        startPosition = 0;
                        positionCount = 1;
                    }


                    i++;
                }
            }
        }

        return randomFrame;
    } //END



// HIGH LEVEL APPS / FUNCTIONS

function setAppParameters() {


}

////////////////////////////////////////////////////////////////////////////////

function animate() {

    stats.begin();
    statsms.begin();
    ////////////////////////////////////////

    setTimeout(function() {

        requestAnimationFrame(animate);
        updateScene();
        // lev.sendBallPositions();

    }, 1000 / 30);

    render();

    ////////////////////////////////////////
    stats.end();
    statsms.end();

}

function render() {
    var timer = Date.now() * 0.0001;
    renderer.render(scene, camera);
}

function updateScene() {
  millis = Date.now();

    switch (simSelect) {
        case 0:
            //
            break;
        case 1:
            moveToFrame(wave());
            break;
        case 2:
            moveAlltoPos(positions + 1);
            break;
        case 3:
            moveAlltoDefault();
            break;
        case 4:
            moveToFrame(nextFrame);
            break;
        case 5:
            moveToFrame(waveStateChange());
            break;
        case 6:
            runApplication(appSelect);
            break;
        default:

    }

}
