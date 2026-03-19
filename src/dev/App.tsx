import React, { useEffect, useRef } from 'react';
import { CustomGraph } from '../app/Graph.example';
import type { Point } from '../core/Graph';

const App: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<CustomGraph | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const graph = new CustomGraph({
            container: containerRef.current,
            draggable: true,
            scalable: true,
            initialOffsetX: 0,
            initialOffsetY: 0,
            minZoom: 0.1,
            maxZoom: 5,
            grid: {
                enabled: true,
                size: 20,
                color: '#e5e7eb',
            },
            onDragEnd: (offset: Point) => {
                console.log('拖拽结束，偏移量:', offset);
            },
            onZoom: (scale: number, offset: Point) => {
                console.log('缩放:', scale, '偏移量:', offset);
            },
        });

        graphRef.current = graph;

        return () => {
            graph.destroy();
        };
    }, []);

    const handleReset = () => {
        graphRef.current?.reset();
    };

    const handleZoomIn = () => {
        if (graphRef.current) {
            const currentScale = graphRef.current.getTransform().scale;
            graphRef.current.zoomTo(currentScale * 1.2);
        }
    };

    const handleZoomOut = () => {
        if (graphRef.current) {
            const currentScale = graphRef.current.getTransform().scale;
            graphRef.current.zoomTo(currentScale / 1.2);
        }
    };

    const handleCenter = () => {
        graphRef.current?.panTo({ x: 0, y: 0 });
    };

    const handleFitToContent = () => {
        graphRef.current?.fitToContent(
            {
                x: -100,
                y: 0,
                width: 300,
                height: 200,
            },
            50
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <div style={{ padding: '16px 24px', backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                <h1 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 'bold' }}>Graph 组件演示</h1>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                        onClick={handleReset}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        重置
                    </button>
                    <button
                        onClick={handleZoomIn}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#22c55e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        放大
                    </button>
                    <button
                        onClick={handleZoomOut}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#eab308',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        缩小
                    </button>
                    <button
                        onClick={handleCenter}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#a855f7',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        居中
                    </button>
                    <button
                        onClick={handleFitToContent}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        适应内容
                    </button>
                </div>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                    提示：鼠标拖拽可以平移画布，滚轮可以缩放
                </p>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <div
                    ref={containerRef}
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
        </div>
    );
};

export default App;
