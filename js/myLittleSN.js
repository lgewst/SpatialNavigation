$(function() {
	// keycode 37 is left arrow
	// keycode 38 is up arrow
	// keycode 39 is right arrow
	// keycode 40 is bottom arrow
	var directionKeyCode = [37, 38, 39, 40];

	// initialize to be able to focus
	$(".rectangle").attr({tabIndex: "-1"});
	$(".rectangle").focus();

	// get focused element and its position informations
	function getFocusedElem() {
		var focusedElem = $(":focus");
		return getElemPosInfo(focusedElem);
	}

	// get all of candidates and their position informations
	function getCandidates() {
		var candidates = $(":button:not(:focus)");
		return getAllElemPosInfos(candidates);
	}


	// get element position infomation with ".getBoundingClientRect()"
	function getElemPosInfo(element) {
		var posInfoObj = $(element).get(0).getBoundingClientRect();
		var elemPosInfo = {
			raw: element,
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

	// get all elements position information
	function getAllElemPosInfos(elements) {
		var result = [];
		$(elements).each(function(index, element) {
			result.push(getElemPosInfo(element));
		});
		
		return result;
	}

	// filter the candidates with "isCorrectCandidate"
	function filterCandidates(focusedElem, candidates, direction) {
		return $.grep(candidates, function (candidate) {
			return isCorrectCandidate(focusedElem, candidate, direction);
		});
	}

	// determine correct candidate or not based on direciton 
	function isCorrectCandidate(focusedElem, candidate, direction) {
		switch(direction) {
			// case of left
			case 37 :		
				return focusedElem.center.x > candidate.center.x;
			// case of up
			case 38 :
				return focusedElem.center.y > candidate.center.y;
			// case of right
			case 39 :
				return focusedElem.center.x < candidate.center.x;
			// case of down
			case 40 :
				return focusedElem.center.y < candidate.center.y;
			// ?
			default :
				return false;
		}
	}

	// compare candidateCorner to diagonal of focusedElemCorner1, 2
	// if candidate corner is on the diagonal, return 0
	// if candidate corner is over the diagonal, return 1
	// if candidate corner is under the diagonal, return -1
	function comparePosByDiagonal(focusedElemCorner1, focusedElemCorner2, candidateCorner) {
		var slope = (focusedElemCorner1.y - focusedElemCorner2.y) / (focusedElemCorner1.x - focusedElemCorner2.x);
		var result = (candidateCorner.y - focusedElemCorner1.y) - (slope * (candidateCorner.x - focusedElemCorner1.x));

		if(result == 0)     return  0;
		else if(result > 0) return  1;
		else if(result < 0) return -1;
	}

	// check whether candidate is between two diagonal-extended-lines
	// you can find definition of "between two diagonal-extended-lines" in the PPT, report
	function isBetweenDiagonal(focusedElem, candidate, direction) {
		switch(direction) {
			// case of left
			case 37 :		
				return (comparePosByDiagonal(getLeftTopCorner(focusedElem), getRightBottomCorner(focusedElem), getRightBottomCorner(candidate)) == 1 && 
								comparePosByDiagonal(getLeftBottomCorner(focusedElem), getRightTopCorner(focusedElem), getRightTopCorner(candidate)) == -1);
			// case of up
			case 38 :
				return (comparePosByDiagonal(getLeftBottomCorner(focusedElem), getRightTopCorner(focusedElem), getLeftBottomCorner(candidate)) == -1 &&
								comparePosByDiagonal(getLeftTopCorner(focusedElem), getRightBottomCorner(focusedElem), getRightBottomCorner(candidate)) == -1);
			// case of right
			case 39 :
				return (comparePosByDiagonal(getLeftBottomCorner(focusedElem), getRightTopCorner(focusedElem), getLeftBottomCorner(candidate)) == 1 && 
								comparePosByDiagonal(getLeftTopCorner(focusedElem), getRightBottomCorner(focusedElem), getLeftTopCorner(candidate)) == -1);
			// case of down
			case 40 :
				return (comparePosByDiagonal(getLeftBottomCorner(focusedElem), getRightTopCorner(focusedElem), getRightTopCorner(candidate)) == 1 &&
								comparePosByDiagonal(getLeftTopCorner(focusedElem), getRightBottomCorner(focusedElem), getLeftTopCorner(candidate)) == 1);
			// ?
			default :
				return false;
		}
	}

	// get left-top corner of element
	function getLeftTopCorner(element) {
		return {x: element.left, y: element.top};
	}

	// get left-bottom corner of element
	function getLeftBottomCorner(element) {
		return {x: element.left, y: element.bottom};
	}

	// get right-top corner of element
	function getRightTopCorner(element) {
		return {x: element.right, y: element.top};
	}

	// get right-bottom corner of element
	function getRightBottomCorner(element) {
		return {x: element.right, y: element.bottom};
	}

	// move focus based on priority
	function moveFocus(direction) {
		var focusedElem = getFocusedElem();
		var candidates = getCandidates();
		
		candidates = filterCandidates(focusedElem, candidates, direction);
		candidates = groupCandidates(focusedElem, candidates, direction);
		candidates = prioritizeCandidates(focusedElem, candidates, direction);

		$(candidates[0].raw).focus();
	}

	// check whether candidate overlap over the focusedElem
	function isOverlapped(focusedElem, candidate) {
		// TODO
		return false;
	}

	// group the candidates with three levels
	function groupCandidates(focusedElem, candidates, direction) {
		groups = [[], [], []];

		$(candidates).each(function(index, candidate) {
			if(isBetweenDiagonal(focusedElem, candidate, direction)) {
				if(isOverlapped(focusedElem, candidate)) {
					// first candidate group
					groups[0].push(candidate);
				} else {
					// second candidate group
					groups[1].push(candidate);
				}
			} else {
				// third candidate group
				groups[2].push(candidate);
			}
		});

		return groups[0].length ? groups[0] : (groups[1].length ? groups[1] : groups[2]);
	}

	// score the candidate
	// score = (offset * offset weight) + (center-line-distance * center-line-distance weight)
	function getScore(focusedElem, candidate, direction) {
		// we can change weight as global configuration
		var offsetWeight = 0.6;
		var centerLineDistanceWeight = 1 - offsetWeight;

		return (getOffset(focusedElem, candidate, direction) * offsetWeight) + 
					 (getCenterLineDistance(focusedElem, candidate, direction) * centerLineDistanceWeight);
	}

	// get offset value
	// you can find definition of offset in the PPT, report
	function getOffset(focusedElem, candidate, direction) {
		var offset = 0;

		switch(direction) {
			// case of left
			case 37 :		
				offset = focusedElem.left - candidate.right;
				break;
			// case of up
			case 38 :
				offset = focusedElem.top - candidate.bottom;
				break;
			// case of right
			case 39 :
				offset = candidate.left - focusedElem.right;
				break;
			// case of down
			case 40 :
				offset = candidate.top - focusedElem.bottom;
				break;
			// ?
			default :
				break;
		}

		return offset;
	}

	// get distance between center line of focused element and a side of candidate
	function getCenterLineDistance(focusedElem, candidate, direction) {
		var distance = 0;

		switch(direction) {
			// case of left and right
			case 37 :	
			case 39 :	
				if(focusedElem.center.y > candidate.bottom) {
					distance = focusedElem.center.y - candidate.bottom;
				}

				if(candidate.top > focusedElem.center.y) {
					distance = candidate.top - focusedElem.center.y;
				}
				break;
			// case of up and bottom
			case 38 :
			case 40 :
				if(focusedElem.center.x > candidate.right) {
					distance = focusedElem.center.x - candidate.right;
				}

				if(candidate.left > focusedElem.center.x) {
					distance = candidate.left - focusedElem.center.x;
				}
				break;
			// ?
			default :
				break;
		}

		return distance;
	}

	// calculate distance between focused element and candidate element based on direction
	// we should implement this function more specific
	// replace this function with "getScore"
	function distanceCalculation(focusedElem, candidate, direction) {
		var criterion = 0;

		switch(direction) {
			// case of left
			case 37 :		
				criterion += Math.abs(focusedElem.left - candidate.center.x);
				criterion += Math.abs(focusedElem.center.y - candidate.center.y);
				break;
			// case of up
			case 38 :
				criterion += Math.abs(focusedElem.center.x - candidate.center.x);
				criterion += Math.abs(focusedElem.top - candidate.center.y);
				break;
			// case of right
			case 39 :
				criterion += Math.abs(focusedElem.right - candidate.center.x);
				criterion += Math.abs(focusedElem.center.y - candidate.center.y);
				break;
			// case of down
			case 40 :
				criterion += Math.abs(focusedElem.center.x - candidate.center.x);
				criterion += Math.abs(focusedElem.bottom - candidate.center.y);
				break;
			// ?
			default :
				break;
		}

		return criterion;
	}

	// sort candidates by score
	function prioritizeCandidates(focusedElem, candidates, direction) {
		candidates.sort(function(a, b) {
			return getScore(focusedElem, a, direction) - getScore(focusedElem, b, direction);
		});

		return candidates;
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
});