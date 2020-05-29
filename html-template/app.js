
$.fn.ehtmail = function( options ) {

	var g = this;
    var data;
	var localdata = sessionStorage.getItem('ehtmail');
	var localCustomFields = sessionStorage.getItem('ehtml_cf');
	var customFields = [];

	var settings = $.extend({
        'form' : '#htmlFields',
        'fields' : '.form-control',
        'createFields' : '#fields'
    }, options );


    // initialize
    initCreateFieldApp();

    if (localdata) {
    	data = JSON.parse(localdata);
    	generatePreview();
    	assignDataToForm(data);
    }

    if (localCustomFields){
    	customFields = JSON.parse(localCustomFields);
    	generatePreview();
    	assignDataToFormCustomFields(customFields);
    }

    $(settings.form).find(settings.fields).on('change, keyup', function(){
    	var formdata = $(settings.form).serializeArray();
    	data = objectifyForm(formdata);
    	generatePreview();

    	sessionStorage.setItem('ehtmail', JSON.stringify(data));
    });

    //end initialize


    //control
    $(settings.createFields).on('click', '#createField', function(){
    	createCustomFields();
    	getAllCustomFields();
    	generatePreview();
    });

    $(settings.createFields).on('click', '.btn-delete-field', function(){
    	var card = $(this).data('card');
    	deleteField(card);
    	

    });

    $('#generatemail').on('click',function(){
    	generateHTMAIL();
    });

    $(settings.createFields).on('change, keyup', '.form-control', function(){
    	getAllCustomFields();
    	generatePreview();
    });

    var el = document.getElementById('sortable');
	var sortable = Sortable.create(el,{
		'handle': '.handle',
		'ghostClass': 'blue-background-class',
		'onEnd' : function(){
			getAllCustomFields();
			generatePreview();
		}
	});
	


  // FUNCTIONS 

  	function previewCustomFields(){
  		var fields = "";

  		customFields.forEach(function(itm, idx){
  			var bg = (idx + 1) % 2 == 0 ? '#ffffff' : '#e6e7e9';
  			fields += `<tr>
	            <td style="background-color: ${bg}; padding:8px 10px;">
	            	<p style="font-family: Arial, Helvetica, sans-serif; font-size:14px; font-weight: normal; margin:0; padding:0; line-height: 1; color: #211f20;"><strong style="font-weight: bold;">${itm.label}:</strong> ${itm.val}</p>
	            </td>
	        </tr>`;
  		});
  		
  		return fields;
  	}

  	function assignDataToFormCustomFields(item){
  		console.log(item)
  		item.forEach(function(itm, idx){
  			createCustomFields(itm);
  		});
  	}

  	function getAllCustomFields(){
  		customFields = [];
  		$(settings.createFields).find('.card').each(function(idx, item){
  			var _id = $(this).attr('id');
  			var _label = $(this).find('.labelTxt').val();
  			var _value = $(this).find('.valueTxt').val();
  			var card = {
  				'group' : _id,
  				'label': _label,
  				'val': _value,
  			}

  			customFields.push(card);
  		});

  		sessionStorage.setItem('ehtml_cf', JSON.stringify(customFields));
  	}


  	function deleteField(item){
  		$('#'+item).slideUp(function(){
  			$(this).remove();
  			getAllCustomFields();
    		generatePreview();
  		})
  	}

  	function createCustomFields(cfdata){
  		var groudId = "field-group-"+$(settings.createFields).find('.card').length + 1;
  		var cf_label = '';
  		var cf_val = '';

  		if (cfdata) {
  			groupId = cfdata.group;
  			cf_label = cfdata.label;
  			cf_val = cfdata.val; 
  		}

  		var template = `<div class="card shadow-sm mb-5" id="${groudId}">
        		<div class="card-body">
            		<div class="form-group">
            			<button class="btn btn-sm btn-warning handle mb-3">drag me</button>
            			<input type="text" class="form-control form-control-sm labelTxt" placeholder="label" value="${cf_label}">
            		</div>
            		<div class="form-group">
            			<input type="text" class="form-control form-control-sm valueTxt" placeholder="value" value="${cf_val}">
            		</div>
            		<div class="form-group text-right mb-0">
            			<button type="button" class="btn btn-danger btn-sm btn-delete-field" data-card="${groudId}">Delete</button>
            		</div>

            	</div>
        	</div>`;

        $(settings.createFields).find('.field-window').append(template);

  	}

  	function initCreateFieldApp(){
  		var button = `<button type="button" class="btn btn-primary btn-block" id="createField">Create A New Field</button>`;
  		var fieldwindow = '<div class="field-window" id="sortable"></div>';
  		$(settings.createFields).append(fieldwindow);
  		$(settings.createFields).append(button);
  	}

  	function assignDataToForm(vals){
  		for (var key in vals) {
		    if (vals.hasOwnProperty(key)) {
		        $(settings.form).find('[name='+key+']').val(vals[key])
		    }
		}
  	}

  	function generatePreview(){
  		g.css('background-color', data.siteBG);

  		var cf = previewCustomFields();

  		var cf_con = `<table border="0" cellspacing="0" cellpadding="0" width="100%">
	            <tbody>${cf}</tbody>
            </table>`;

  		var base_template = `
		    <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="${data.siteBG}"  class="responsive-table" style="width: 560px; margin:auto;"s>
		        <tr>
		            <td align="center" valign="top">
		                <a href="${data.siteURL}" target="_blank">
		                    <img style="color: rgb(255, 255, 255); font-family: Helvetica, Arial, sans-serif; font-size: 12px; display: block; margin-bottom:20px" alt="${data.siteTitle}" src="${data.siteLogo}" border="0">
		                </a>
		            </td>
		        </tr>
		        <tr align="left" class="container" style="display:block; padding: 0px 0 10px;">
		            <td valign="top">
		                <p style="font-family: Arial, Helvetica, sans-serif; font-size:14px; font-weight: normal; margin:0 0 20px; color: #ffffff;">${data.siteDescription}</p>
		                ${cf_con}
		                <p style="font-family: Arial, Helvetica, sans-serif; font-size:14px; font-weight: normal; margin:0 0 20px; padding:15px 0 0; color: #ffffff;">${data.footeDescription}</p>
		            </td>
		        </tr>
		    </table>`;

		g.html(base_template);
		
  	}

  	function objectifyForm(formArray) {//serialize data function

  		var returnArray = {};
	  	for (var i = 0; i < formArray.length; i++){
	    	returnArray[formArray[i]['name']] = formArray[i]['value'];
	  	}
	  	return returnArray;
	}

	function generateHTMAIL(){
		var content = $('#preview').html();
    var htitle = data.siteTitle;

		var htmail = `<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com-office:office" dir="ltr" lpcachedff="0" lpcachedffnumforms="0">

<head>

    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="format-detection" content="telephone=no" />

    <title>${htitle}</title>
    <meta name="description" content="" />

    <!-- STYLES -->
    <style type="text/css">
        a {
                 text-decoration: none !important;
             }
             a:hover, a:visited {
                 color: #211f20;
                 text-decoration: none !important;
             }
            /**This is to overwrite Outlook.comâ€™s Embedded CSS************/
            a, a:link, a:visited {text-decoration: none; color: #211f20;}
            a:hover { text-decoration: none; }
            span a:hover { background-color: #211f20; width: 200px;}
            strong{ font-weight: normal; }
            strong:hover { color: #211f20; font-weight: normal; }
            .button { background-color: #211f20; margin: 0px 5px; }
            .button:hover { background-color: #211f20 !important; }
            .social-media:hover {opacity:.5;}
            body > table  { margin-bottom: 0px !important; }
            h2,h2 a,h2 a:visited,h3,h3 a,h3 a:visited,h4,h5,h6,.t_cht {color:#211f20; !important}
            p {margin-bottom: 0; text-transform: none;}
            .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td {line-height: 100%}
            /**This is to center your email in Outlook.com************/
            .ExternalClass {width: 100%;}
             /* CLIENT-SPECIFIC STYLES */
             body, table, td, a {-webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;} /* Prevent WebKit and Windows mobile changing default text sizes */
             table, td {mso-table-lspace: 0pt; mso-table-rspace: 0pt;} /* Remove spacing between tables in Outlook 2007 and up */
             img {-ms-interpolation-mode: bicubic;} /* Allow smoother rendering of resized image in Internet Explorer */

             /* RESET STYLES */
             img {border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none;}
             table {border-collapse: collapse !important;}
             body {height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important;}

             /* iOS BLUE LINKS */
             a[x-apple-data-detectors] {color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important;}

             /* MOBILE STYLES */
             @media screen and (max-width: 625px) {
                /* ALLOWS FOR FLUID TABLES */
                .wrapper {width: 100% !important; max-width: 100% !important;}
                /* ADJUSTS LAYOUT OF LOGO IMAGE */
                .logo img {margin: 0 auto !important;}
                /* FULL-WIDTH TABLES */
                .responsive-table {width: 100% !important; max-width: 100% !important;}
              }

    </style>

    <!-- OUTLOOK v.2003+ -->
    <!--[if (gte mso 9)|(IE)]>
        <style type="text/css"></style>
        <![endif]-->

    <!-- OUTLOOK | 120dpi -->
    <!--[if (gte mso 9)|(IE)]>
        <xml>
            <o:OfficeDocumentSettings>
                <o:AllowPNG/>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
        <![endif]-->
</head>

<body style="margin: 0px !important; padding: 0px !important;text-align: center; background-color:#0a5173"> 
${content}
<!--[if (gte mso 9)|(IE)]>
    </td>
    </tr>
    </table>
    <![endif]-->
</body>

</html>`;

		$('#editor').val(htmail);
	}
}



$(function(){
	$('#preview').ehtmail({
		'form' : '#htmlFields', //default id form
		'fields' : '.form-control', // default field class
		'createFields' : '#fields' // default create field container class

	});


	$('#createField').click(function(){
		var fieldholder = $('#fields').find('.card').length;
	});
	
});


