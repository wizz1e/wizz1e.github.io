(function () {
  /*
     ------------------------------------
     Create captions for `img`s
     ------------------------------------
  */

  var imgs = document.querySelectorAll('article img')

  Array.prototype.forEach.call(imgs, function (el) {
    var alttext = el.getAttribute('alt')

    if (alttext) {
      el.insertAdjacentHTML('afterend', '<figcaption><p>' + alttext + '</p></figcaption>')
    }
  })
  
  /*
     ------------------------------------
     Bigfoot
     ------------------------------------
  */
  
  $.bigfoot();
   
  /*
     ------------------------------------
     Responsive Menu
     ------------------------------------
  */ 

  $('.menu-toggle').click(function() {
    $('.site-navigation').slideToggle(250);
  });

  $(window).on('resize', function() {
    if ($(this).width() >= 990) {
      $('.site-navigation').show();
    } else {
      $('.site-navigation').hide();
    }
  });
  
  /*
     ------------------------------------
     Fluid videos
     ------------------------------------
  */

  fluidvids.init({
    selector: ['iframe', 'object'],
    players: ['www.youtube.com', 'player.vimeo.com']
  })
}).call(this)
