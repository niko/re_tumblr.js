re_tumblr
=========

A javscript-badge that handles these post types (all available as of 2008/10/14):
audio, conversation, link, photo, quote, regular, video

It produces basically the same html structure as the standard tumblr javascript produces
but adds additional date and the tag divs.  It also links photos to the post itself.
Click-through links aren't supported by the API (yet?).

The used html classes are (for your reference):

    tumblr_posts, tumblr_post, tumblr_[type]_post,
    tumblr_date*, tumblr_tags*,
    tumblr_title,
    tumblr_photo, tumblr_photo_link*,
    tumblr_link, tumblr_video, tumblr_audio,
    tumblr_caption, tumblr_body, tumblr_label,
    tumblr_open_quote, tumblr_close_quote, tumblr_quote, tumblr_source,

    *(new classes)

to use it, you just call the javascript like that:

    tumblrBadge({})

or with some options:

    tumblrBadge( {"username" : "restorm-news", "num" : 1} )