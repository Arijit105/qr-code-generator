function download_image() {
	download_blob();
}

function get_blob() {

	var img = document.images[0];
	// atob to base64_decode the data-URI
	var image_data = atob(img.src.split(',')[1]);
	// Use typed arrays to convert the binary data to a Blob
	var arraybuffer = new ArrayBuffer(image_data.length);
	var view = new Uint8Array(arraybuffer);
	for (var i = 0; i < image_data.length; i++) {
		view[i] = image_data.charCodeAt(i) & 0xff;
	}
	try {
		// This is the recommended method:
		var blob = new Blob([arraybuffer], {
			type: 'application/octet-stream'
		});
	} catch (e) {
		// The BlobBuilder API has been deprecated in favour of Blob, but older
		// browsers don't know about the Blob constructor
		// IE10 also supports BlobBuilder, but since the `Blob` constructor
		//  also works, there's no need to add `MSBlobBuilder`.
		var bb = new(window.WebKitBlobBuilder || window.MozBlobBuilder);
		bb.append(arraybuffer);
		var blob = bb.getBlob('application/octet-stream'); // <-- Here's the Blob
	}

	return blob;


}

function download_blob() {
	var img = document.images[0];
	// atob to base64_decode the data-URI
	var image_data = atob(img.src.split(',')[1]);
	// Use typed arrays to convert the binary data to a Blob
	var arraybuffer = new ArrayBuffer(image_data.length);
	var view = new Uint8Array(arraybuffer);
	for (var i = 0; i < image_data.length; i++) {
		view[i] = image_data.charCodeAt(i) & 0xff;
	}
	try {
		// This is the recommended method:
		var blob = new Blob([arraybuffer], {
			type: 'application/octet-stream'
		});
	} catch (e) {
		// The BlobBuilder API has been deprecated in favour of Blob, but older
		// browsers don't know about the Blob constructor
		// IE10 also supports BlobBuilder, but since the `Blob` constructor
		//  also works, there's no need to add `MSBlobBuilder`.
		var bb = new(window.WebKitBlobBuilder || window.MozBlobBuilder);
		bb.append(arraybuffer);
		var blob = bb.getBlob('application/octet-stream'); // <-- Here's the Blob
	}

	// Use the URL object to create a temporary URL
	var url = (window.webkitURL || window.URL).createObjectURL(blob);
	// location.href = url; // <-- Download!
	document.getElementById('btn_download').href = url;

}

function download_jpg() {

	blob = get_blob();

	var url = (window.webkitURL || window.URL).createObjectURL(blob);
	// location.href = url; // <-- Download!
	document.getElementById('btn_download2').href = url;


}

function download_png_domvas() {
	// use domvas
	var canvas = document.getElementById("mycanvas");
	var img = canvas.toDataURL("image/png");
	document.write('<img src="' + img + '"/>');
}

function isNumeric(str) {
	if (typeof str != "string") return false // we only process strings!  
	return !isNaN(str) &&
		// use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
		!isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}


var elText = document.getElementById("text");
var output_div = document.getElementById("qrcode");
var button_download_container = document.getElementById("button_download_container");


var download_btn = `
<a id="btn_download" download="qr-code.png" href="#" onclick="download_image()" class="w3-button w3-blue w3-round w3-margin w3-padding">
Download PNG
</a>

<a id="btn_download2" download="qr-code.jpg" href="#" onclick="download_jpg()" class="w3-button w3-blue w3-round w3-margin w3-padding">
Download JPG
</a>
                    `;
const prompt_input = `
<h3>ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ Qʀ ᴄᴏᴅᴇ ɢᴇɴᴇʀᴀᴛᴏʀ .</h3>
<p><b>It Works, Even You Are Offline!!</b> </p>
<p> ꜰᴏʀ ᴇxᴀᴍᴘʟᴇ : </p>
<li>🔗 liɴᴋ      :   https://domain.com/</li>
<li>💾 ᴅᴏᴄᴜᴇᴍᴇɴᴛ :  https://domain.com/document_pdf</li>
<li>🧰 ᴇᴍᴀɪʟ     :  examle@domain.com</li>
<li>📞 ᴘʜᴏɴᴇ     :  +919988776655</li>
</ul>

<h4>ꜱᴛᴇᴘ ʙʏ ꜱᴛᴇᴘ ᴛᴏ ɢᴇɴᴇʀᴀᴛᴇ Qʀ ᴄᴏᴅᴇ</h4>
<ol>
<li>ᴘᴀꜱᴛᴇ ʏᴏᴜʀ ᴛʏᴘᴇ ᴏꜰ ꜱᴏᴜʀᴄᴇ ɪɴ ᴜʀʟ ᴛᴇxᴛ ʙᴏx</li>
<li>ᴛʜᴇɴ ꜱᴇʟᴇᴄᴛ ʏᴏᴜʀ ꜱɪᴢᴇ ᴏꜰ Qʀ ᴄᴏᴅᴇ ɪɴ ꜱɪᴢᴇ ʙᴏx</li>
<li>ɴᴏᴡ ꜱᴇʟᴇᴄᴛ ʏᴏᴜʀ ᴄᴏʟᴏʀ ᴏꜰ Qʀ ᴄᴏᴅᴇ</li>
<li>ᴛʜᴀᴛ ꜱᴏʟᴠᴇ ɴᴏᴡ ᴄʟɪᴄᴋ ᴛʜᴇ ɢᴇɴᴇʀᴀᴛᴇ ʙᴜᴛᴛᴏɴ ᴀɴᴅ ᴄʜᴏꜱᴇ ʏᴏᴜʀ ᴄʜᴏɪᴄᴇ ᴘɴɢ ꜰɪʟᴇ ᴏʀ ᴊʙɢ ᴀɴᴅ ᴅᴏᴡɴʟᴏᴀᴅ ɪᴛ</li>
</ol>

        `


function makeCode() {

	if (!elText.value) {
		output_div.innerHTML = prompt_input
		elText.focus();
		return;
	}

	button_download_container.innerHTML = '';
	output_div.innerHTML = "";

	var bg_color = document.getElementById('bg_color').jscolor.toHEXString();
	var dot_color = document.getElementById('dot_color').jscolor.toHEXString();
	var size = document.getElementById('size').value;

	var qrcode_width = 100;
	var qrcode_height = 100;

	if (size == 'custom') {

		// check if custom height and width is correct

		custom_height = document.getElementById('height').value;
		custom_width = document.getElementById('width').value;

		if (!isNumeric(custom_height) || !isNumeric(custom_width)) {
			output_div.innerHTML = "<h2>Wrong custom size<h2>";
			return;

		}
		qrcode_height = custom_height;
		qrcode_width = custom_width;


	} else {
		qrcode_height = size;
		qrcode_width = size;
	}

	// and you can use some methods
	// qrcode.clear(); 
	// qrcode.makeCode("http://naver.com"); 

	var qrcode = new QRCode(output_div, {
		width: qrcode_width,
		height: qrcode_height,
		colorDark: dot_color,
		colorLight: bg_color,
		correctLevel: QRCode.CorrectLevel.H
	});


	qrcode.makeCode(elText.value);
	button_download_container.innerHTML = download_btn;


}

$('document').ready(function() {

	$('#text').on('keyup', function(e) {

		if (elText.value) {
			makeCode();
		} else {
			output_div.innerHTML = prompt_input;
			button_download_container.innerHTML = '';
		}

	});

	makeCode();

})