interface Document {
  prerendering?: boolean;
}

interface Navigator {
  connection?: {
    downlink: number;
    effectiveType: string;
    rtt: number;
  };
}
