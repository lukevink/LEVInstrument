//GUI //////////////////////////////////////////////////////////////////////

var LevGui = function() {

    this.guiID = 1;

    this.setInteractionMethod = function() {};

    this.setWav = function() {};
    this.wav_amplitude = wav_amplitude;
    this.wav_offset = wav_offset;
    this.wav_crests = wav_crests;

    this.setLev = function() {};
    this.columns = columns;
    this.positions = positions;
    this.ballSpeed = ballSpeed;
    this.columnDist = columnDist;
    this.posDist = columnDist;

    this.set3D = function() {};
    this.nextFrame = function() {};

    this.columnX = 0;
    this.columnZ = 0;

    this.selectColl = function() {};

    this.selectSim2 = function() {};

};

window.onload = function() {

    var levGui = new LevGui();
    var gui = new dat.GUI();


    gui.add(levGui, 'guiID').listen().name('Ball ID:');

    // theinfo.__controllers

    var setInteraction = gui.addFolder('Interaction Options');
    setInteraction.add(levGui, 'setInteractionMethod').onFinishChange(function() {
        intSelect = 0;
    }).name('Move Single');
    setInteraction.add(levGui, 'setInteractionMethod').onFinishChange(function() {
        intSelect = 1;
    }).name('Move Column');
    setInteraction.add(levGui, 'setInteractionMethod').onFinishChange(function() {
        intSelect = 2;
    }).name('Move All ');
    setInteraction.add(levGui, 'setInteractionMethod').onFinishChange(function() {
        intSelect = 3;
    }).name('Bend All ');



    var renderObjects = gui.addFolder('Render Static Object');
    renderObjects.add(levGui, 'nextFrame').onFinishChange(function() {
        simSelect = 4;
        nextFrame = shapeData(0);
    }).name('Sphere');
    renderObjects.add(levGui, 'nextFrame').onFinishChange(function() {
        simSelect = 4;
        nextFrame = shapeData(1);
    }).name('Cube');
    renderObjects.add(levGui, 'nextFrame').onFinishChange(function() {
        simSelect = 4;
        nextFrame = shapeData(2);
    }).name('Helix');
    renderObjects.add(levGui, 'nextFrame').onFinishChange(function() {
        simSelect = 4;
        nextFrame = shapeData(3);
    }).name('Torus');
    renderObjects.add(levGui, 'nextFrame').onFinishChange(function() {
        simSelect = 4;
        nextFrame = shapeData(4);
    }).name('Atom');
    renderObjects.add(levGui, 'nextFrame').onFinishChange(function() {
        simSelect = 4;
        nextFrame = planeFrame(1);

    }).name('Planes');
    renderObjects.add(levGui, 'nextFrame').onFinishChange(function() {
        simSelect = 4;
        nextFrame = genrateRandomNext();
    }).name('Random Frame');




    var apps = gui.addFolder('Applications');
    apps.add(levGui, 'nextFrame').onFinishChange(function() {
      simSelect = 6;
moveAlltoDefault();
        appSelect = 1;
        $("#sequencer").show();
    }).name('Sequencer');

    apps.add(levGui, 'nextFrame').onFinishChange(function() {
        wav_crests = 2;
        wav_amplitude = 0.1;
        scriptedBeginTime = millis;
        setWater();
        simSelect = 5;
        $("#sequencer").hide();

    }).name('State Change');


        var setWav = gui.addFolder('Wave Animation Options');
        setWav.add(levGui, 'wav_amplitude', 0, 1).onFinishChange(function(newValue) {
            simSelect = 1;
            wav_amplitude = newValue;
        });
        setWav.add(levGui, 'wav_crests', 0, 20).onFinishChange(function(newValue) {
            simSelect = 1;
            wav_crests = newValue;
        });
        setWav.add(levGui, 'wav_offset', 0, 1000).step(1).onFinishChange(function(newValue) {
            simSelect = 1;
            wav_offset = newValue;
            orbitYPosition = ((lev.ysize * posDist) - posDist - (wav_offset / 2)) / 2;
            controls.target.y = orbitYPosition;
            controls.object.lookAt(controls.target);
        });



    var setLev = gui.addFolder('Lev Settings');
    setLev.add(levGui, 'columns', 0, 20).step(1).onFinishChange(function(newValue) {
        columns = newValue;
        resetInlev();
    });
    setLev.add(levGui, 'positions', 0, 20).step(1).onFinishChange(function(newValue) {
        positions = newValue;
        resetInlev();
    });
    setLev.add(levGui, 'ballSpeed', 0, 0.05).onFinishChange(function(newValue) {
        ballSpeed = newValue;
    });
    setLev.add(levGui, 'columnDist', 100, 300).step(10).onFinishChange(function(newValue) {
        columnDist = newValue;
        resetInlev();
    });
    setLev.add(levGui, 'posDist', 100, 300).step(10).onFinishChange(function(newValue) {
        posDist = newValue;
        resetInlev();
    });

    var columnX = 0;
    var columnZ = 0;
    var selectCol = gui.addFolder('Select Column');
    selectCol.add(levGui, 'columnX').onFinishChange(function(newValue) {
        columnX = newValue
    });
    selectCol.add(levGui, 'columnZ').onFinishChange(function(newValue) {
        columnZ = newValue
    });
    selectCol.add(levGui, 'selectColl').onFinishChange(function() {
        selectColumn(columnX, columnZ)
    }).name('Select Column');
    selectCol.add(levGui, 'clear').name('Clear Selection');




};
