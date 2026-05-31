var TIF = {                            
    album:              "TALB",
    bpm:                "TBPM",
    composer:           "TCOM",
    genre:              "TCON",
    copyright:          "TCOP",
    date:               "TDAT",
    playlistDelay:      "TDLY",
    encodedBy:          "TENC",
    textWriter:         "TEXT",
    fileType:           "TFLT",
    time:               "TIME",
    contentGroup:       "TIT1",
    title:              "TIT2",
    subtitle:           "TIT3",
    initialKey:         "TKEY",
    language:           "TLAN",
    length:             "TLEN",
    mediaType:          "TMED",
    originalTitle:      "TOAL",
    originalFilename:   "TOFN",
    originalTextwriter: "TOLY",
    originalArtist:     "TOPE",
    originalYear:       "TORY",
    fileOwner:          "TOWN",
    artist:             "TPE1",
    performerInfo:      "TPE2",
    conductor:          "TPE3",
    remixArtist:        "TPE4",
    partOfSet:          "TPOS",
    publisher:          "TPUB",
    trackNumber:        "TRCK",
    recordingDates:     "TRDA",
    internetRadioName:  "TRSN",
    internetRadioOwner: "TRSO",
    size:               "TSIZ",
    ISRC:               "TSRC",
    encodingTechnology: "TSSE",
    year:               "TYER"
}
function Audio() {
  
}
Audio.prototype.update = function(tags, buffer) {
    var frames = [];
    frames.push(this.createTagHeader());
    var tagNames = Object.keys(tags);
    for(var i = 0; i < tagNames.length; i++) {

        if(TIF[tagNames[i]]) {
            var specName = TIF[tagNames[i]];
            var frame = this.createTextFrame(specName, tags[tagNames[i]]);
            if(frame instanceof Buffer) frames.push(frame);
        }
    }

    if(tags.image) {
        var frame = this.createPictureFrame(tags.image);
        if(frame instanceof Buffer) frames.push(frame);
    }

    var totalSize = 0;
    for(var i = 0; i < frames.length; i++) {
        totalSize += frames[i].length;
    }

    totalSize -= 10;
    var size = encodeSize(totalSize);

    frames[0].writeUInt8(size[0], 6);
    frames[0].writeUInt8(size[1], 7);
    frames[0].writeUInt8(size[2], 8);
    frames[0].writeUInt8(size[3], 9);

    var completeTag = Buffer.concat(frames);
    try {
        var data = buffer
        data = this.removeTagsFromBuffer(data) || data;
        var rewriteFile = Buffer.concat([completeTag, data]);
        return rewriteFile
    } catch(e) {
        return e;
    }

    return true;
}

Audio.prototype.removeTagsFromBuffer = function (data){
  var ts = String.prototype.indexOf.call(data, (new Buffer("ID3")));
  if(ts == -1 || ts > 20) return false;

  var hSize = new Buffer([data[ts +6], data[ts +7], data[ts +8], data[ts +9]]);
  if ((hSize[0] | hSize[1] | hSize[2] | hSize[3]) & 0x80) {

      return false;
  }
  var encSize = ((hSize[0] << 21) + (hSize[1] << 14) + (hSize[2] << 7) + (hSize[3]));
  return data.slice(ts + encSize + 10);
};

Audio.prototype.removeTags = function(filepath) {
    try {
        var data = fs.readFileSync(filepath);
    } catch(e) {
        return e;
    }
    var newData = this.removeTagsFromBuffer(data);
    if(!newData) return false;
    try {
        fs.writeFileSync(filepath, newData, 'binary');
    } catch(e) {
        return e;
    }
    return true;
}

function encodeSize(totalSize) {
    byte_3 = totalSize & 0x7F;
    byte_2 = (totalSize >> 7) & 0x7F;
    byte_1 = (totalSize >> 14) & 0x7F;
    byte_0 = (totalSize >> 21) & 0x7F;
    return ([byte_0, byte_1, byte_2, byte_3]);
}

Audio.prototype.createTagHeader = function() {
    var header = new Buffer(10);
    header.fill(0);
    header.write("ID3", 0);             
    header.writeUInt16BE(0x0300, 3);    
    header.writeUInt16BE(0x0000, 5);    
    return header;
}

Audio.prototype.createTextFrame = function(specName, text) {
    if(!specName || !text) return null;
    var buffer = new Buffer(10);
    buffer.fill(0);
    buffer.write(specName, 0);
    buffer.writeUInt32BE((text).length + 1, 4);     
    var encBuffer = new Buffer(1);                  
    encBuffer.fill(0);
    var contentBuffer = new Buffer(text, 'binary'); 
    return Buffer.concat([buffer, encBuffer, contentBuffer]);
}

Audio.prototype.createPictureFrame = function(buffer) {
    try {
        var apicData = new Buffer(buffer, 'binary');
        var bHeader = new Buffer(10);
        bHeader.fill(0);
        bHeader.write("APIC", 0);
    	var mime_type = "image/png";
        if(apicData[0] == 0xff && apicData[1] == 0xd8 && apicData[2] == 0xff) {
            mime_type = "image/jpeg";
        }
        var bContent = new Buffer(mime_type.length + 4);
        bContent.fill(0);
        bContent[mime_type.length + 2] = 0x03; 
        bContent.write(mime_type, 1);
    	bHeader.writeUInt32BE(apicData.length + bContent.length, 4);     

        return Buffer.concat([bHeader, bContent, apicData]);
    } catch(e) {
        return e;
    }
}
module.exports = new Audio