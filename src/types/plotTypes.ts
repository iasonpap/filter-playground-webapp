export interface ComplexNumber {
    real: number;
    imag: number;
}

export interface TraceData {
    x: number[];
    y: number[];
    label: string;
}

export interface BodePlotProps {
    traces: TraceData[];
    title: string;
    xLabel: string;
    yLabel: string;
}