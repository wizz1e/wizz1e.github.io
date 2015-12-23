<script type="text/javascript">
$(document).ready(function() {
//Quotes rotator
var divs = $('.cbp-qtcontent');

function fade() {
var current = $('.current');
var currentIndex = divs.index(current),
nextIndex = currentIndex + 1;

if (nextIndex >= divs.length) {
nextIndex = 0;
}

var next = divs.eq(nextIndex);

next.stop().fadeIn(1500, function() {
$(this).addClass('current');
});

current.stop().fadeOut(1500, function() {
$(this).removeClass('current');
_startProgress()
setTimeout(fade, 8000);
});
}

function _startProgress(){
$(".cbp-qtprogress").removeAttr('style');
$(".cbp-qtprogress").animate({
width:"800px",
} , 8000);
}

_startProgress()
setTimeout(fade, 8000);
});
</script>