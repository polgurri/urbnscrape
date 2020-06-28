import fetch from 'node-fetch';

const DEFAULT_HEADERS = {
  Referer: 'https://secure.urbnsurf.com/',
};

const WAVE_CODES = {
  cruiserLeft: 'CRUISEL',
  cruiserRight: 'CRUISER',
  intermediateLeft: 'SPEAKL',
  intermediateRight: 'SPEAKR',
  advancedLeft: 'SREEFL',
  advancedRight: 'SREEFR',
  expertLeft: 'EXPL',
  expertRight: 'EXPR',
};

const DEFAULT_FARE_CODE = 'ADULT';
const DEFAULT_WAVE = WAVE_CODES.intermediateRight;

const fetcher = (path, opts) =>
  fetch(path, {
    ...opts,
    headers: {
      ...DEFAULT_HEADERS,
      ...(opts.headers || {}),
    },
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    console.log(response);
    throw new Error(response.status || 'Fetch error');
  });

const LOGIN_URL =
  'https://webservicesms.customlinc.com.au/restlinc/URBNSURF/login/security/login';

const LOGIN_BODY = JSON.stringify({
  authToken: null,
  brand: 'URBNSURFGV',
  language: 'EN',
  queueToken: null,
});

const NAME_BODY = {
  addresses: [],
  bookingId: '',
  comment: '',
  concessionCard: '',
  email: '',
  firstName: 'Name',
  genderCode: '',
  height: 0,
  id: 0,
  lastName: '',
  memberCardId: '',
  mobilePhone: '',
  saveRebilling: false,
  titleCode: '',
  weight: 0,
};

let authToken = null;

// add the authToken to a body object
// and stringify it
const getBody = (body = {}) =>
  JSON.stringify({
    queueToken: null,
    authToken,
    ...body,
  });

// get an auth token, cache it locally.
const postLogin = async () => {
  const data = await fetcher(LOGIN_URL, {
    method: 'POST',
    body: LOGIN_BODY,
  });
  authToken = data.authToken;
  return data.authToken;
};

const categoryFareInitialise = () =>
  fetcher(
    'https://webservicesms.customlinc.com.au/restlinc/URBNSURF/cart/categoryfareinitialise',
    {
      method: 'POST',
      body: getBody(),
    }
  );

const putCategoryFare = (
  category = DEFAULT_WAVE,
  fareCode = DEFAULT_FARE_CODE,
  quantity = 1
) =>
  fetcher(
    'https://webservicesms.customlinc.com.au/restlinc/URBNSURF/cart/categoryfare',
    {
      method: 'PUT',
      body: getBody({
        category,
        fareCode,
        quantity,
      }),
    }
  );

const putName = () =>
  fetcher(
    'https://webservicesms.customlinc.com.au/restlinc/URBNSURF/cart/name',
    {
      method: 'PUT',
      body: getBody(NAME_BODY),
    }
  );

const postDetails = () =>
  fetcher(
    'https://webservicesms.customlinc.com.au/restlinc/URBNSURF/user/details',
    {
      method: 'POST',
      body: getBody(),
    }
  );

const postCategoryProducts = () =>
  fetcher(
    'https://webservicesms.customlinc.com.au/restlinc/URBNSURF/cart/categoryproducts',
    {
      method: 'POST',
      body: getBody(),
    }
  );

const putDefaultDate = (date) =>
  fetcher(
    'https://webservicesms.customlinc.com.au/restlinc/URBNSURF/cart/defaultdate',
    {
      method: 'PUT',
      body: getBody({
        date,
      }),
    }
  );

/**
 * Set up everything we need to start
 * querying the API.
 */
export const boot = async (
  category = DEFAULT_WAVE,
  fareCode = DEFAULT_FARE_CODE,
  quantity = 1
) => {
  await postLogin();
  await categoryFareInitialise();
  await putCategoryFare(category, fareCode, quantity);
  await putName();
  await postDetails();
};

/**
 * Fetch the available sessions for a day
 * @param  {Date} date
 * @return {[Object]}
 */
export const getSessionsForDay = async (date) => {
  await putDefaultDate(date.toISOString());
  const { categoryProducts } = await postCategoryProducts();
  return categoryProducts[0].products;
};