// Enable pusher logging - don't include this in production
Pusher.log = function(message) {
  if (window.console && window.console.log) {
    window.console.log(message);
  }
};

var pusher = new Pusher("50ed18dd967b455393ed");

var substringMatcher = function(strs) {
  return function findMatches(q, cb) {
    var matches, substrRegex;
 
    // an array that will be populated with substring matches
    matches = [];
 
    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');
 
    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function(i, str) {
      if (substrRegex.test(str)) {
        // the typeahead jQuery plugin expects suggestions to a
        // JavaScript object, refer to typeahead docs for more info
        matches.push({ value: str });
      }
    });
 
    cb(matches);
  };
};
 
var subreddits = ["funny","AdviceAnimals","pics","aww","todayilearned","videos","WTF","gaming","leagueoflegends","gifs","AskReddit","worldnews","TrollXChromosomes","pcmasterrace","4chan","movies","trees","mildlyinteresting","DotA2","reactiongifs","news","politics","pokemon","soccer","atheism","cringepics","technology","gentlemanboners","MakeupAddiction","Minecraft","science","TumblrInAction","woahdude","Showerthoughts","nba","Unexpected","anime","Jokes","cats","Celebs","hearthstone","smashbros","IAmA","gameofthrones","explainlikeimfive","polandball","teenagers","tifu","SquaredCircle","facepalm","conspiracy","circlejerk","GlobalOffensive","Music","bestof","Games","tattoos","food","nfl","EarthPorn","TrollYChromosome","skyrim","fatpeoplehate","comics","magicTCG","Marvel","talesfromtechsupport","creepy","LifeProTips","OldSchoolCool","hiphopheads","HistoryPorn","wow","TalesFromRetail","Bitcoin","TheLastAirbender","worldpolitics","Android","roosterteeth","TwoXChromosomes","tf2","fffffffuuuuuuuuuuuu","standupshots","GetMotivated","progresspics","DIY","dayz","mildlyinfuriating","StarWars","Fallout","nottheonion","tumblr","FoodPorn","nosleep","youtubehaiku","firstworldanarchists","interestingasfuck","mindcrack","baseball","motorcycles"];
 
$(".typeahead").typeahead({
  hint: true,
  highlight: true,
  minLength: 1
}, {
  name: "subreddits",
  displayKey: "value",
  source: substringMatcher(subreddits)
});

$('.typeahead').bind("typeahead:selected", function(event, suggestion, name) {
  var listings = $(event.target).parent().next(".listings");
  changeReddit(suggestion.value, listings);
});

var changeReddit = function(subreddit, listings) {
  var subredditLower = subreddit.toLowerCase();
  var listingSubreddit = listings.get(0).dataset.subreddit;

  if (pusher.channel(subredditLower)) {
    console.log("Already subscibed to subreddit: " + subredditLower);
    return;
  }

  if (listingSubreddit && pusher.channel(listingSubreddit)) {
    pusher.unsubscribe(listingSubreddit);
  }

  var channel = pusher.subscribe(subredditLower);

  // Change data attribute
  listings.get(0).dataset.subreddit = subredditLower;

  channel.bind("new-listing", function(listing) {
    if (listing.over_18) {
      console.log("Listing is NSFW");
      return; 
    }

    var listingDOM = document.createElement("li");
      
    if (listing.url.search(/\.jpg|\.jpeg|\.png|\.gif$/g) > -1) {
      listingDOM.innerHTML = "<a href='http://reddit.com" + listing.permalink + "' target='_blank'><img src='" + listing.url + "' title='" + listing.title + "'></a><div class='caption'><a href='http://reddit.com" + listing.permalink + "' target='_blank'>" + listing.title + "</a></div>";
    } else {
      listingDOM.innerHTML = "<a href='http://reddit.com" + listing.permalink + "' target='_blank'>" + listing.title + "</a>";
    }

    listings.get(0).insertBefore(listingDOM, listings.get(0).firstChild);

    console.log(listing);
  });
};

// Load default subreddits and set up keyboard listeners
var defaultSubreddits = $(".subreddit-input.tt-input");
defaultSubreddits.each(function(index, element) {
  // TODO: Work out how to stop this triggering (duplicating effort) if enter was pressed on typeahead suggestion
  element.addEventListener("keydown", function(e) {
    if(e.keyCode == 13){
      changeReddit(element.value, $(element).parent().next(".listings"));
    }
  });

  if (element.placeholder) {
    changeReddit(element.placeholder, $(element).parent().next(".listings"));
  };
});