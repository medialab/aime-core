navigator.sayswho= (function(){
    var N= navigator.appName, ua= navigator.userAgent, tem;
    var M= ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
    if(M && (tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
    M= M? [M[1], M[2]]: [N, navigator.appVersion, '-?'];

    return M;
})();

var browser = navigator.sayswho[0];

if ( browser != 'Chrome' && browser != 'Safari' && browser != 'Firefox' ) {
	alert('Sorry, in this moment just Chrome, Firefox and Safari are supported. Please switch to one of them.');
}



