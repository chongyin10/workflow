import React, { useEffect, useRef, useState } from 'react';
import { Graph } from '../core/Graph';
import { Node } from '../core/Node';
import { Shape } from '../core/Shape';
import { Edge, EdgeType } from '../core/Edge';
import { PortPosition, PortGroupOptions } from '../core/Port';

/**
 * PortExample - Port 连接桩组件使用示例
 * 
 * 展示功能：
 * - 连接桩的位置配置（top/right/bottom/left/center/自定义坐标）
 * - 连接桩的样式（大小、颜色、形状）
        - 连接桩的显示/隐藏控制
 * - 多连接桩布局
 * - 连接桩与边的交互
 */
export const PortExample: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<Graph | null>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

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
        // ========== 示例 1：基础方位端口 ==========
        const basicNode = graph.addNode({
            id: 'node-basic',
            label: '基础端口',
            x: 150,
            y: 150,
            shape: Shape.Rect,
            style: {
                width: 140,
                height: 100,
                backgroundColor: '#3b82f6',
                borderColor: '#2563eb',
                textColor: '#ffffff',
            },
        });

        // 添加四个基本方位的端口
        basicNode.addPort({
            id: 'port-top',
            position: 'top',
            visible: true,
            style: { fillColor: '#22c55e', strokeColor: '#16a34a', width: 12, height: 12, strokeWidth: 2 } as any,
        });
        basicNode.addPort({
            id: 'port-right',
            position: 'right',
            visible: true,
            style: { fillColor: '#f59e0b', strokeColor: '#d97706', width: 12, height: 12, strokeWidth: 2 } as any,
        });
        basicNode.addPort({
            id: 'port-bottom',
            position: 'bottom',
            visible: true,
            style: { fillColor: '#ef4444', strokeColor: '#dc2626', width: 12, height: 12, strokeWidth: 2 } as any,
        });
        basicNode.addPort({
            id: 'port-left',
            position: 'left',
            visible: true,
            style: { fillColor: '#8b5cf6', strokeColor: '#7c3aed', width: 12, height: 12, strokeWidth: 2 } as any,
        });

        // ========== 示例 2：多端口节点 ==========
        const multiPortNode = graph.addNode({
            id: 'node-multi',
            label: '多端口布局',
            x: 450,
            y: 150,
            shape: Shape.Rect,
            style: {
                width: 180,
                height: 120,
                backgroundColor: '#14b8a6',
                borderColor: '#0d9488',
                textColor: '#ffffff',
            },
        });

        // 使用 PortManager 批量添加多个端口，自动均匀分布
        multiPortNode.addPortGroup({
            id: 'top-ports',
            position: 'top',
            count: 3,
            portConfig: (index: number) => ({
                id: `port-multi-t${index + 1}`,
                label: `输入 ${index + 1}`,
                visible: true,
                style: { fillColor: '#22c55e', strokeColor: '#16a34a', width: 12, height: 12, strokeWidth: 2 } as any,
            }),
        });

        // 底部端口组
        multiPortNode.addPortGroup({
            id: 'bottom-ports',
            position: 'bottom',
            count: 3,
            portConfig: (index: number) => ({
                id: `port-multi-b${index + 1}`,
                label: `输出 ${index + 1}`,
                visible: true,
                style: { fillColor: '#ef4444', strokeColor: '#dc2626', width: 12, height: 12, strokeWidth: 2 } as any,
            }),
        });

        // 左右端口
        multiPortNode.addPort({ id: 'port-multi-l', position: 'left', visible: true });
        multiPortNode.addPort({ id: 'port-multi-r', position: 'right', visible: true });

        // ========== 示例 3：中心端口（圆形节点） ==========
        const centerPortNode = graph.addNode({
            id: 'node-center',
            label: '中心端口',
            x: 750,
            y: 150,
            shape: Shape.Circle,
            style: {
                width: 100,
                height: 100,
                backgroundColor: '#ec4899',
                borderColor: '#db2777',
                textColor: '#ffffff',
            },
        });

        centerPortNode.addPort({
            id: 'port-center',
            position: 'center',
            visible: true,
            style: { fillColor: '#ffffff', strokeColor: '#db2777', width: 16, height: 16, strokeWidth: 2 } as any,
        });

        // ========== 示例 4：端口大小样式对比 ==========
        const styleNode1 = graph.addNode({
            id: 'node-style1',
            label: '小端口',
            x: 100,
            y: 350,
            shape: Shape.Rect,
            style: {
                width: 100,
                height: 60,
                backgroundColor: '#f59e0b',
                borderColor: '#d97706',
                textColor: '#ffffff',
            },
        });
        styleNode1.addPort({
            id: 'port-small',
            position: 'right',
            visible: true,
            style: { width: 8, height: 8, fillColor: '#ffffff', strokeColor: '#d97706', strokeWidth: 2 } as any,
        });

        const styleNode2 = graph.addNode({
            id: 'node-style2',
            label: '中端口',
            x: 250,
            y: 350,
            shape: Shape.Rect,
            style: {
                width: 100,
                height: 60,
                backgroundColor: '#22c55e',
                borderColor: '#16a34a',
                textColor: '#ffffff',
            },
        });
        styleNode2.addPort({
            id: 'port-medium',
            position: 'right',
            visible: true,
            style: { width: 12, height: 12, fillColor: '#ffffff', strokeColor: '#16a34a', strokeWidth: 2 } as any,
        });

        const styleNode3 = graph.addNode({
            id: 'node-style3',
            label: '大端口',
            x: 400,
            y: 350,
            shape: Shape.Rect,
            style: {
                width: 100,
                height: 60,
                backgroundColor: '#3b82f6',
                borderColor: '#2563eb',
                textColor: '#ffffff',
            },
        });
        styleNode3.addPort({
            id: 'port-large',
            position: 'right',
            visible: true,
            style: { width: 20, height: 20, fillColor: '#ffffff', strokeColor: '#2563eb', strokeWidth: 2 } as any,
        });

        // ========== 示例 5：可切换显示端口的节点 ==========
        const toggleNode = graph.addNode({
            id: 'node-toggle',
            label: '可切换端口',
            x: 600,
            y: 350,
            shape: Shape.Rect,
            style: {
                width: 140,
                height: 80,
                backgroundColor: '#8b5cf6',
                borderColor: '#7c3aed',
                textColor: '#ffffff',
            },
        });
        toggleNode.addPort({ id: 'port-toggle-1', position: 'top', visible: true });
        toggleNode.addPort({ id: 'port-toggle-2', position: 'right', visible: false }); // 初始隐藏
        toggleNode.addPort({ id: 'port-toggle-3', position: 'bottom', visible: true });
        toggleNode.addPort({ id: 'port-toggle-4', position: 'left', visible: false }); // 初始隐藏

        // ========== 示例 6：连接演示 ==========
        const sourceNode = graph.addNode({
            id: 'node-source',
            label: '源节点',
            x: 200,
            y: 500,
            shape: Shape.Circle,
            style: {
                width: 80,
                height: 80,
                backgroundColor: '#ef4444',
                borderColor: '#dc2626',
                textColor: '#ffffff',
            },
        });
        sourceNode.addPort({ id: 'port-source-out', position: 'right', visible: true });

        const targetNode = graph.addNode({
            id: 'node-target',
            label: '目标节点',
            x: 500,
            y: 500,
            shape: Shape.Circle,
            style: {
                width: 80,
                height: 80,
                backgroundColor: '#22c55e',
                borderColor: '#16a34a',
                textColor: '#ffffff',
            },
        });
        targetNode.addPort({ id: 'port-target-in', position: 'left', visible: true });

        // 创建连接
        graph.addEdge({
            id: 'edge-demo',
            source: { nodeId: 'node-source', portId: 'port-source-out' },
            target: { nodeId: 'node-target', portId: 'port-target-in' },
            label: '端口连接',
            type: EdgeType.Bezier,
            style: { stroke: '#64748b', strokeWidth: 2 },
        });
    };

    // 切换端口可见性
    const togglePortVisibility = (portId: string) => {
        if (!graphRef.current || !selectedNodeId) return;

        const node = (graphRef.current as any).nodes.get(selectedNodeId);
        if (!node) return;

        const port = (node as any).ports.get(portId);
        if (port) {
            const newVisible = !port.isVisible();
            port.setVisible(newVisible);
            (graphRef.current as any)['scheduleRender']?.();
            console.log('端口可见性切换:', portId, newVisible);
        }
    };

    // 添加自定义位置端口
    const addCustomPort = (x: number, y: number) => {
        if (!graphRef.current || !selectedNodeId) return;

        const node = (graphRef.current as any).nodes.get(selectedNodeId);
        if (!node) return;

        const portCount = (node as any).ports.size;
        const portId = `port-custom-${portCount + 1}`;

        node.addPort({
            id: portId,
            position: { x, y },
            visible: true,
        });

        (graphRef.current as any)['scheduleRender']?.();
        console.log('添加自定义端口:', portId, `位置(${x}, ${y})`);
    };

    // 删除指定端口
    const removePort = (portId: string) => {
        if (!graphRef.current || !selectedNodeId) return;

        const node = (graphRef.current as any).nodes.get(selectedNodeId);
        if (!node) return;

        node.removePort(portId);
        (graphRef.current as any)['scheduleRender']?.();
        console.log('删除端口:', portId);
    };

    // 添加标准方位端口
    const addStandardPort = (position: PortPosition) => {
        if (!graphRef.current || !selectedNodeId) return;

        const node = (graphRef.current as any).nodes.get(selectedNodeId);
        if (!node) return;

        const portCount = (node as any).ports.size;
        const positionStr = typeof position === 'string' ? position : 'custom';
        const portId = `port-${positionStr}-${portCount + 1}`;

        node.addPort({
            id: portId,
            position,
            visible: true,
        });

        (graphRef.current as any)['scheduleRender']?.();
    };

    // 批量添加端口组（演示 PortManager 功能）
    const addPortGroup = (position: 'top' | 'right' | 'bottom' | 'left', count: number) => {
        if (!graphRef.current || !selectedNodeId) return;

        const node = (graphRef.current as any).nodes.get(selectedNodeId);
        if (!node) return;

        const groupId = `group-${position}-${Date.now()}`;
        const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];

        node.addPortGroup({
            id: groupId,
            position,
            count,
            portConfig: (index: number) => ({
                id: `${groupId}-port-${index}`,
                label: `${position} ${index + 1}`,
                visible: true,
                style: {
                    fillColor: colors[index % colors.length],
                    strokeColor: colors[index % colors.length],
                    width: 12,
                    height: 12,
                    strokeWidth: 2,
                } as any,
            }),
        });

        (graphRef.current as any)['scheduleRender']?.();
        console.log(`添加 ${count} 个${position}端口，自动均匀分布`);
    };

    // 清除选中节点的所有端口
    const clearAllPorts = () => {
        if (!graphRef.current || !selectedNodeId) return;

        const node = (graphRef.current as any).nodes.get(selectedNodeId);
        if (!node) return;

        node.clearPorts();
        (graphRef.current as any)['scheduleRender']?.();
        console.log('清除所有端口');
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
            <h2>🔌 Port 连接桩组件示例</h2>
            <p>展示连接桩的位置、样式、显示/隐藏控制</p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold' }}>添加端口:</span>
                <button onClick={() => addStandardPort('top')} disabled={!selectedNodeId} style={buttonStyle(Boolean(selectedNodeId), '#3b82f6')}>
                    + 顶部
                </button>
                <button onClick={() => addStandardPort('bottom')} disabled={!selectedNodeId} style={buttonStyle(Boolean(selectedNodeId), '#3b82f6')}>
                    + 底部
                </button>
                <button onClick={() => addStandardPort('left')} disabled={!selectedNodeId} style={buttonStyle(Boolean(selectedNodeId), '#3b82f6')}>
                    + 左侧
                </button>
                <button onClick={() => addStandardPort('right')} disabled={!selectedNodeId} style={buttonStyle(Boolean(selectedNodeId), '#3b82f6')}>
                    + 右侧
                </button>
                <button onClick={() => addStandardPort('center')} disabled={!selectedNodeId} style={buttonStyle(Boolean(selectedNodeId), '#8b5cf6')}>
                    + 中心
                </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold' }}>自定义位置:</span>
                <button onClick={() => addCustomPort(0.25, 0)} disabled={!selectedNodeId} style={buttonStyle(Boolean(selectedNodeId), '#22c55e')}>
                    + 左上
                </button>
                <button onClick={() => addCustomPort(0.75, 0)} disabled={!selectedNodeId} style={buttonStyle(Boolean(selectedNodeId), '#22c55e')}>
                    + 右上
                </button>
                <button onClick={() => addCustomPort(0.25, 1)} disabled={!selectedNodeId} style={buttonStyle(Boolean(selectedNodeId), '#22c55e')}>
                    + 左下
                </button>
                <button onClick={() => addCustomPort(0.75, 1)} disabled={!selectedNodeId} style={buttonStyle(Boolean(selectedNodeId), '#22c55e')}>
                    + 右下
                </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold' }}>批量添加(自适应分布):</span>
                <button onClick={() => addPortGroup('top', 3)} disabled={!selectedNodeId} style={buttonStyle(Boolean(selectedNodeId), '#ec4899')}>
                    + 顶部x3
                </button>
                <button onClick={() => addPortGroup('bottom', 4)} disabled={!selectedNodeId} style={buttonStyle(Boolean(selectedNodeId), '#ec4899')}>
                    + 底部x4
                </button>
                <button onClick={() => addPortGroup('left', 3)} disabled={!selectedNodeId} style={buttonStyle(Boolean(selectedNodeId), '#ec4899')}>
                    + 左侧x3
                </button>
                <button onClick={() => addPortGroup('right', 5)} disabled={!selectedNodeId} style={buttonStyle(Boolean(selectedNodeId), '#ec4899')}>
                    + 右侧x5
                </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button onClick={clearAllPorts} disabled={!selectedNodeId} style={buttonStyle(Boolean(selectedNodeId), '#64748b')}>
                    🗑️ 清除所有端口
                </button>
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
                <h3>📚 Port 位置类型</h3>
                <ul style={{ lineHeight: '1.8' }}>
                    <li><strong>方位字符串:</strong> 'top' | 'right' | 'bottom' | 'left' | 'center'</li>
                    <li><strong>相对坐标:</strong> {'{ x: number, y: number }'}，范围 0-1 表示在节点上的相对位置</li>
                    <li><strong>自动计算:</strong> 根据位置类型自动计算端口在节点边缘或中心的坐标</li>
                </ul>
                <h3>🎨 端口样式</h3>
                <ul style={{ lineHeight: '1.8' }}>
                    <li><strong>大小:</strong> radius 控制端口圆点的半径</li>
                    <li><strong>颜色:</strong> fill (填充色), stroke (边框色)</li>
                    <li><strong>状态颜色:</strong> hoverFill, selectedFill, hoverStroke, selectedStroke</li>
                    <li><strong>可见性:</strong> visible 控制端口是否显示</li>
                </ul>
                <h3>🔧 常用方法</h3>
                <ul style={{ lineHeight: '1.8' }}>
                    <li><strong>node.addPort(options):</strong> 添加新端口到节点</li>
                    <li><strong>node.addPortGroup(options):</strong> 批量添加同一侧的多个端口（自动均匀分布）</li>
                    <li><strong>node.removePort(portId):</strong> 从节点删除指定端口</li>
                    <li><strong>node.getPort(portId):</strong> 获取指定 ID 的端口</li>
                    <li><strong>node.getAllPorts():</strong> 获取所有端口</li>
                    <li><strong>port.setVisible(boolean):</strong> 设置端口可见性</li>
                    <li><strong>port.getConnectionPoint():</strong> 获取端口的连接点坐标</li>
                </ul>
                <h3>🎯 PortGroup 批量添加端口</h3>
                <ul style={{ lineHeight: '1.8' }}>
                    <li><strong>自动布局:</strong> 同一侧的多个端口自动均匀分布</li>
                    <li><strong>自适应间距:</strong> 根据节点大小自动计算最佳间距</li>
                    <li><strong>自定义配置:</strong> 支持为每个端口单独配置样式</li>
                    <li><strong>动态更新:</strong> 支持增删端口时自动重新布局</li>
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

export default PortExample;
