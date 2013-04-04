function addToStage() {
	var stageObject = {};
	
	var url = jQuery('#questionUrl').val();
	
	var regex = XRegExp('(http://|https://)(?<hostname>.*?).com/questions/(?<questionId>\\d+)');
	var parts = XRegExp.exec(url, regex);
	
	if (parts.hostname !== undefined && parts.questionId !== undefined) {
		stageObject.site =  parts.hostname;
		stageObject.question = parts.questionId;

		var newNode = $("#toc-staging").jstree("create",-1,false,stageObject.site + " " + stageObject.question,false,true)[0];
		newNode.data = stageObject;
	}
}
