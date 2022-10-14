var dateFormat = "D, MMM YYYY";

async function fetchNYTApi(userInput) {
  let res = await fetch(
    "https://api.nytimes.com/svc/search/v2/articlesearch.json?q=" +
      userInput +
      "&api-key=zkidiktBcpfsGjeON9HaDv0qxuDvKevq"
  );
  let timesData = await res.json();
  renderNYTData(condenseNYTimesData(timesData));
}

async function fetchRedditApi(userInput) {
  let res = await fetch("https://www.reddit.com/r/" + userInput + ".json");
  let redditData = await res.json();
  renderRedditData(condenseRedditData(redditData));
}

//----- These two functions take in response JSON data from reddit and NYT and returns a list of objects with relevant data -----
function condenseRedditData(data) {
  var articles = [];
  for (const a of data.data.children) {
    articles.push({
      title: a.data.title,
      author: a.data.author,
      content: a.data.selftext,
      media: a.data.url,
      upvotes: a.data.ups,
      date: a.data.created,
      url: "https://reddit.com" + a.data.permalink,
    });
  }
  return articles;
}

function condenseNYTimesData(data) {
  var articles = [];
  for (const a of data.response.docs) {
    articles.push({
      lead_text: a.abstract,
      image: a.multimedia,
      title: a.headline.main,
      authors: a.byline.person,
      word_count: a.word_count,
      date: dayjs(a.pub_date).unix(),
      url: a.web_url,
    });
  }
  return articles;
}
//-------------------------------------------------------------------------------------------------------------------------------

//----- These functions take the condensed JSON data and creates elements for each post for NYTimes and Reddit -----
function renderNYTData(timesData) {
  let timesContainerEl = $("#times-content");
  //empties the Div container of the times data so the page can update with fresh information
  timesContainerEl.empty();

  //checks to see if the number of results is less than ten then chooses the smaller number to display
  let length = Math.min(timesData.length, 10);

  //loops through the array of condensed objects of data and creates and displays elements to the page for each data point
  for (let i = 0; i < length; i++) {
    let timesCardContEl = $("<a>");
    let timesImgEl = $("<img>");
    let timesTextContEl = $("<div>");
    let timesTitleEl = $("<h4>");
    let timesBodyEl = $("<p>");
    let authorEl = $("<h5>");
    let authors = "";
    let dateEl = $("<h5>");

    //adds the tailwind classes to create the base of the card
    timesCardContEl.addClass(
      "flex flex-col items-center bg-white rounded-lg border shadow-md md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 my-3"
    );
    //makes the card a clickable link that takes you to the given article
    timesCardContEl.attr("href", timesData[i].url);

    //adds tailwind classes to the image element setting a standard size for it.
    timesImgEl.addClass(
      "object-cover w-full h-96 rounded-t-lg md:h-auto md:w-48 md:rounded-none md:rounded-l-lg"
    );
    //adds the front page image to the card.
    timesImgEl.attr({
      src: "https://nytimes.com/" + timesData[i].image[0].url,
      alt: "New York Times Cover Image",
    });
    //adds tailwind classes to the container inside the card that will contain the text
    timesTextContEl.addClass(
      "flex flex-col justify-between p-4 leading-normal"
    );
    //adds tailwind classes to the title of the card with the headline
    timesTitleEl.addClass(
      "mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
    );
    //adds title text
    timesTitleEl.text(timesData[i].title);
    //adds tailwind classes to the main body of the card
    timesBodyEl.addClass("mb-3 font-normal text-gray-700 dark:text-gray-400");
    //adds the abstract for the article to the card(note* full article not available in API)
    timesBodyEl.text(timesData[i].lead_text);

    //adds the tailwind classes to the author text of the card
    authorEl.addClass("mb-3 font-normal text-gray-700 dark:text-gray-400");

    //if there is more than one author, appends each to a string and displays the string
    for (let author of timesData[i].authors) {
      authors += author.firstname + " " + author.lastname + ", ";
    }
    authors = authors.slice(0, authors.length - 2);
    authorEl.text(authors);

    //adds tailwind classes to the date section
    dateEl.addClass("mb-3 font-normal text-gray-700 dark:text-gray-400");
    //adds the date of publish to the card
    dateEl.text(dayjs.unix(timesData[i].date).format(dateFormat));

    //appends all element to the proper container to display on the screen
    authorEl.append(dateEl);
    timesTextContEl.append(timesTitleEl, timesBodyEl, authorEl);
    timesCardContEl.append(timesImgEl, timesTextContEl);
    timesContainerEl.append(timesCardContEl);
  }
}

