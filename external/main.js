var today = Date.today();
var yesterday = Date.today().add({
    days: -1
});
  
var dateRangeConfigObject = {
    dateRanges: [{
      grainValue: "Today",
      grainDisplayName: "Today",
      start: today,
      end: today
    }, {
      grainValue: "Yesterday",
      grainDisplayName: "Yesterday",
      start: yesterday,
      end: yesterday

    }, {
      grainValue: "LAST_7_DAYS",
      grainDisplayName: "Last 7 Days",
      start: Date.today().add({
        days: -6
      }),
      end: today
    }, {
      grainValue: "LAST_30_DAYS",
      grainDisplayName: "Last 30 Days",
      start: Date.today().add({
        days: -29
      }),
      end: today
    }, {
      grainValue: "THIS_MONTH",
      grainDisplayName: "This Month",
      start: Date.today().moveToFirstDayOfMonth(),
      end: Date.today().moveToLastDayOfMonth()
    }, {
      grainValue: "LAST_MONTH",
      grainDisplayName: "Last Month",
      start: Date.today().moveToFirstDayOfMonth().add({
        months: -1
      }),
      end: Date.today().moveToFirstDayOfMonth().add({
        days: -1
      })
    }]
  };

document.addEventListener('DOMComponentsLoaded', function(){

    var myDateBox = document.getElementById("myDateBox");
    

    document.getElementById("alertCurrentSelection").addEventListener("click", function(){
        alert(JSON.stringify(myDateBox.value));
    });
    
    document.getElementById("addCustomDateRange").addEventListener("click", function(){
        myDateBox.setCustomDateRangeConfig(dateRangeConfigObject);                
    });
});


