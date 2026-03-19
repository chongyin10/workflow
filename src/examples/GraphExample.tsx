import React, { useEffect, useRef } from 'react';
import { Graph } from '../core/Graph';
import { Node } from '../core/Node';
import { Shape } from '../core/Shape';
import { Edge, EdgeType } from '../core/Edge';
import { Port } from '../core/Port';

/**
 * GraphExample - Graph 核心组件使用示例
 * 
 * 展示功能：
 * - 节点创建与样式配置
 * - 边的连接与多种类型
 * - 连接桩（Port/锚点）的使用
 * - 拖拽、缩放、选中交互
 * - 鼠标悬停变色效果
 * - 断开/重连边功能
 */
export const GraphExample: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<Graph | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // 创建 Graph 实例
        const graph = new Graph({
            container: containerRef.current,
            width: 800,
            height: 600,
            draggable: true,
            scalable: true,
            backgroundColor: '#f8fafc',
            grid: {
                enabled: true,
                size: 20,
                color: '#e2e8f0',
            },
            onNodeSelect: (node) => {
                console.log('选中节点:', node?.getId());
            },
            onDragEnd: (offset) => {
                console.log('画布偏移:', offset);
            },
            onZoom: (scale, offset) => {
                console.log('缩放比例:', scale, '偏移:', offset);
            },
        });

        graphRef.current = graph;

        // 创建示例节点和边
        createExampleData(graph);

        return () => {
            graph.destroy();
        };
    }, []);

    // 创建示例数据
    const createExampleData = (graph: Graph) => {
        // ========== 节点 1：开始节点（圆形） ==========
        const node1 = graph.addNode({
            id: 'node-start',
            label: '开始',
            x: 200,
            y: 150,
            shape: Shape.Circle,
            style: {
                width: 100,
                height: 100,
                backgroundColor: '#22c55e',
                borderColor: '#16a34a',
                textColor: '#ffffff',
                hoverBackgroundColor: '#4ade80',
            },
        });

        // 添加连接桩
        node1.addPort({
            id: 'port-start-right',
            position: 'right',
            visible: true,
        });
        node1.addPort({
            id: 'port-start-bottom',
            position: 'bottom',
            visible: true,
        });

        // ========== 节点 2：处理节点（矩形） ==========
        const node2 = graph.addNode({
            id: 'node-process',
            label: '处理数据',
            x: 450,
            y: 150,
            shape: Shape.Rect,
            style: {
                width: 140,
                height: 80,
                backgroundColor: '#3b82f6',
                borderColor: '#2563eb',
                borderRadius: 8,
                textColor: '#ffffff',
                hoverBackgroundColor: '#60a5fa',
            },
        });

        // 添加多个连接桩
        node2.addPort({ id: 'port-process-left', position: 'left', visible: true });
        node2.addPort({ id: 'port-process-right', position: 'right', visible: true });
        node2.addPort({ id: 'port-process-top', position: 'top', visible: true });
        node2.addPort({ id: 'port-process-bottom', position: 'bottom', visible: true });

        // ========== 节点 3：判断节点（菱形/多边形） ==========
        const node3 = graph.addNode({
            id: 'node-decision',
            label: '条件判断',
            x: 450,
            y: 350,
            shape: {
                type: Shape.Polygon,
                points: [
                    { x: 0, y: -40 },
                    { x: 60, y: 0 },
                    { x: 0, y: 40 },
                    { x: -60, y: 0 },
                ],
            },
            style: {
                width: 120,
                height: 80,
                backgroundColor: '#f59e0b',
                borderColor: '#d97706',
                textColor: '#ffffff',
                hoverBackgroundColor: '#fbbf24',
            },
        });

        node3.addPort({ id: 'port-decision-top', position: 'top', visible: true });
        node3.addPort({ id: 'port-decision-left', position: 'left', visible: true });
        node3.addPort({ id: 'port-decision-right', position: 'right', visible: true });

        // ========== 节点 4：结束节点 ==========
        const node4 = graph.addNode({
            id: 'node-end',
            label: '结束',
            x: 700,
            y: 350,
            shape: Shape.Circle,
            style: {
                width: 80,
                height: 80,
                backgroundColor: '#ef4444',
                borderColor: '#dc2626',
                textColor: '#ffffff',
                hoverBackgroundColor: '#f87171',
            },
        });

        node4.addPort({ id: 'port-end-left', position: 'left', visible: true });

        // ========== 创建边（多种类型） ==========

        // 1. 直线连接
        graph.addEdge({
            id: 'edge-1',
            source: { nodeId: 'node-start', portId: 'port-start-right' },
            target: { nodeId: 'node-process', portId: 'port-process-left' },
            type: EdgeType.Straight,
            label: '直线',
            style: {
                stroke: '#64748b',
                strokeWidth: 2,
                arrowSize: 10,
            },
        });

        // 2. 水平折线
        graph.addEdge({
            id: 'edge-2',
            source: { nodeId: 'node-process', portId: 'port-process-bottom' },
            target: { nodeId: 'node-decision', portId: 'port-decision-top' },
            type: EdgeType.Horizontal,
            label: '水平折线',
            style: {
                stroke: '#64748b',
                strokeWidth: 2,
                cornerRadius: 10,
            },
        });

        // 3. 垂直折线
        graph.addEdge({
            id: 'edge-3',
            source: { nodeId: 'node-decision', portId: 'port-decision-right' },
            target: { nodeId: 'node-end', portId: 'port-end-left' },
            type: EdgeType.Vertical,
            label: '垂直折线',
            style: {
                stroke: '#64748b',
                strokeWidth: 2,
                cornerRadius: 10,
            },
        });

        // 4. 贝塞尔曲线
        const bezierEdge = graph.addEdge({
            id: 'edge-bezier',
            source: { nodeId: 'node-start', portId: 'port-start-bottom' },
            target: { nodeId: 'node-decision', portId: 'port-decision-left' },
            type: EdgeType.Bezier,
            label: '贝塞尔曲线',
            style: {
                stroke: '#8b5cf6',
                strokeWidth: 2,
                dashed: true,
                dashPattern: [8, 4],
                arrowSize: 8,
            },
        });

        // 设置断开回调示例
        bezierEdge['onDisconnect'] = (edge) => {
            console.log(`边 ${edge.getId()} 已断开连接`);
        };

        // 5. 弧线
        graph.addEdge({
            id: 'edge-arc',
            source: { nodeId: 'node-start', position: 'left' },
            target: { nodeId: 'node-end', position: 'top' },
            type: EdgeType.Arc,
            style: {
                stroke: '#06b6d4',
                strokeWidth: 2,
                arrowSize: 8,
            },
        });
    };

    // 控制按钮操作
    const handleZoomIn = () => {
        const graph = graphRef.current;
        if (graph) {
            const { scale } = graph.getTransform();
            graph.zoomTo(scale * 1.2);
        }
    };

    const handleZoomOut = () => {
        const graph = graphRef.current;
        if (graph) {
            const { scale } = graph.getTransform();
            graph.zoomTo(scale * 0.8);
        }
    };

    const handleReset = () => {
        graphRef.current?.reset();
    };

    const handleDisconnectEdge = () => {
        const graph = graphRef.current;
        if (graph) {
            const edge = graph.getEdge('edge-bezier');
            if (edge && edge.isConnected()) {
                edge.disconnect();
                console.log('已断开贝塞尔曲线');
            }
        }
    };

    const handleReconnectEdge = () => {
        const graph = graphRef.current;
        if (graph) {
            const edge = graph.getEdge('edge-bezier');
            if (edge && !edge.isConnected()) {
                edge.reconnect();
                console.log('已重连贝塞尔曲线');
            }
        }
    };

    const handleRemoveSelected = () => {
        const graph = graphRef.current;
        if (graph) {
            const selectedNode = graph.getSelectedNode();
            if (selectedNode) {
                graph.removeNode(selectedNode.getId());
            }
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
            {/* 控制面板 */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                    onClick={handleZoomIn}
                    style={{
                        padding: '8px 16px',
                        background: '#3b82f6',
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
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    缩小
                </button>
                <button
                    onClick={handleReset}
                    style={{
                        padding: '8px 16px',
                        background: '#64748b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    重置视图
                </button>
                <button
                    onClick={handleDisconnectEdge}
                    style={{
                        padding: '8px 16px',
                        background: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    断开虚线边
                </button>
                <button
                    onClick={handleReconnectEdge}
                    style={{
                        padding: '8px 16px',
                        background: '#22c55e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    重连虚线边
                </button>
                <button
                    onClick={handleRemoveSelected}
                    style={{
                        padding: '8px 16px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    删除选中节点
                </button>
            </div>

            {/* Graph 容器 */}
            <div
                ref={containerRef}
                style={{
                    width: '100%',
                    height: '600px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: '#f8fafc',
                }}
            />

            {/* 说明文字 */}
            <div style={{ color: '#64748b', fontSize: '14px' }}>
                <p>操作说明：</p>
                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    <li>拖拽空白区域：移动画布</li>
                    <li>滚轮：缩放画布</li>
                    <li>点击节点：选中节点（可拖拽移动）</li>
                    <li>鼠标悬停在边上：线条变色</li>
                    <li>连接桩（Port）：用于精确连接边</li>
                </ul>
            </div>
        </div>
    );
};

export default GraphExample;
