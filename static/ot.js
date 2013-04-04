BookElementEmun = {
	TopLevel: 0,
	Book: 1,
	Chapter: 2,
	SEContent: 3
};

function start() {
	// connect to the server
	sharejs.open('book12', 'json', function(error, doc) {
		
		// this function is called once the connection is opened
		if (error) {
			console.log("ERROR:", error);
			return;
		}

		if (doc.get() == null) {
			doc.set({
				id: 'toc', 
				type: BookElementEmun.TopLevel,
				children: [{
					id: 0, 
					type: BookElementEmun.Book, 
					name: "Book", children: []}
				]
			});
		} 			

		buildAndPopulateTree(doc);

		doc.at().on('child op', function (path, op) {			
			buildAndPopulateTree(doc);
		});
	});
}

function buildPath(id, parent, parents) {
			
	for (var i = 0; i < parent.children.length; ++i) {
		if ('node' + parent.children[i].id == id) {

			var path = [];

			jQuery.each(parents, function(i, parentIndex) {	
				path.push('children', parentIndex);
			});
			path.push('children', i);
			return path;

		}
	};

	for (var i = 0; i < parent.children.length; ++i) {	
		parents.push(i);				
		var retValue = buildPath(id, parent.children[i], parents);
		if (retValue != null) {
			return retValue;
		}
		parents.pop();
	};

	return null;
}

function buildAndPopulateTree(doc) {
	
	var scrollPos = 0;
	if (jQuery('#toc').length != 0) {
		scrollPos = jQuery('#toc').scrollTop();
	}
	
	buildTree();
	addChild(jQuery('#tocTopLevel'), doc.get());	
	buildJSTree(doc);
	renderBook(doc);

	jQuery('#toc').scrollTop(scrollPos);
}

function buildTree() {

	jQuery('#toc').remove();
	var tocElement = jQuery('<div id="toc" style="position: absolute; top: 50; bottom: 0; left: 16; right: 0; overflow-y: auto">');
	var tocTopLevel = jQuery('<ul id="tocTopLevel">');
	tocElement.append(tocTopLevel);
	jQuery('#tocParent').append(tocElement);

}

