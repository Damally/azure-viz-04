/**
 * Recognizer Callback
 * 
 */
 var audioFile = null;
 var speechTranscript = '';
 var recognizer = null;
 var state = 0;
 var microphoneActive = false;

  /**
  * Inactivate the Tabs
  */
 function inactivateTabs() {
    var iTab, tabcontent, tabbuttons, tablinks;
     
     // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (iTab = 0; iTab < tabcontent.length; iTab++) {
        tabcontent[iTab].style.display = "none";
    }
  
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (iTab = 0; iTab < tablinks.length; iTab++) {
        tablinks[iTab].className = tablinks[iTab].className.replace(" active", "");
        tablinks[iTab].style.textDecoration = "none";
    }

 }

 /**
 * Show the Active Tab
 * 
 * @param {*} evt the Tab to Show
 * @param {*} tab the name of the Tab
 * @param {*} button the Tab's button
 * @api private
 * 
 */
function showTab(evt, tab, button) {

    inactivateTabs();

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tab).style.display = "block";
    document.getElementById(button).style.textDecoration = "underline";
 
    evt.currentTarget.className += " active";

}

/**
 * Start the Recognizer
 * @param {object} SDK the Speech SDK API
 * @param {object} recognizer the Speech Recognizer
 * @api private
 * 
 */
function RecognizerStart(SDK, recognizer) {
            
    recognizer.Recognize((event) => {
  
        switch (event.Name) {
            case "RecognitionTriggeredEvent" :
                break;
            case "ListeningStartedEvent" :
                break;
            case "RecognitionStartedEvent" :
                break;
            case "SpeechStartDetectedEvent" :
                break;
            case "SpeechHypothesisEvent" :
                UpdateRecognizedHypothesis(event.Result.Text);
                break;
            case "SpeechFragmentEvent" :
                console.log(event.Result.Text);
                UpdateRecognizedHypothesis(event.Result.Text);
                break;
            case "SpeechEndDetectedEvent" :
                break;
            case "SpeechSimplePhraseEvent" :
                break;
            case "SpeechDetailedPhraseEvent" :
                UpdateRecognizedPhrase(event.Result);
                break;
            case "RecognitionEndedEvent" :
                break;
            default:
                console.error(JSON.stringify(event)); // Debug information
        }
    })
    .On(() => {
    },
    (error) => {
        alert(error);
    });

}

function UpdateRecognizedHypothesis(text) {

    $('#transcription').html($('#transcription').html() + "<span style='font-style:italic; color:#a0a0a0;'>" +  text + '</span>&nbsp;')

}

function UpdateRecognizedPhrase(json) {
    console.log(JSON.stringify(json));

    try { 
        if (json['RecognitionStatus'] == 'EndOfDictation') {
            StopTranscription();
        } else {
            speechTranscript += json['NBest'][json['NBest'].length-1]['Display'] +'&nbsp;'
        }

        $('#transcription').html("<span style='font-style:bold ; color:#ffffff;'>" + speechTranscript + '</spand>');

    } catch (e) {
        alert(e)
    }
    
}

function StopTranscription() {
    state = 0;
    $('#playbtn').attr('value', 'Transcribe');
    $('#waitImage').css('display', 'none');
            
    $('#recordImage').css('display', 'none');
    $('#microphoneImage').attr('src', '/icons/muted.svg'); 
    $('#microphonebtn').attr('value', 'Microphone On');
    
    microphoneActive = false;

    recognizer.AudioSource.TurnOff();
 

}

