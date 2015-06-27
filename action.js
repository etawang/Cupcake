var numHoursPreviousToSearch = 24;
function buildUrlList(divName) {
  var microsecondsPerHour = 1000 * 60 * 60;
  var startTime = (new Date).getTime() - microsecondsPerHour;

  var numRequestsOutstanding = 0;

  chrome.history.search({
    'text': '',
    'startTime': startTime
    }, processHistoryItemsAndBuildList);
}

// Assumes list - change to other objects if necessary
function buildHistoryListsDOM(divName, elements){
  var list = document.getElementById(divName);
  for (var i = 0; i < elements.length; i++){
    var entry = document.createElement('li');
    entry.appendChild(document.createTextNode(elements[i].title));
    list.appendChild(entry);
  }

}

function processHistoryItemsAndBuildList(historyItems){
  var results = processHistoryItems(historyItems);
  buildHistoryListsDOM("pages-list", results);
}

// do any necessary filtering
function processHistoryItems(historyItems) {
  var results = [];
  for (var i = 0; i < historyItems.length; i++) {
    var title = historyItems[i].title;
    if (title) {
      results.push({title:title, url:historyItems[i].url});
    } else {
      results.push({title:historyItems[i].url, url: historyItems[i].url});
    }
  }
  return results;
}

document.addEventListener('DOMContentLoaded', function(){
  buildUrlList("test_div");
});