function buildJSTree(doc) {
	jQuery("#toc-items").jstree({		
		"crrm" : {
			"move" : {
			"check_move" : function (m) {
				return false;
			}
		    }
		},
		plugins : [ "themes", "html_data", "dnd", "crrm", "ui" ]
	});
	
	jQuery("#toc-staging").jstree({		
		"crrm" : {
			"move" : {
			"check_move" : function (m) {
				return false;
			}
		    }
		},
		plugins : [ "themes", "html_data", "dnd", "crrm", "ui" ]
	});

	jQuery("#toc").jstree({
		"core" : { "initially_open" : [ "node0" ], open_parents: true },
		"crrm": { 
			"move": { 
				"always_copy": "multitree",
				"check_move" : function (m) {
					if (m.np[0].id == 'toc') {
						return false;	
					}
					
					var sourceNodeId = m.np[0].id;
					var sourceTocElement = getTocElement(sourceNodeId, doc.get());
					
					if (sourceTocElement != null && sourceTocElement.type == BookElementEmun.SEContent && sourceTocElement.seData === undefined) {
						return false;	
					}
					
					return true;
				}
			}				
		},
		plugins : [ "themes", "html_data", "crrm", "dnd", "ui"]
	}).bind('move_node.jstree',function(event,data){

		console.log(event);
		console.log(data); 
		console.log('the item being dragged '+ data.rslt.o[0].id + 'target '+ data.rslt.np[0].id + ' source ' + data.rslt.op[0].id);

		//lets assume we want to roll back
		/*
			jQuery.jstree.rollback(data.rlbk);
			alert('this move is not allowed');
		*/    

		
		var parentOfNewNode = data.rslt.np[0];
		var sourceNode = data.rslt.o[0];

		/*
			If the source is toc-items, we have just copied a new element into the toc.
			Issue an add operation to the OT server.
		*/

		if (sourceNode.parentElement.parentElement == jQuery("#toc-items")[0]) {
			var newNode = data.rslt.oc[0];
			
			var nodeId = (getMaxNodeId(0, doc.get()) + 1);
			newNode.id = 'node' + nodeId;

			var childIndex = getChildIndex(newNode.parentElement, newNode);			
			var newTocElement = {id: nodeId, type: BookElementEmun.Chapter, name: newNode.innerText.trim(), children: []};

			var pathDetails = buildPath(parentOfNewNode.id, doc.get(), []);

			// notify the OT server
			pathDetails.push('children');
			
			var subDoc = doc.at(pathDetails);
			subDoc.insert(childIndex, newTocElement);
		} 
		/*
			This is a content node from the staging area
		*/
		else if (sourceNode.parentElement.parentElement == jQuery("#toc-staging")[0]) {
			/*
				We copy by default, but we actually want to move from the
				staging tree, so remove the source node.
			*/
			$("#toc-staging").jstree("remove", sourceNode);	
			
			var newNode = data.rslt.oc[0];
			
			var nodeId = (getMaxNodeId(0, doc.get()) + 1);
			newNode.id = 'node' + nodeId;

			var childIndex = getChildIndex(newNode.parentElement, newNode);			
			var newTocElement = sourceNode.data;
			newTocElement.id = nodeId;

			var pathDetails = buildPath(parentOfNewNode.id, doc.get(), []);

			// notify the OT server
			pathDetails.push('children');
			
			var subDoc = doc.at(pathDetails);
			subDoc.insert(childIndex, newTocElement);
		}
		/*
			This is a move internally
		*/				
		else if (jQuery(sourceNode).closest(jQuery("#toc").length > 0)) {
			
			var referenceNode = data.rslt.o[0];
		
			// remove source node from old parent
			var pathDetails = buildPath(referenceNode.id, doc.get(), []);
			var subDoc = doc.at(pathDetails);
			var subDocToc = subDoc.get();
			subDoc.remove();

			// add source node to new parent
			var newPathDetails = buildPath(parentOfNewNode.id, doc.get(), []);
			newPathDetails.push('children');					
			var newSubDoc = doc.at(newPathDetails);
			newSubDoc.insert(data.rslt.cp, subDocToc);
		}
		
		renderBook(doc);
	}).bind("before.jstree", function (e, data) {
		/*
			Prevent the tree from being collapsed.
		*/
	
		if(data.func === "close_node") {
		    e.stopImmediatePropagation();
		    return false;
		}
	}).bind("loaded.jstree", function (event, data) {
		/*
			Open the tree when it is loaded
		*/
		scrollPos = jQuery('#toc').scrollTop();
		jQuery("#toc").jstree("open_all");
		jQuery('#toc').scrollTop(scrollPos);
	}).bind("dblclick.jstree", function (event, data) {
		/*
			Rename chapters on double click
		*/
		var sourceNodeId = $('#toc').jstree('get_selected')[0].id;
		var sourceTocElement = getTocElement(sourceNodeId, doc.get());
		if (sourceTocElement.type == BookElementEmun.Chapter) {		
			$("#toc").jstree("rename");
		}
		
		renderBook(doc);
	}).bind("rename_node.jstree", function (event, data) { 			    
		/*
			Sync renames with OT server
		*/
	
		var node = data.rslt.obj[0];
		
		// get a path that describes the  object that changed
		var childIndex = getChildIndex(node.parentElement, node);
		var pathDetails = buildPath(node.parentElement.parentElement.id, doc.get(), []);
		pathDetails.push('children'); 
		pathDetails.push(childIndex);				
		pathDetails.push('name');
		var subDoc = doc.at(pathDetails);
		
		// set the new title
		subDoc.set(data.rslt.name);
		
		renderBook(doc);
	}).bind("select_node.jstree", function(event, data){
            var node = data.rslt.obj[0];
            var nodeId = node.id.substring('node'.length, node.id.length);
            jQuery('#rendered' + nodeId)[0].scrollIntoView(); 
        });
	
	/*
		Watch for the delete key.
	*/
	jQuery(document).keydown(function (event) { 
		if (event.keyCode == '46') {
			
			jQuery.each(jQuery('#toc').jstree('get_selected'), function(i, tocElement) {				
				/* Don't delete the book folder */
				if (tocElement.id != 'node0') {
					// get a path that describes the  object that changed
					var childIndex = getChildIndex(tocElement.parentElement, tocElement);
					var pathDetails = buildPath(tocElement.parentElement.parentElement.id, doc.get(), []);
					pathDetails.push('children'); 
					pathDetails.push(childIndex);				
					var subDoc = doc.at(pathDetails);
					subDoc.remove();
					
					$("#toc").jstree("remove", tocElement);
				}
			});

			renderBook(doc);
		}
	});
}

function addChild(parent, child) {
	if (child != null && child.children != null) {
		jQuery.each(child.children, function(i, tocElement) {								
			var listItem = jQuery('<li id="node' + child.children[i].id + '">');
			var href = jQuery('<a href="#">').text(child.children[i].name);
			var unorderedList = jQuery('<ul>');
			parent.append(listItem);
			listItem.append(href);
			listItem.append(unorderedList);

			addChild(unorderedList, child.children[i]);
		});
	}		
}

function getTocElement(id, toc) {
	if ('node' + toc.id == id) {
		return toc;
	}
	
	for (var i = 0; i < toc.children.length; ++i) {
		var retValue = getTocElement(id, toc.children[i]);
		if (retValue != null) {
			return retValue;
		}
	};
	
	return null;
}

function getChildIndex(parent, child) {
	for (var childIndex = 0; childIndex < parent.children.length; ++childIndex) {			
		if (parent.children[childIndex] == child) {
			return childIndex;
		}
	}
	
	return null;
}

function getMaxNodeId(maxID, toc) {
	if (toc.id > maxID) {
		maxID = toc.id;
	}
	
	for (var childIndex = 0; childIndex < toc.children.length; ++childIndex) {			
		maxID = getMaxNodeId(maxID, toc.children[childIndex]); 
	}
	
	return maxID;
}
