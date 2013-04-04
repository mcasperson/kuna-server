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
		var text = child.seData.body;
		if (child.seData.answers !== undefined) {
			var accepted_answer_id = child.seData.accepted_answer_id;
			
			if (accepted_answer_id === undefined) {
				var maxScore = undefined;
				jQuery.each(child.seData.answers, function(i, answer){
					if (maxScore === undefined || answer.score > maxScore) {
						text = answer.body;
						maxScore = answer.score;
					}
				});	
			} else {
				jQuery.each(child.seData.answers, function(i, answer){
					if (answer.answer_id == accepted_answer_id) {
						text = answer.body;
						return false;
					}
				});	
			}
		}
		
		var div = jQuery(
			'<div>' +
				'<h4>' + child.name + '</h4>' +
				'<div>' + text + '</div>' +
			'<div>');
		jQuery('#rendered').append(div);
	}
	
	jQuery.each(child.children, function(i, tocElement){
		renderedElement(tocElement);			
	});	
}
