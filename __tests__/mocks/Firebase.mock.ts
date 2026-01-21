export const logEvent = jest.fn();
export const setUserId = jest.fn();
export const setUserProperties = jest.fn();
export const logScreenView = jest.fn();

export const analytics = {
  logEvent,
  setUserId,
  setUserProperties,
  logScreenView,
};

export default {
  logEvent,
  setUserId,
  setUserProperties,
  logScreenView,
};
