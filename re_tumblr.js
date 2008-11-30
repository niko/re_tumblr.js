// Homepage::  http://restorm.com
// Author::    Niko Dittmann (http://niko-at-restorm.members.restorm.com)
// Copyright:: (cc) 2008 restorm AG
// License::   BSD

function tumblrBadge(options){
  tumblrUsername = options['username'] != undefined ? options['username'] : 'tumblr-api-test'
  var num = options['num']             != undefined ? options['num']      : 10
  tumblrOpenQuote  = options['oquote'] != undefined ? options['oquote']   : '<span class="tumblr_open_quote">&#8220;</span>'
  tumblrCloseQuote = options['cquote'] != undefined ? options['cquote']   : '<span class="tumblr_close_quote">&#8221;</span>'
  tumblrPhotoSize  = options['psize']  != undefined ? options['psize']    : 500, // available are 75, 100, 250, 400, 500
  
  document.write('<script type="text/javascript" src="http://' + tumblrUsername + '.tumblr.com/api/read/json?num=' + num + '&amp;callback=tumblrToJson"> </script>');
}

function tumblrToJson(json){
  tumblr = new TumblrPosts(json);
  tumblr.openOl();
  
  tumblr.posts.each(function(post){
    Object.extend(post, tumblr.methods)
    
    // the contructor for the simgle posts:
    post.openLi();
      post.tagList();
      post.dateInfo();
      eval('post.' + post['type'] + 'Body()')
    post.closeLi();
  
  })
  tumblr.closeOl();
}

TumblrPosts = Class.create({
  initialize: function(json){
    this.posts = json.posts;
  },
  openOl: function(){
    document.write('<ol class="tumblr_posts">');
  },
  closeOl: function(){
    document.write('</ol>');
  },
  
  methods: {
    openLi: function(){
      document.write('<li class="tumblr_post tumblr-'+ this['type'] +'-post">');
    },
    closeLi: function(){
      document.write('</li>');
    },
    
    dateInfo: function(){
      document.write('<div class="tumblr_date">' + this['date-gmt'].split(' ')[0].replace(/-/g,'/') + '</div>');
    },
    
    tagList: function(){
      if(this['tags'] != undefined){
        document.write('<ul class="tumblr_tags">');
        this['tags'].each(function(tag){
          document.write('<li><a href="http://'+ tumblrUsername +'.tumblr.com/tagged/'+ tag.replace(' ','_') +'">'+ tag + '</a></li>');
        })
        document.write('</ul>');
      }
    },
    
    photoBody: function(){
      document.write('<a class="tumblr_photo_link" href="'+ this['url'] +'"><img class="tumblr_photo" src="' + this['photo-url-' + tumblrPhotoSize] + '"/></a>');
      document.write('<div class="tumblr_caption">'+ this['photo-caption'] +'</div>');
    },
    linkBody: function(){
      var linkText = this['link-text'] == '' ? this['link-url'] : this['link-text']
      document.write('<a class="tumblr_link" href="'+ this['link-url'] +'">'+ linkText +'</a>');
      if(this['link-description'] != ''){ document.write('<div class="tumblr_description">'+ this['link-description'] +'</div>'); }
    },
    videoBody: function(){
      document.write('<div class="tumblr_video">'+ this['video-player'] +'</div>');
      if(this['video-caption'] != ''){ document.write('<div class="tumblr_caption">'+ this['video-caption'] +'</div>'); }
    },
    audioBody: function(){
      document.write('<div class="tumblr_audio">'+ this['audio-player'] +'</div>');
      if(this['audio-caption'] != ''){ document.write('<div class="tumblr_caption">'+ this['audio-caption'] +'</div>'); }
    },
    conversationBody: function(){
      if(this['conversation-title'] != ''){ document.write('<div class="tumblr_title">'+ this['conversation-title'] +'</div>'); }
      document.write('<ul>');
      this['conversation-lines'].each(function(line){
        document.write('<li><span class="tumblr_label">'+ line['label'] +'</span>\n'+ line['phrase'] +'</li>');
      })
      document.write('</ul>');
    },
    quoteBody: function(){
      quoteText = this['quote-text'].replace(/^&#8220;/,'').replace(/&#8221;$/,'') // we strip those hard-coded quotes, use our own:
      document.write('<div class="tumblr_quote">'+ tumblrOpenQuote + quoteText + tumblrCloseQuote +'</div>');
      if(this['quote-source'] != ''){ document.write('<div class="tumblr_source">'+ this['quote-source'] +'</div>'); }
    },
    regularBody: function(){
      if(this['regular-title'] != ''){ document.write('<div class="tumblr_title">'+ this['regular-title'] +'</div>'); }
      if(this['regular-body'] != ''){ document.write('<div class="tumblr_body">'+ this['regular-body'] +'</div>'); }
    }
  }
})
