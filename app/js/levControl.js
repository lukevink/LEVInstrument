//Mousefunctions etc



///////////////////////////////////////////////////////////////////////
// MOUSE FUNCTIONS //

var mouseX = 0,
    mouseY = 0;

var tempX = 0,
    tempZ = 0;
tempY = 0;

var tempYcolumn = [];
tempXcolumn = [];
tempZcolumn = [];

var mouseClicked = false;

function onDocumentMouseDown(event) {

    multiTempSetOnce = false;

    // Get mouse position
    var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    var mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    // Get 3D vector from 3D mouse position using 'unproject' function
    var vector = new THREE.Vector3(mouseX, mouseY, 1);
    vector.unproject(camera);

    // Set the raycasterDrag position
    raycasterDrag.set(camera.position, vector.sub(camera.position).normalize());

    // Find all intersected objects
    var intersects = raycasterDrag.intersectObjects(lev.balls);

    if (intersects.length > 0) {
        // Disable the controls
        controls.enabled = false;
        currentFrame = getFrame();

        // Set the selection - first intersected object
        lev.selection = intersects[0].object;

        if (mouseClicked == false) {
            tempX = lev.selection.position.x;
            tempZ = lev.selection.position.z;
            tempY = lev.selection.position.y;
            mouseClicked = true;
        }

        document.body.className = 'closedhand';

        lev.selection.material = new THREE.MeshLambertMaterial({
            color: 0xFF0000
        });

        // Calculate the offset
        var intersects = raycasterDrag.intersectObject(lev.plane);
        lev.offset.copy(intersects[0].point).sub(lev.plane.position);

        if (LevGui) {
            LevGui.guiID = lev.getBallId(lev.selection);
            console.log('ballID:' + lev.getBallId(lev.selection));

              // LevGui.guiID.updateDisplay();


        }


    }


}

function onDocumentMouseMove(event) {

    var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    var mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    // Find MouseOver Ball
    raycasterh.setFromCamera(mouse, camera);

    var intersectsh = raycasterh.intersectObjects(lev.balls);

    if (intersectsh.length > 0) {
        //Highlight Hovered Ball
        if (mouseClicked == false) {
            if (INTERSECTED != intersectsh[0].object) {
                if (INTERSECTED) INTERSECTED.material = INTERSECTED.currentHex;
                INTERSECTED = intersectsh[0].object;
                INTERSECTED.currentHex = INTERSECTED.material;
                if (lev.selection == null) {
                    INTERSECTED.material = new THREE.MeshLambertMaterial({
                        color: 0xffccee
                    });
                }
                controls.enabled = false;
                document.body.className = 'openhand';

            }

        }


    } else {
        if (mouseClicked == false) {
            if (INTERSECTED) INTERSECTED.material = INTERSECTED.currentHex;
            INTERSECTED = null;
            controls.enabled = true;
            document.body.className = 'openhand';

        }

    }

    /////////////////////////////

    // Get 3D vector from 3D mouse position using 'unproject' function
    var vector = new THREE.Vector3(mouseX, mouseY, 1);
    vector.unproject(camera);

    // Set the raycasterDrag position
    raycasterDrag.set(camera.position, vector.sub(camera.position).normalize());


    if (lev.selection) {
        // Check the position where the plane is intersected
        var intersects = raycasterDrag.intersectObject(lev.plane);

        // Reposition the object based on the intersection point with the plane

        if (mouseClicked == true) {

            simSelect = 0;
            lev.selection.position.copy(intersects[0].point.sub(lev.offset));

            switch (intSelect) {
                case 0:
                    dragSingleBall(lev.selection);
                    break;
                case 1:
                    // dragColumn(lev.selection);
                    break;
                case 2:
                    dragPlane(lev.selection);
                    break;
                case 3:
                    planeInterpolation(lev.selection)
                    break;
                case 4:
                    // Function for etc
                    break;
                default:
                    dragSingleBall(lev.selection);

            }

        }



    } else {
        // Update position of the plane if need
        var intersects = raycasterDrag.intersectObjects(lev.balls);
        if (intersects.length > 0) {
            lev.plane.position.copy(intersects[0].object.position);
            lev.plane.lookAt(camera.position);
        }
    }




}

