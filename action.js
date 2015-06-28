var sliceIndex = 0;
var currSortOrder = "visits";
function sortAlphabetical() {
  sliceIndex = 0;
  currSortOrder = "alpha";
  $(".icon").remove();
  getHistory(function(h) { displayBubbles("icon-container", h, "alpha") });
}

function sortVisits() {
  sliceIndex = 0;
  currSortOrder = "visits";
  $(".icon").remove();
  getHistory(function(h) { displayBubbles("icon-container", h, "visits") });
}

function showIcons(divName, items, sortOrder) {
  var availableIconList = { facebook: 'facebook.png', google: 'google.png'};
  var iconList = document.getElementById(divName);
  while (iconList.firstChild) {
      iconList.removeChild(iconList.firstChild);
  }
  for (var i = 0; i < 8; i++) {
      if (i >= items.length) {
          break;
      }
      var icon = document.createElement('div');
      icon.className = "icon";
      var a = document.createElement('a');
      a.href = "chrome-extension://" + chrome.runtime.id + "/list.html?host=" + items[i][0];
      var img = document.createElement('img');
      if (items[i][0] in availableIconList) {
        img.setAttribute('src', 'img/' + items[i][0] + '.png');
      } else {
        img.setAttribute('src', 'img/lemon_cupcake.jpg');
      }
      img.setAttribute('alt', items[i][0]);

      var visitCountDiv = document.createElement('div');
      visitCountDiv.className = "text";
      var visitCount = document.createElement('div');
      visitCount.className = "visits-text";
      var numPage;
      if (items[i][1] == 1) {
         numPage = document.createTextNode("1 Page");
      } else {
         numPage = document.createTextNode(items[i][1] + " Pages");
      }

      visitCount.appendChild(numPage);
      // TODO: consider displaying visits instead of pages
      visitCountDiv.appendChild(visitCount);
      a.appendChild(img);
      a.appendChild(visitCountDiv);
      icon.appendChild(a);
      var name = document.createElement('div');
      name.className = "name";
      name.appendChild(document.createTextNode(items[i][0]));
      icon.appendChild(name);
      iconList.appendChild(icon);
  }
}

function displayBubbles(divName, historyItems, sortOrder) {
  if (!sortOrder)
    sortOrder = currSortOrder;
  var items = bin(historyItems, sortOrder);
  showIcons(divName, items.slice(sliceIndex, items.length));
}

document.addEventListener('DOMContentLoaded', function(){
  document.getElementById("toggle").addEventListener("click", function(){
    var button = document.getElementById("toggle");
    if (button.innerHTML == "Sort by Name"){
      sortAlphabetical();
      button.innerHTML = "Sort by Visits";
    } else {
      console.log("calling sortVisits");
      sortVisits();
      button.innerHTML = "Sort by Name";
    }
  })
  document.getElementById("next").addEventListener("click", function(){
    sliceIndex += 8;
    getHistory(function(h){
      displayBubbles("icon-container", h)
    });
  });
  getHistory(function(h) { displayBubbles("icon-container", h) });
});

