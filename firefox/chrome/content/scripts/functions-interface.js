var checkItInterface = {

    showHideContextMenus: function () {//hide menus according to context
 
	//hide md2 option if text is not selected
	var showCheckItMD2 = document.getElementById("checkit-run-check-md2");
	showCheckItMD2.hidden = !(gContextMenu.isTextSelected);

	//hide md5 option if text is not selected
	var showCheckItMD5 = document.getElementById("checkit-run-check-md5");
	showCheckItMD5.hidden = !(gContextMenu.isTextSelected);

	//hide sha1 option if text is not selected
	var showCheckItSHA1 = document.getElementById("checkit-run-check-sha1");
	showCheckItSHA1.hidden = !(gContextMenu.isTextSelected);

	//hide sha256 option if text is not selected
	var showCheckItSHA256 = document.getElementById("checkit-run-check-sha256");
	showCheckItSHA256.hidden = !(gContextMenu.isTextSelected);

	//hide sha384 option if text is not selected
	var showCheckItSHA384 = document.getElementById("checkit-run-check-sha384");
	showCheckItSHA384.hidden = !(gContextMenu.isTextSelected);

	//hide sha512 option if text is not selected
	var showCheckItSHA512 = document.getElementById("checkit-run-check-sha512");
	showCheckItSHA512.hidden = !(gContextMenu.isTextSelected);

	//hide separator if text is not selected
	var showCheckItPrefSeparator = document.getElementById("checkit-prefrences-separator");
	showCheckItPrefSeparator.hidden = !(gContextMenu.isTextSelected);

	//access preferences interface
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.checkit.");

	//fetch preferences
	var checkmd2 = this.prefs.getBoolPref("md2");
	var checkmd5 = this.prefs.getBoolPref("md5");
	var checksha1 = this.prefs.getBoolPref("sha1");
	var checksha256 = this.prefs.getBoolPref("sha256");
	var checksha384 = this.prefs.getBoolPref("sha384");
	var checksha512 = this.prefs.getBoolPref("sha512");

	if (checkmd2 !== true){	//hide md2 option if preference is false
	    document.getElementById("checkit-run-check-md2").hidden = true;
	}

	if (checkmd5 !== true){//hide md5 option if preference is false
	    document.getElementById("checkit-run-check-md5").hidden = true;
	}

	if (checksha1 !== true){//hide sha1 option if preference is false
	    document.getElementById("checkit-run-check-sha1").hidden = true;
	}

	if (checksha256 !== true){//hide sha256 option if preference is false
	    document.getElementById("checkit-run-check-sha256").hidden = true;
	}

	if (checksha384 !== true){//hide sha384 option if preference is false
	    document.getElementById("checkit-run-check-sha384").hidden = true;
	}

	if (checksha512 !== true){//hide sha512 option if preference is false
	    document.getElementById("checkit-run-check-sha512").hidden = true;
	}

	if(checkmd2 !== true && checkmd5 !== true && checksha1 !== true && checksha256 !== true && checksha384 !== true && checksha512 !== true){//hide separator if all options are hidden
	    document.getElementById("checkit-prefrences-separator").hidden = true;
	}
    },

    compareChecksum: function (aType) {//prompt for file selection and compare selected text value with selected file checksum

	//access preferences interface
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.checkit.");

	//get selected text value
	var originalchecksum = content.getSelection();

	//declare selected algorith
	var checktype = aType;

	var strbundle = document.getElementById("checkitstrings");
	var aText = strbundle.getFormattedString("selectafile", [ aType ]);

	//prompt for file selection
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"]
		.createInstance(nsIFilePicker);
	fp.init(window, aText, nsIFilePicker.modeOpen);
	var rv = fp.show();
	if (rv == nsIFilePicker.returnOK) {

	    var f = fp.file;
	    //read selected file
	    var istream = Components.classes["@mozilla.org/network/file-input-stream;1"]           
		    .createInstance(Components.interfaces.nsIFileInputStream);
	    istream.init(f, 0x01, 0444, 0);
	    var ch = Components.classes["@mozilla.org/security/hash;1"]
		    .createInstance(Components.interfaces.nsICryptoHash);

	    //switch algorithm according to selected option
	    switch(aType) {
		case "MD2": ch.init(ch.MD2); break;
		case "MD5": ch.init(ch.MD5); break;
		case "SHA1": ch.init(ch.SHA1); break;
		case "SHA256": ch.init(ch.SHA256); break;
		case "SHA384": ch.init(ch.SHA384); break;
		case "SHA512": ch.init(ch.SHA512); break;
		default: ch.init(ch.MD5); break;
	    }

	    //generate file checksum and declare it
	    const PR_UINT32_MAX = 0xffffffff;
	    ch.updateFromStream(istream, PR_UINT32_MAX);
	    var hash = ch.finish(false);
	    function toHexString(charCode)
	    {
	      return ("0" + charCode.toString(16)).slice(-2);
	    }
	    var filechecksum = [toHexString(hash.charCodeAt(i)) for (i in hash)].join("");

	    if (aType == "MD2" && filechecksum.length > 32) {//check if file checksum has more than 32 chars
		filechecksum = filechecksum.substr(0,32);
	    }
  
	    if (aType == "MD5" && filechecksum.length > 32) {//check if file checksum has more than 32 chars
		filechecksum = filechecksum.substr(0,32);
	    }

	    if (aType == "SHA1" && filechecksum.length > 40) {//check if file checksum has more than 40 chars
		filechecksum = filechecksum.substr(0,40);
	    }

	    if (aType == "SHA256" && filechecksum.length > 64) {//check if file checksum has more than 64 chars
		filechecksum = filechecksum.substr(0,64);
	    }

	    if (aType == "SHA384" && filechecksum.length > 96) {//check if file checksum has more than 96 chars
		filechecksum = filechecksum.substr(0,96);
	    }

	    if (aType == "SHA512" && filechecksum.length > 128) {//check if file checksum has more than 128 chars
		filechecksum = filechecksum.substr(0,128);
	    }

	    var filechecksum = filechecksum.replace(/\s/g,"");
	    var originalchecksum = originalchecksum.toString().replace(/\s/g,"");

	    if (filechecksum == originalchecksum){//action if checksums match

		//fetch message from strbundle
		var strbundle = document.getElementById("checkitstrings");
		var message = strbundle.getString("isamatch");
		var messagetitle = strbundle.getString("checkitmessage");
		//alert user
		var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
		    .getService(Components.interfaces.nsIAlertsService);
		alertsService.showAlertNotification("chrome://checkit/content/images/checkit_large.png",
		messagetitle, message,
		false, "", null);
	    }
	    else{//action if checksums do not match

		var filechecksum = filechecksum.toUpperCase();
		var originalchecksum = originalchecksum.toUpperCase();

		if (filechecksum == originalchecksum){//action if checksums match

		    //fetch message from strbundle
		    var strbundle = document.getElementById("checkitstrings");
		    var message = strbundle.getString("isamatch");
		    var messagetitle = strbundle.getString("checkitmessage");
		    //alert user
		    var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
			.getService(Components.interfaces.nsIAlertsService);
		    alertsService.showAlertNotification("chrome://checkit/content/images/checkit_large.png",
		    messagetitle, message,
		    false, "", null);
		}
		else{
		    //fetch message from strbundle
		    var strbundle = document.getElementById("checkitstrings");
		    var message = strbundle.getFormattedString("notamatch", [ filechecksum, originalchecksum ]);
		    var messagetitle = strbundle.getString("checkitalert");
		    //prompt user
		    var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
			    .getService(Components.interfaces.nsIPromptService);
		    prompts.alert(window, messagetitle, message);
		}
	    }
	}
    }
};