function onDocumentMouseUp(event) {
    // Enable the controls

    if(lev.selection)
        sendBallPosition(lev.selection);

    controls.enabled = true;
    lev.selection = null;
    mouseClicked = false;
    multiTempSetOnce = false;

    //REMOVE WHEN ALL BALLS
    lev.sendBallrows();
}


function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


function onMouseMove(event) {

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

}

function transformRange(old_value, old_min, old_max, new_min, new_max) {
    new_value = ((old_value - old_min) / (old_max - old_min)) * (new_max - new_min) + new_min;
    return new_value;
}



function zeroFill(number, width) {
    width -= number.toString().length;
    if (width > 0) {
        return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
    }
    return number + ""; // always return a string
}

function dragSingleBall(ball) {
    if (ball.position.y < 0) {
        ball.position.y = 0
    }
    if (ball.position.y < tempY) {
        ball.material = new THREE.MeshLambertMaterial({
            color: 0x00FFFF
        });
    }

    if (ball.position.y > tempY) {
        ball.material = new THREE.MeshLambertMaterial({
            color: 0x3399FF
        });
    }
    ball.position.x = tempX;
    ball.position.z = tempZ;

}


function dragPlane(ball) {
    if (ball.position.y < 0) {
        ball.position.y = 0
    }
    ball.position.x = tempX;
    ball.position.z = tempZ;
    plane = lev.getPlane(ball.id % lev.ysize);
    area = lev.xsize * lev.zsize;
    console.log(area)
    for (var i = 0; i < area; i++) {
        ball_in_plane = lev.getBallById(plane[i]);
        ball_in_plane.position.y = ball.position.y;
    }
}

