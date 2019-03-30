Audio.init = function() {
    Audio.drop = new Audio("css/sfx/drop.mp3");
    Audio.wipe = new Audio("css/sfx/wipe.mp3");
    Audio.edit = new Audio("css/sfx/edit.mp3");
    Audio.plop = new Audio("css/sfx/plop.mp3");
}

    

Audio.play = function(str) {
    if (str == 'drop') {
        Audio.drop.pause();
        Audio.drop.currentTime = 0;
        Audio.drop.play();
    }
    else if (str == 'wipe') {
        Audio.wipe.pause();
        Audio.wipe.currentTime = 0;
        Audio.wipe.play();
    }
    else if (str == 'edit') {
        Audio.edit.pause();
        Audio.edit.currentTime = 0;
        Audio.edit.play();
    }
    else if (str == 'plop') {
        Audio.plop.pause();
        Audio.plop.currentTime = 0;
        Audio.plop.play();
    }
}