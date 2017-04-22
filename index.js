// JavaScript Document
/*jshint esnext: true */
(function(window, document, undefined){
	
'use strict';

	function byId(id) { return document.getElementById(id); };
	function byClass(id) { return document.getElementsByClassName(id); };

		// Initialize List
	var steamIDs = byId('mods');

	var modList = Sortable.create(steamIDs, {
		animation: 150,
		filter: '.js-remove',
		onFilter: function (evt) {
			evt.item.parentNode.removeChild(evt.item);
			updateDisplay();
		},
		onUpdate: updateDisplay,
		onAdd: updateDisplay
	
	});
 
	function createModElement(id, title, checked = true) {
		var el = document.createElement('li');
		el.className = 'modItem';
		el.innerHTML = ' <label><input class="modCheck" type="checkbox" checked name="selectedMods" value="' + id + '"><a class="modLink" href="http://steamcommunity.com/sharedfiles/filedetails/?id=' + id + '" target="_blank">' + title + '</a></label>  <span class="remove"><strong class="js-remove">✖</strong></span>';
		el.firstChild.checked = checked;
		el.firstChild.onclick = updateDisplay;
		return el;
	}
	
	var dataLoaded = function() {
		var data = localStorage['mods'];
		console.log(data);
		try {
			var mods = JSON.parse(data);
		if (mods) {
			for (var i = 0; i < mods.length; i++) {
				var el = createModElement(mods[i]["steamid"], mods[i]["title"], mods[i]["checked"]);
				modList.el.appendChild(el);
			}
			updateDisplay();
			return true;
		} else {
			mods = [];
			return false;
		}
		} catch (e) {
			console.log(e);
		}
	};

	if (dataLoaded()) {
		console.log("Data Loaded");
	} else {
		console.log("Data Not Loaded");
	}

	function pullIDs() {
		var text = '';
		var modChecks = byClass('modCheck');
		for (var i = 0; i < modChecks.length; i++) {
			if (modChecks[i].checked === true) {
				text += modChecks[i].value;
				text += ',';
			}
		}
		return text.slice(0, -1);
  	};
	
	function updateDisplay() {
		var display = byId('display');
		display.innerHTML = pullIDs();
	};
	
	
	function storeData(key, value){
	if (typeof(Storage) !== "undefined") {
    // Code for localStorage/sessionStorage.
		localStorage.setItem(key, value);
		return true;
	} else {
		console.log("No Web Storage Support");
		return false;
    // Sorry! No Web Storage support..
	}
}

		// onclick functions
	byId('save').onclick = function(e) {
		e.preventDefault();
	
		var modChecks = byClass('modCheck');
		var modLinks = byClass('modLink');
		
		var data = [];
		storeData('mods', data);
	
		if (modChecks.length > 0 && modChecks.length === modLinks.length) {
		
			for (var i = 0; i < modChecks.length; i++) {
				data.push({"steamid": modChecks[i].value, "checked": modChecks[i].checked, "title": modLinks[i].innerHTML});
			}
			
			storeData("mods", JSON.stringify(data));
			console.log("Stored: " + JSON.stringify(data));
		
			/*
			$.ajax({
				url     : 'saveJSON.php',
				method  : 'POST',
				data    : JSON.stringify(data),
				success : function( response ) {
					console.log("Save request received successfully")
				},
				error   : function( response ) {
					alert( "Error: " + JSON.stringify(response) + "\nSent: " +  JSON.stringify(data));
				}
			}); */
		}
	};

	// Setup Add button with prompt
	byId('addMod').onclick = function () {
		Ply.dialog('prompt', {
			title: 'Add',
			form: { title: 'name',  id: 'steamID'}
		}).done(function (ui) {
			var el = createModElement(ui.data.id, ui.data.title);
			modList.el.appendChild(el);
			updateDisplay();
		});
	};


	// Save to clipboard
    var clipboard = new Clipboard(byId('clipIt'), {
        text: pullIDs
    });
	
	clipboard.on('success', function(e) {
        console.log(e);
    });
    clipboard.on('error', function(e) {
        console.log(e);
    });

})(window, document, undefined); 
