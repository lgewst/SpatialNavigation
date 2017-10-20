$(function() {
	// keycode 37 is left arrow
	// keycode 38 is up arrow
	// keycode 39 is right arrow
	// keycode 40 is bottom arrow
	var directionKeyCode = [37, 38, 39, 40];

	// initialize to be able to focus
	$(".rectangle").attr({tabIndex: "-1"});
	$(".rectangle").focus();

	// get all of candidates
	// if we can, I want to change this function not getting all of candidates but getting selectively based on direction
	function getCandidates() {
		return $(".rectangle:not(:focus)");
	}

	// get element position infomation with ".getBoundingClientRect()"
	function getElemPosInfo(element) {
		var posInfoObj = $(element).get(0).getBoundingClientRect();
		var elemPosInfo = {
			left: posInfoObj.left,
			top: posInfoObj.top,
			right: posInfoObj.right,
			bottom: posInfoObj.bottom,
			width: posInfoObj.width,
			height: posInfoObj.height,
			center: {
				x: posInfoObj.left + Math.floor(posInfoObj.width/2),
				y: posInfoObj.top + Math.floor(posInfoObj.height/2)
			}
		};

		return elemPosInfo;
	}

	// sort candidates by criteria
	function prioritizeCandidates(focusedElem, candidates, direction) {
		candidates.sort(function(a, b) {
			return distanceCalculation(focusedElem, a, direction) - distanceCalculation(focusedElem, b, direction);
		});

		return candidates;
	}

	// calculate distance between focused element and candidate element based on direction
	// we should implement this function more specific
	function distanceCalculation(focusedElem, candidate, direction) {
		var criterion = 0;
		var focusedElemPosInfo = getElemPosInfo(focusedElem);
		var candidatePosInfo = getElemPosInfo(candidate);

		switch(direction) {
			// case of left
			case 37 :		
				criterion += Math.abs(focusedElemPosInfo.left - candidatePosInfo.center.x);
				criterion += Math.abs(focusedElemPosInfo.center.y - candidatePosInfo.center.y);
			break;
			// case of up
			case 38 :
				criterion += Math.abs(focusedElemPosInfo.center.x - candidatePosInfo.center.x);
				criterion += Math.abs(focusedElemPosInfo.top - candidatePosInfo.center.y);
				break;
			// case of right
			case 39 :
				criterion += Math.abs(focusedElemPosInfo.right - candidatePosInfo.center.x);
				criterion += Math.abs(focusedElemPosInfo.center.y - candidatePosInfo.center.y);
				break;
			// case of down
			case 40 :
				criterion += Math.abs(focusedElemPosInfo.center.x - candidatePosInfo.center.x);
				criterion += Math.abs(focusedElemPosInfo.bottom - candidatePosInfo.center.y);
				break;
			default :
			break;
		}

		return criterion;
	}

	// determine correct candidate or not based on direciton 
	function IsCorrectCandidate(focusedElem, candidate, direction) {
		var focusedElemPosInfo = getElemPosInfo(focusedElem);
		var candidatePosInfo = getElemPosInfo(candidate);

		switch(direction) {
			// case of left
			case 37 :		
				return focusedElemPosInfo.center.x > candidatePosInfo.center.x;
			// case of up
			case 38 :
				return focusedElemPosInfo.center.y > candidatePosInfo.center.y;
			// case of right
			case 39 :
				return focusedElemPosInfo.center.x < candidatePosInfo.center.x;
			// case of down
			case 40 :
				return focusedElemPosInfo.center.y < candidatePosInfo.center.y;
			default :
				return false;
		}
	}

	// filter the candidates with "IsCorrectCandidate"
	function candidatesFilter(focusedElem, candidates, direction) {
		return $.grep(candidates, function (candidate) {
			return IsCorrectCandidate(focusedElem, candidate, direction);
		});
	}

	// move focus based on priority
	function moveFocus(direction) {
		var candidates = [];
		var focusedElem = $(":focus");

		candidates = getCandidates();
		candidates = candidatesFilter(focusedElem, candidates, direction);
		candidates = prioritizeCandidates(focusedElem, candidates, direction);

		$(candidates).first().focus();
	}

	// make keydown listener
	function fourWayKeysListener() {
		$(document).keydown(function(key) {
			var direction = key.keyCode;
			
			if($.inArray(direction, directionKeyCode) !=  -1) {
				moveFocus(direction);
			}
		}); 
	}

	fourWayKeysListener();
	console.log("length : " + $(":focus").length);
});