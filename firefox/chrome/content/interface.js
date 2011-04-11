var checkItInterface = {

		init: function () {
			var contextMenu = document.getElementById("contentAreaContextMenu");
			if (contextMenu) {
				contextMenu.addEventListener("popupshowing", function(e) { checkItInterface.onShowing(e); }, false);
			}
		},

		onShowing: function (e) {
			var context = document.getElementById("checkit-hash-context");
			var orig = content.getSelection().toString().replace(/[^0-9a-f]/ig, '');
			var type = checkItInterface.getChecksumType(orig);
			if ( type ) {
				context.label = document.getElementById("checkitstrings").getString("selectedhash")+' ('+type+')';
				context.hidden = false;	
			}else{
				context.hidden = true;
				context.label = document.getElementById("checkitstrings").getString("checkitalert");
			}
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

		compareWithSelected: function () {

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

			filechecksum = checkItInterface.processFileHash(aType);
			aType = checkItInterface.getChecksumType(filechecksum);

			if (aType) {

				originalchecksum = originalchecksum.toLowerCase();

				//trigger alerts
				if (filechecksum == originalchecksum){
					message = aType+' '+strbundle.getString("isamatch");
					messagetitle = strbundle.getString("checkitmessage");
					var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
					.getService(Components.interfaces.nsIAlertsService);
					alertsService.showAlertNotification("chrome://checkit/skin/icon32.png",
							messagetitle, message,
							false, "", null);
				} else {
					message = aType+' '+strbundle.getFormattedString("notamatch", [ originalchecksum, filechecksum ]);
					messagetitle = strbundle.getString("checkitalert");
					prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
					.getService(Components.interfaces.nsIPromptService);
					prompts.alert(window, messagetitle, message);
				}
			}
		},

		compareTwoFiles: function (aType) {

			//get localization strings
			var strbundle = document.getElementById("checkitstrings");
			var file1checksum, file2checksum, message, messagetitle, prompts, alertsService;

			file1checksum = checkItInterface.processFileHash(aType);
			aType = checkItInterface.getChecksumType(file1checksum);

			if (aType) {

				file2checksum = checkItInterface.processFileHash(aType);
				aType = checkItInterface.getChecksumType(file2checksum);

				if (file2checksum){

					if (file1checksum == file2checksum){
						message = aType+' '+strbundle.getString("isamatch");
						messagetitle = strbundle.getString("checkitmessage");
						var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
						.getService(Components.interfaces.nsIAlertsService);
						alertsService.showAlertNotification("chrome://checkit/skin/icon32.png",
								messagetitle, message,
								false, "", null);
					} else {
						message = aType+' '+strbundle.getFormattedString("filesnotmatch", [ file1checksum, file2checksum ]);
						messagetitle = strbundle.getString("checkitalert");
						prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
						.getService(Components.interfaces.nsIPromptService);
						prompts.alert(window, messagetitle, message);
					}
				}
			}
		},

		comparewithHashFile: function (aType) {
			//get localization strings
			var strbundle = document.getElementById("checkitstrings");
			var file1checksum, filehash, message, messagetitle, prompts, alertsService;

			file1checksum = checkItInterface.processFileHash(aType);
			aType = checkItInterface.getChecksumType(file1checksum);

			if (aType) {

				filehash = checkItInterface.processFileContent(aType);
				aType = checkItInterface.getChecksumType(filehash);

				if (filehash){

					if (file1checksum == filehash){
						message = aType+' '+strbundle.getString("isamatch");
						messagetitle = strbundle.getString("checkitmessage");
						var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
						.getService(Components.interfaces.nsIAlertsService);
						alertsService.showAlertNotification("chrome://checkit/skin/icon32.png",
								messagetitle, message,
								false, "", null);
					} else {
						message = aType+' '+strbundle.getFormattedString("filesnotmatch", [ file1checksum, filehash ]);
						messagetitle = strbundle.getString("checkitalert");
						prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
						.getService(Components.interfaces.nsIPromptService);
						prompts.alert(window, messagetitle, message);
					}
				}else{

				}
			}
		},		

		compareWithClipboard: function (aType) {

			//get localization strings
			var strbundle = document.getElementById("checkitstrings");

			try{
				var clip = Components.classes["@mozilla.org/widget/clipboard;1"].getService(Components.interfaces.nsIClipboard);
				if (!clip) return false;

				var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
				if (!trans) return false;
				trans.addDataFlavor("text/unicode");

				clip.getData(trans, clip.kGlobalClipboard);
				var str = new Object();
				var strLength = new Object();
				trans.getTransferData("text/unicode", str, strLength);

			}catch(e){
				message = strbundle.getString("invalidclipboard");
				messagetitle = strbundle.getString("checkitalert");
				prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
				.getService(Components.interfaces.nsIPromptService);
				prompts.alert(window, messagetitle, message);
				return false;
			}

			var file1checksum, message, messagetitle, prompts, alertsService;

			if (str) {

				str = str.value.QueryInterface(Components.interfaces.nsISupportsString);
				pastetext = str.data.substring(0, strLength.value / 2);
				aType = checkItInterface.getChecksumType(pastetext);

				//trigger invalidhash alert
				if ( !aType ) {
					message = strbundle.getString("invalidclipboard");
					messagetitle = strbundle.getString("checkitalert");
					prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
					.getService(Components.interfaces.nsIPromptService);
					prompts.alert(window, messagetitle, message);
					return false;
				}				

				if (aType) {

					file1checksum = checkItInterface.processFileHash(aType);
					aType = checkItInterface.getChecksumType(file1checksum);

					if (file1checksum){

						if (file1checksum == pastetext){
							message = aType+' '+strbundle.getString("isamatch");
							messagetitle = strbundle.getString("checkitmessage");
							var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
							.getService(Components.interfaces.nsIAlertsService);
							alertsService.showAlertNotification("chrome://checkit/skin/icon32.png",
									messagetitle, message,
									false, "", null);
						} else {
							message = aType+' '+strbundle.getFormattedString("filesnotmatch", [ pastetext, file1checksum ]);
							messagetitle = strbundle.getString("checkitalert");
							prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
							.getService(Components.interfaces.nsIPromptService);
							prompts.alert(window, messagetitle, message);
						}
					}
				}
			}else{
				message = strbundle.getString("invalidclipboard");
				messagetitle = strbundle.getString("checkitalert");
				prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
				.getService(Components.interfaces.nsIPromptService);
				prompts.alert(window, messagetitle, message);
				return false;
			}
		},

		generateFileHash: function (aType) {

			//get localization strings
			var strbundle = document.getElementById("checkitstrings");
			var file1checksum, message, messagetitle, prompts, alertsService;

			file1checksum = checkItInterface.processFileHash(aType);
			aType = checkItInterface.getChecksumType(file1checksum);

			if (aType) {

				//copy to clipboard
				const gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
				gClipboardHelper.copyString(file1checksum);

				//alert user
				message = strbundle.getFormattedString("toclipboard", [ aType ]);
				messagetitle = strbundle.getString("checkitmessage");
				var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
				.getService(Components.interfaces.nsIAlertsService);
				alertsService.showAlertNotification("chrome://checkit/skin/icon32.png",
						messagetitle, message,
						false, "", null);
			}
		},

		processFileHash: function (aType) {

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
			}else {
				return false;
			}
		},

		processFileContent: function (aType) {

			//get localization strings
			var strbundle = document.getElementById("checkitstrings");

			//get file and generate hash
			var nsIFilePicker = Components.interfaces.nsIFilePicker;
			var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
			fp.init(window, strbundle.getFormattedString("selectahashfile", [ aType ]), nsIFilePicker.modeOpen);
			fp.appendFilters(nsIFilePicker.filterText);
			var rv = fp.show();
			if (rv == nsIFilePicker.returnOK) {
				var f = fp.file;

				// read file
				var istream = Components.classes["@mozilla.org/network/file-input-stream;1"]
				.createInstance(Components.interfaces.nsIFileInputStream);
				istream.init(f, 0x01, 444, 0);
				istream.QueryInterface(Components.interfaces.nsILineInputStream);

				var line = {}, lines = [], hasmore;
				do {
					hasmore = istream.readLine(line);
					lines.push(line.value);
					aType = checkItInterface.getChecksumType(line.value);
					if(aType){
						return line.value;
						break;
					}

				} while (hasmore);
				istream.close();
			}else {
				return false;
			}
		}
};

window.addEventListener("load", checkItInterface.init, false);