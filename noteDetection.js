import { PitchDetector } from "https://esm.sh/pitchy@4";

// Song var Setup
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
var barnSongs = [[0, 2, 4, 5, 7, 9, 11, 12],[12, 11, 9, 7, 5, 4, 2, 0]];
var fieldColumnSongs = [[0, 4, 7], [0, 4, 7, 12, 11], [0, 4, 7, 12, 11, 7, 5], [0,4, 7, 12, 11, 7, 5, 2, 0]];
var fieldRowSongs  =[[-12, -8, -5], [-12, -8, -5, -8], [-12, -8, -5, -8, -12]];
var seedSongs = [[0, 2, 0, 4, 0, 5],[0, 7, 0, 9],[0, 11, 0, 12]];
var cancelSong = [[-5, -1, 2, -1, -5]];
var pots = [
            [-1,-1,-1,-1],
            [-1,-1,-1,-1],
            [-1,-1,-1,-1]
            ];
var stageOfPot = [
                  [1,1,1,1],
                  [1,1,1,1],
                  [1,1,1,1]
                  ]

//Note deection variable creation
var tuning = 2;
var middleC =12*5;
var currentNotes = [];
var pastNotes = new Array(20).fill('emp');

var currentColumn = -1;
var currentRow = -1;
var barnOpen = false;
var barnLocked = false;
var seedsAvailable = new Array(3);
var bag = new Array(0);
var bagOpen = false;
var finalTestStage = 1;
var testLocked = true;

//compares two arrays to see if they are equal
function areEqual(length, arr1, arr2){
  for (var i = 0; i < length; i++){
    if(arr1[i] != arr2 [i]){
      return false;
    }
  }
  return true;
}

function replaceSeeds(){
  for (var i=0; i<3; i++){
    if ($("#seed"+i).hasClass("seedFall")){
      seedsAvailable[i] = Math.floor(Math.random()*plants.length);
      $("#seed"+i).attr("src", "img/"+plants[seedsAvailable[i]][0]+"Seed.png");
      $("#seed"+i).removeClass("seedFall");    
      $("#seed"+i+"Song").removeClass("seedFall");
    }
  }
}

