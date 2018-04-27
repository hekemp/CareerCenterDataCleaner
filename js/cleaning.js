
  var reader;
  var progress = document.querySelector('.percent');

  var readText;
  var keyText;
  var columnChanging;

  var readInList = [];
  var keyInList = [];

  var foundKeyValues = {};
  var toAssign = {};
  var index = 0;

  var cleaningStarted = false;

  var names;

  function strCompare(a, b) { // Removes speical characters, staring and ending spaces, and extra spaces for ignoring case comparison
    let s1 = a.replace(/[^A-Za-z0-9\s]/g, "").replace(/\s*/g, " ").toLowerCase().trim();
    let s2 = b.replace(/[^A-Za-z0-9\s]/g, "").replace(/\s*/g, " ").toLowerCase().trim();
    return s1.localeCompare(s2);
  }

  function resetKeys(){
    if(keyText != null){
      document.getElementById("errorMessage").innerHTML = "&nbsp;"
      breakKeyText();
      if(cleaningStarted){
        startCleaning();
      }
    }
    else{
      document.getElementById("errorMessage").innerHTML = "No key file was uploaded."
    }

  }

  function resetInput(){
    if(readText != null){
      document.getElementById("errorMessage").innerHTML = "&nbsp;"
      breakReadText();
      if (cleaningStarted) {
        startCleaning();
      }
    } else {
      document.getElementById("errorMessage").innerHTML = "No input file was uploaded."
    }


  }

  function abortRead() {
    reader.abort();
  }

  function errorHandler(evt) {
    switch(evt.target.error.code) {
      case evt.target.error.NOT_FOUND_ERR:
        document.getElementById("errorMessage").innerHTML = "File was not found.";
        break;
      case evt.target.error.NOT_READABLE_ERR:
        document.getElementById("errorMessage").innerHTML = "File was not able to be read.";
        alert('File is not readable');
        break;
      case evt.target.error.ABORT_ERR:
        break; // noop
      default:
        document.getElementById("errorMessage").innerHTML = "There was an error reading this file.";
    };
  }

  function updateProgress(evt) {
    // evt is an ProgressEvent.
    if (evt.lengthComputable) {
      var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
      // Increase the progress bar length.
      if (percentLoaded < 100) {
        progress.style.width = percentLoaded + '%';
        progress.textContent = percentLoaded + '%';
      }
    }
  }

  function handleKeysSelect(evt) {
    // Reset progress indicator on new file selection.
    progress.style.width = '0%';
    progress.textContent = '0%';

    reader = new FileReader();
    reader.onerror = errorHandler;
    reader.onprogress = updateProgress;
    reader.onabort = function(e) {
      document.getElementById("errorMessage").innerHTML = "File read was cancelled";
    };
    reader.onloadstart = function(e) {
      document.getElementById('progress_bar').className = 'loading';
    };
    reader.onload = function(e) {
      // Ensure that the progress bar displays 100% at the end.
      progress.style.width = '100%';
      progress.textContent = '100%';
      setTimeout("document.getElementById('progress_bar').className='';", 2000);


      keyText = reader.result;
      breakKeyText();


    }



    // Read in the image file as a binary string.
    reader.readAsText(evt.target.files[0]);



  }

  function handleFileSelect(evt) {
    // Reset progress indicator on new file selection.
    progress.style.width = '0%';
    progress.textContent = '0%';

    reader = new FileReader();
    reader.onerror = errorHandler;
    reader.onprogress = updateProgress;
    reader.onabort = function(e) {
      document.getElementById("errorMessage").innerHTML = "File read was cancelled";
    };
    reader.onloadstart = function(e) {
      document.getElementById('progress_bar').className = 'loading';
    };
    reader.onload = function(e) {
      // Ensure that the progress bar displays 100% at the end.
      progress.style.width = '100%';
      progress.textContent = '100%';
      setTimeout("document.getElementById('progress_bar').className='';", 2000);


      readText = reader.result;
      breakReadText();

    }



    // Read in the image file as a binary string.
    reader.readAsText(evt.target.files[0]);



  }

  document.getElementById('files').addEventListener('change', handleFileSelect, false);
  document.getElementById('keys').addEventListener('change', handleKeysSelect, false);



  //download(reader.result, "test", "text/csv");

  function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
      }
    }

    var mapLetterValue = function(val) {
      var base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', i, j, result = 0;

      for (i = 0, j = val.length - 1; i < val.length; i += 1, j -= 1) {
        result += Math.pow(base.length, j) * (base.indexOf(val[i]) + 1);
      }

      return result;
    };

    function isEmpty(ob){
        for(var i in ob){ return false;}
      return true;
    }

    function startCleaning(){

      foundKeyValues = {};
      toAssign = {};
      index = 0;
      cleaningStarted = true;

      names = [];

      var columnToChange = document.getElementById("ColumnToChange").value;
      columnToChange = columnToChange.toUpperCase();

      columnChanging = [ columnToChange ].map(mapLetterValue)[0] - 1;

      if(readText == null){
        document.getElementById("errorMessage").innerHTML = "No input file was uploaded."
      }
      else if (keyText == null) {
        document.getElementById("errorMessage").innerHTML = "No key file was uploaded."
      } else if (columnToChange == "") {
        document.getElementById("errorMessage").innerHTML = "No column to clean was selected."

      } else {

        document.getElementById("errorMessage").innerHTML = "&nbsp;"
        var currentValue;
        for(var i = 1; i < readInList.length; i++) {
          currentValue = readInList[i][columnChanging];

          if (currentValue == ""); // empty column
          else if ((foundKeyValues[currentValue] != "" && foundKeyValues[currentValue] != null )) { // we already know the value
            readInList[i][columnChanging] = foundKeyValues[currentValue];
          } else {
              var locatedValue = findValue(currentValue);

              if (locatedValue != ""){ // Item was assigned a value
                foundKeyValues[currentValue] = locatedValue;
                readInList[i][columnChanging] = locatedValue;
              }
              else { // Item hasn't been assigned yet
                if(toAssign[currentValue] != "" && toAssign[currentValue] != null) { // Item has been found elsewhere
                  toAssign[currentValue][toAssign[currentValue].length] = i;
                }
                else { // This is the first time we've found this item
                  toAssign[currentValue] = [ i ];
                }
              }
          }
        }
        assignKeysToNames();

        if(isEmpty(toAssign)){
          $("#name-chooser").text("Cleaning complete!");
        }
        else{
          $("#name-chooser").text(names[0]);
          populateChoices();
        }
      }
    }

    /*
      To Get Items:
      for(item in toAssign){
        console.log(toAssign[item]);
      }
    */

    function assignKeysToNames(){
      names = [];
      for(item in toAssign){
        names[names.length] = item;
      }
    }

    function nextChoice(companyPicked) {

      document.getElementById("errorMessage").innerHTML = "&nbsp;"
      var newIndex;
      for(var i = 0; i < toAssign[names[index]].length; i++){
        newIndex = toAssign[names[index]][i];
        readInList[newIndex][columnChanging] = companyPicked;
      }

      for(var i = 0; i < keyInList.length; i++){
        if(strCompare(keyInList[i][0], companyPicked) == 0){
          keyInList[i][keyInList[i].length] = names[index];
          i = keyInList.length;
        }
      }

      if(index < names.length - 1) {
        index++;
        $("#name-chooser").text(names[index]);
        document.getElementById("customInput").value  = "";
      } else {
        $("#name-chooser").text("You're Done!");
        toAssign = {}
        index = 0;
        document.getElementById("choices").innerHTML = "";
        document.getElementById("custom").innerHTML = "";
        document.getElementById("instruction").innerHTML = '<h3 id="instruction" class="text-muted">Download your files now, or continue cleaning.</h3>';

      }

      return false;
    }

    function nextChoiceAdd() {

      document.getElementById("errorMessage").innerHTML = "&nbsp;"
      var theirValue = document.getElementById("customInput").value;
      var foundValue = findValue(theirValue);
      if(findValue(theirValue) != ""){
        theirValue = foundValue;
      } else {
        keyInList[keyInList.length] = [ theirValue ];

      }
      populateChoices();
      var newIndex;
      for(var i = 0; i < toAssign[names[index]].length; i++){
        newIndex = toAssign[names[index]][i];
        readInList[newIndex][columnChanging] = theirValue;
      }



      if(index < names.length - 1) {
        index++;
        $("#name-chooser").text(names[index]);
      } else {
        $("#name-chooser").text("You're Done!");
        toAssign = {}
        index = 0;
        document.getElementById("choices").innerHTML = "";
        document.getElementById("custom").innerHTML = "";
        document.getElementById("instruction").innerHTML = '<h3 id="instruction" class="text-muted">Download your files now, or continue cleaning.</h3>';
      }

      document.getElementById("customInput").value  = "";

      return false;
    }

    function populateChoices(){
      document.getElementById("choices").innerHTML = "";
      var sortedKeys = keyInList.slice().sort(function (a, b) {
        return strCompare(a[0], b[0]);
      });
      for(var i = 0; i < sortedKeys.length; i++){
        if(sortedKeys[i][0] != ""){
          document.getElementById("choices").innerHTML += '<div class="form-group" style="padding:1% 3% .25% 3%"><button class="btn" onclick="return nextChoice(\'' + sortedKeys[i][0] + '\');">' + sortedKeys[i][0] + '</button></div>';
        }

      }

      document.getElementById("custom").innerHTML = '<div class="form-group"><label for="customInput">Company Name:</label><input type="text" class="form-control" id="customInput" placeholder="New company name" onInput="displayFilteredChoices()" /></div><button class="btn btn-primary" onclick="return nextChoiceAdd();">Submit</button>';
      document.getElementById("instruction").innerHTML = '<h3 id="instruction" class="text-muted">Select a canonical company name:</h3>';
    }

    function substringComparison(a, b, chars){

      if(chars > b.length){ // if a is longer than b, it can't be b
        return false;
      }
      if (a.trim().length != a.length){ // Handles surrounding white spaces that might have slipped by
        chars = a.trim().length;
      }

      let s1 = a.replace(/[^A-Za-z0-9\s]/g, "").replace(/\s*/g, "").toLowerCase().trim().substring(0, chars);
      let s2 = b.replace(/[^A-Za-z0-9\s]/g, "").replace(/\s*/g, "").toLowerCase().trim();

      return s2.includes(s1);
    }

    function displayFilteredChoices(){
      document.getElementById("choices").innerHTML = "";
      var theirValue = document.getElementById("customInput").value;
      var filteredKeys = [];
      for (var i = 0; i < keyInList.length; i++){
        if(substringComparison(theirValue, keyInList[i][0], theirValue.replace(/[^A-Za-z0-9\s]/g, "").replace(/\s*/g, "").trim().length)){
          filteredKeys[filteredKeys.length] = keyInList[i][0];
        }
      }
      var sortedKeys = filteredKeys.slice().sort(function (a, b) {
        return strCompare(a, b);
      });
      for(var i = 0; i < sortedKeys.length; i++){
        if(sortedKeys[i] != ""){
          document.getElementById("choices").innerHTML += '<div class="form-group" style="padding:1% 3% .25% 3%"><button class="btn" onclick="return nextChoice(\'' + sortedKeys[i] + '\');">' + sortedKeys[i] + '</button></div>';
        }

      }

      document.getElementById("instruction").innerHTML = '<h3 id="instruction" class="text-muted">Select a canonical company name:</h3>';
    }


    function findValue(itemToLocate){

      for(var i = 0; i < keyInList.length; i++) {
        for(var j = 0; j < keyInList[i].length; j++){
          if (strCompare(keyInList[i][j], itemToLocate) == 0){
            return keyInList[i][0];
          }
        }
      }
      return "";
    }

    function breakReadText(){

      var splitByLine = readText.split(/\r?\n/g);
      var splitByComma = [];
      for(var i = 0; i < splitByLine.length; i++){
        splitByComma[i] = splitByLine[i].split(',');

      }
      for(var i = 0; i < splitByComma.length; i++){
        for (var j = 0; j < splitByComma[i].length; j++){
          splitByComma[i][j] = splitByComma[i][j].trim().replace(/^[^A-Za-z0-9\s]*/g, "").replace(/[^A-Za-z0-9\s]*$/g, "").replace(/\s+/g, " ");
        }
      }

      readInList = splitByComma;

    }

    function breakKeyText(){
      var splitByLine = keyText.split(/\r?\n/g);
      var splitByComma = [];
      for(var i = 0; i < splitByLine.length; i++){
        splitByComma[i] = splitByLine[i].split(',');

      }
      for(var i = 0; i < splitByComma.length; i++){
        for (var j = 0; j < splitByComma[i].length; j++){
          splitByComma[i][j] = splitByComma[i][j].trim().replace(/^[^A-Za-z0-9\s]*/g, "").replace(/[^A-Za-z0-9\s]*$/g, "").replace(/\s+/g, " ");
        }
      }
      keyInList = splitByComma;

    }

    function reassembleReadText(){
      var splitByLine = [];
      for(var i = 0; i < readInList.length; i++){
        splitByLine[i] = readInList[i].join(',');
      }
      return splitByLine.join('\n');
    }

    function reassembleKeyText(){
      var splitByLine = [];
      for(var i = 0; i < keyInList.length; i++){
        splitByLine[i] = keyInList[i].join(',');
      }
      return splitByLine.join('\n');

    }

    function downloadFile(){


      var fileName = document.getElementById("FileName").value;

      if(fileName == ""){
        document.getElementById("errorMessage").innerHTML = "No input file was uploaded.";
      } else if ( readInList == [] || readInList == null ) {
        document.getElementById("errorMessage").innerHTML = "No input file was uploaded.";
      }
      else {
        document.getElementById("errorMessage").innerHTML = "&nbsp;";
        var newText = reassembleReadText();
        download(newText, fileName, "text/csv");
      }
    }

    function downloadKeyFile(){
      var fileName = document.getElementById("KeyFileName").value;
      if(fileName != "" && ( keyInList != [] && keyInList != null ) ) {
        var newText = reassembleKeyText();
        download(newText, fileName, "text/csv");
      }
    }

    var acc = document.getElementsByClassName("accordion");
    var i;

    for (i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function() {
            this.classList.toggle("active");
            var panel = this.nextElementSibling;
            if (panel.style.display === "block") {
                panel.style.display = "none";
            } else {
                panel.style.display = "block";
            }
        });
    }
