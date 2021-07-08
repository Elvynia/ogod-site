export interface Bubble {
    id: string;
    name: string;
    tags: string[];
}

export interface BubbleLabel {
    id: string;
    text: string;
    x?: number;
    y?: number;
}
