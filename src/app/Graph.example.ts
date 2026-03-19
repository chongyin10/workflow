/**
 * Graph 类使用示例
 */

import { Graph, Point } from '../core/Graph';
import { Node } from '../core/Node';
import { Edge, EdgeType } from '../core/Edge';
import { Shape } from '../core/Shape';

// 示例 1: 基础用法
function basicExample() {
    const container = document.getElementById('graph-container')!;

    const graph = new Graph({
        container,
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
        onDragEnd: (offset) => {
            console.log('拖拽结束，偏移量:', offset);
        },
        onZoom: (scale, offset) => {
            console.log('缩放:', scale, '偏移量:', offset);
        },
    });

    return graph;
}

// 示例 2: 使用 Node 和 Edge 类绘制
class CustomGraph extends Graph {
    constructor(options: any) {
        super(options);
        
        // 使用 addNode 添加节点
        const node1 = this.addNode({
            id: 'node-1',
            x: 0,
            y: 0,
            shape: Shape.Circle,
            label: '节点 1',
            style: {
                width: 60,
                height: 60,
                backgroundColor: '#3b82f6',
                borderColor: '#1d4ed8',
                borderWidth: 2,
                textColor: '#ffffff',
                fontSize: 14,
            },
        });
        
        const node2 = this.addNode({
            id: 'node-2',
            x: 200,
            y: 100,
            shape: Shape.Circle,
            label: '节点 2',
            style: {
                width: 60,
                height: 60,
                backgroundColor: '#10b981',
                borderColor: '#059669',
                borderWidth: 2,
                textColor: '#ffffff',
                fontSize: 14,
            },
        });
        
        const node3 = this.addNode({
            id: 'node-3',
            x: -100,
            y: 200,
            shape: Shape.Circle,
            label: '节点 3',
            style: {
                width: 60,
                height: 60,
                backgroundColor: '#f59e0b',
                borderColor: '#d97706',
                borderWidth: 2,
                textColor: '#ffffff',
                fontSize: 14,
            },
        });
        
        // 使用 addEdge 添加边
        this.addEdge({
            id: 'edge-1-2',
            source: { nodeId: 'node-1', position: 'right' },
            target: { nodeId: 'node-2', position: 'left' },
            type: EdgeType.Bezier,
            style: {
                stroke: '#94a3b8',
                strokeWidth: 2,
                dashed: false,
                arrowSize: 8,
            },
        });
        
        this.addEdge({
            id: 'edge-2-3',
            source: { nodeId: 'node-2', position: 'bottom' },
            target: { nodeId: 'node-3', position: 'right' },
            type: EdgeType.Bezier,
            style: {
                stroke: '#94a3b8',
                strokeWidth: 2,
                dashed: false,
                arrowSize: 8,
            },
        });
    }

    // 重写 onRender 方法（可选，用于添加额外的自定义绘制）
    protected onRender(): void {
        // 节点和边已经在 Graph.render() 中自动渲染
        // 这里可以添加额外的自定义绘制逻辑
    }
}

// 示例 3: 带控制的画布
function controlledExample() {
    const container = document.getElementById('graph-container')!;

    const graph = new Graph({
        container,
        draggable: true,
        scalable: true,
    });

    // 控制按钮事件
    document.getElementById('reset-btn')?.addEventListener('click', () => {
        graph.reset();
    });

    document.getElementById('zoom-in-btn')?.addEventListener('click', () => {
        const currentScale = graph.getTransform().scale;
        graph.zoomTo(currentScale * 1.2);
    });

    document.getElementById('zoom-out-btn')?.addEventListener('click', () => {
        const currentScale = graph.getTransform().scale;
        graph.zoomTo(currentScale / 1.2);
    });

    document.getElementById('center-btn')?.addEventListener('click', () => {
        graph.panTo({ x: 0, y: 0 });
    });

    return graph;
}

// 示例 4: 坐标转换
function coordinateExample() {
    const container = document.getElementById('graph-container')!;

    const graph = new Graph({
        container,
        draggable: true,
        scalable: true,
    });

    // 监听画布点击事件
    graph.getCanvas().addEventListener('click', (e) => {
        const rect = graph.getCanvas().getBoundingClientRect();
        const screenPoint: Point = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };

        // 转换为世界坐标
        const worldPoint = graph.screenToWorld(screenPoint);
        console.log('屏幕坐标:', screenPoint);
        console.log('世界坐标:', worldPoint);

        // 绘制点击标记
        const ctx = graph.getContext();
        ctx.save();
        ctx.translate(worldPoint.x, worldPoint.y);
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.restore();
    });

    return graph;
}

// 示例 5: 适应内容
function fitToContentExample() {
    const container = document.getElementById('graph-container')!;

    const graph = new CustomGraph({
        container,
        draggable: true,
        scalable: true,
    });

    // 适应内容到视图
    document.getElementById('fit-btn')?.addEventListener('click', () => {
        graph.fitToContent(
            {
                x: -100,
                y: 0,
                width: 300,
                height: 200,
            },
            50 // 内边距
        );
    });

    return graph;
}

// 导出示例供使用
export {
    basicExample,
    CustomGraph,
    controlledExample,
    coordinateExample,
    fitToContentExample,
};
