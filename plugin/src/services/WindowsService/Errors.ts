export enum ErrorCode {
  ERROR_CREATE_WINDOW = 2000,
  ERROR_GET_CURRENT_WINDOW = 2001,
  ERROR_GET_WINDOW = 2002,
  ERROR_GET_ALL_WINDOWS = 2003,
  ERROR_CLOSE_WINDOW = 2004,
  ERROR_GET_TAB = 2005,
  ERROR_QUERY_TABS = 2006,
}

export class WindowsServiceError extends Error {
  public errorCode: ErrorCode;
  public errorChrome: chrome.runtime.LastError;

  public constructor(
    errorCode: ErrorCode,
    errorChrome: chrome.runtime.LastError,
    message: string,
  ) {
    super(message);
    this.errorChrome = errorChrome;
    this.errorCode = errorCode;
  }
}

export const ERROR_CREATE_WINDOW = (
  errorChrome: chrome.runtime.LastError,
): WindowsServiceError => {
  return new WindowsServiceError(
    ErrorCode.ERROR_CREATE_WINDOW,
    errorChrome,
    "WindowsService: could not create window",
  );
};

export const ERROR_GET_CURRENT_WINDOW = (
  errorChrome: chrome.runtime.LastError,
): WindowsServiceError => {
  return new WindowsServiceError(
    ErrorCode.ERROR_GET_CURRENT_WINDOW,
    errorChrome,
    "WindowsService: could not get current window",
  );
};

export const ERROR_GET_WINDOW = (
  errorChrome: chrome.runtime.LastError,
  windowId: number,
): WindowsServiceError => {
  return new WindowsServiceError(
    ErrorCode.ERROR_GET_WINDOW,
    errorChrome,
    `WindowsService: could not get the window with the ID ${windowId}`,
  );
};

export const ERROR_GET_ALL_WINDOWS = (
  errorChrome: chrome.runtime.LastError,
): WindowsServiceError => {
  return new WindowsServiceError(
    ErrorCode.ERROR_GET_ALL_WINDOWS,
    errorChrome,
    "WindowsService: could not get all windows",
  );
};

export const ERROR_CLOSE_WINDOW = (
  errorChrome: chrome.runtime.LastError,
): WindowsServiceError => {
  return new WindowsServiceError(
    ErrorCode.ERROR_CLOSE_WINDOW,
    errorChrome,
    "WindowsService: could not close window",
  );
};

export const ERROR_GET_TAB = (
  errorChrome: chrome.runtime.LastError,
  tabId: number,
): WindowsServiceError => {
  return new WindowsServiceError(
    ErrorCode.ERROR_GET_TAB,
    errorChrome,
    `WindowsService: could not get the tab with the ID ${tabId}`,
  );
};

export const ERROR_UPDATE_TAB = (
  errorChrome: chrome.runtime.LastError,
  tabId: number,
): WindowsServiceError => {
  return new WindowsServiceError(
    ErrorCode.ERROR_GET_TAB,
    errorChrome,
    `WindowsService: could not update the tab with the ID ${tabId}`,
  );
};

export const ERROR_QUERY_TABS = (
  errorChrome: chrome.runtime.LastError,
): WindowsServiceError => {
  return new WindowsServiceError(
    ErrorCode.ERROR_GET_TAB,
    errorChrome,
    "WindowsService: could not get query the tabs",
  );
};
