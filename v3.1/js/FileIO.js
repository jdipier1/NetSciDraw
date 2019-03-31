/*
Example on how to use this script:

// Writing a file called "exampleFile.nsd" //

FileIO.writeFile("exampleFile");
FileIO.write("some identifier", "some data")
FileIO.write("Jason", "is the coolest B)");
FileIO.write("Binghamton University", "https://en.wikipedia.org/wiki/Binghamton_University_basketball_scandal");
FileIO.saveFile();

// Reading that same file //

FileIO.emptyFileCache(); // In case any file was opened previosuly
FileIO.openFile();
window.addEventListener('readevent', function(e) {
    var infoFromFile = FileIO.read("some identifier");
    var coolDude = FileIO.read("Jason");
    var university = FileIO.read("Binghamton");        // This will set "university" to "MISSING_DATA", since we didnt save anything to this key
}
*/

//window.document.body.innerHTML = "<input id='file_input' type='file' name='name' style='display: none;'>";

window.FileIO = {};

FileIO.name = "";
FileIO.writeData = "";
FileIO.readData = [];
FileIO.appExtension = ".nsd";

FileIO.readEvent = document.createEvent('Event');
FileIO.readEvent.initEvent('readevent', true, true);

// TODO: For this script to work, this code must be put somewhere (it is currently in teh Sidebar.js script)
//"<input id='file_input' type='file' name='name' style='left: -999999; display: none;'>";

FileIO.writeFile = function(filename) {
    var filenameLower = filename.toLowerCase();
    FileIO.name = filenameLower.includes(FileIO.appExtension) ? filename : filename + FileIO.appExtension;
    FileIO.writeData = "";
}

FileIO.write = function(key, value) {
    var valueSanitized = value.toString().replace(new RegExp('\n', 'g'), '\b');
    FileIO.writeData += key + "\t" + valueSanitized + "\n";
}

FileIO.saveFile = function() {
    var uri = "data:application/octet-stream;filename="+FileIO.name+"," + encodeURIComponent(FileIO.writeData);
    // Doesn't work in certain browsers
    //window.open(uri, 'newproject');
    
    var link = document.createElement('a');
    if (typeof link.download === 'string') {
        document.body.appendChild(link);
        link.download = FileIO.name;
        link.href = uri;
        link.click();
        document.body.removeChild(link);
    } else {
        location.replace(uri);
    }
}

FileIO.openFile = function() {
    var input = document.getElementById("file_input");
    input.click();

    input.onchange = function(event) {
        var file = input.files[0];

        if (!file.name.toLowerCase().includes(FileIO.appExtension)) {
            alert("Please choose a NetSciDraw (.nsd) file");
			return;
        }

        var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function(e) {
            if (FileIO.readData.length != 0) return;
            try {
                var data = e.target.result;
                var lines = data.split("\n");
                for(var i = 0; i < lines.length; i++) {
                    var keyVal = lines[i].split("\t");
                    if (keyVal.length == 2) {
                        var value = keyVal[1].replace(new RegExp("\b", 'g'), "\n");
                        FileIO.readData.push(keyVal[0]);
                        FileIO.readData.push(value);
                    }
                }

                if (FileIO.readData.length > 2) {
                    window.dispatchEvent(FileIO.readEvent);
                } else {
                    alert("Failed to read file :( [Read data was too small]");
					return;
                }
            }
            catch {
                alert("Failed to read file :( [Unknown error while reading]");
            }
        }
    }
}

// This function does no error checking, and should only be used with expected data
FileIO.readInternalData = function(data) {
    var lines = data.split("\n");
    for(var i = 0; i < lines.length; i++) {
        var keyVal = lines[i].split("\t");
        var value = keyVal[1].replace(new RegExp("\b", 'g'), "\n");
        FileIO.readData.push(keyVal[0]);
        FileIO.readData.push(value);
    }
}

FileIO.read = function(key) {
    console.log("READ: "+FileIO.readData.length);
    for(var i = 0; i < FileIO.readData.length; i += 2) {
        if (FileIO.readData[i] == key) {
            return FileIO.readData[i+1];
        }
    }

    return "MISSING_DATA";
}

FileIO.emptyFileCache = function() {
    FileIO.readData = [];
    FileIO.readEvent.preventDefault();
}

FileIO.saveCanvas = function(filename) {
    var filenameLower = filename.toLowerCase();
    name = filenameLower.includes(".png") ? filename : filename + ".png";

    var d=Model.getCanvas().toDataURL(name+"/png");
    var link = document.createElement('a');
    if (typeof link.download === 'string') {
        document.body.appendChild(link);
        link.download = name;
        link.href = d;
        link.click();
        document.body.removeChild(link);
    } else {
        location.replace(uri);
    }
    //var w=window.open('about:blank');
    //w.document.write("<img src='"+d+"' alt='from canvas'/>");
}