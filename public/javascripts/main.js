/**
  *JQuery - Document Ready
  */
 var audioFile = null;
 var speechTranscript = '';
 var recognizer = null;
 var state = 0;

$(document).ready(function() {
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
        //trigger default file upload button
        defaultUploadBtn.click();
    });
     
    defaultUploadBtn.on('change', function() {
        var files = $(this)[0].files;

        processFiles(files);    
        return false;
    });

	var processFiles = function(files) {
 
		if(files && typeof FileReader !== "undefined") {
			for(var iFile = 0; iFile<files.length; iFile++) {
			    readFile(files[iFile]);
			}
        } 
        
    }
    
    var readFile = function(file) {
		if( (/wav/i).test(file.type) ) {     
            audioFile = file;      
           var reader = new FileReader();
            
			reader.onload = function(e) {
 
                $('#audioPlayer').attr('src', reader.result);
                try { 
                    $('#header').html(header.replace(/$.*/, '&nbsp;-&nbsp;\'' + file.name + '\''));
                    $('#controls').css('display', 'block');
                    $('#transcription').html('');
                    audioFile = file;
                } catch (e) {

                }

			};
			
           reader.readAsDataURL(file);
          
          $('#controls').css('display', 'block');
  
        } else {
            alert(file.type + " - is not supported");
            
        }
    
     }

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

        return new SDK.CognitiveSubscriptionKeyAuthentication('370ba2302d4d4a05b4219a1cc3b79408');

    }();

    recognizer = SDK.CreateRecognizerWithFileAudioSource(recognizerConfig, authentication, audioFile);
    
    RecognizerStart(SDK, recognizer)

    function RecognizerStart(SDK, recognizer) {
            
    recognizer.Recognize((event) => {
            console.log(event.name);
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
        recognizer.AudioSource.TurnOff();
    }
 
 });
