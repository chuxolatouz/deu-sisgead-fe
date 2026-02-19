// import getConfig from "next/config";
import ceil from "lodash/ceil";
import { differenceInMinutes, isValid, format } from "date-fns";
// import currencyJs from "currency.js";

/**
 * GET THE DIFFERENCE DATE FORMAT
 * @param  date - which is created comment data
 * @returns string - formatted from now
 */

/**
 * SAFELY PARSE A DATE (handles strings, Date objects, and MongoDB $date objects)
 * @param  date - incoming date data
 * @returns Date | null
 */
function parseSafeDate(date) {
  if (!date) return null;

  let parsedDate;
  if (date.$date) {
    // Handle MongoDB extended JSON format
    parsedDate = new Date(date.$date);
  } else {
    parsedDate = new Date(date);
  }

  return isValid(parsedDate) ? parsedDate : null;
}

/**
 * SAFELY FORMAT A DATE
 * @param  date - incoming date data
 * @param  formatStr - date-fns format string
 * @param  fallback - string to return if date is invalid
 * @returns string
 */
function formatSafeDate(date, formatStr = "dd/MM/yyyy", fallback = "N/A", options = {}) {
  const parsedDate = parseSafeDate(date);
  if (!parsedDate) return fallback;
  return format(parsedDate, formatStr, options);
}

function getDateDifference(date) {
  const parsedDate = parseSafeDate(date);
  if (!parsedDate) return "N/A";
  let diff = differenceInMinutes(new Date(), parsedDate);
  if (diff < 60) return diff + " minutes ago";
  diff = ceil(diff / 60);
  if (diff < 24) return `${diff} hour${diff === 0 ? "" : "s"} ago`;
  diff = ceil(diff / 24);
  if (diff < 30) return `${diff} day${diff === 0 ? "" : "s"} ago`;
  diff = ceil(diff / 30);
  if (diff < 12) return `${diff} month${diff === 0 ? "" : "s"} ago`;
  diff = diff / 12;
  return `${diff.toFixed(1)} year${ceil(diff) === 0 ? "" : "s"} ago`;
}

/**
 * RENDER THE PRODUCT PAGINATION INFO
 * @param page - CURRENT PAGE NUMBER
 * @param perPageProduct - PER PAGE PRODUCT LIST
 * @param totalProduct - TOTAL PRODUCT NUMBER
 * @returns
 */

function renderProductCount(page, perPageProduct, totalProduct) {
  let startNumber = (page - 1) * perPageProduct;
  let endNumber = page * perPageProduct;
  if (endNumber > totalProduct) {
    endNumber = totalProduct;
  }
  return `Showing ${startNumber - 1}-${endNumber} of ${totalProduct} products`;
}

/**
 * CALCULATE PRICE WITH PRODUCT DISCOUNT THEN RETURN NEW PRODUCT PRICES
 * @param  price - PRODUCT PRICE
 * @param  discount - DISCOUNT PERCENT
 * @returns - RETURN NEW PRICE
 */

function calculateDiscount(price, discount) {
  const afterDiscount = Number((price - price * (discount / 100)).toFixed(2));
  return currency(afterDiscount);
}

/**
 * CHANGE THE CURRENCY FORMAT
 * @param  price - PRODUCT PRICE
 * @param  fraction - HOW MANY FRACTION WANT TO SHOW
 * @returns - RETURN PRICE WITH CURRENCY
 */

function currency(price) {
  // const formatCurrency = currencyJs(price).format({
  //   fromCents: true
  // });
  // return formatCurrency;

  // const { publicRuntimeConfig } = getConfig();
  const roundedPrice = Math.round(price);
  const formatCurrency = new Intl.NumberFormat("es-VE", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `Bs. ${formatCurrency.format(roundedPrice / 100)}`;
}

/**
 * FORMAT A NUMBER TO VENEZUELAN CURRENCY FORMAT
 * @param  amount - AMOUNT TO FORMAT (can be number or string with comma)
 * @returns - RETURN FORMATTED AMOUNT WITH Bs. PREFIX
 */
function formatMonto(amount) {
  // Manejar strings con coma (formato venezolano del backend)
  let num = amount;
  if (typeof amount === 'string') {
    // Reemplazar coma por punto para parseo correcto
    num = parseFloat(amount.replace(',', '.'));
  }
  num = Number(num) || 0;

  const formatCurrency = new Intl.NumberFormat("es-VE", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `Bs. ${formatCurrency.format(num)}`;
}

export {
  renderProductCount,
  calculateDiscount,
  currency,
  getDateDifference,
  formatMonto,
  parseSafeDate,
  formatSafeDate
};

