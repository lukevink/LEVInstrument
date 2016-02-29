var dbg = function(s) {
	if(typeof console !== 'undefined')
		console.log("Sequencer: " + s);
};

var globals = (function(){
    var pm = {};
    pm.colSelected = 0;
    pm.loaded = 0;
    return pm;
})();


    
$(document).ready(function(){
         $("td").click(function(){
            $(this).toggleClass("play");
        });
        
        for(var i = 1; i <=16; i++){
            var soundFile = 'sound'+i;
            var snd = new Sound(soundFile+'.mp3');
            snd.load();
            globals.soundFile = snd;
        }
        run();
    });

function run(){
    alert('called');
    setInterval(playNextColumn, 250);

    function playNextColumn(){
        var curr = globals.colSelected + 1;
        var prev = curr - 1;
        if(prev <= 0){
            prev = 16;
        }
        $('tr td:nth-child('+curr+')').addClass("selected");
        $('tr td:nth-child('+curr+')').each(function(){
            if($(this).hasClass("play")){
                var soundName = $(this).parent().attr('id');
                dbg(new Date().getTime());
                globals.soundName.play();
                //soundManager.play(soundName);
            }

        });
        $('tr td:nth-child('+prev+')').removeClass("selected");
        globals.colSelected = (curr) % 16;
        
        
    }
}
