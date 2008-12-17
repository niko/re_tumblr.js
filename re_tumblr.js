// Homepage::  http://restorm.com
// Author::    Niko Dittmann (http://niko-at-restorm.members.restorm.com)
// Copyright:: (cc) 2008 restorm AG
// License::   BSD

// Don't laugh. Function name property for Safari and IE.
//
function defineName(fn,name){
  if(!fn.name){fn.name = name;};
}

// Outputs the date of the last post in the feed.
//
function tumblrLastPostDate(tumblrUsername){
  username = tumblrUsername != undefined ? tumblrUsername : 'tumblr-api-test';
  tumblrContainerWrite(username, tumblrInsertLastPostDate, 1, 0);
}

// Outputs *num* posts of the feed.
//
function tumblrPosts(options){
  var num          = options['num']        != undefined ? options['num']         : 10;
  
  tumblrUsername   = options['username']   != undefined ? options['username']    : 'tumblr-api-test';
  tumblrOpenQuote  = options['oquote']     != undefined ? options['oquote']      : '<span class="tumblr_open_quote">&#8220;</span>';
  tumblrCloseQuote = options['cquote']     != undefined ? options['cquote']      : '<span class="tumblr_close_quote">&#8221;</span>';
  tumblrPhotoSize  = options['psize']      != undefined ? options['psize']       : 400; // available are 75, 100, 250, 400, 500
  tumblrMoreLinkText = options['moreLink'] != undefined ? options['moreLink']    : '...';
  
  tumblrContainerWrite(tumblrUsername, tumblrInsertPosts, num, 0);
}

// Loads more posts.
//
function tumblrPostsAppend(div_id){
  container = $(div_id);
  container.tumblr_start = container.tumblr_start + container.tumblr_num;
  tumblrContainerWrite(tumblrUsername, tumblrInsertPostsAppend, container.tumblr_num, container.tumblr_start);
}


// This is a generic function to generate a container for the tumblr data and
// add the tumblr call to the HTMl header.
// The containers id is generated from the (sanitized) username and the name of the callback.
// This means, you can not use the same tumlbr feed twice in one HTML document.
//
function tumblrContainerWrite(tumblrUsername, callback, num, start){
  var div_class = callback.name.replace('Append','') + '_container';
  var div_id = tumblrUsername.replace(/[^A-Za-z0-9]/g,'_') + '_' + div_class;
  if ($(div_id) == null){ document.write('<div id="' + div_id + '" class="' + div_class + '"></div>'); }
  
  var callback_name = "update_" + div_id;
  window[callback_name] = function(json){ callback(json, div_id, num, start); };
  var json_url = 'http://' + tumblrUsername + '.tumblr.com/api/read/json?num=' + num + '&start=' + start + '&callback=' + callback_name;
  var e = document.createElement("script");
  e.src = json_url;
  e.type="text/javascript";
  document.getElementsByTagName("head")[0].appendChild(e);
}


// The callback for tumblrPosts.
//
function tumblrInsertPosts(json, div_id, num, start){
  var container = $(div_id);
  container.tumblr_num = parseInt(num);
  container.tumblr_start = parseInt(start);
  
  var ol = new Element("ol", {'class':'tumblr_posts'});
  var tumblr = new TumblrPosts(json);
  
  insertListOfPosts(tumblr, ol);
  container.appendChild(ol);
  tumblrMoreLink(container, tumblr, div_id);
}
defineName(tumblrInsertPosts, 'tumblrInsertPosts');

// The callback for tumblrLastPostDate.
//
function tumblrInsertLastPostDate(json, div_id, num, start){
  var tumblr = new TumblrPosts(json);
  var post = tumblr.posts[0];
  Object.extend(post, tumblr.methods);
  $(div_id).appendChild(post.dateInfo());
}
defineName(tumblrInsertLastPostDate, 'tumblrInsertLastPostDate');

// The callback for tumblrPostsAppend.
//
function tumblrInsertPostsAppend(json, div_id, num, start){
  var container = $(div_id);
  container.tumblr_num = parseInt(num);
  container.tumblr_start = parseInt(start);
  
  var ol = container.down('ol');
  var tumblr = new TumblrPosts(json);
  
  insertListOfPosts(tumblr, ol);
  
  tumblrMoreLink(container, tumblr, div_id);
}
defineName(tumblrInsertPostsAppend, 'tumblrInsertPostsAppend');

