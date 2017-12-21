var rect = {width: 0, height: 1};
var pos = {y: 0, x: 1};
var candidates = [[5, 5]];
var block = [];
var cnt = 0;
var sectionWidth = $(window).width() * 0.7;

var basicElementSideRatio = 0.125;
var basicElementSide = Math.round(sectionWidth * basicElementSideRatio);
var sectionHeight = basicElementSide * 6;

var containerPosInfo;
var pageTag = "";

function imageMaker(width, height, top, left, src, id, link) {
	$("#container").append("<a href=\"" + link + "\" id=\"img" + cnt + "\" class=\"basic\" tabindex=\"-1\" style=\"position: absoulte; top:"
	 												+ top + "px; left:" + left + "px; width:" + width * basicElementSide + "px; height:"  + height * basicElementSide + "px; padding: 5px; background: url(" + src 
	 												+ ") no-repeat; background-size: cover; background-origin: content-box; background-clip: content-box;\">");

	 												// + "<img id=\"" +"img" + cnt + "\" src=\"" + src + "\" class=\"basic\" tabindex=\"-1\" style=\"position: absoulte; top:"
	 												//+ top + "px; left:" + left + "px; width:" + width * basicElementSide + "px; height:"  + height * basicElementSide + "px; padding: 5px;\">" + "</a>");
}

function randomRatioGeneration(widthMaxRatio, heightMaxRatio) {
	var widthRatio = Math.floor(Math.random() * widthMaxRatio) + 1;
	var heightRatio;
	if(widthRatio == 1) {
		heightRatio = heightMaxRatio > 3 ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * heightMaxRatio) + 1;
	} else if(widthRatio == 4) {
		if(heightMaxRatio == 1) {
			return randomRatioGeneration(widthMaxRatio, heightMaxRatio);
		} else {
			heightRatio = Math.floor(Math.random() * (heightMaxRatio - 1)) + 2;
		}
	} else {
		heightRatio = Math.floor(Math.random() * heightMaxRatio) + 1;
	}

	if(widthMaxRatio == 2) {
		widthRatio = 2;
	}

	return [widthRatio, heightRatio];
}

function estimateMaxRatio(arrangementPos) {
	var widthMaxRatio2 = 4;
	var widthMaxRatio1 = 4 <= (containerPosInfo.right - containerPosInfo.left - arrangementPos[pos.x])/basicElementSide ? 
	4 : Math.floor((containerPosInfo.right - containerPosInfo.left - arrangementPos[pos.x])/basicElementSide);
	var heightMaxRatio = 4 <= (containerPosInfo.bottom - containerPosInfo.top - arrangementPos[pos.y])/basicElementSide ?
	4 : Math.floor((containerPosInfo.bottom - containerPosInfo.top - arrangementPos[pos.y])/basicElementSide);

	var temp = $.grep($.merge($.merge([], block), candidates), function (candidate) {
		return arrangementPos[pos.x] <= candidate[pos.x];
	});

	if(temp.length != 0) {
		var canBlock = temp.sort(function (a, b) {
			return a[pos.x] - b[pos.x];
		}).shift();

		widthMaxRatio2 = 4 <= (canBlock[pos.x] - arrangementPos[pos.x])/basicElementSide ? 
		4 : Math.floor((canBlock[pos.x] - arrangementPos[pos.x])/basicElementSide);
	}

	return [widthMaxRatio1 > widthMaxRatio2 ? widthMaxRatio2 : widthMaxRatio1, heightMaxRatio];
}

function myElementFromPoint(x, y) {
/*	var check=false, isRelative=true;
	if(!document.elementFromPoint) return null;

	if(!check)
	{
		var sl;
		if((sl = $(document).scrollTop()) >0)
		{
			isRelative = (document.elementFromPoint(0, sl + $(window).height() -1) == null);
		}
		else if((sl = $(document).scrollLeft()) >0)
		{
			isRelative = (document.elementFromPoint(sl + $(window).width() -1, 0) == null);
		}
		check = (sl>0);
	}

	if(!isRelative)
	{
		x += $(document).scrollLeft();
		y += $(document).scrollTop();
	}*/

	return document.elementFromPoint(x - window.pageXOffset, y + $(document).scrollTop());
}