//checks if the current played notes are any of the songs
function checkSongs(){
  if(!barnOpen){
    if (!bagOpen && !barnLocked && currentNotes.length == barnSongs[0].length && areEqual(currentNotes.length, currentNotes, barnSongs[0])){
      $("#notesPlayed").text("enter barn Song");

      $('#barnTray').removeClass('slideOut');
      $('#barnTray').addClass('slideIn');

      $('#templateStaff').empty();

      replaceSeeds();

      barnOpen = true;
    }
    for (var i = 0; i < fieldColumnSongs.length; i++){
      if (currentNotes.length == fieldColumnSongs[i].length && areEqual(currentNotes.length, currentNotes, fieldColumnSongs[i])) {
        $("#notesPlayed").text("field column song");
        $("#selectionBox").attr("style", "visibility: visible; left: "+(16+11.5*i)+"dvw;");
        currentColumn=i;
        if(!barnLocked){
          $("#barn").attr("src", "img/Barn Closing.gif");
          barnLocked = true;
        }
      }
    }
    if (currentColumn>=0){
      for (var i = 0; i < fieldRowSongs.length; i++){
        if (currentNotes.length == fieldRowSongs[i].length && areEqual(currentNotes.length, currentNotes, fieldRowSongs[i])) {
          $("#notesPlayed").text("field row song");
          $("#pointer").attr("style", "visibility: visible; left: "+(16+11.5*currentColumn)+"dvw; top: " + (50+21*i) + "dvh;");
          currentRow = i;
        }
      }
    }
    if(bagOpen){
      for (var i=0; i< bag.length; i++){
        if (currentNotes[0] == barnSongs[0][i]) {
          pots[currentRow][currentColumn]=bag[i];
          $("#pot"+currentRow+currentColumn).attr("src", "img/"+plants[bag[i]][0]+"Pot.png")
          bag.splice(i,1);
          $("#bag").removeClass("bagIn");
          $("#bag").addClass("bagOut");
          bagOpen=false;
          deselect();

          localStorage.setItem('pots', JSON.stringify(pots));
          localStorage.setItem('bag', JSON.stringify(bag));
        }
      }
    }
    for (var i = 0; i<pots.length; i++){
      for (var j = 0; j<pots[i].length; j++){
        if (pots[i][j]>=0){
          if (stageOfPot[i][j]<5){
            var plantsNotes = new Array(plants[pots[i][j]][stageOfPot[i][j]].length);
            for (var k = 0; k< plantsNotes.length; k++){
              plantsNotes[k] = noteNames[plants[pots[i][j]][stageOfPot[i][j]][k] % 12] + (Math.floor(plants[pots[i][j]][stageOfPot[i][j]][k] / 12) - 1)
            }
            if (currentNotes.length == plantsNotes.length && areEqual(currentNotes.length, currentNotes, plantsNotes)) {
              stageOfPot[i][j]++;
              localStorage.setItem('stageOfPot', JSON.stringify(stageOfPot));
              $('#staff').empty();
              currentNotes = [];
              switch (stageOfPot[i][j]){
                case 2: $('#pot'+i+j).attr("src", "img/"+plants[pots[i][j]][0]+"Sprout.png")
                  break;
                case 3: $('#pot'+i+j).attr("src", "img/"+plants[pots[i][j]][0]+"Stock.png")
                  break;
                case 4: $('#pot'+i+j).attr("src", "img/"+plants[pots[i][j]][0]+"Bud.png")
                  break;
                case 5: $('#pot'+i+j).attr("src", "img/"+plants[pots[i][j]][0]+"Flower.png")
                  break;
                default:
                  break;
              }
              if (stageOfPot[i][j] < 5){
                displayTemplate(pots[i][j],stageOfPot[i][j]);
              }
              else{
                $('#templateStaff').empty();
              }
            }
          }
          else if(!testLocked){
            var plantsNotes = new Array(plants[pots[i][j]][finalTestStage].length);
            for (var k = 0; k< plantsNotes.length; k++){
              plantsNotes[k] = noteNames[plants[pots[i][j]][finalTestStage][k] % 12] + (Math.floor(plants[pots[i][j]][finalTestStage][k] / 12) - 1)
            }
            if (currentNotes.length == plantsNotes.length && areEqual(currentNotes.length, currentNotes, plantsNotes)) {
              $('#staff').empty();
              currentNotes = [];     
              if (finalTestStage<4){
                finalTestStage++;
                displayTemplate(pots[i][j],finalTestStage);
              }  
              else{
                finalTestStage = 1;
                $('#pot'+i+j).attr("src", "img/Pot.png")
                pots[i][j] = -1;
                stageOfPot[i][j] = 1;
                $('#templateStaff').empty();
                testLocked = true;
                localStorage.setItem('pots', JSON.stringify(pots));
                localStorage.setItem('stageOfPot', JSON.stringify(stageOfPot));
              }
            }
          }
        }
      }
    }
    if (currentNotes.length == cancelSong[0].length && areEqual(currentNotes.length, currentNotes, cancelSong[0])){
      if(bagOpen){
        $("#bag").removeClass("bagIn");
        $("#bag").addClass("bagOut");
        bagOpen=false;
      }
      deselect();
      finalTestStage = 1;
      $('#templateStaff').empty();
      testLocked = true;
    }
  }
  else{
    if (currentNotes.length == barnSongs[1].length && areEqual(currentNotes.length, currentNotes, barnSongs[1])){
      $("#notesPlayed").text("exit barn song");
      $('#barnTray').removeClass('slideIn');
      $('#barnTray').addClass('slideOut');
      barnOpen = false;
    }
    for (var i = 0; i < seedSongs.length; i++){
      if (currentNotes.length == seedSongs[i].length && areEqual(currentNotes.length, currentNotes, seedSongs[i])) {
        if(bag.length<8){
          $("#notesPlayed").text("seed song");
          $("#seed"+i).addClass("seedFall");
          $("#seed"+i+"Song").addClass("seedFall");
          bag.push(seedsAvailable[i]);
          localStorage.setItem('bag', JSON.stringify(bag));
        }
      }
    }
  }
}

