$(function() {
	var focusedElem;
	var direction;

	// use like enum?
	var fourWayKey = {left: 37, up: 38, right: 39, down: 40};

	// initialize to be able to focus
	$(".rectangle").attr({tabIndex: "-1"});
	$(".rectangle").focus();

	// get focused element and its position informations
	function getFocusedElem() {
		return getElemPosInfo($(":focus"));
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
	function filterCandidates(candidates) {
		return $.grep(candidates, function (candidate) {
			return isCorrectCandidate(candidate);
		});
	}

	// determine correct candidate or not based on direciton 
	function isCorrectCandidate(candidate) {
		switch(direction) {
			// case of left
			case fourWayKey.left :		
				return focusedElem.center.x > candidate.center.x;
			// case of up
			case fourWayKey.up :
				return focusedElem.center.y > candidate.center.y;
			// case of right
			case fourWayKey.right :
				return focusedElem.center.x < candidate.center.x;
			// case of down
			case fourWayKey.down :
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
	function isBetweenDiagonal(candidate) {
		switch(direction) {
			// case of left
			case fourWayKey.left :		
				return (comparePosByDiagonal(getLeftTopCorner(focusedElem), getRightBottomCorner(focusedElem), getRightBottomCorner(candidate)) == 1 && 
								comparePosByDiagonal(getLeftBottomCorner(focusedElem), getRightTopCorner(focusedElem), getRightTopCorner(candidate)) == -1);
			// case of up
			case fourWayKey.up :
				return (comparePosByDiagonal(getLeftBottomCorner(focusedElem), getRightTopCorner(focusedElem), getLeftBottomCorner(candidate)) == -1 &&
								comparePosByDiagonal(getLeftTopCorner(focusedElem), getRightBottomCorner(focusedElem), getRightBottomCorner(candidate)) == -1);
			// case of right
			case fourWayKey.right :
				return (comparePosByDiagonal(getLeftBottomCorner(focusedElem), getRightTopCorner(focusedElem), getLeftBottomCorner(candidate)) == 1 && 
								comparePosByDiagonal(getLeftTopCorner(focusedElem), getRightBottomCorner(focusedElem), getLeftTopCorner(candidate)) == -1);
			// case of down
			case fourWayKey.down :
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
	function moveFocus() {
		focusedElem = getFocusedElem();
		var candidates = getCandidates();
		
		candidates = filterCandidates(candidates);
		candidates = groupCandidates(candidates);
		candidates = prioritizeCandidates(candidates);

		$(candidates[0].raw).focus();
	}

	// check whether candidate overlap over the focusedElem
	function isOverlapped(candidate) {
		// TODO
		return false;
	}

	// group the candidates with three levels
	function groupCandidates(candidates) {
		groups = [[], [], []];

		$(candidates).each(function(index, candidate) {
			if(isBetweenDiagonal(candidate)) {
				if(isOverlapped(candidate)) {
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
	function getScore(candidate) {
		// we can change weight as global configuration
		var offsetWeight = 0.6;
		var centerLineDistanceWeight = 1 - offsetWeight;

		return (getOffset(candidate) * offsetWeight) + 
					 (getCenterLineDistance(candidate) * centerLineDistanceWeight);
	}

	// get offset value
	// you can find definition of offset in the PPT, report
	function getOffset(candidate) {
		var offset = 0;

		switch(direction) {
			// case of left
			case fourWayKey.left :		
				offset = focusedElem.left - candidate.right;
				break;
			// case of up
			case fourWayKey.up :
				offset = focusedElem.top - candidate.bottom;
				break;
			// case of right
			case fourWayKey.right :
				offset = candidate.left - focusedElem.right;
				break;
			// case of down
			case fourWayKey.down :
				offset = candidate.top - focusedElem.bottom;
				break;
			// ?
			default :
				break;
		}

		return offset;
	}

	// get distance between center line of focused element and a side of candidate
	function getCenterLineDistance(candidate) {
		var distance = 0;

		switch(direction) {
			// case of left and right
			case fourWayKey.left  :	
			case fourWayKey.right :	
				if(focusedElem.center.y > candidate.bottom) {
					distance = focusedElem.center.y - candidate.bottom;
				}

				if(candidate.top > focusedElem.center.y) {
					distance = candidate.top - focusedElem.center.y;
				}
				break;
			// case of up and bottom
			case fourWayKey.up   :
			case fourWayKey.down :
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
	function distanceCalculation(candidate) {
		var criterion = 0;

		switch(direction) {
			// case of left
			case fourWayKey.left :		
				criterion += Math.abs(focusedElem.left - candidate.center.x);
				criterion += Math.abs(focusedElem.center.y - candidate.center.y);
				break;
			// case of up
			case fourWayKey.up :
				criterion += Math.abs(focusedElem.center.x - candidate.center.x);
				criterion += Math.abs(focusedElem.top - candidate.center.y);
				break;
			// case of right
			case fourWayKey.right :
				criterion += Math.abs(focusedElem.right - candidate.center.x);
				criterion += Math.abs(focusedElem.center.y - candidate.center.y);
				break;
			// case of down
			case fourWayKey.down :
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
	function prioritizeCandidates(candidates) {
		candidates.sort(function(a, b) {
			return getScore(a) - getScore(b);
		});

		return candidates;
	}

	// make keydown listener
	function fourWayKeysListener() {
		$(document).keydown(function(key) {
			direction = key.keyCode;
			
			// whether direction is 37, 38, 39, or 40
			if(direction >= 37 && direction <= 40) {
				moveFocus();
			}
		}); 
	}

	fourWayKeysListener();
});