function nyopnyop() {

		console.log("start!!");
	for(var i=0; i<30; i++) {
		candidates.sort(function(a, b) {
			if(a[pos.y] == b[pos.y]) {
				return a[pos.x] - b[pos.x];
			} else {
				return a[pos.y] - b[pos.y];
			}
		});

		var arrangementPos;
		var maxRatio;


		do {
			if(candidates.length == 0) { return }
				arrangementPos = candidates.shift();
				maxRatio = estimateMaxRatio(arrangementPos);
		} while ($(myElementFromPoint(arrangementPos[pos.x] + containerPosInfo.left + 10, arrangementPos[pos.y] + containerPosInfo.top + 10)).is("a") || maxRatio[rect.width] == 0)
		
		console.log(maxRatio[rect.width] + " : " + maxRatio[rect.height]);

		var ratios = randomRatioGeneration(maxRatio[rect.width], maxRatio[rect.height]);

		//imageMaker(ratios[rect.width], ratios[rect.height], arrangementPos[pos.y], arrangementPos[pos.x]);
/////////////////////////////////////////////////////////////////////////////////////////

		var url = function() {
			var id, tag, src;
			var data = "http://picturesque.ga/api/";
		$.ajax ({
			url: data + "get_image/" + ratios[rect.width] + ":" + ratios[rect.height] + "/" + pageTag,
			type: "GET",
			dataType: 'json',
			processData: false,
			contentType: false,
			async: false,
			success: function(response) {
				//alert("success : ");
				$.each( response, function( key, val ) {
    			//console.log(key + " : " + val + "\n");
    			if(key == "tag") tag = val;
    			if(key == "id") id = val;
    			if(key == "image_url") src = val;
  			});

				if(tag) {
					imageMaker(ratios[rect.width], ratios[rect.height], arrangementPos[pos.y], arrangementPos[pos.x], src, id, "../html/tag_page.html?tag=" + tag);
    			// data + "get_image/" + ratios[rect.width] + ":" + ratios[rect.height] + "/" + tag
    		} else {
    			imageMaker(ratios[rect.width], ratios[rect.height], arrangementPos[pos.y], arrangementPos[pos.x], src, id, "../html/tag_page.html");
    			// data + "detail/" + id
    		}			
    	},
			error: function(response) {
				alert("post error");
			}
		});
		}
		var temp = url();
////////////////////////////////////////////////////////////////////////////////////
		var imgPosInfo = $("#img" + cnt).get(0).getBoundingClientRect();

		if(basicElementSide < containerPosInfo.bottom - imgPosInfo.bottom) {
			var temp = Math.round(imgPosInfo.left - containerPosInfo.left - 1);
			var compare = $.grep(candidates, function (candidate) {
				return temp == candidate[pos.x];
			});

			if(compare.length == 0) {
				candidates.push([Math.round(imgPosInfo.bottom - containerPosInfo.top - 1), Math.round(imgPosInfo.left - containerPosInfo.left - 1)]);
			}
		} else {
			block.push([Math.round(imgPosInfo.bottom - containerPosInfo.top - 1), Math.round(imgPosInfo.left - containerPosInfo.left - 1)]);
		}

		if(basicElementSide < containerPosInfo.right - imgPosInfo.right) {
			var temp = Math.round(imgPosInfo.right - containerPosInfo.left - 1);
			var compare = $.grep(candidates, function (candidate) {
				return temp == candidate[pos.x];
			});

			if(compare.length == 0) {
				candidates.push([Math.round(imgPosInfo.top - containerPosInfo.top - 1), Math.round(imgPosInfo.right - containerPosInfo.left - 1)]);
			}
		}

		cnt++;
	}
}

function getUrlParameter(sParam) {
	var sPageURL = decodeURIComponent(window.location.search.substring(1));
	var sURLVariables = sPageURL.split('&');
	var sParameterName;
	var i;

	for (i = 0; i < sURLVariables.length; i++) {
		sParameterName = sURLVariables[i].split('=');

		if (sParameterName[0] === sParam) {
			return sParameterName[1] === undefined ? true : sParameterName[1];
		}
	}
};

$(function() {
	$("#container").css({"width" : sectionWidth + 13 + "px", "height" : sectionHeight + 10 + "px", "background-color" : "#fff", "margin" : "0 auto"});
	containerPosInfo = $("#container").get(0).getBoundingClientRect();




	nyopnyop();

	//$("a:focus").css({"outline-clolr" : "#F8B195", "outline-style" : "dashed", "outline-width" : "4px"});

	//var temp = randomRatioGeneration(4, 4);
	//var src;

	//var url = function() {
		//var width = temp[rect.width];
		//var height = temp[rect.height];

		//var data = "http://picturesque.ga/api/get_image/" + "1" + ":" + "1" + "/";


	//}

	//src = url();

	//console.log("haha : " + src);
	
	// imageMaker(basicElementSide, basicElementSide, 10, 10, "https://picturesqueimages.s3.amazonaws.com/media/images/no_login/20171219195815.jpg");
}); 
