export const getCurrentUnixTimeGMT = () => ((new Date()).getTime() - ((new Date()).getTimezoneOffset() * 60 * 1000));