function planeInterpolation(ball) {
    console.log(ball.id);
    if (ball.position.y < 0) {
        ball.position.y = 0
    }
    plane_id = ball.id % lev.ysize;
    displacement = ball.position.y - tempY;
    ball.position.x = tempX;
    ball.position.z = tempZ;
    plane = lev.getPlane(plane_id);
    area = lev.xsize * lev.zsize;
    // Rows
    crossA1 = lev.getCrossA(plane_id, 0);
    crossA2 = lev.getCrossA(plane_id, 1);
    crossA3 = lev.getCrossA(plane_id, 2);
    crossA4 = lev.getCrossA(plane_id, 3);
    crossA5 = lev.getCrossA(plane_id, 4);
    // Columns
    crossB1 = lev.getCrossB(plane_id, 0);
    crossB2 = lev.getCrossB(plane_id, 1);
    crossB3 = lev.getCrossB(plane_id, 2);
    crossB4 = lev.getCrossB(plane_id, 3);
    crossB5 = lev.getCrossB(plane_id, 4);
    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < area; j++) {
            ball_in_plane = lev.getBallById(plane[j]);
            if (ball_in_plane.id != ball.id) {
                if (ball.id == crossA1[i]) {
                    //edge1 case
                    if (in_list(ball_in_plane.id, crossA1)) {
                        ball_in_plane.position.y = ball.position.y;
                        if (ball_in_plane.position.y < 0) {
                            ball_in_plane.position.y = 0
                        }
                    }
                    if (in_list(ball_in_plane.id, crossA2)) {
                        ball_in_plane.position.y = ball.position.y * .5;
                        if (ball_in_plane.position.y < 0) {
                            ball_in_plane.position.y = 0
                        }
                    }
                    if (in_list(ball_in_plane.id, crossA3)) {
                        ball_in_plane.position.y = ball.position.y * .25;
                        if (ball_in_plane.position.y < 0) {
                            ball_in_plane.position.y = 0
                        }
                    }
                    if (in_list(ball_in_plane.id, crossA4)) {
                        ball_in_plane.position.y = ball.position.y * .125;
                        if (ball_in_plane.position.y < 0) {
                            ball_in_plane.position.y = 0
                        }
                    }
                    if (in_list(ball_in_plane.id, crossA5)) {
                        ball_in_plane.position.y = ball.position.y * .0625;
                        if (ball_in_plane.position.y < 0) {
                            ball_in_plane.position.y = 0
                        }
                    }
                }
                if (ball.id == crossB1[i]) {
                    //edge2 case
                    if (in_list(ball_in_plane.id, crossB1)) {
                        ball_in_plane.position.y = ball.position.y;
                        if (ball_in_plane.position.y < 0) {
                            ball_in_plane.position.y = 0
                        }
                    }
                    if (in_list(ball_in_plane.id, crossB2)) {
                        ball_in_plane.position.y = ball.position.y * .5;
                        if (ball_in_plane.position.y < 0) {
                            ball_in_plane.position.y = 0
                        }
                    }
                    if (in_list(ball_in_plane.id, crossB3)) {
                        ball_in_plane.position.y = ball.position.y * .25;
                        if (ball_in_plane.position.y < 0) {
                            ball_in_plane.position.y = 0
                        }
                    }
                    if (in_list(ball_in_plane.id, crossB4)) {
                        ball_in_plane.position.y = ball.position.y * .125;
                        if (ball_in_plane.position.y < 0) {
                            ball_in_plane.position.y = 0
                        }
                    }
                    if (in_list(ball_in_plane.id, crossB5)) {
                        ball_in_plane.position.y = ball.position.y * .0625;
                        if (ball_in_plane.position.y < 0) {
                            ball_in_plane.position.y = 0
                        }
                    }
                }
                if (ball.id == crossA5[i]) {
                    //edge3 case
                    if (in_list(ball_in_plane.id, crossA5)) {
                        ball_in_plane.position.y = ball.position.y;
                        if (ball_in_plane.position.y < 0) {
                            ball_in_plane.position.y = 0
                        }
                    }
                    if (in_list(ball_in_plane.id, crossA4)) {
                        ball_in_plane.position.y = ball.position.y * .5;
                        if (ball_in_plane.position.y < 0) {
                            ball_in_plane.position.y = 0
                        }
                    }
                    if (in_list(ball_in_plane.id, crossA3)) {
                        ball_in_plane.position.y = ball.position.y * .25;
                        if (ball_in_plane.position.y < 0) {
                            ball_in_plane.position.y = 0
                        }
                    }
                    if (in_list(ball_in_plane.id, crossA2)) {
                        ball_in_plane.position.y = ball.position.y * .125;
                        if (ball_in_plane.position.y < 0) {
                            ball_in_plane.position.y = 0
                        }
                    }
                    if (in_list(ball_in_plane.id, crossA1)) {
                        ball_in_plane.position.y = ball.position.y * .0625;
                        if (ball_in_plane.position.y < 0) {
                            ball_in_plane.position.y = 0
                        }
                    }
                }
                if (ball.id == crossB5[i]) {
                    //edge4 case
                    if (in_list(ball_in_plane.id, crossB5)) {
                        ball_in_plane.position.y = ball.position.y;
                        if (ball_in_plane.position.y < 0) {
                            ball_in_plane.position.y = 0
                        }
                    }
                    if (in_list(ball_in_plane.id, crossB4)) {
                        ball_in_plane.position.y = ball.position.y * .5;
                        if (ball_in_plane.position.y < 0) {
                            ball_in_plane.position.y = 0
                        }
                    }
                    if (in_list(ball_in_plane.id, crossB3)) {
                        ball_in_plane.position.y = ball.position.y * .25;
                        if (ball_in_plane.position.y < 0) {
                            ball_in_plane.position.y = 0
                        }
                    }
                    if (in_list(ball_in_plane.id, crossB2)) {
                        ball_in_plane.position.y = ball.position.y * .125;
                        if (ball_in_plane.position.y < 0) {
                            ball_in_plane.position.y = 0
                        }
                    }
                    if (in_list(ball_in_plane.id, crossB1)) {
                        ball_in_plane.position.y = ball.position.y * .0625;
                        if (ball_in_plane.position.y < 0) {
                            ball_in_plane.position.y = 0
                        }
                    }
                }
            }
        }
    }
}


