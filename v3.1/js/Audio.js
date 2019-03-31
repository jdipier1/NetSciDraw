Audio.init = function() {
    Audio.drop = new Audio("css/sfx/drop.mp3");
    Audio.wipe = new Audio("css/sfx/wipe.mp3");
    Audio.edit = new Audio("css/sfx/edit.mp3");
    Audio.plop = new Audio("css/sfx/plop.mp3");
}

Audio.play = function(str) {
    Audio.playAtVolume(str, 1.0);
}

Audio.playAtVolume = function(str, vol) {
    var audio = null;
    if (str == 'drop') {
        audio = Audio.drop;
    }
    else if (str == 'wipe') {
        audio = Audio.wipe;
    }
    else if (str == 'edit') {
        audio = Audio.edit;
    }
    else if (str == 'plop') {
        audio = Audio.plop;
    }

    if (audio != null) {
        audio.volume = vol;
        audio.pause();
        audio.currentTime = 0;
        audio.play();
        audio.volume = 1.0;
    }
}