function insertListOfPosts(tumblr, ol){
  tumblr.posts.each(function(post){
    Object.extend(post, tumblr.methods);
    
    var li = new Element("li", {'class':'tumblr_post tumblr-'+ post['type'] +'-post'})
      .insert(post.dateInfo())
      .insert(post.tagList());
    
    var methodName = post['type'] + 'Body';
    post[methodName]().each(function(el){
      li.insert(el);
    });
    
    ol.appendChild(li);
  });
}

function tumblrMoreLink(container, tumblr, div_id){
  if(tumblr.postsTotal > container.tumblr_num + container.tumblr_start){
    var link = new Element("a").update(tumblrMoreLinkText);
    link.observe('click', function(){ this.remove(); tumblrPostsAppend(div_id); });
    container.appendChild(link);
  }
}

TumblrPosts = Class.create({
  initialize: function(json){
    this.posts      = json['posts'];
    this.postsTotal = json['posts-total'];
  },
  
  methods: {
    div_el: function(content, klass){
      return new Element("div", {'class':klass}).insert(content);
    },
    
    dateInfo: function(){
      var c = this['date-gmt'].split(' ')[0].replace(/-/g,'/');
      return(this.div_el(c, 'tumblr_date'));
    },
    tagList: function(){
      if(this['tags'] != undefined){
        var ul = new Element("ul", {'class':'tumblr_tags'});
        
        this['tags'].each(function(tag){
          var url = 'http://'+ tumblrUsername +'.tumblr.com/tagged/'+ tag.replace(' ','_');
          ul.insert(
            new Element("li", {}).insert(
              new Element("a", {'href':url}).update(tag)
            )
          );
        });
        
      }
      return ul;
    },
    
    photoBody: function(){
      var photo = new Element("a", {'class':'tumblr_photo_link', 'href':this['url']})
        .insert(new Element("img", {'class':'tumblr_photo', 'src':this['photo-url-' + tumblrPhotoSize]}));
      var caption = this.div_el(this['photo-caption'], "tumblr_caption");
      return [photo, caption];
    },
    linkBody: function(){
      var linkText = this['link-text'] == '' ? this['link-url'] : this['link-text'];
      var link = new Element("a", {'class':'tumblr_link', 'href':this['link-url']}).update(linkText);
      if(this['link-description'] != ''){
        var desc = this.div_el(this['link-description'], 'tumblr_description');
      }
      return[link, desc].compact();
    },
    videoBody: function(){
      var body = this.div_el(this['video-player'], 'tumblr_video');
      if(this['video-caption'] != ''){
        var caption = this.div_el(this['video-caption'], 'tumblr_caption');
      }
      return [body, caption].compact();
    },
    audioBody: function(){
      var body = this.div_el(this['audio-player'], 'tumblr_audio');
      if(this['audio-caption'] != ''){
        var caption = this.div_el(this['audio-caption'], 'tumblr_caption');
      }
      return [body, caption].compact();
    },
    conversationBody: function(){
      if(this['conversation-title'] != ''){
        var title = this.div_el(this['conversation-title'], 'tumblr_title');
      };
      var conversation = new Element("ul");
      this['conversation-lines'].each(function(line){
        conversation.insert(
          new Element("li").insert(
            new Element("span", {'class':'tumblr_label'}).update(line['label'])
          ).update(line['phrase'])
        );
      });
      return [title, conversation].compact();
    },
    quoteBody: function(){
      quoteText = this['quote-text'].replace(/^&#8220;/,'').replace(/&#8221;$/,''); // we strip those hard-coded quotes, use our own:
      var quote = this.div_el(tumblrOpenQuote + quoteText + tumblrCloseQuote, "tumblr_quote");
      if(this['quote-source'] != ''){
        var source = this.div_el(this['quote-source'], "tumblr_source");
      }
      return [quote, source].compact();
    },
    regularBody: function(){
      if(this['regular-title'] != ''){
        var title = this.div_el(this['regular-title'], "tumblr_title");
      }
      if(this['regular-body'] != ''){
        var body = this.div_el(this['regular-body'], "tumblr_body");
      }
      return [title, body].compact();
    }
  }
});