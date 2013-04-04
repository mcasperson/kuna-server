/** A collection of content items ready to be added to the book */
stagingContent = [];

function addToStage() {
	var stageObject = {};
	
	var url = jQuery('#questionUrl').text();
	
	var regex = XRegExp('(http://)|(https://)(?<hostname>.*?).com/questions/(?<questionId>\\d+)');
}
