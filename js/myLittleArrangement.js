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
}

function imageMakerTag(width, height, top, left, src, id, link, string) {
	$("#container").append("<a href=\"" + link + "\" id=\"img" + cnt + "\" class=\"basic\" tabindex=\"-1\" data-keboard=\"true\" data-target=\"#layerpop" + id + "\" data-toggle=\"modal\" style=\"position: absoulte; top:"
	 												+ top + "px; left:" + left + "px; width:" + width * basicElementSide + "px; height:"  + height * basicElementSide + "px; padding: 5px; background: url(" + src
	 												+ ") no-repeat; background-size: cover; background-origin: content-box; background-clip: content-box;\">");
    $("#container").append("<div><div class=\"modal fade\" id=\"layerpop" + id + "\"><div class=\"modal-dialog\"><div class=\"modal-content\"><button class=\"close\" data-dismiss=\"modal\"><i class=\"fa fa-close\"></i></button>"
    	                     + "<img class=\"modal-image\" src=\"" + src + "\" style=\"text-align: center; position: relative;\"><div class=\"modal-footer\"><h4>" + string + "</h4></div></div></div></div></div>");
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
		} while ($(document.elementFromPoint(arrangementPos[pos.x] + containerPosInfo.left + 10, arrangementPos[pos.y] + containerPosInfo.top + 10)).is("a") || maxRatio[rect.width] == 0)

		console.log(maxRatio[rect.width] + " : " + maxRatio[rect.height]);

		var ratios = randomRatioGeneration(maxRatio[rect.width], maxRatio[rect.height]);

		var url = function() {
			var id, src;
			var tag = new Array();
			var data = "http://picturesque.ga/api/";
			$.ajax ({
				url: data + "get_image/" + ratios[rect.width] + ":" + ratios[rect.height] + "/" + pageTag,
				type: "GET",
				dataType: 'json',
				processData: false,
				contentType: false,
				async: false,
				success: function(response) {
					$.each( response, function( key, val ) {
						if(key == "tag") tag.push(val);
						if(key == "id") id = val;
						if(key == "image_url") src = val;
					});

					var tag2string = tag.toString();
					var tagArray = tag2string.split(",");
					var string = "";
					for(var i=0; i<tagArray.length; i++)
						string += "#" + tagArray[i] + " ";
					if(getUrlParameter('tag') != null) {
					  console.log(src)
						imageMakerTag(ratios[rect.width], ratios[rect.height], arrangementPos[pos.y], arrangementPos[pos.x], src, id, "../html/tag_page.html?tag=" + tagArray[0], string);
					} else {
						imageMaker(ratios[rect.width], ratios[rect.height], arrangementPos[pos.y], arrangementPos[pos.x], src, id, "../html/tag_page.html?tag=" + tagArray[0]);
					}
				},
				error: function(response) {
					// alert("post error");
          console.log("post error");
				}
			});
		}

		var temp = url();
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
}

$(function() {
	$("#container").css({"width" : sectionWidth + 13 + "px", "height" : sectionHeight + 10 + "px", "background-color" : "#fff", "margin" : "0 auto"});
	containerPosInfo = $("#container").get(0).getBoundingClientRect();
	nyopnyop();

	if(getUrlParameter('tag')) {
		pageTag = getUrlParameter('tag');
		$("button.tag").text("#" + pageTag).css({ 'font-weight': 'bold' })
	}

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
