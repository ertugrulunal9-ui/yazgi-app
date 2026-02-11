export const logEvent = jest.fn();
export const setUserId = jest.fn();
export const setUserProperties = jest.fn();
export const logScreenView = jest.fn();
export const logGameStarted = jest.fn();
export const logCharacterCreated = jest.fn();
export const logEventCompleted = jest.fn();
export const logHubAction = jest.fn();
export const logTurnAdvanced = jest.fn();
export const logGameEnded = jest.fn();
export const logPurchaseMade = jest.fn();
export const logCustomEvent = jest.fn();
export const setUserProperty = jest.fn();
export const setEnabled = jest.fn();
export const logProgressionEconomy = jest.fn();
export const logRetentionCheckpoint = jest.fn();

export const analyticsService = {
  logGameStarted,
  logCharacterCreated,
  logEventCompleted,
  logHubAction,
  logTurnAdvanced,
  logGameEnded,
  logPurchaseMade,
  logCustomEvent,
  setUserId,
  setUserProperty,
  setEnabled,
  logProgressionEconomy,
  logRetentionCheckpoint,
};

export const analytics = {
  logEvent,
  setUserId,
  setUserProperties,
  logScreenView,
};

export default {
  analyticsService,
  logEvent,
  setUserId,
  setUserProperties,
  logScreenView,
};
