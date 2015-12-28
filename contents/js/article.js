$(function(){
  var updateSize = function(event, slick, currentSlide) {
    var slide = $(this).find("div.slick-current")
    var img_height = slide.children().height()
    $(this).height(img_height)
    console.log(img_height)
  }
  $(document).ready(function(){
    $('.slideshow > img, .slideshow_landscape > img, .slideshow_portrait > img').wrap("<div></div>")
    $('.slideshow, .slideshow_landscape, .slideshow_portrait').on('afterChange', updateSize)
    $('.slideshow, .slideshow_landscape, .slideshow_portrait').on('init', updateSize)
    $('.slideshow, .slideshow_landscape, .slideshow_portrait').slick({ })
  })
		
  /*$(".slideshow").slidesjs({
    width: 100,
    height: 75,
  });*/
  /*$(".slideshow_portrait").slidesjs({
    width: 6,
    height: 8,
  });*/
});
