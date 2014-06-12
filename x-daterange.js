(function() {
  "use strict";

  var Util = {
    format: function(d) {
      if (d !== null && d !== undefined && typeof d === "object" && typeof d.getFullYear === "function") {
        return [Util.pad(d.getFullYear(), 4),
          Util.pad(d.getMonth() + 1, 2),
          Util.pad(d.getDate(), 2)].join('-');
      } else {
        return null;
      }
    },
    pad: function(n, padSize) {
      var str = n.toString();
      var padZeros = (new Array(padSize)).join('0');
      return (padZeros + str).substr(-padSize);
    }
  };
  var MODE_ENUM = {
    SelectFirstDate: "SelectFirstDate",
    SelectLastDate: "SelectLastDate",
    Selecting: "Selecting",
    CUSTOM: "CUSTOM",
    CUSTOM_LABEL: "Custom Range"
  };

  xtag.register('x-daterange', {
    lifecycle: {
      created: function() {
        //TODO - use underscore template
        var x = Util.format(new Date()).split("-");
        x[1] = Util.pad((parseInt(x[1], 10) - 1), 2);
        x = x.join("-");

        this.innerHTML = '<x-calendar view="' + x + '" controls multiple span="3"></x-calendar>' +
          '<div class="status"><div>From : <span class="startDate commonDate"></span></div><div>To : <span class="endDate commonDate"></span></div></div>' +
          '<div class="grains"></div>';
        this._mode = MODE_ENUM.SelectFirstDate;
        this._range = {
          start: null,
          end: null,
          grainValue: MODE_ENUM.CUSTOM
        };
        this.setCustomDateRangeConfig({
          dateRanges: []
        });
      }
    },
    events: {
      'click:delegate(.grain)': function(event) {
        var grainValue = this.getAttribute("data-grainValue");
        this.parentNode.parentNode.selectRange(grainValue);
      },
      'datetoggleon': function(event) {
        if (this._mode === MODE_ENUM.Selecting) {
          return;
        }
        if (this._mode === MODE_ENUM.SelectFirstDate) {
          this._range.start = event.detail.date;
          this._range.end = event.detail.date;
          this._range.grainValue = MODE_ENUM.CUSTOM;

          this._mode = MODE_ENUM.SelectLastDate;
          this._updateCurrentSelection();

          this.getElementsByTagName("x-calendar")[0].chosen = [
            [this._range.start, this._range.end]
          ];
          return;

        }
        if (this._mode === MODE_ENUM.SelectLastDate) {

          if (this._range.start.getTime() > event.detail.date.getTime()) {
            this._range.end = this._range.start;
            this._range.start = event.detail.date;

          } else {
            this._range.end = event.detail.date;

          }


          this._range.grainValue = MODE_ENUM.CUSTOM;

          this._mode = MODE_ENUM.SelectFirstDate;
          this.getElementsByTagName("x-calendar")[0].chosen = [
            [this._range.start, this._range.end]
          ];

          if (this.getElementsByTagName("x-calendar")[0].chosen.length === 0) {
            this._range.start = null;
            this._range.end = null;
          }
          this._updateCurrentSelection();
          return;
        }
      },
      'datetoggleoff': function(event) {
        this._range.start = event.detail.date;
        this._range.end = event.detail.date;

        this._updateCurrentSelection();
        this._mode = MODE_ENUM.SelectLastDate;
        this.getElementsByTagName("x-calendar")[0].chosen = [
          [this._range.start, this._range.end]
        ];
      }
    },
    accessors: {
      'value': {
        get: function() {
          return {
            grainValue: this._range.grainValue,
            start: this._range.start,
            end: this._range.end
          };
        },
        set: function(value) {
          this._range.grainValue = value.grainValue;
          this._range.start = value.start;
          this._range.end = value.end;
          this.selectRange(this._range.grainValue, this._range.start, this._range.end);
          if (this._range.grainValue === MODE_ENUM.CUSTOM) {
            this.getElementsByTagName("x-calendar")[0].chosen = [
              [this._range.start, this._range.end]
            ];
            this._updateCurrentSelection();
          }
        }
      }
    },
    methods: {
      _updateCurrentSelection: function() {
        this.querySelector(".startDate").innerHTML = Util.format(this._range.start);
        this.querySelector(".endDate").innerHTML = Util.format(this._range.end);

        this._highlightStartEndDate();

        if (this._dateRangeConfig.dateRanges.length !== 0) {
          var x = this.querySelector(".grain.selected");
          if (x !== null) {
            x.classList.remove("selected");
          }
          this.querySelector(".grain[data-grainValue='" + this._range.grainValue + "']").classList.add("selected");
        }
      },
      _highlightStartEndDate: function() {

        if (this.querySelector(".startDateSpan") !== null) {
          xtag.removeClass(this.querySelector(".startDateSpan"), "startDateSpan");
        }
        if (this.querySelector(".endDateSpan")) {
          xtag.removeClass(this.querySelector(".endDateSpan"), "endDateSpan");
        }

        if (this.querySelector('span[data-date="' + Util.format(this._range.start) + '"]') !== null) {
          xtag.addClass(this.querySelector('span[data-date="' + Util.format(this._range.start) + '"]'), "startDateSpan");
        }
        if (this.querySelector('span[data-date="' + Util.format(this._range.end) + '"]') !== null) {

          xtag.addClass(this.querySelector('span[data-date="' + Util.format(this._range.end) + '"]'), "endDateSpan");
        }

      },
      setCustomDateRangeConfig: function(value) {
        this._dateRangeConfig = value;
        if (this._dateRangeConfig.dateRanges.length !== 0) {
          var str = "";
          for (var i = 0; i < this._dateRangeConfig.dateRanges.length; i++) {
            str = str + '<button data-grainValue="' + this._dateRangeConfig.dateRanges[i].grainValue + '" class="grain">' + this._dateRangeConfig.dateRanges[i].grainDisplayName + '</button>';
          }
          str = str + '<button data-grainValue="' + MODE_ENUM.CUSTOM + '" class="grain">' + MODE_ENUM.CUSTOM_LABEL + '</button>';
          this.querySelector(".grains").innerHTML = str;
        }
      },
      selectRange: function(rangeName, start, end) {
        var rangeFound = false;
        if (this._dateRangeConfig !== undefined && this._dateRangeConfig.dateRanges !== undefined) {
          for (var i = 0; i < this._dateRangeConfig.dateRanges.length; i++) {
            if (this._dateRangeConfig.dateRanges[i].grainValue === rangeName) {
              rangeFound = true;
              this._range.grainValue = this._dateRangeConfig.dateRanges[i].grainValue;
              this._range.start = this._dateRangeConfig.dateRanges[i].start;
              this._range.end = this._dateRangeConfig.dateRanges[i].end;
            }
          }
        }
        if (!rangeFound) {
          this._range.grainValue = MODE_ENUM.CUSTOM;
          this._range.start = start || null;
          this._range.end = end || null;

        }
        this.getElementsByTagName("x-calendar")[0].chosen = [
          [this._range.start, this._range.end]
        ];
        this._updateCurrentSelection();
      }
    }
  });
})();

