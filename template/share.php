<?php
  
  if(!isset($share_title)) {
    $share_title = 'Climate Explorer';
  }
  
	$current_url = 'http://';
	
	if ($_SERVER["SERVER_PORT"] != "80") {
		$current_url .= $_SERVER["SERVER_NAME"].":".$_SERVER["SERVER_PORT"].$_SERVER["REQUEST_URI"];
	} else {
		$current_url .= $_SERVER["SERVER_NAME"].$_SERVER["REQUEST_URI"];
	}
  
?>

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <div class="share-widget">
  <a href="#" class="share-trigger"><span class="icon icon-social"></span>Share</a>
  <ul>
    <li><a href="#" class="share-link share-facebook" data-href="<?php echo $current_url; ?>"><span class="icon icon-facebook"></span>Facebook</a></li>
    <li><a href="https://twitter.com/intent/tweet?text=<?php echo $share_title; ?> via @NOAA Climate Explorer: <?php echo $current_url; ?>" class="share-link share-twitter"><span class="icon icon-twitter"></span>Twitter</a></li>
    <li><a href="#" class="share-link share-linkedin"><span class="icon icon-linkedin"></span>LinkedIn</a></li>
  </ul>
</div>
