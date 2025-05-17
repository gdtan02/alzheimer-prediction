export interface VisualizationResponse {
    status: "success" | "failed";
    imageData: string;
    contentType: string;
    error?: string;
}

export interface VisualizationResult {
    name: string;
    label: string;
    imageUrl: string;
    error?: string;
}

export type VisualizationType =
    | "target-distribution"
    | "numerical-features-boxplot"
    | "numerical-features-pairplot"
    | "numerical-features-violin"
    | "correlation-heatmap"
    | "categorical-vs-target"
    | "feature-importance";

