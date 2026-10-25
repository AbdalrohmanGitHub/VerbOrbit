import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VerbOrbit",
    short_name: "VerbOrbit",
    description: "Präfixverben sehen, die Satzklammer spüren, sie wiederholen.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f7fb",
    theme_color: "#2563eb",
    lang: "de",
  };
}
