//GUI //////////////////////////////////////////////////////////////////////

var LevGui = function() {

    this.guiID = 1;

    this.setInteractionMethod = function() {};

    // this.setWav = function() {};
    // this.wav_amplitude = wav_amplitude;
    // this.wav_offset = wav_offset;
    // this.wav_crests = wav_crests;

    this.setLev = function() {};
    this.columns = columns;
    this.rows = rows;
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




    var setLev = gui.addFolder('Lev Settings');
    setLev.add(levGui, 'columns', 0, 20).step(1).onFinishChange(function(newValue) {
        columns = newValue;
        resetInlev();
    });
    setLev.add(levGui, 'rows', 0, 20).step(1).onFinishChange(function(newValue) {
        rows = newValue;
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
    setLev.add(levGui, 'nextFrame').onFinishChange(function() {
        nextFrame = genrateRandomNext();
        animateToFrame = true;
    }).name('Random Frame');




};
