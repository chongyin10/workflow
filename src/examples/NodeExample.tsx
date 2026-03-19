import React, { useEffect, useRef, useState } from 'react';
import { Graph } from '../core/Graph';
import { Node } from '../core/Node';
import { Shape } from '../core/Shape';
import { Edge, EdgeType } from '../core/Edge';
import { PortPosition } from '../core/Port';

/**
 * NodeExample - Node 节点组件使用示例
 * 
 * 展示功能：
 * - 多种形状：矩形、圆形、椭圆、多边形
 * - 节点样式：颜色、边框、圆角、阴影
 * - 连接桩管理：添加、删除、定位
 * - 节点位置设置和移动
 * - 选中状态和高亮效果
 */
export const NodeExample: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<Graph | null>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [nodeCount, setNodeCount] = useState(0);

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
                setSelectedNodeId(node?.getId() || null);
                console.log('选中节点:', node?.getId());
            },
        });

        graphRef.current = graph;
        createExampleData(graph);
        setNodeCount(graph['nodes'].size);

        return () => {
            graph.destroy();
        };
    }, []);

    // 创建示例数据
    const createExampleData = (graph: Graph) => {
        // ========== 第 1 行：基础形状展示 ==========
        
        // 矩形节点 - 蓝色
        const rectNode = graph.addNode({
            id: 'node-rect',
            label: '矩形',
            x: 150,
            y: 100,
            shape: Shape.Rect,
            style: {
                width: 120,
                height: 80,
                backgroundColor: '#3b82f6',
                borderColor: '#2563eb',
                borderWidth: 2,
                borderRadius: 8,
                textColor: '#ffffff',
                hoverBackgroundColor: '#60a5fa',
            },
        });
        rectNode.addPort({ id: 'port-rect-left', position: 'left', visible: true });
        rectNode.addPort({ id: 'port-rect-right', position: 'right', visible: true });

        // 圆形节点 - 绿色
        const circleNode = graph.addNode({
            id: 'node-circle',
            label: '圆形',
            x: 350,
            y: 100,
            shape: Shape.Circle,
            style: {
                width: 100,
                height: 100,
                backgroundColor: '#22c55e',
                borderColor: '#16a34a',
                borderWidth: 2,
                textColor: '#ffffff',
                hoverBackgroundColor: '#4ade80',
            },
        });
        circleNode.addPort({ id: 'port-circle-top', position: 'top', visible: true });
        circleNode.addPort({ id: 'port-circle-bottom', position: 'bottom', visible: true });

        // 椭圆节点 - 紫色
        const ellipseNode = graph.addNode({
            id: 'node-ellipse',
            label: '椭圆',
            x: 550,
            y: 100,
            shape: Shape.Ellipse,
            style: {
                width: 140,
                height: 80,
                backgroundColor: '#8b5cf6',
                borderColor: '#7c3aed',
                borderWidth: 2,
                textColor: '#ffffff',
                hoverBackgroundColor: '#a78bfa',
            },
        });
        ellipseNode.addPort({ id: 'port-ellipse-left', position: 'left', visible: true });
        ellipseNode.addPort({ id: 'port-ellipse-right', position: 'right', visible: true });

        // 菱形（多边形）- 橙色
        const diamondNode = graph.addNode({
            id: 'node-diamond',
            label: '菱形',
            x: 750,
            y: 100,
            shape: {
                type: Shape.Polygon,
                points: [
                    { x: 0, y: -50 },
                    { x: 60, y: 0 },
                    { x: 0, y: 50 },
                    { x: -60, y: 0 },
                ],
            },
            style: {
                width: 120,
                height: 100,
                backgroundColor: '#f59e0b',
                borderColor: '#d97706',
                borderWidth: 2,
                textColor: '#ffffff',
                hoverBackgroundColor: '#fbbf24',
            },
        });
        diamondNode.addPort({ id: 'port-diamond-top', position: 'top', visible: true });
        diamondNode.addPort({ id: 'port-diamond-bottom', position: 'bottom', visible: true });

        // ========== 第 2 行：样式变体 ==========
        
        // 带阴影的节点
        const shadowNode = graph.addNode({
            id: 'node-shadow',
            label: '阴影效果',
            x: 150,
            y: 250,
            shape: Shape.Rect,
            style: {
                width: 120,
                height: 70,
                backgroundColor: '#0ea5e9',
                borderColor: '#0284c7',
                borderWidth: 2,
                borderRadius: 12,
                textColor: '#ffffff',
                shadowColor: 'rgba(14, 165, 233, 0.4)',
                shadowBlur: 15,
                shadowOffsetX: 4,
                shadowOffsetY: 4,
            },
        });

        // 虚线边框节点
        const dashedNode = graph.addNode({
            id: 'node-dashed',
            label: '虚线边框',
            x: 350,
            y: 250,
            shape: Shape.Rect,
            style: {
                width: 120,
                height: 70,
                backgroundColor: '#f8fafc',
                borderColor: '#64748b',
                borderWidth: 2,
                borderRadius: 8,
                textColor: '#64748b',
            },
        });

        // 渐变背景节点（通过纯色模拟）
        const gradientNode = graph.addNode({
            id: 'node-gradient',
            label: '丰富样式',
            x: 550,
            y: 250,
            shape: Shape.Rect,
            style: {
                width: 120,
                height: 70,
                backgroundColor: '#ec4899',
                borderColor: '#db2777',
                borderWidth: 3,
                borderRadius: 20,
                textColor: '#ffffff',
                fontSize: 14,
            },
        });

        // 六边形节点
        const hexNode = graph.addNode({
            id: 'node-hex',
            label: '六边形',
            x: 750,
            y: 250,
            shape: {
                type: Shape.Polygon,
                points: [
                    { x: -40, y: -35 },
                    { x: 40, y: -35 },
                    { x: 80, y: 0 },
                    { x: 40, y: 35 },
                    { x: -40, y: 35 },
                    { x: -80, y: 0 },
                ],
            },
            style: {
                width: 160,
                height: 70,
                backgroundColor: '#14b8a6',
                borderColor: '#0d9488',
                borderWidth: 2,
                textColor: '#ffffff',
            },
        });

        // ========== 第 3 行：多端口演示 ==========
        
        const multiPortNode = graph.addNode({
            id: 'node-multiport',
            label: '多端口节点',
            x: 250,
            y: 400,
            shape: Shape.Rect,
            style: {
                width: 160,
                height: 100,
                backgroundColor: '#6366f1',
                borderColor: '#4f46e5',
                borderWidth: 2,
                borderRadius: 8,
                textColor: '#ffffff',
            },
        });

        // 添加多个方向的端口
        multiPortNode.addPort({ id: 'port-multi-top1', position: 'top', visible: true });
        multiPortNode.addPort({ id: 'port-multi-top2', position: { x: 0.7, y: 0 }, visible: true });
        multiPortNode.addPort({ id: 'port-multi-bottom1', position: 'bottom', visible: true });
        multiPortNode.addPort({ id: 'port-multi-bottom2', position: { x: 0.3, y: 1 }, visible: true });
        multiPortNode.addPort({ id: 'port-multi-left', position: 'left', visible: true });
        multiPortNode.addPort({ id: 'port-multi-right', position: 'right', visible: true });

        // 连接目标节点
        const targetNode = graph.addNode({
            id: 'node-target',
            label: '目标节点',
            x: 550,
            y: 400,
            shape: Shape.Circle,
            style: {
                width: 100,
                height: 100,
                backgroundColor: '#ef4444',
                borderColor: '#dc2626',
                borderWidth: 2,
                textColor: '#ffffff',
            },
        });
        targetNode.addPort({ id: 'port-target-left', position: 'left', visible: true });
        targetNode.addPort({ id: 'port-target-top', position: 'top', visible: true });
        targetNode.addPort({ id: 'port-target-bottom', position: 'bottom', visible: true });

        // 连接多端口到目标
        graph.addEdge({
            id: 'edge-multi-1',
            source: { nodeId: 'node-multiport', portId: 'port-multi-right' },
            target: { nodeId: 'node-target', portId: 'port-target-left' },
            type: EdgeType.Bezier,
            style: { stroke: '#6366f1', strokeWidth: 2 },
        });

        // ========== 第 4 行：动态节点区域 ==========
        const dynamicNode = graph.addNode({
            id: 'node-dynamic',
            label: '动态节点\n(点击按钮操作)',
            x: 400,
            y: 550,
            shape: Shape.Rect,
            style: {
                width: 180,
                height: 80,
                backgroundColor: '#f43f5e',
                borderColor: '#e11d48',
                borderWidth: 2,
                borderRadius: 8,
                textColor: '#ffffff',
            },
        });
        setSelectedNodeId('node-dynamic');
    };

    // 添加端口到选中节点
    const handleAddPort = (position: PortPosition) => {
        if (!graphRef.current || !selectedNodeId) return;
        
        const node = (graphRef.current as any).nodes.get(selectedNodeId);
        if (!node) return;

        const portCount = (node as any).ports.size;
        const portId = `port-${selectedNodeId}-${portCount + 1}`;
        
        node.addPort({
            id: portId,
            position,
            visible: true,
        });
        
        // 触发重新渲染
        (graphRef.current as any)['scheduleRender']?.();
        console.log('添加端口:', portId, '位置:', position);
    };

    // 删除选中节点的最后一个端口
    const handleRemovePort = () => {
        if (!graphRef.current || !selectedNodeId) return;
        
        const node = (graphRef.current as any).nodes.get(selectedNodeId);
        if (!node) return;

        const ports = Array.from((node as any).ports.values());
        if (ports.length > 0) {
            const lastPort = ports[ports.length - 1] as any;
            node.removePort(lastPort.getId());
            // 触发重新渲染
            (graphRef.current as any)['scheduleRender']?.();
            console.log('删除端口:', lastPort.getId());
        }
    };

    // 移动选中节点
    const handleMoveNode = (deltaX: number, deltaY: number) => {
        if (!graphRef.current || !selectedNodeId) return;
        
        const node = (graphRef.current as any).nodes.get(selectedNodeId);
        if (!node) return;

        node.move(deltaX, deltaY);
        // 触发重新渲染
        (graphRef.current as any)['scheduleRender']?.();
        console.log('移动节点:', selectedNodeId, `偏移(${deltaX}, ${deltaY})`);
    };

    // 设置节点样式
    const handleSetStyle = () => {
        if (!graphRef.current || !selectedNodeId) return;
        
        const node = (graphRef.current as any).nodes.get(selectedNodeId);
        if (!node) return;

        const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        // 更新节点数据来模拟样式变化
        node.setData({
            ...node.getData(),
            customColor: randomColor,
        });
        
        // 触发重新渲染
        (graphRef.current as any)['scheduleRender']?.();
    };

    // 删除选中节点
    const handleRemoveNode = () => {
        if (!graphRef.current || !selectedNodeId) return;
        
        graphRef.current.removeNode(selectedNodeId);
        setSelectedNodeId(null);
        setNodeCount(graphRef.current['nodes'].size);
    };

    // 添加新节点
    const handleAddNode = () => {
        if (!graphRef.current) return;
        
        const id = `node-new-${Date.now()}`;
        const x = 200 + Math.random() * 400;
        const y = 300 + Math.random() * 150;
        
        const node = graphRef.current.addNode({
            id,
            label: `新节点 ${(graphRef.current as any).nodes.size + 1}`,
            x,
            y,
            shape: Math.random() > 0.5 ? Shape.Rect : Shape.Circle,
            style: {
                width: 100,
                height: 60,
                backgroundColor: '#64748b',
                borderColor: '#475569',
                textColor: '#ffffff',
            },
        });
        
        node.addPort({ id: `port-${id}-left`, position: 'left', visible: true });
        node.addPort({ id: `port-${id}-right`, position: 'right', visible: true });
        
        setNodeCount((graphRef.current as any).nodes.size);
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
            <h2>📦 Node 节点组件示例</h2>
            <p>展示不同形状、样式、端口管理和交互功能</p>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold' }}>选中节点操作:</span>
                <button onClick={() => handleAddPort('top')} disabled={!selectedNodeId} style={buttonStyle(Boolean(selectedNodeId), '#3b82f6')}>
                    + 顶部端口
                </button>
                <button onClick={() => handleAddPort('bottom')} disabled={!selectedNodeId} style={buttonStyle(Boolean(selectedNodeId), '#3b82f6')}>
                    + 底部端口
                </button>
                <button onClick={() => handleAddPort('left')} disabled={!selectedNodeId} style={buttonStyle(Boolean(selectedNodeId), '#3b82f6')}>
                    + 左侧端口
                </button>
                <button onClick={() => handleAddPort('right')} disabled={!selectedNodeId} style={buttonStyle(Boolean(selectedNodeId), '#3b82f6')}>
                    + 右侧端口
                </button>
                <button onClick={handleRemovePort} disabled={!selectedNodeId} style={buttonStyle(Boolean(selectedNodeId), '#ef4444')}>
                    - 删除端口
                </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button onClick={() => handleMoveNode(-20, 0)} disabled={!selectedNodeId} style={buttonStyle(Boolean(selectedNodeId), '#8b5cf6')}>
                    ← 左移
                </button>
                <button onClick={() => handleMoveNode(20, 0)} disabled={!selectedNodeId} style={buttonStyle(Boolean(selectedNodeId), '#8b5cf6')}>
                    右移 →
                </button>
                <button onClick={() => handleMoveNode(0, -20)} disabled={!selectedNodeId} style={buttonStyle(Boolean(selectedNodeId), '#8b5cf6')}>
                    ↑ 上移
                </button>
                <button onClick={() => handleMoveNode(0, 20)} disabled={!selectedNodeId} style={buttonStyle(Boolean(selectedNodeId), '#8b5cf6')}>
                    下移 ↓
                </button>
                <button onClick={handleSetStyle} disabled={!selectedNodeId} style={buttonStyle(Boolean(selectedNodeId), '#f59e0b')}>
                    🎨 随机样式
                </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button onClick={handleAddNode} style={buttonStyle(true, '#22c55e')}>
                    + 添加节点
                </button>
                <button onClick={handleRemoveNode} disabled={!selectedNodeId} style={buttonStyle(Boolean(selectedNodeId), '#dc2626')}>
                    - 删除节点
                </button>
                <span style={{ marginLeft: 'auto', color: '#64748b' }}>
                    节点数量: {nodeCount}
                </span>
            </div>

            {selectedNodeId && (
                <div style={{ 
                    padding: '10px', 
                    background: '#e0f2fe', 
                    borderRadius: '4px',
                    marginBottom: '15px',
                }}>
                    <strong>选中节点:</strong> {selectedNodeId}
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
                <h3>📚 Node 形状类型</h3>
                <ul style={{ lineHeight: '1.8' }}>
                    <li><strong>Rect (矩形):</strong> 标准矩形，支持圆角</li>
                    <li><strong>Circle (圆形):</strong> 正圆形，宽高相同时显示为圆</li>
                    <li><strong>Ellipse (椭圆):</strong> 椭圆形，可设置不同宽高</li>
                    <li><strong>Polygon (多边形):</strong> 通过 points 定义任意多边形，如菱形、六边形</li>
                </ul>
                <h3>🎨 样式属性</h3>
                <ul style={{ lineHeight: '1.8' }}>
                    <li><strong>背景/边框:</strong> backgroundColor, borderColor, borderWidth</li>
                    <li><strong>圆角:</strong> borderRadius</li>
                    <li><strong>阴影:</strong> shadowColor, shadowBlur, shadowOffsetX/Y</li>
                    <li><strong>文本:</strong> textColor, fontSize, fontWeight</li>
                    <li><strong>交互:</strong> hoverBackgroundColor, selectedBorderColor</li>
                </ul>
                <h3>🔌 端口管理</h3>
                <ul style={{ lineHeight: '1.8' }}>
                    <li><strong>位置:</strong> 支持方位字符串 ('top'|'right'|'bottom'|'left'|'center') 或相对坐标 {`{x, y}`}</li>
                    <li><strong>方法:</strong> addPort(), removePort(), getPort(), getAllPorts()</li>
                </ul>
            </div>
        </div>
    );
};

// 按钮样式辅助函数
const buttonStyle = (enabled: boolean, color: string): React.CSSProperties => ({
    padding: '6px 12px',
    background: enabled ? color : '#ccc',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: enabled ? 'pointer' : 'not-allowed',
    fontSize: '13px',
});

export default NodeExample;
