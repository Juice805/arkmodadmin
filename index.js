// JavaScript Document
/*jshint esnext: true */
(function(window, document, undefined){
	
'use strict';

	function byId(id) { return document.getElementById(id); }
	function byClass(id) { return document.getElementsByClassName(id); }

		// Initialize List
	var modIDs = byId('modList');

	var modList = Sortable.create(modIDs, {
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
		curNode.className = 'modItemLine';
		
		
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
		newChild.setAttribute('target', '_blank');
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
		var data = localStorage.mods;
		console.log(data);
		
		if (!data) {
			console.log('No Data to Load');
			return false;
		}
		
		try {
			var mods = JSON.parse(data);
		if (mods) {
			for (var i = 0; i < mods.length; i++) {
				var el = createModElement(mods[i].modid.replace(/\s/g,''), mods[i].title, mods[i].checked);
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
			return false;
		}
	};

	if (dataLoaded()) {
		console.log("Data Loaded");
	} else {
		console.log("Data Not Loaded");
		updateDisplay();
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
  	}
	
	function updateDisplay() {
		var display = byId('display');
		display.value = pullIDs();
		if (byClass('modCheck').length === 0) {
			var placeholder = document.createElement('p');
			placeholder.textContent = 'Empty';
			placeholder.id = 'empty';
			modIDs.appendChild(placeholder);
		} else if (byId('empty')) {
			var placeholder =  byId('empty');
			placeholder.parentNode.removeChild(placeholder);
		}
	}
	
	
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
			data.push({"modid": modChecks[i].value, "checked": modChecks[i].checked, "title": modLinks[i].innerHTML});
		}
		
		return data;
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
	
	byId('omnibutton').onclick = function(e) {
		e.preventDefault();
		
		var importKey = false;
		
		if (byId('importKey').textContent === "Alt") {
			importKey = e.altKey;
		} else {
			importKey = e.ctrlKey;
		}
		
		if (importKey) { //import
			var importEl = byId('import');
			console.log("Attempting to import");
			
			importEl.click();
			
		} else if (e.shiftKey) { //export
					
			if (listEmpty()) {
			
				console.log("Attempting to export");
			
				var exportEl = document.createElement('a');
		
				var json = getListJSON();
			
				exportEl.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(json)));
				exportEl.setAttribute('download', 'ark-mods.txt');
				exportEl.style.display = 'none';
			
				document.body.appendChild(exportEl);
			
				exportEl.click();

				document.body.removeChild(exportEl);			
			} else {
				console.log("List empty. Not exporting...");
			}
		} else { // copy to clipboard
			byId('clipIt').click();
		}
	};
	
	byId('import').onchange = function(e) {
		console.log('File selected');
		var files = e.target.files;
		if (files.length <= 0) {
			alert("No selection made!");
		} else if (files.length > 1) {
			alert("Select only one file!");
		} else {
			var file = files[0];
			
			var reader = new FileReader();
			reader.onload = function(e) {
				try {
					var obj = JSON.parse(e.target.result);
					console.log(obj);
					
					// remove previous data
					while (modList.el.firstChild) {
    					modList.el.removeChild(modList.el.firstChild);
					}
					
					for (var i = 0; i < obj.length; i++) {
						var el = createModElement(obj[i].modid.replace(/\s/g,''), obj[i].title, obj[i].checked);
						modList.el.appendChild(el);
					}

					updateDisplay();

				} catch (exception){
					console.log(exception.message);
					alert('invalid data');
				}				
			};
			reader.readAsText(file);
		}
		this.value = ""; // reset value to allow for another change when next file is imported
	};

	// Setup Add button with prompt
	byId('addMod').onclick = function () {
		Ply.dialog('prompt', {
			title: 'Add',
			form: { title: 'name',  id: 'modID'}
		}).done(function (ui) {
			var el = createModElement(ui.data.id.replace(/\s/g,''), ui.data.title);
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
