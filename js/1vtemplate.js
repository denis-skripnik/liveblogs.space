/* Sticky Sidebar Left */
if(jQuery(window).width() > 767){
		jQuery(window).scroll(function(){
			var headerWrapper = jQuery('#header_wrapper').height();
			var scrollTop = jQuery(window).scrollTop();
			if(scrollTop >= headerWrapper){
				jQuery('#sidebar_left').css('position','fixed');
			} else {
				jQuery('#sidebar_left').css('position','absolute');
			}
		});
}
/* End of Sticky Sidebar Left */
jQuery(document).ready(function(){
	/* Anchor links slow scrolling */
	jQuery(".anchor_link").on("click", function (event){
        event.preventDefault();
        var id  = $(this).attr('href');
        var top = $(id).offset().top;
        $('body,html').animate({scrollTop: top}, 1500);
    });
	/* End of Anchor links slow scrolling */

	/* Parallax sript */
	jQuerywindow = jQuery(window); // cache the window object
	jQuery('.parallax_wrapper[data-type="background"]').each(function(){
		var jQueryscroll = jQuery(this); // declare the variable to affect the defined data-type
		jQuery(window).scroll(function(){
			var yPos = -(jQuerywindow.scrollTop() / jQueryscroll.data('speed')); // HTML5 proves useful for helping with creating JS functions! Also, negative value because we're scrolling upwards			 
			var coords = '50% '+ yPos + 'px'; // background position
			jQueryscroll.css({ backgroundPosition: coords }); // move the background
		}); // end window scroll
	}); // end section function
	document.createElement("section"); // initialization for earlier IE
	/* End of Parallax sript */
	
	/* Bootstrap 3 Responsive tables hint */
	jQuery('.table-responsive').each(function(){
		if(this.offsetWidth < this.scrollWidth){
			jQuery('.table-responsive_hint').removeClass('hidden');
			jQuery('.table-responsive_hint').addClass('vsbl_block');
		}else{
			jQuery('.table-responsive_hint').addClass('hidden');
			jQuery('.table-responsive_hint').removeClass('vsbl_block');
		}
	});
	/* End of Bootstrap 3 Responsive tables hint */
	
	/* Bootstrap File Input (Krajee) Initialization */
	/* jQuery(".input-file-ru").fileinput({
		'showUpload':false,
		'language':'ru',
		'previewFileType':'image'
	}); */
	/* End of Bootstrap File Input (Krajee) Initialization */
	
	/* Bootstrap 3 Images Multi Modal for Images Carousel */
	jQuery('#imagesModal').on('show.bs.modal', function (event) {
		var button = $(event.relatedTarget); // Button that triggered the modal
		var recipient_1 = button.data('whatever_1'); // Extract info from data-* attributes
		var recipient_2 = button.data('whatever_2'); // Extract info from data-* attributes
		var recipient_3 = button.data('whatever_3'); // Extract info from data-* attributes
		// If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
		// Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
		var modal = $(this);
		modal.find('.img_carousel').attr('src','' + recipient_1 + '');
		modal.find('#imagesModalLabel').text(recipient_2);
		modal.find('.img_carousel').attr('alt','' + recipient_3 + '');
	});
	/* End of Bootstrap 3 Awards Multi Modal */
});
/* Bootstrap 3 Responsive tables hint */
jQuery(window).resize(function(){
	jQuery('.table-responsive').each(function(){
		if(this.offsetWidth < this.scrollWidth){
			jQuery('.table-responsive_hint').removeClass('hidden');
			jQuery('.table-responsive_hint').addClass('vsbl_block');
		}else{
			jQuery('.table-responsive_hint').addClass('hidden');
			jQuery('.table-responsive_hint').removeClass('vsbl_block');
		}
	});
});
/* End of Bootstrap 3 Responsive tables hint */

/* Bootstrap 3 - Input file hack */
jQuery(document).on('change', '.btn-file :file', function() {
	var input = jQuery(this),
		numFiles = input.get(0).files ? input.get(0).files.length : 1,
		label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
	input.trigger('fileselect', [numFiles, label]);
});
/* End of Bootstrap 3 - Input file hack */