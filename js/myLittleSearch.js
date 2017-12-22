$(function() {
	$(".searchbutton").click(function() {
		var tag = $(".searchbox").val();
		var tagurl = "./tag_page.html?tag=" + tag;

		window.location.replace(tagurl);
	});

	$(".searchbox").keydown(function (key) {
		if(key.keyCode == 13){
			if($(".searchbox").is(":focus")) {
				var tag = $(".searchbox").val();
				var tagurl = "./tag_page.html?tag=" + tag;

				window.location.replace(tagurl);
			}
		}
	});

	$(".tag").click(function() {
	  window.location.reload();
  });
});