function renderRedditData(redditData) {
  // Get and empty the reddit content field
  let container = $("#reddit-content");
  container.empty();

  // Loop through each result (max of 10) and create preview cards for each post
  for (var i = 0; i < Math.min(redditData.length, 10); i++) {
    // Create the main card container
    let card = $("<a>");
    card.attr("href", redditData[i].url);
    card.addClass(
      "flex flex-col mb-4 items-center bg-white rounded-lg border shadow-md md:flex-row md:max-w-100% hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
    );

    // Create the container for text content
    let textContainer = $("<div>");
    textContainer.addClass("flex flex-col justify-between p-4 leading-normal");

    // Create the image container
    // If there is no valid image associated with the post, a default reddit icon will be displayed instead
    let cardImage = $("<img>");
    if (checkURLForImage(redditData[i].media)) {
      cardImage.addClass(
        "object-cover w-full h-96 rounded-t-lg md:h-auto md:w-48 md:rounded-none md:rounded-l-lg"
      );
      cardImage.attr("src", redditData[i].media);
    } else {
      cardImage.addClass(
        "object-cover sm:mt-4 md:mt-0 md:ml-4 w-16 h-16 rounded-t-lg md:h-16 md:w-16 md:rounded-none md:rounded-l-lg"
      );
      cardImage.attr("src", "https://www.reddit.com/favicon.ico");
    }
    card.append(cardImage);

    // Create the card header
    let cardHeader = $("<h5>");
    cardHeader.addClass(
      "mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
    );
    cardHeader.text(redditData[i].title);
    textContainer.append(cardHeader);

    // Create the text body for each card
    let cardText = $("<p>");
    cardText.addClass("mb-3 font-normal text-gray-700 dark:text-gray-400");
    cardText.text(redditData[i].content);
    textContainer.append(cardText);

    // Create the header to display upvotes
    let cardUps = $("<h6>");
    cardUps.addClass("mb-2 font-normal text-gray-700 dark:text-gray-400");
    cardUps.text("Upvotes: " + redditData[i].upvotes);
    textContainer.append(cardUps);

    // Create the header to display the post creator
    let cardAuthor = $("<h6>");
    cardAuthor.addClass("mb-2 font-normal text-gray-700 dark:text-gray-400");
    cardAuthor.text(redditData[i].author);
    textContainer.append(cardAuthor);

    // Create the header to display the creation date
    let cardDate = $("<h6>");
    cardDate.addClass("mb-2 font-normal text-gray-700 dark:text-gray-400");
    cardDate.text(dayjs.unix(redditData[i].date).format(dateFormat));
    textContainer.append(cardDate);

    card.append(textContainer);
    container.append(card);
  }
}
//-----------------------------------------------------------------------------------------------------------------

// Checks if a string has one of the specified endings
function checkURLForImage(url) {
  return url.match(/\.(jpeg|jpg|gif|png|jfif)$/) != null;
}

function renderButtons() {
  var history = [];
  for (var i = 0; i < history.length; i++) {
    var newButton = $("<button>");
    newButton.addClass("search-btn");
    newButton.attr("data-search", history[i]);
    newButton.text(history[i]);
    $("#searchbar-history").append(newButton);
  }
}

$("#searchBtn").on("click", function (event) {
  event.preventDefault();
  var searched = $("#default-search").val().trim();
  history.push(searched);
  renderButtons();
});

$(document).on("click", "#search-btn", renderNYTData, renderRedditData);
renderButtons();

fetchRedditApi("mcdonalds");
fetchNYTApi("mcdonald's");
