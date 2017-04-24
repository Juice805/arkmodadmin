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
		
		var curNode = document.createElement('label');
		
		
		var newChild = document.createElement('input');
		newChild.className = 'modCheck';
		newChild.setAttribute('type', 'checkbox');
		newChild.setAttribute('value', id);
		newChild.setAttribute('data-title', title);
		newChild.checked = checked;
		newChild.onclick = updateDisplay;
		curNode.appendChild(newChild);
		
		newChild = document.createElement('a');
		newChild.className = 'modLink';
		newChild.setAttribute('href', 'http://steamcommunity.com/sharedfiles/filedetails/?id=' + id);
		newChild.setAttribute('target', '_blank')
		newChild.innerText = title;
		curNode.appendChild(newChild);
		el.appendChild(curNode);
		
		var removeNode = document.createElement('strong');
		removeNode.className = "js-remove";
		removeNode.innerText = '✖';
		el.appendChild(removeNode);

		
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
	function listEmpty(){
		var modChecks = byClass('modCheck');
		var modLinks = byClass('modLink');
		
		return modChecks.length > 0 && modChecks.length === modLinks.length;
		
	}
	
	function getListJSON() {
		var modChecks = byClass('modCheck');
		var modLinks = byClass('modLink');

		var data = [];

		for (var i = 0; i < modChecks.length; i++) {
			data.push({"steamid": modChecks[i].value, "checked": modChecks[i].checked, "title": modLinks[i].innerHTML});
		}
		
		return data
	}

		// onclick functions
	byId('save').onclick = function(e) {
		e.preventDefault();
			
		storeData('mods', JSON.stringify([]));
	
		if (listEmpty()) {
		
			var json = getListJSON();
			
			storeData("mods", JSON.stringify(json));
			console.log("Stored: " + JSON.stringify(json));
		}
	};
	
	byId('download').onclick = function(e) {
		e.preventDefault();
							
		if (listEmpty()) {
			
			console.log("Attempting to download");
			
			var downloadEl = document.createElement('a');
		
			var json = getListJSON();
			
			downloadEl.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(json)));
			downloadEl.setAttribute('download', 'ark-mods.txt');
			downloadEl.style.display = 'none';
			
			document.body.appendChild(downloadEl);
			
			downloadEl.click();

			document.body.removeChild(downloadEl);			
		} else {
			console.log("List empty. Not downloading...");
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
