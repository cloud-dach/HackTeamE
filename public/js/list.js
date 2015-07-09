(function($){

	$.ajaxSetup({ cache: false });
	 
    $(".container-fluid").on( 'click', function( event ) {
        ClickPic(event.target.src);
    });

    function ClickPic(pic) {
        var ctx = window.location.pathname;
        ctx = ctx.substring(0, ctx.lastIndexOf("/"));
        ctx = ctx.substring(0, ctx.lastIndexOf("/") + 1);
        var url = ctx + "/analyze";
        var param1 = url + "?pic=" + pic;
        
        console.log(param1);
        
        window.location.replace(param1);
//        $.get( url, {pic: param1}, function(data) {
//           //console.log(data);
//           //alert(JSON.stringify(data));
//        });
        
//        $.post( url, {pic: param1}, function(data) {
//            //console.log(data);
//            //alert(JSON.stringify(data));
//         });
    };

})(jQuery);