$(document).ready(function() {

    window.alert = function() {
    };

    $('#fileFrame').css('display', 'inline-block');

    var header = $('#header').html();
    var dropzone = $('#droparea');
     
    dropzone.on('dragover', function() {
        //add hover class when drag over
        dropzone.addClass('hover');
        return false;
    });
     
    dropzone.on('dragleave', function() {
        //remove hover class when drag out
        dropzone.removeClass('hover');
        return false;
    });
     
    dropzone.on('drop', function(e) {
        //prevent browser from open the file when drop off
        e.stopPropagation();
        e.preventDefault();
        dropzone.removeClass('hover');
     
        //retrieve uploaded files data
        var files = e.originalEvent.dataTransfer.files;
        processFiles(files);
     
        return false;
    });

    var uploadBtn = $('#uploadbtn');
    var defaultUploadBtn = $('#upload');
     
    uploadBtn.on('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        defaultUploadBtn.click();
    });
     
    defaultUploadBtn.on('change', function() {
        var files = $(this)[0].files;

        processFiles(files);    
        return false;
    });

	var processFiles = function(files) {
        $('#controls').css('display', 'none');
        $('#transcription').html('');

 		if (files && typeof FileReader !== "undefined") {
			for(var iFile = 0; iFile<files.length; iFile++) {
			    readFile(files[iFile]);
			}
        } 
        
    }
    
    var readFile = function(file) {
        if (file.size == 0) {
            alert("File: '" + file.name + "' is empty!");
        } else if( (/wav/i).test(file.type) ) {  

            $('#uploadWait').css('display', 'block');

            audioFile = file;      
            var reader = new FileReader();
            
			reader.onload = function(e) {
                $('#uploadWait').css('display', 'none');
                $('#audioPlayer').attr('src', reader.result);
                $('#filename').html(`File:&nbsp;<b>${file.name}</b>`);
                $('#controls').css('display', 'block');
                $('#transcription').html('');
                audioFile = file;
                
			};
            
            reader.onprogress = function(data) {
                
                if (data.lengthComputable) {                                            
                    var progress = parseInt( ((data.loaded / data.total) * 100), 10 );
                    document.getElementById("uploadProgress").className = "c100 p" + 
                    progress + 
                    " big blue";
                    $('#percentage').html(progress + "%");

                }
            }

            reader.readAsDataURL(file);
          
        } else {
            alert(file.type + " - is not supported");
        }
    
     }

});

/**
  * On Translate Button Button
  */

 $('#microphonebtn').on('click', function(e) {

    if (microphoneActive) {  
        StopTranscription();  
        return;  
    }

    if (state == 1) {
        StopTranscription();
    }

    window.setTimeout(function() {
        state == 1;
    
        speechTranscript = '';

        $('#playbtn').attr('value', 'Transcribe');
        $('#transcription').html('');   
        $('#microphoneImage').attr('src', '/icons/microphone.svg') 
        $('#recordImage').css('display', 'block');
        $('#microphonebtn').attr('value', 'Microphone Off');
    
        microphoneActive = true;

        var recognizerConfig = new SDK.RecognizerConfig(
            new SDK.SpeechConfig(      
                new SDK.Context(    
                    new SDK.OS(navigator.userAgent, "Browser", null),    
                    new SDK.Device("SpeechSample", "SpeechSample", "1.0.00000"))),  
                    SDK.RecognitionMode.Dictation,
                    'en-US', // Supported languages are specific to each recognition mode. Refer to docs.  
                    'Detailed'); // SDK.SpeechResultFormat.Simple (Options - Simple/Detailed)

        var authentication = function() {

            return new SDK.CognitiveSubscriptionKeyAuthentication(key);

        }();

        recognizer = SDK.CreateRecognizer(recognizerConfig, authentication);
        
        RecognizerStart(SDK, recognizer)
    }, 100);
 });

/**
  * On Translate Button Button
  */

 $('#playbtn').on('click', function(e) {

    if (state == 1) {

        StopTranscription();

        return;
    }

    state = 1;
    
    speechTranscript = '';
    $('#transcription').html('');
    $('#playbtn').attr('value', 'Stop');
    $('#waitImage').css('display', 'block');

    var recognizerConfig = new SDK.RecognizerConfig(
        new SDK.SpeechConfig(      
            new SDK.Context(    
                new SDK.OS(navigator.userAgent, "Browser", null),    
                new SDK.Device("SpeechSample", "SpeechSample", "1.0.00000"))),  
                SDK.RecognitionMode.Dictation,
                'en-US', // Supported languages are specific to each recognition mode. Refer to docs.  
                'Detailed'); // SDK.SpeechResultFormat.Simple (Options - Simple/Detailed)

    var authentication = function() {

        return new SDK.CognitiveSubscriptionKeyAuthentication(key);

    }();

    recognizer = SDK.CreateRecognizerWithFileAudioSource(recognizerConfig, authentication, audioFile);
    
    RecognizerStart(SDK, recognizer)
 
 });
