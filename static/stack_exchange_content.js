function addToStage() {
	var stageObject = {};
	
	var url = jQuery('#questionUrl').val();
	
	var regex = XRegExp('(http://|https://)(?<hostname>.*?).com/questions/(?<questionId>\\d+)');
	var parts = XRegExp.exec(url, regex);
	
	if (parts.hostname !== undefined && parts.questionId !== undefined) {
		stageObject.site =  parts.hostname;
		stageObject.question = parts.questionId;
		stageObject.children = [];
		stageObject.type = BookElementEmun.SEContent;

		var newNode = jQuery("#toc-staging").jstree("create",-1,false,stageObject.site + " " + stageObject.question,false,true)[0];
		newNode.data = stageObject;
		
		/*
			Get the details of the question.
		*/
		jQuery.getJSON("http://api.stackexchange.com/2.1/questions/" + stageObject.question + "?key=" + sekey + "&site=" + stageObject.site + "&filter=!)65UbsXJgkqyBTkd)y3_nYUQl-No&callback=", function (data){
			if (data.items !== undefined && data.items.length > 0) {
				stageObject.seData = data.items[0];
				
				
				/* 
					Decode any HTML entities. Note that you can't drag this node until the title has been set (which 
					indicates that we have gotten the details from SE.
				*/
				var questionTitle =  jQuery('<div/>').html(data.items[0].title).text();
				stageObject.name = questionTitle;				
				jQuery("#toc-staging").jstree('rename_node', newNode , questionTitle );
			}
		});
	}
}