//



function dragColumn(ball) {

    var column = selectColumnByBall(ball);
    console.log(column);

    //FIX THIS SHIT.
    if (multiTempSetOnce == false) {
        tempY = ball.position.y;
        for (var i = 0; i < 5; i++) {
            tempYcolumn[i] = column[i].position.y;
            tempXcolumn[i] = column[i].position.x;
            tempZcolumn[i] = column[i].position.z;
            console.log(tempYcolumn[i]);
        }

        multiTempSetOnce = true;
    }

    for (var i = 0; i < 5; i++) {
        if (column[i].position.y < 0) {
            column[i].position.y = 0
        }


        if (column[i].position.y < tempYcolumn[i]) {
            column[i].material = new THREE.MeshLambertMaterial({
                color: 0x00FFFF
            });
        }

        if (column[i].position.y > tempYcolumn[i]) {
            column[i].material = new THREE.MeshLambertMaterial({
                color: 0x3399FF
            });
        }

        column[i].position.x = tempXcolumn[i];
        column[i].position.z = tempZcolumn[i];
        ball.position.x = tempXcolumn[i];
        ball.position.z = tempZcolumn[i];


        column[i].position.y = (column[i].position.y + (tempYcolumn[i] + tempY));


        var oldY = parseInt(column[i].position.y);
        var newY = parseInt(transformRange(oldY, 0, (rows * 2 * posDist), 0, 15));
        var command = "B" + zeroFill(lev.getBallId(column[i]), 3) + zeroFill(newY, 3);

        // if(socket)
        //   socket.emit('ballMoved',{ID:(lev.getBallId(column[i])), y:newY});
        //   // socket.emit('ballY',newY);
        //   socket.emit('ballCommand',command)
    }

}






///////////////////////////////////////////////////////////////////////////////////////////////////////// NODE COMMUNICATION //////////////////////////////////////////////////////////////////

function sendBallPosition(theball){

  var oldY = parseInt(theball.position.y);
  var newY = parseInt(transformRange(oldY, 0, (rows * 2 * posDist), 0, 15));
  var command = "B" + zeroFill(lev.getBallId(theball), 3) + zeroFill(newY, 3) + zeroFill(floatto255(theball.material.color.r), 3) + zeroFill(floatto255(theball.material.color.g), 3) + zeroFill(floatto255(theball.material.color.b), 3) ;

  if(socket)
    socket.emit('ballCommand',command);

}

function floatto255(value){
  return transformRange(value, 0, 1, 0, 255);
}


function makeAllBallsColor(r,g,b){

  for (var b = 0; b < lev.balls.size; b++) {
    var command = "B" + zeroFill(lev.getBallId(b), 3) + zeroFill(999, 3) + zeroFill(r, 3) + zeroFill(g, 3) + zeroFill(b, 3);
    if(socket)
      socket.emit('ballCommand',command);
  }

}



////////////// KEY PRESS ///////////////

$(document).keypress(function(e) {
    if(e.which == 13) {
        if(!newCalID)
          newCalID = true;
    }
});








document.addEventListener('mousemove', onDocumentMouseMove, false);
document.addEventListener('mousedown', onDocumentMouseDown, false);
document.addEventListener('mouseup', onDocumentMouseUp, false);
window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('resize', onWindowResize, false);
window.requestAnimationFrame(render);
