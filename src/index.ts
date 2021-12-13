import debug from "debug";

const logger = debug("TeamsJsWireDebugger");
const appHostLogger = logger.extend("AppHost");
const teamsJsLogger = logger.extend("TeamsJs");

const appHostRequestLogger = appHostLogger.extend("Request");
const teamsJsRequestLogger = teamsJsLogger.extend("Request");
const teamsJsResponseLogger = teamsJsLogger.extend("Response");

appHostRequestLogger.enabled = true;
teamsJsRequestLogger.enabled = true;
teamsJsResponseLogger.enabled = true;

const formatData = (data: any): any => {
  return data && Array.isArray(data) && data.length === 1 ? data[0] : data;
};

window.addEventListener("message", (event) => {
  const frames = Array.from(document.getElementsByTagName("iframe"));
  const frame = frames.find((x) => x.contentWindow == event.source);
  if (frame && frame.getAttribute("data-tid") === "app-host-iframe") {
    const data = event.data;

    if (data.id !== undefined) {
      const { id, func, timestamp, args } = data;

      appHostRequestLogger("Request from TeamsJs: %o", {
        id,
        func,
        timestamp,
        data: formatData(args),
      });
    }

    return;
  }

  if (event.source === window.parent) {
    const data = event.data;
    const { id, func, args } = data;
    if (id !== undefined) {
      teamsJsResponseLogger("Response from Host %o", {
        id,
        data: formatData(args),
      });
    } else if (func) {
      teamsJsRequestLogger("Request from Host %o", {
        func,
        data: formatData(args),
      });
    }
  }
});
