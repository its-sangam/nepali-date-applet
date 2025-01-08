const Applet = imports.ui.applet;
const GLib = imports.gi.GLib;
const Lang = imports.lang;

// Utility functions to convert AD to BS and format Nepali dates
const NepaliDateConverter = {
    // Nepali month names
    nepaliMonths: [
        "बैशाख", "जेठ", "असार", "श्रावण", "भदौ", "आश्विन",
        "कार्तिक", "मंसिर", "पुष", "माघ", "फाल्गुन", "चैत्र"
    ],

    // Nepali days of the week
    nepaliDays: ["आइतवार", "सोमवार", "मंगलवार", "बुधवार", "बिहिवार", "शुक्रवार", "शनिवार"],

    // Days in each month for BS years 2080-2099
    daysInMonthBS: {
        2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
        2081: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
        2082: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
        2083: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
        2084: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
        2085: [31, 32, 31, 32, 30, 31, 30, 30, 29, 30, 30, 30],
        2086: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
        2087: [31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30],
        2088: [30, 31, 32, 32, 30, 31, 30, 30, 29, 30, 30, 30],
        2089: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
        2090: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
        2091: [31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30],
        2092: [30, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30],
        2093: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
        2094: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
        2095: [31, 31, 32, 31, 31, 31, 30, 29, 30, 30, 30, 30],
        2096: [30, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
        2097: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
        2098: [31, 31, 32, 31, 31, 31, 29, 30, 29, 30, 29, 31],
        2099: [31, 31, 32, 31, 31, 31, 30, 29, 29, 30, 30, 30]
    },

    // Convert AD date to BS dynamically
    ad2bs: function (adDate) {
        const referenceADDate = new Date(2023, 3, 14); // 14th April 2023 (start of BS 2080)
        const referenceBS = { year: 2080, month: 1, day: 1 }; // Corresponding BS date

        const diffInDays = Math.floor((adDate - referenceADDate) / (1000 * 60 * 60 * 24));

        let bsYear = referenceBS.year;
        let bsMonth = referenceBS.month;
        let bsDay = referenceBS.day + diffInDays;

        // Adjust month and year based on days overflow
        while (true) {
            const daysInCurrentMonth = this.daysInMonthBS[bsYear][bsMonth - 1];
            if (bsDay <= daysInCurrentMonth) break;

            bsDay -= daysInCurrentMonth;
            bsMonth++;

            if (bsMonth > 12) {
                bsMonth = 1;
                bsYear++;
            }
        }

        const weekday = adDate.getDay();

        return {
            year: bsYear,
            month: bsMonth,
            day: bsDay,
            weekday: weekday
        };
    },

    // Format BS date to Nepali numerals and day
    formatNepaliDate: function (bsDate) {
        const nepaliNumerals = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

        const convertToNepaliNumerals = (num) =>
            String(num)
                .split("")
                .map((digit) => nepaliNumerals[parseInt(digit)])
                .join("");

        const year = convertToNepaliNumerals(bsDate.year);
        const month = this.nepaliMonths[bsDate.month - 1];
        const day = convertToNepaliNumerals(bsDate.day);
        const weekday = this.nepaliDays[bsDate.weekday];

        return `${day} ${month} ${year}, ${weekday}`;
    }
};

function BSDateApplet(metadata) {
    this._init(metadata);
}

BSDateApplet.prototype = {
    __proto__: Applet.TextIconApplet.prototype,

    _init: function(metadata) {
        Applet.TextIconApplet.prototype._init.call(this, metadata);

        this.set_applet_label("Checking...");

        this.updateNepaliDate();
    },

    updateNepaliDate: function() {
        try {
            const today = new Date();
            const bsDate = NepaliDateConverter.ad2bs(today);
            const formattedDate = NepaliDateConverter.formatNepaliDate(bsDate);

            // global.log(`BS Date: ${formattedDate}`);
            this.set_applet_label(formattedDate);
        } catch (e) {
            // global.logError(`Error: ${e.message}`);
            this.set_applet_label(new Date().toLocaleDateString());
        }
    }
};

function main(metadata) {
    return new BSDateApplet(metadata);
}
