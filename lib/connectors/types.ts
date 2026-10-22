import type { PipelineConnectorKey, RawSourceOffer } from "../../types/pipeline";

export type ConnectorContext = {
  limit: number;
};

export interface SourceConnector {
  key: PipelineConnectorKey;
  displayName: string;
  configured(): boolean;
  fetchOffers(context: ConnectorContext): Promise<RawSourceOffer[]>;
}
