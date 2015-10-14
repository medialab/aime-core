var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-34970508-1']);
_gaq.push(['_setDomainName', 'modesofexistence.org']);
_gaq.push(['_setAllowLinker', true]);
_gaq.push(['_trackPageview', location.pathname + location.search + location.hash]);

(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();


// Piwik

var pkBaseURL = (("https:" == document.location.protocol) ? "https://stats.sciencespo.fr/" : "http://stats.sciencespo.fr/");
document.write(unescape("%3Cscript async src='" + pkBaseURL + "piwik.js' type='text/javascript'%3E%3C/script%3E"));

try {
	var piwikTracker = Piwik.getTracker(pkBaseURL + "piwik.php", 18);
	piwikTracker.trackPageView();
	piwikTracker.enableLinkTracking();
} catch( err ) {};
