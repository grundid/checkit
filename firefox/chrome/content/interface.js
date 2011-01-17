var checkItInterface = {
		compareChecksum: function () {
			strbundle = document.getElementById("checkitstrings");
			var originalchecksum = content.getSelection().toString().replace(/[^0-9a-f]/ig, '');
			var aType='MD5';
			switch(originalchecksum.length) {
			case 40: var aType='SHA1'; break;
			case 64: var aType='SHA256'; break;
			case 96: var aType='SHA384'; break;
			case 128: var aType='SHA512'; break;
			}
			var nsIFilePicker = Components.interfaces.nsIFilePicker;
			var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
			fp.init(window, strbundle.getFormattedString("selectafile", [ aType ]), nsIFilePicker.modeOpen);
			var rv = fp.show();
			if (rv == nsIFilePicker.returnOK) {
				var f = fp.file;
				var istream = Components.classes["@mozilla.org/network/file-input-stream;1"]		   
				.createInstance(Components.interfaces.nsIFileInputStream);
				istream.init(f, 0x01, 0444, 0);
				var ch = Components.classes["@mozilla.org/security/hash;1"]
				.createInstance(Components.interfaces.nsICryptoHash);
				ch.init(ch[aType]);
				const PR_UINT32_MAX = 0xffffffff;
				ch.updateFromStream(istream, PR_UINT32_MAX);
				var hash = ch.finish(false);
				function toHexString(charCode){ return ("0" + charCode.toString(16)).slice(-2); }
				var filechecksum = [toHexString(hash.charCodeAt(i)) for (i in hash)].join("");
				var filechecksum = filechecksum.replace(/[^0-9a-f]/ig, '');
				var filechecksum = filechecksum.toLowerCase();
				var originalchecksum = originalchecksum.toLowerCase();
				if (filechecksum == originalchecksum){
					var message = aType+' '+strbundle.getString("isamatch");
					var messagetitle = strbundle.getString("checkitmessage");
					var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
					.getService(Components.interfaces.nsIAlertsService);
					alertsService.showAlertNotification("chrome://checkit/skin/icon32.png",
							messagetitle, message,
							false, "", null);
				} else {
					var message = aType+' '+strbundle.getFormattedString("notamatch", [ originalchecksum, filechecksum ]);
					var messagetitle = strbundle.getString("checkitalert");
					var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
					.getService(Components.interfaces.nsIPromptService);
					prompts.alert(window, messagetitle, message);
				}
			}
		}
};