function deselect(){
  $("#selectionBox").attr("style", "visibility: hidden;");
  $("#pointer").attr("style", "visibility: hidden;");
  currentColumn = -1;
  currentRow = -1;
  $("#barn").attr("src", "img/Barn Opening.gif");
  barnLocked = false;
}

//checks if all notes between certain values are the given note
function between(note, begin, end) {
  for (var i = begin; i <= end; i++){
    if (pastNotes[i]!=note){
      return false;
    }
  }
  return true;
}
//checks if all notes between certain values are NOT the given note
function notBetween(note, begin, end) {
  for (var i = begin; i <= end; i++){
    if (pastNotes[i]==note){
      return false;
    }
  }
  return true;
}

//places the note at the currect spot, given it's pitch and length
function placeNote(midiNum, length, spotInPhrase, isPlayer){
  // $.get('note.html', function (NoteHTML) {
  //   var NoteHTML = $(NoteHTML);

    //sets the image to the correct note type
    var imageSrc;
    switch (length){
      case 1:
        imageSrc = "Whole";
        break;
      case 2:
        imageSrc = "Half";
        break;
      case 4:
        imageSrc = "Quarter";
        break;
      case 8:
        imageSrc = "Eighth";
        break;
      case 16:
        imageSrc = "Sixteenth";
        break;
    }

    //sets the tail direction
    if (midiNum >= middleC-1 && length != 1){
      imageSrc += " Down"
    }
    else if(length != 1){
      imageSrc += " Up"
    }

    //sets if the note is sharp or not
    switch(midiNum%12){
      case 1:
      case 3:
      case 6:
      case 8:
      case 10:
        imageSrc += " Sharp";
        midiNum--;
        break;
      default:
        break;
    }

    //sets as either a player note or a template note
    var color = "color:rgb(0,8,85)" ;
    if(isPlayer){
      color = "color:rgb(255,255,255)" ;
      imageSrc+=" Player"
    }

    //corrects the note's shift (accounting for difference in midi number due to sharps having their own numbers)
    if ((midiNum%12>4 || Math.floor(midiNum/12>(middleC/12))) && midiNum > middleC){
      midiNum += 1 + Math.floor(-1*(middleC-midiNum)/12);
    }
    else if ((midiNum%12<5 || Math.floor(midiNum/12<(middleC/12))) && midiNum < middleC){
      midiNum -= 1 + Math.floor((middleC-midiNum)/12);
    }

    //sets the image and location of the note
    // NoteHTML.filter("#image").attr("src", "img/" + imageSrc + ".png");
    // NoteHTML.filter("#image").attr("style", "top:" + ((middleC-midiNum)-(Math.floor((middleC-midiNum)/2)))*2 + "dvh; left:"+ (10+(3/(length/8))*(currentNotes.length-1)) +"dvw;");

    var noteImg = '<img class="note crt_glow" src="img/'+imageSrc+'.png" alt="Note failed to load" style="top:' + ((middleC-midiNum)-(Math.floor((middleC-midiNum)/2)))*2 + 'dvh; left:'+ (10+(3/(length/8))*(spotInPhrase)) +'dvw;'+color+'"></img>'

    if(isPlayer){
      $('#staff').append(noteImg);
    }
    else{
      $('#templateStaff').append(noteImg);
    }
  // });
}

function displayTemplate(plant, stage){
  $('#templateStaff').empty();
  for(var i = 0; i<plants[plant][stage].length;i++){
    placeNote(plants[plant][stage][i], 4, i, false)
  }
}

