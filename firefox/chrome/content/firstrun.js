var checkItFirstrun = {

		init: function(){//get current version from extension manager
			
			"use strict";

			try {// Firefox <= 3.6

				//get current version from extension manager
				var gExtensionManager = Components.classes["@mozilla.org/extensions/manager;1"]
				.getService(Components.interfaces.nsIExtensionManager);
				var current = gExtensionManager.getItemForID("checkit@lovinglinux.megabyet.net").version;
				checkItFirstrun.updateInstall(current);
			}
			catch(e){// Firefox >=4.0

				//get current version from extension manager
				Components.utils.import("resource://gre/modules/AddonManager.jsm");
				AddonManager.getAddonByID("checkit@lovinglinux.megabyet.net", function(addon) {
					var current = addon.version;
					checkItFirstrun.updateInstall(current);
				});
			}
			window.removeEventListener("load",function(){ checkItFirstrun.init(); },true);
		},

		updateInstall: function(aVersion){//check version and perform updates
			
			"use strict";
			
			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.checkit.");

			//firstrun, update and current declarations
			var ver = -1, firstrun = true;
			var current = aVersion;

			try{//check for existing preferences
				ver = this.prefs.getCharPref("version");
				firstrun = this.prefs.getBoolPref("firstrun");
			}catch(e){
				//nothing
			}finally{

				if(firstrun){//actions specific for first installation

					//add toolbar button
					var navbar = document.getElementById("nav-bar");
					var newset = navbar.currentSet + ",checkit-toolbar-button";
					navbar.currentSet = newset;
					navbar.setAttribute("currentset", newset );
					document.persist("nav-bar", "currentset");

					//set preferences
					this.prefs.setBoolPref("firstrun",false);
					this.prefs.setCharPref("version",current);
				}

				if(ver !== current && !firstrun){//actions specific for extension updates

					//set preferences
					this.prefs.setCharPref("version",current);

					if(ver !== "1.1.1"){

						//add toolbar button
						var navbar = document.getElementById("nav-bar");
						var newset = navbar.currentSet + ",checkit-toolbar-button";
						navbar.currentSet = newset;
						navbar.setAttribute("currentset", newset );
						document.persist("nav-bar", "currentset");
					}
				}
			}
		}
};
//event listeners to call the functions when Firefox starts
window.addEventListener("load",function(){ checkItFirstrun.init(); },true);
