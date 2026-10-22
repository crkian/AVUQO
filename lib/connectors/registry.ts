import type { PipelineConnectorKey } from "../../types/pipeline";
import { awinConnector } from "./awin";
import { demoConnector } from "./demo";
import type { SourceConnector } from "./types";

const connectors: Record<PipelineConnectorKey, SourceConnector> = {
  demo: demoConnector,
  awin: awinConnector,
};

export function getConnector(key: PipelineConnectorKey) {
  return connectors[key];
}

export function connectorStatus() {
  return Object.values(connectors).map((connector) => ({
    key: connector.key,
    name: connector.displayName,
    configured: connector.configured(),
  }));
}
