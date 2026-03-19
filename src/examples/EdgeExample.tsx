import React, { useEffect, useRef, useState } from 'react';
import { Graph, GraphOptions } from '../core/Graph';
import { Node } from '../core/Node';
import { Shape } from '../core/Shape';
import { Edge, EdgeType } from '../core/Edge';

/**
 * EdgeExample - Edge 边组件使用示例
 * 
 * 展示功能：
 * - 5 种边类型：直线、水平折线、垂直折线、贝塞尔曲线、弧线
 * - 边的样式配置（颜色、线型、箭头）
 * - 鼠标悬停变色效果
 * - 断开连接和重连功能
 * - 边标签显示
 */
export const EdgeExample: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<Graph | null>(null);
    const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
    const [edgeStatuses, setEdgeStatuses] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!containerRef.current) return;

        const graph = new Graph({
            container: containerRef.current,
            width: 900,
            height: 600,
            draggable: true,
            scalable: true,
            backgroundColor: '#f8fafc',
            grid: { enabled: true, size: 20, color: '#e2e8f0' },
            onNodeSelect: (node) => {
                // 通过节点选中来获取关联的边
                const edgeId = node?.getData()?.edgeId as string;
                if (edgeId) {
                    setSelectedEdgeId(edgeId);
                }
            },
        });

        graphRef.current = graph;
        createExampleData(graph);

        return () => {
            graph.destroy();
        };
    }, []);

    // 创建示例数据
    const createExampleData = (graph: Graph) => {
        const statuses: Record<string, string> = {};

        // ========== 第 1 行：直线边 ==========
        const node1a = createNode(graph, 'node-1a', '起点', 80, 80, Shape.Circle, '#22c55e');
        const node1b = createNode(graph, 'node-1b', '终点', 280, 80, Shape.Circle, '#ef4444');
        
        const edge1 = graph.addEdge({
            id: 'edge-straight',
            source: { nodeId: 'node-1a', portId: 'port-right' },
            target: { nodeId: 'node-1b', portId: 'port-left' },
            label: '直线边',
            type: EdgeType.Straight,
            style: {
                stroke: '#3b82f6',
                strokeWidth: 2,
                hoverStroke: '#f59e0b',
            },
        });
        statuses[edge1.getId()] = '已连接';

        // ========== 第 2 行：水平折线 ==========
        const node2a = createNode(graph, 'node-2a', '起点', 80, 180, Shape.Rect, '#8b5cf6');
        const node2b = createNode(graph, 'node-2b', '终点', 280, 180, Shape.Rect, '#ec4899');
        
        const edge2 = graph.addEdge({
            id: 'edge-horizontal',
            source: { nodeId: 'node-2a', portId: 'port-right' },
            target: { nodeId: 'node-2b', portId: 'port-left' },
            label: '水平折线',
            type: EdgeType.Horizontal,
            style: {
                stroke: '#06b6d4',
                strokeWidth: 2,
                hoverStroke: '#f59e0b',
            },
        });
        statuses[edge2.getId()] = '已连接';

        // ========== 第 3 行：垂直折线 ==========
        const node3a = createNode(graph, 'node-3a', '起点', 80, 280, Shape.Ellipse, '#f97316');
        const node3b = createNode(graph, 'node-3b', '终点', 280, 280, Shape.Ellipse, '#84cc16');
        
        const edge3 = graph.addEdge({
            id: 'edge-vertical',
            source: { nodeId: 'node-3a', portId: 'port-right' },
            target: { nodeId: 'node-3b', portId: 'port-left' },
            label: '垂直折线',
            type: EdgeType.Vertical,
            style: {
                stroke: '#ec4899',
                strokeWidth: 2,
                hoverStroke: '#f59e0b',
            },
        });
        statuses[edge3.getId()] = '已连接';

        // ========== 第 4 行：贝塞尔曲线 ==========
        const node4a = createNode(graph, 'node-4a', '起点', 80, 380, Shape.Circle, '#14b8a6');
        const node4b = createNode(graph, 'node-4b', '终点', 280, 380, Shape.Circle, '#6366f1');
        
        const edge4 = graph.addEdge({
            id: 'edge-bezier',
            source: { nodeId: 'node-4a', portId: 'port-right' },
            target: { nodeId: 'node-4b', portId: 'port-left' },
            label: '贝塞尔曲线',
            type: EdgeType.Bezier,
            style: {
                stroke: '#8b5cf6',
                strokeWidth: 2,
                hoverStroke: '#f59e0b',
            },
        });
        statuses[edge4.getId()] = '已连接';

        // ========== 第 5 行：弧线 ==========
        const node5a = createNode(graph, 'node-5a', '起点', 80, 480, Shape.Rect, '#0ea5e9');
        const node5b = createNode(graph, 'node-5b', '终点', 280, 480, Shape.Rect, '#f43f5e');
        
        const edge5 = graph.addEdge({
            id: 'edge-arc',
            source: { nodeId: 'node-5a', portId: 'port-right' },
            target: { nodeId: 'node-5b', portId: 'port-left' },
            label: '弧线',
            type: EdgeType.Arc,
            style: {
                stroke: '#10b981',
                strokeWidth: 2,
                hoverStroke: '#f59e0b',
            },
        });
        statuses[edge5.getId()] = '已连接';

        // ========== 右侧：断开/重连演示区 ==========
        const nodeDemo1 = createNode(graph, 'node-demo1', '源节点', 500, 150, Shape.Circle, '#3b82f6');
        const nodeDemo2 = createNode(graph, 'node-demo2', '目标节点', 750, 150, Shape.Circle, '#ef4444');
        
        // 添加多个端口
        nodeDemo1.addPort({ id: 'port-demo1-top', position: 'top', visible: true });
        nodeDemo1.addPort({ id: 'port-demo1-right', position: 'right', visible: true });
        nodeDemo1.addPort({ id: 'port-demo1-bottom', position: 'bottom', visible: true });
        nodeDemo2.addPort({ id: 'port-demo2-top', position: 'top', visible: true });
        nodeDemo2.addPort({ id: 'port-demo2-left', position: 'left', visible: true });
        nodeDemo2.addPort({ id: 'port-demo2-bottom', position: 'bottom', visible: true });

        const demoEdge = graph.addEdge({
            id: 'edge-demo',
            source: { nodeId: 'node-demo1', portId: 'port-demo1-right' },
            target: { nodeId: 'node-demo2', portId: 'port-demo2-left' },
            label: '可断开/重连',
            type: EdgeType.Bezier,
            style: {
                stroke: '#f59e0b',
                strokeWidth: 3,
                hoverStroke: '#ef4444',
            },
        });
        statuses[demoEdge.getId()] = '已连接';

        // ========== 虚线样式示例 ==========
        const nodeDash1 = createNode(graph, 'node-dash1', '虚线起点', 500, 350, Shape.Rect, '#64748b');
        const nodeDash2 = createNode(graph, 'node-dash2', '虚线终点', 750, 350, Shape.Rect, '#64748b');
        
        const dashEdge = graph.addEdge({
            id: 'edge-dashed',
            source: { nodeId: 'node-dash1', portId: 'port-right' },
            target: { nodeId: 'node-dash2', portId: 'port-left' },
            label: '虚线样式',
            type: EdgeType.Straight,
            style: {
                stroke: '#64748b',
                strokeWidth: 2,
                dashed: true,
                hoverStroke: '#f59e0b',
            },
        });
        statuses[dashEdge.getId()] = '已连接';

        setEdgeStatuses(statuses);
    };

    // 创建节点的辅助函数
    const createNode = (
        graph: Graph,
        id: string,
        label: string,
        x: number,
        y: number,
        shape: Shape,
        color: string
    ): Node => {
        const node = graph.addNode({
            id,
            label,
            x,
            y,
            shape,
            style: {
                width: 80,
                height: 50,
                backgroundColor: color,
                borderColor: color,
                textColor: '#ffffff',
                borderRadius: shape === Shape.Circle ? 50 : 6,
            },
        });

        // 添加左右端口
        node.addPort({ id: 'port-left', position: 'left', visible: true });
        node.addPort({ id: 'port-right', position: 'right', visible: true });

        return node;
    };

    // 断开选中的边
    const handleDisconnect = () => {
        if (!graphRef.current || !selectedEdgeId) return;
        
        const edge = (graphRef.current as any).edges.get(selectedEdgeId);
        if (edge && edge.disconnect()) {
            setEdgeStatuses(prev => ({ ...prev, [selectedEdgeId]: '已断开' }));
            // 触发重新渲染
            (graphRef.current as any)['scheduleRender']?.();
            console.log('边已断开:', selectedEdgeId);
        }
    };

    // 重连选中的边
    const handleReconnect = () => {
        if (!graphRef.current || !selectedEdgeId) return;
        
        const edge = (graphRef.current as any).edges.get(selectedEdgeId);
        if (edge && edge.reconnect()) {
            setEdgeStatuses(prev => ({ ...prev, [selectedEdgeId]: '已连接' }));
            // 触发重新渲染
            (graphRef.current as any)['scheduleRender']?.();
            console.log('边已重连:', selectedEdgeId);
        }
    };

    // 删除选中的边
    const handleRemoveEdge = () => {
        if (!graphRef.current || !selectedEdgeId) return;
        
        graphRef.current.removeEdge(selectedEdgeId);
        setEdgeStatuses(prev => {
            const newStatuses = { ...prev };
            delete newStatuses[selectedEdgeId];
            return newStatuses;
        });
        setSelectedEdgeId(null);
    };

    // 清空所有边
    const handleClearEdges = () => {
        if (!graphRef.current) return;
        
        graphRef.current.clearEdges();
        setEdgeStatuses({});
        setSelectedEdgeId(null);
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
            <h2>🌊 Edge 边组件示例</h2>
            <p>展示不同类型的边、悬停效果、断开/重连功能</p>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
                <button 
                    onClick={handleDisconnect}
                    disabled={!selectedEdgeId}
                    style={{
                        padding: '8px 16px',
                        background: selectedEdgeId ? '#ef4444' : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: selectedEdgeId ? 'pointer' : 'not-allowed',
                    }}
                >
                    断开边
                </button>
                <button 
                    onClick={handleReconnect}
                    disabled={!selectedEdgeId}
                    style={{
                        padding: '8px 16px',
                        background: selectedEdgeId ? '#22c55e' : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: selectedEdgeId ? 'pointer' : 'not-allowed',
                    }}
                >
                    重连边
                </button>
                <button 
                    onClick={handleRemoveEdge}
                    disabled={!selectedEdgeId}
                    style={{
                        padding: '8px 16px',
                        background: selectedEdgeId ? '#f59e0b' : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: selectedEdgeId ? 'pointer' : 'not-allowed',
                    }}
                >
                    删除边
                </button>
                <button 
                    onClick={handleClearEdges}
                    style={{
                        padding: '8px 16px',
                        background: '#64748b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    清空所有边
                </button>
            </div>

            {selectedEdgeId && (
                <div style={{ 
                    padding: '10px', 
                    background: '#e0f2fe', 
                    borderRadius: '4px',
                    marginBottom: '15px',
                }}>
                    <strong>选中边:</strong> {selectedEdgeId} | 
                    <strong> 状态:</strong> {edgeStatuses[selectedEdgeId] || '未知'}
                </div>
            )}

            <div 
                ref={containerRef}
                style={{
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
            />

            <div style={{ marginTop: '20px', padding: '15px', background: '#f1f5f9', borderRadius: '8px' }}>
                <h3>📚 Edge 类型说明</h3>
                <ul style={{ lineHeight: '1.8' }}>
                    <li><strong>Straight (直线):</strong> 两点之间的直接连线</li>
                    <li><strong>Horizontal (水平折线):</strong> 先水平后垂直的折线，适合水平布局</li>
                    <li><strong>Vertical (垂直折线):</strong> 先垂直后水平的折线，适合垂直布局</li>
                    <li><strong>Bezier (贝塞尔曲线):</strong> 平滑的曲线连接</li>
                    <li><strong>Arc (弧线):</strong> 圆弧连接</li>
                </ul>
                <h3>🎨 功能特性</h3>
                <ul style={{ lineHeight: '1.8' }}>
                    <li><strong>悬停变色:</strong> 鼠标移入边时改变颜色（hoverStroke）</li>
                    <li><strong>断开/重连:</strong> 使用 disconnect() 和 reconnect() 方法</li>
                    <li><strong>样式配置:</strong> 支持颜色、线宽、虚线、箭头</li>
                    <li><strong>标签显示:</strong> 边中间可以显示文本标签</li>
                </ul>
            </div>
        </div>
    );
};

export default EdgeExample;
