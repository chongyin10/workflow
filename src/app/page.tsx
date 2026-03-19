'use client';

import { useEffect, useRef } from 'react';
import type { Point } from '../core/Graph';
import { CustomGraph } from './Graph.example';

export default function Home() {
    const containerRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<CustomGraph | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // 创建 CustomGraph 实例
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

        // 清理函数
        return () => {
            graph.destroy();
        };
    }, []);

    // 控制按钮处理函数
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
            50 // 内边距
        );
    };

    return (
        <div className="flex flex-col h-screen">
            <div className="p-4 bg-gray-100 border-b">
                <h1 className="text-xl font-bold mb-4">Graph 示例</h1>
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                        重置
                    </button>
                    <button
                        onClick={handleZoomIn}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                    >
                        放大
                    </button>
                    <button
                        onClick={handleZoomOut}
                        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                    >
                        缩小
                    </button>
                    <button
                        onClick={handleCenter}
                        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
                    >
                        居中
                    </button>
                    <button
                        onClick={handleFitToContent}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                        适应内容
                    </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                    提示：鼠标拖拽可以平移画布，滚轮可以缩放
                </p>
            </div>
            <div className="flex-1 overflow-hidden">
                <div
                    ref={containerRef}
                    className="w-full h-full"
                />
            </div>
        </div>
    );
}
