// Assumes list - change to other objects if necessary
function buildHistoryListsDOM(divName, qparam, elements){
  var domainName = document.createElement('span');
  domainName.appendChild(document.createTextNode(qparam));
  var title = document.getElementById("title");
  title.appendChild(domainName);

  var list = document.getElementById(divName);
  while (list.firstChild) {
      list.removeChild(list.firstChild);
  }
  for (var i = 0; i < elements.length; i++) {
    var entry = document.createElement('li');
    entry.className = "page";
    var newLink = document.createElement('a');
    newLink.appendChild(document.createTextNode(elements[i].title));
    newLink.setAttribute("href", elements[i].url);
    entry.appendChild(newLink);
    list.appendChild(entry);
  }
}

function processHistoryItemsAndBuildList(divName, qparam, historyItems){
  var results = processHistoryItems(qparam, historyItems);
  buildHistoryListsDOM(divName, qparam, results);
}

// do any necessary filtering
function processHistoryItems(qparam, historyItems) {
  var results = [];
  for (var i = 0; i < historyItems.length; i++) {
    if (getHostname(historyItems[i].url) == qparam) {
      var title = historyItems[i].title;
      if (title) {
        results.push({title:title, url:historyItems[i].url});
      } else {
        results.push({title:historyItems[i].url, url: historyItems[i].url});
      }
    }
  }
  return results;
}

// Warning: Assumes just one query parameter.
function displayList(divName, historyItems) {
  var url = window.location.href;
  var qparam = url.slice(url.lastIndexOf('=')+1);
  processHistoryItemsAndBuildList(divName, qparam, historyItems);
}

document.addEventListener('DOMContentLoaded', function(){
  getHistory(function(h) { displayList("pages-list", h) });
  document.getElementById("search-button").addEventListener('click', function(){
    var query = document.getElementById("search-text").value;
    getHistory(function(h) { displayList("pages-list", h)}, query);
  });
});
