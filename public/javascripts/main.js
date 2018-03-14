$(document).ready(function() {

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
        //retrieve selected uploaded files data

        var files = $(this)[0].files;
        processFiles(files);    
        return false;
    });

	var processFiles = function(files) {
 
		if(files && typeof FileReader !== "undefined") {
			//process each files only if browser is supported
			for(var iFile = 0; iFile<files.length; iFile++) {
				readFile(files[iFile]);
			}
		} else {
			
		}
    }
    
    var readFile = function(file) {
		if( (/wav/i).test(file.type) ) {           
			var reader = new FileReader();

			//init reader onload event handlers
			reader.onload = function(e) {	
 
                $('#audioPlayer').attr('src', reader.result);
                                             
			};
			
			//begin reader read operation
			reader.readAsDataURL(file);
			            
		} else {
            alert(file.type + " - is not supported");
            
			//some message for wrong file format
			$('#err').text('*Selected file format not supported!');
        }
        
    }

    /**
     * Call Microsoft's Conginitive OCR 
     * 
     * @param {*} file the File returned from the upload
     * @param {*} content  the Content
     */
    function callCogOCR(file, content) {

        try {
        var uriBase = "https://westcentralus.api.cognitive.microsoft.com/vision/v1.0/RecognizeText";
        var subscriptionKey = "28d06e43b8a940078499d4c92217a38f";
        
        var params = {
            "handwriting": "false",
        };

        var objFormData = new FormData();
        objFormData.append('userfile', file);
    
        $.ajax({
            url: uriBase + "?" + $.param(params),

            // Request headers.
            beforeSend: function(jqXHR){
                jqXHR.setRequestHeader("Content-Type", "application/octet-stream");
                jqXHR.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
            },
            type: "POST",
            processData: false,  
            data: data2Blob(content)
        })
        .done(function(data) {

            try {
                var html = "";
               for (var iRegion = 0; iRegion < data['regions'].length; iRegion++) {
  
                    html += processLines(data['regions'][iRegion]);

                }

           } catch (e) {
                alert(e);
            }

            $('#cogResult').html(html); 
            $('#cogResult').css('overflow', 'auto');     
            $('#cogResult').css('height', '380px');     
            $('#cogLoader').css('display', 'none');
            $('#CogOCRText').css('top', '-35px');
            
            
        })

        .fail(function(jqXHR, textStatus, errorThrown) {
            // Display error message.
            var errorString = (errorThrown === "") ? "Error. " : errorThrown + " (" + jqXHR.status + "): ";
            errorString += (jqXHR.responseText === "") ? "" : jQuery.parseJSON(jqXHR.responseText).message;

            alert(errorString);

        });

        } catch (e) {
            alert(e);
        }

    }

    /**
     * Convert Data to a Blob (base64 encoded)
     * 
     * @param {*} data to convert (base64) encoded
     */
    function data2Blob(data) {       
        // convert base64 to raw binary data held in a string
        // doesn't handle URLEncoded DataURIs

        var byteString;

        if (data.split(',')[0].indexOf('base64') >= 0) {
            byteString = atob(data.split(',')[1]);
        } else {
            byteString = unescape(data.split(',')[1]);
        }
        
        // separate out the mime component
        var mimeString = data.split(',')[0].split(':')[1].split(';')[0]
        
        // write the bytes of the string to an ArrayBuffer
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        
        //Passing an ArrayBuffer to the Blob constructor appears to be deprecated, 
        //so convert ArrayBuffer to DataView
        var dataView = new DataView(ab);
        var blob = new Blob([dataView], {type: mimeString});
     
        return blob;
    
    }

});