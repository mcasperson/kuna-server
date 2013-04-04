function renderBook(doc) {
	jQuery('#rendered').empty();
	var toc = doc.get();
	renderedElement(toc);		
}

function renderedElement(child) {
	if (child.type == BookElementEmun.Chapter) {
		var div = jQuery('<div><h3>' + child.name + '</h3><div>');
		jQuery('#rendered').append(div);
	} else if (child.type == BookElementEmun.SEContent) {
		var div = jQuery('<div>' + child.seData.body + '<div>');
		jQuery('#rendered').append(div);
	}
	
	jQuery.each(child.children, function(i, tocElement){
		renderedElement(tocElement);			
	});	
}
