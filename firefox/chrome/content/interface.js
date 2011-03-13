var checkItInterface = {

		init: function () {
			var contextMenu = document.getElementById("checkit-contextmenu");
			if (contextMenu) {
				contextMenu.addEventListener("popupshowing", function(e) { checkItInterface.onShowing(e); }, false);
				contextMenu.addEventListener("popuphiding", function(e) { checkItInterface.onHiding(e); }, false);
			}
		},

		onShowing: function (e) {
			var entry = document.getElementById("checkit-hash");
			var orig = content.getSelection().toString().replace(/[^0-9a-f]/ig, '');
			var type = checkItInterface.getChecksumType(orig);
			if ( type ) {
				entry.label = document.getElementById("checkitstrings").getString("selectedhash")+' ('+type+')';
				entry.hidden = false;
			}
		},

		onHiding: function (e) {
			var entry = document.getElementById("checkit-hash");
			entry.hidden = true;
			entry.label = document.getElementById("checkitstrings").getString("checkitalert");
		},

		getChecksumType: function (checksum) {
			switch(checksum.length) {
			case 32: return 'MD5'; break;
			case 40: return 'SHA1'; break;
			case 64: return 'SHA256'; break;
			case 96: return 'SHA384'; break;
			case 128: return 'SHA512'; break;
			default: return false;
			}
		},

		compareChecksum: function () {

			//get localization strings
			var strbundle = document.getElementById("checkitstrings");
			var originalchecksum, filechecksum, aType, message, messagetitle, prompts, alertsService;

			//get selected hash and check type
			originalchecksum = content.getSelection().toString().replace(/[^0-9a-f]/ig, '');
			aType = checkItInterface.getChecksumType(originalchecksum);

			//trigger invalidhash alert
			if ( !aType ) {
				message = strbundle.getString("invalidhash");
				messagetitle = strbundle.getString("checkitalert");
				prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
				.getService(Components.interfaces.nsIPromptService);
				prompts.alert(window, messagetitle, message);
				return false;
			}

			filechecksum = checkItInterface.getFileHash(aType);
			originalchecksum = originalchecksum.toLowerCase();

			//trigger alerts
			if (filechecksum == originalchecksum){
				message = aType+' '+strbundle.getString("isamatch");
				messagetitle = strbundle.getString("checkitmessage");
				var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
				.getService(Components.interfaces.nsIAlertsService);
				alertsService.showAlertNotification("chrome://checkit/skin/icon48.png",
						messagetitle, message,
						false, "", null);
			} else {
				message = aType+' '+strbundle.getFormattedString("notamatch", [ originalchecksum, filechecksum ]);
				messagetitle = strbundle.getString("checkitalert");
				prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
				.getService(Components.interfaces.nsIPromptService);
				prompts.alert(window, messagetitle, message);
			}
		},

		compareFiles: function (aType) {

			//get localization strings
			var strbundle = document.getElementById("checkitstrings");
			var file1checksum, file2checksum, message, messagetitle, prompts, alertsService;

			file1checksum = checkItInterface.getFileHash(aType);
			file2checksum = checkItInterface.getFileHash(aType);

			if (file1checksum == file2checksum){
				message = aType+' '+strbundle.getString("isamatch");
				messagetitle = strbundle.getString("checkitmessage");
				var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
				.getService(Components.interfaces.nsIAlertsService);
				alertsService.showAlertNotification("chrome://checkit/skin/icon48.png",
						messagetitle, message,
						false, "", null);
			} else {
				message = aType+' '+strbundle.getFormattedString("filesnotmatch", [ file1checksum, file2checksum ]);
				messagetitle = strbundle.getString("checkitalert");
				prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
				.getService(Components.interfaces.nsIPromptService);
				prompts.alert(window, messagetitle, message);
			}
		},

		getFileHash: function (aType) {

			//get localization strings
			var strbundle = document.getElementById("checkitstrings");

			//get file and generate hash
			var nsIFilePicker = Components.interfaces.nsIFilePicker;
			var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
			fp.init(window, strbundle.getFormattedString("selectafile", [ aType ]), nsIFilePicker.modeOpen);
			var rv = fp.show();
			if (rv == nsIFilePicker.returnOK) {
				var f = fp.file;
				//open input stream
				var istream = Components.classes["@mozilla.org/network/file-input-stream;1"]
				.createInstance(Components.interfaces.nsIFileInputStream);
				istream.init(f, 0x01, 0444, 0);

				//hash check
				var ch = Components.classes["@mozilla.org/security/hash;1"]
				.createInstance(Components.interfaces.nsICryptoHash);
				ch.init(ch[aType]);
				const PR_UINT32_MAX = 0xffffffff;
				ch.updateFromStream(istream, PR_UINT32_MAX);
				var hash = ch.finish(false);
				function toHexString(charCode){ return ("0" + charCode.toString(16)).slice(-2); }
				var filechecksum = [toHexString(hash.charCodeAt(i)) for (i in hash)].join("");
				filechecksum = filechecksum.replace(/[^0-9a-f]/ig, '');
				filechecksum = filechecksum.toLowerCase();
				return filechecksum;
			}
		}
};

window.addEventListener("load", checkItInterface.init, false);