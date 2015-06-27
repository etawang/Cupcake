var numHoursPreviousToSearch = 24;
function buildUrlList(divName) {
  var microsecondsPerHour = 1000 * 60 * 60;
  var startTime = (new Date).getTime() - microsecondsPerHour;

  var numRequestsOutstanding = 0;

  chrome.history.search({
    'text': '',
    'startTime': startTime
    }, processHistoryItems);
}

function processHistoryItems(historyItems) {
  for (var i = 0; i < historyItems.length; i++) {
    var title = historyItems[i].title;
    if (title) {
      console.log(historyItems[i].title)
    } else {
      console.log(historyItems[i].url)
    }
  }
}

document.addEventListener('DOMContentLoaded', function(){
  buildUrlList("test_div");
});