function midiToNote(array){
  for (var i = 0; i < array.length; i++){
    for (var j = 0; j< array[i].length; j++){
      array[i][j] += middleC;
      array[i][j] = noteNames[array[i][j] % 12] + (Math.floor(array[i][j] / 12) - 1)
    }
  }
}
function resetSongsToMidi(){
  barnSongs = [[0, 2, 4, 5, 7, 9, 11, 12],[12, 11, 9, 7, 5, 4, 2, 0]];
  fieldColumnSongs = [[0, 4, 7], [0, 4, 7, 12, 11], [0, 4, 7, 12, 11, 7, 5], [0,4, 7, 12, 11, 7, 5, 2, 0]];
  fieldRowSongs  =[[-12, -8, -5], [-12, -8, -5, -8], [-12, -8, -5, -8, -12]];
  seedSongs = [[0, 2, 0, 4, 0, 5],[0, 7, 0, 9],[0, 11, 0, 12]];
  cancelSong = [[-5, -1, 2, -1, -5]];
  plants = [...plantsResetBackup];
}

//executes when the site boots up
$(document).ready(async () => {
  const savedTuning = JSON.parse(localStorage.getItem('tuning'));
  const savedC = JSON.parse(localStorage.getItem('middleC'));
  const savedPots = JSON.parse(localStorage.getItem('pots'));
  const savedStages = JSON.parse(localStorage.getItem('stageOfPot'));
  const savedBag = JSON.parse(localStorage.getItem('bag'));

  if(savedC != null && savedTuning !=null){
    tuning = savedTuning;
    middleC = savedC;
    if(savedPots != null && savedStages !=null){
      pots = savedPots;
      stageOfPot = savedStages;
    }
    if(bag !=null){
      bag = savedBag;
    }
    midiToNote(barnSongs);
    midiToNote(fieldColumnSongs);
    midiToNote(fieldRowSongs);
    midiToNote(seedSongs);
    midiToNote(cancelSong);
    for(var i = 0; i< plants.length;i++){
      for(var j = 1; j< plants[i].length;j++){
        for(var k = 0; k< plants[i][j].length;k++){
          plants[i][j][k]+= middleC;
        }
      }
    }

    for (var i = 0; i<pots.length; i++){
      for (var j = 0; j<pots[i].length; j++){
        if (pots[i][j]>=0){
          switch (stageOfPot[i][j]){
            case 2: $('#pot'+i+j).attr("src", "img/"+plants[pots[i][j]][0]+"Pot.png")
              break;
            case 2: $('#pot'+i+j).attr("src", "img/"+plants[pots[i][j]][0]+"Sprout.png")
              break;
            case 3: $('#pot'+i+j).attr("src", "img/"+plants[pots[i][j]][0]+"Stock.png")
              break;
            case 4: $('#pot'+i+j).attr("src", "img/"+plants[pots[i][j]][0]+"Bud.png")
              break;
            case 5: $('#pot'+i+j).attr("src", "img/"+plants[pots[i][j]][0]+"Flower.png")
              break;
            default:
              break;
          }
        }
      }
    }
  }
  else{
    tutorial();
  }


  //Get microphone input
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioCtx.createMediaStreamSource(await navigator.mediaDevices.getUserMedia({ audio: true }));
  const analyser = audioCtx.createAnalyser();
  //set up pitch detection
  analyser.fftSize = 2048;
  source.connect(analyser);
  const inputBuffer = new Float32Array(analyser.fftSize);
  const detector = PitchDetector.forFloat32Array(analyser.fftSize);

  //gets the pitch from the mic
  function updatePitch() {
    //gets pitch in hertz
    analyser.getFloatTimeDomainData(inputBuffer);
    const [pitch, clarity] = detector.findPitch(inputBuffer, audioCtx.sampleRate);
      if (clarity > 0.9 && pitch >= 27.50) { //ensures note is audible and proper
        // console.log( `Frequency: ${pitch.toFixed(1)} Hz | Clarity: ${clarity.toFixed(2)}`);
        //turns the pitch into a midi number and then a note name
        const midiNum = (Math.round(12 * (Math.log(pitch/440)/Math.log(2))) + 69) + tuning;
        const notePlayed = noteNames[midiNum % 12] + (Math.floor(midiNum / 12) - 1);

        //displays pitch and note
        $("#hertz").text((pitch).toFixed(1));
        $("#note").text(notePlayed);
        
        //adds note as one of the past notes
        pastNotes.push(notePlayed);
        pastNotes.shift();
        // console.log(pastNotes);

        //adds note as a note played if it was played long enough uninterupted, and checks for articulation
        if (between(notePlayed, pastNotes.length-8, pastNotes.length-1) && notBetween(notePlayed, pastNotes.length-9, pastNotes.length-9)){
          if(tutorialStage == 2){
            $("#tutorialButton").addClass("front");
            $("#tutorial10").removeClass("type_in");
            $("#tutorial10").addClass("fade-Out");
            $("#tuningNote").removeClass("fade-In");
            $("#tuningNote").addClass("fade-Out");
            $("#tutorialOverlay").removeClass("fade-In");
            $("#tutorialOverlay").addClass("fade-Out");      
            tutorialStage = 0;

            const midiNum = (Math.round(12 * (Math.log(pitch/440)/Math.log(2))) + 69);
            tuning = 12-(midiNum%12);
            middleC = midiNum+tuning;
            localStorage.setItem('tuning', JSON.stringify(tuning));;          
            localStorage.setItem('middleC', JSON.stringify(middleC));;      

            //converts all songs from midi to note
            resetSongsToMidi()
            midiToNote(barnSongs);
            midiToNote(fieldColumnSongs);
            midiToNote(fieldRowSongs);
            midiToNote(seedSongs);
            midiToNote(cancelSong);
            for(var i = 0; i< plants.length;i++){
              for(var j = 1; j< plants[i].length;j++){
                for(var k = 0; k< plants[i][j].length;k++){
                  plants[i][j][k]+= middleC;
                }
              }
            }
          }
          else if(tutorialStage == 0){
            currentNotes.push(notePlayed);
            $("#notesPlayed").text(currentNotes);

            placeNote(midiNum, 4, currentNotes.length-1, true);
            checkSongs();
          }
        }
      } 
      else {
        //logs a blank note/no note properly played
        $("#hertz").text("--");
        $("#note").text("--");    
        pastNotes.push("--");
        pastNotes.shift();

        //checks if all the recorded past notes are blank
        var count = 0;
        for (var i = 1; i<pastNotes.length; i++){
          if (pastNotes[i] != pastNotes[0]){
            count ++;
          }
        }

        //clears current notes if needed
        if (count==0){
          if(finalTestStage != 1){
            $('#templateStaff').empty();
            finalTestStage = 1;
            testLocked = true;
          }
          currentNotes = [];
          $("#notesPlayed").text(" ");
          $('#staff').empty();

          if(currentRow >= 0){
            if (pots[currentRow][currentColumn]>=0){
              var plant = pots[currentRow][currentColumn];
              var stage = stageOfPot[currentRow][currentColumn];
              if (stage>4){
                stage = 1;
                testLocked = false;
              }
              displayTemplate(plant, stage);
              deselect();
            }
            else if (bag.length>0){
              for(var i = 0; i < 8; i++){
                $("#bagSlot"+i).attr("style", "visibility:hidden;");
                if(i<bag.length){
                  $("#bagSlot"+i).attr("style", "visibility:visible;");
                  $("#bagSeed"+i).attr("src", "img/"+plants[bag[i]][0]+"Seed.png");
                }
              }
              $("#bag").removeClass("bagOut");
              $("#bag").addClass("bagIn");
              bagOpen=true;
              $('#templateStaff').empty();
            }
            else{
              deselect();

            }
          }
        }
      }

    //loops the function
    requestAnimationFrame(updatePitch);
  }

  //enters the loop
  updatePitch();
});

$('#tutorialButton').on('click', function() {
  if(tutorialStage == 0){
    tuning = 0;
    middleC = 0;
    tutorial();
  }
});