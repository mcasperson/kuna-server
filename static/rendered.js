function renderBook(doc) {
	jQuery('#rendered').empty();
	var toc = doc.get();
	renderedElement(toc);		
}

function renderedElement(child) {
	if (child.type == BookElementEmun.Chapter) {
		var div = jQuery('<div id="rendered' + child.id + '"><a href="' + child.seData.owner.link + '"><h3>' + child.name + '</h3></a><div>');
		jQuery('#rendered').append(div);
	} else if (child.type == BookElementEmun.SEContent) {
		var text = child.seData.body;
		var user = '<a href="' + child.seData.owner.link + '">' + child.seData.owner.display_name + '</a>';
		if (child.seData.answers !== undefined) {
			var accepted_answer_id = child.seData.accepted_answer_id;
			
			if (accepted_answer_id === undefined) {
				var maxScore = undefined;
				jQuery.each(child.seData.answers, function(i, answer){
					if (maxScore === undefined || answer.score > maxScore) {
						text = answer.body;
						user = '<a href="' + answer.owner.link + '">' + answer.display_name + '</a>';
						maxScore = answer.score;
					}
				});	
			} else {
				jQuery.each(child.seData.answers, function(i, answer){
					if (answer.answer_id == accepted_answer_id) {
						text = answer.body;
						user = '<a href="' + answer.owner.link + '">' + answer.display_name + '</a>';
						return false;
					}
				});	
			}
		}
		
		var div = jQuery(
			'<div id="rendered' + child.id + '">' +
				'<h4>' + child.name + '</h4>' +
				'<div>' + text + '</div>' +
				'<div>' + user + '</div>' +
			'<div>');
		jQuery('#rendered').append(div);
	}
	
	jQuery.each(child.children, function(i, tocElement){
		renderedElement(tocElement);			
	});	
}
