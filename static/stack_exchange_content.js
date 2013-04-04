function addToStage() {
	var stageObject = {};
	
	var url = jQuery('#questionUrl').val();
	
	var regex = XRegExp('(http://|https://)(?<hostname>.*?).com/questions/(?<questionId>\\d+)');
	var parts = XRegExp.exec(url, regex);
	
	if (parts.hostname !== undefined && parts.questionId !== undefined) {
		stageObject.site =  parts.hostname;
		stageObject.question = parts.questionId;
		stageObject.type = BookElementEmun.SEContent;

		var newNode = jQuery("#toc-staging").jstree("create",-1,false,stageObject.site + " " + stageObject.question,false,true)[0];
		newNode.data = stageObject;
		
		jQuery.getJSON("http://api.stackexchange.com/2.1/questions/" + stageObject.question + "?key=" + sekey + "&site=" + stageObject.site + "&filter=default&callback=", function (data){
			if (data.items !== undefined) {
				/* Decode any HTML entities */
				stageObject.title =  $('<div/>').html(data.items[0].title).text();
				jQuery("#toc-staging").jstree('rename_node', newNode , stageObject.title );
			}
		});
	}
}
