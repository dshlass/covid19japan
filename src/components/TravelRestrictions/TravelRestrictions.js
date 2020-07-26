import i18next from "i18next";
import twemoji from "twemoji";

/**
 * Parse the string for an emoji and convert to image
 * @param {string} emoji Emoji
 * @returns {HTMLImageElement}
 */
const parseEmoji = (emoji) => {
  return twemoji.parse(emoji, {
    folder: "svg",
    ext: ".svg",
  });
};

/**
 * Adds the localized "name" property to each country on the array.
 *
 * @param {array} countries The countries to loaclize
 */
const localizeCountryNames = (countries) => {
  const countryData = require("i18n-iso-countries");
  var language = i18next.language;
  try {
    countryData.registerLocale(
      require("i18n-iso-countries/langs/" + language + ".json")
    );
  } catch (err) {
    // Fall back to English
    language = "en";
    countryData.registerLocale(require("i18n-iso-countries/langs/en.json"));
  }
  countries.forEach((country) => {
    const countryKey = `countries.${country.code}`;
    const localizedName = i18next.exists(countryKey)
      ? i18next.t(countryKey)
      : countryData.getName(country.code, language);
    country.name = localizedName || country.name;
  });
};

/**
 * Creates a list of countries, sorted by name.
 *
 * @param {array} countries
 * @returns The list of countries as HTML.
 */
const createCountryList = (countries, titleId) => {
  return countries
    .sort((a, b) => a["name"].localeCompare(b["name"], i18next.language))
    .map((country) => {
      return `<a data-type=${titleId + "-" + country.name[0]} href="${
        country.link
      }" class="country-link">${parseEmoji(country.emoji)}${country.name}</a>`;
    })
    .join("  ");
};

/**
 * Creates the filter list based on first letter of country name.
 *
 * @param {array} countries The countries to loaclize
 */
const createSortList = (countries, titleId, elementId) => {
  const countryList = countries.sort((a, b) =>
    a["name"].localeCompare(b["name"], i18next.language)
  );
  let letterArray = {};

  countryList.forEach((country) => {
    if (!letterArray[country.name[0]]) {
      letterArray[country.name[0]] = [country];
    } else if (letterArray[country.name[0]]) {
      letterArray[country.name[0]].push(country);
    }
  });

  const filterContainer = elementId;

  const countryNodeArray = elementId.children;
  const countryArray = Array.from(countryNodeArray);

  const filterSelection = (e) => {
    countryArray.forEach((country) => {
      country.classList.remove("hidden");

      if (
        country.dataset &&
        country.dataset.type !== `${titleId + "-" + e.currentTarget.value}`
      ) {
        country.classList.add("hidden");
      }
    });
  };

  const clearFilter = () => {
    countryArray.forEach((country) => {
      country.classList.remove("hidden");
    });
  };

  const ul = document.createElement("ul");

  const allInput = document.createElement("input");
  allInput.classList.add("filter-input");
  allInput.setAttribute("type", "radio");
  allInput.setAttribute("id", `${titleId + "-" + "All"}`);
  allInput.setAttribute("value", "All");
  allInput.setAttribute("name", `${titleId + "-" + "countries-list"}`);
  allInput.setAttribute("checked", "true");

  allInput.addEventListener("change", () => clearFilter());

  const allLabel = document.createElement("label");
  allLabel.classList.add("filter-label");
  allLabel.setAttribute("for", `${titleId + "-" + "All"}`);
  allLabel.innerText = "All";

  ul.appendChild(allInput);
  ul.appendChild(allLabel);

  Object.keys(letterArray).forEach((letter) => {
    const letterInput = document.createElement("input");
    letterInput.classList.add("filter-input");
    letterInput.setAttribute("type", "radio");
    letterInput.setAttribute("id", `${titleId + "-" + letter}`);
    letterInput.setAttribute("value", letter);
    letterInput.setAttribute("name", `${titleId + "-" + "countries-list"}`);

    letterInput.addEventListener("change", (e) => filterSelection(e));

    const letterLabel = document.createElement("label");
    letterLabel.classList.add("filter-label");
    letterLabel.setAttribute("for", `${titleId + "-" + letter}`);
    letterLabel.innerText = letter;

    const letterLi = document.createElement("li");

    letterLi.appendChild(letterInput);
    letterLi.appendChild(letterLabel);

    ul.appendChild(letterLi);
  });

  ul.classList.add("filter-country");

  filterContainer.prepend(ul);
};

/**
 * Populate the travel restrictions element with the list of countries.
 *
 * @param {string} titleId The element ID for the title.
 * @param {string} elementId The element ID for the contents.
 * @param {array} countries The list of countries for the content.
 */
const populateTravelRestriction = (titleId, elementId, countries) => {
  // Hide category title if the category is empty.
  if (!countries || !countries.length) {
    const title = document.querySelector(titleId);
    if (title) {
      title.hidden = true;
    }
    return;
  }
  // Target element for the list
  const banned = document.querySelector(elementId);
  if (!banned) {
    return;
  }

  localizeCountryNames(countries);
  banned.innerHTML = createCountryList(countries, titleId);
  if (countries.length > 50) {
    createSortList(countries, titleId, banned);
  }
};

export const drawTravelRestrictions = (ddb) => {
  const banned = ddb.travelRestrictions.japan.banned;
  const visaRequired = ddb.travelRestrictions.japan.visaRequired;
  const selfQuarantine = ddb.travelRestrictions.selfQuarantine;
  const other = ddb.travelRestrictions.japan.other;

  // Hide entire travel restrictions section if all categories are empty.
  if (
    (!banned || !banned.length) &&
    (!visaRequired || !visaRequired.length) &&
    (!selfQuarantine || !selfQuarantine.length) &&
    (!other || !other.length)
  ) {
    const travelResSection = document.querySelector("#travel-restrictions");
    if (travelResSection) {
      travelResSection.hidden = true;
    }
  } else {
    populateTravelRestriction("#banned-entry-title", "#banned-entry", banned);
    populateTravelRestriction(
      "#visa-required-title",
      "#visa-required",
      visaRequired
    );
    populateTravelRestriction(
      "#self-quarantine-title",
      "#self-quarantine",
      selfQuarantine
    );
    populateTravelRestriction(
      "#other-restrictions-title",
      "#other-restrictions",
      other
    );
  }
};

export default drawTravelRestrictions;
