import React, { useEffect, useRef, useState } from 'react';
import { Graph, Dnd, Node } from '../lib';

/**
 * Dnd 拖拽示例
 * 
 * 演示如何使用 Dnd 插件从外部拖拽节点到画布中
 */
export default function DndExample() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<Graph | null>(null);
    const dndRef = useRef<Dnd | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const addLog = (message: string) => {
        setLogs(prev => [...prev.slice(-9), `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    useEffect(() => {
        if (!canvasRef.current) return;

        // 创建画布
        const graph = new Graph({
            container: canvasRef.current,
            width: 800,
            height: 500,
            backgroundColor: '#f8fafc',
            grid: {
                enabled: true,
                size: 20,
                color: '#e2e8f0',
            },
        });
        graphRef.current = graph;

        // 创建 Dnd 插件
        const dnd = new Dnd({
            graph,
            enabled: true,
            onDragStart: (e) => {
                setIsDragging(true);
                addLog(`🚀 拖拽开始: ${e.nodeOptions?.label || '未命名节点'}`);
            },
            onDrag: (e) => {
                // 可以在这里实时更新拖拽位置
                // console.log('拖拽中:', e.position);
            },
            onDragEnter: () => {
                addLog('📥 进入画布区域');
            },
            onDragLeave: () => {
                addLog('📤 离开画布区域');
            },
            onDrop: (e) => {
                addLog(`✅ 放置节点: ${e.nodeOptions?.label} 在 (${Math.round(e.position.x)}, ${Math.round(e.position.y)})`);
                return true; // 返回 true 允许放置
            },
            onDragEnd: () => {
                setIsDragging(false);
                addLog('🏁 拖拽结束');
            },
            // 可选：验证放置位置
            validateDrop: (position) => {
                // 示例：只允许放置在 x > -200 的区域
                return position.x > -200;
            },
        });
        dndRef.current = dnd;

        // 添加一些初始节点
        graph.addNode({
            id: 'start',
            label: '开始',
            x: 0,
            y: -100,
            style: { backgroundColor: '#22c55e', borderColor: '#16a34a' },
        });

        graph.addNode({
            id: 'end',
            label: '结束',
            x: 0,
            y: 100,
            style: { backgroundColor: '#ef4444', borderColor: '#dc2626' },
        });

        addLog('🎨 画布初始化完成');

        return () => {
            dnd.destroy();
            graph.destroy();
        };
    }, []);

    // 处理工具栏项的拖拽开始
    const handleDragStart = (nodeTemplate: { label: string; style?: any }) => (e: React.DragEvent) => {
        if (!dndRef.current) return;

        // 生成唯一ID
        const nodeId = `node-${Date.now()}`;

        // 启动拖拽
        dndRef.current.start({
            id: nodeId,
            label: nodeTemplate.label,
            x: 0, // 位置会被自动设置为放置位置
            y: 0,
            style: nodeTemplate.style,
        }, e.nativeEvent);
    };

    // 工具栏配置
    const toolbarItems = [
        { label: '处理节点', style: { backgroundColor: '#3b82f6', borderColor: '#2563eb' } },
        { label: '判断节点', style: { backgroundColor: '#f59e0b', borderColor: '#d97706' } },
        { label: '数据节点', style: { backgroundColor: '#8b5cf6', borderColor: '#7c3aed' } },
        { label: '输出节点', style: { backgroundColor: '#ec4899', borderColor: '#db2777' } },
    ];

    // 清空画布
    const clearCanvas = () => {
        graphRef.current?.clearNodes();
        addLog('🗑️ 清空画布');
    };

    // 切换 Dnd 启用状态
    const [enabled, setEnabled] = useState(true);
    const toggleDnd = () => {
        const newEnabled = !enabled;
        setEnabled(newEnabled);
        dndRef.current?.setEnabled(newEnabled);
        addLog(newEnabled ? '✅ Dnd 已启用' : '❌ Dnd 已禁用');
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <h2>🎯 Dnd 拖拽示例</h2>
            <p>从左侧工具栏拖拽节点到画布中，体验完整的拖拽交互功能。</p>

            <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                {/* 工具栏 */}
                <div
                    style={{
                        width: '150px',
                        padding: '15px',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                    }}
                >
                    <h4 style={{ marginTop: 0, marginBottom: '15px' }}>📦 组件库</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {toolbarItems.map((item, index) => (
                            <div
                                key={index}
                                draggable
                                onDragStart={handleDragStart(item)}
                                style={{
                                    padding: '12px 16px',
                                    backgroundColor: item.style.backgroundColor,
                                    color: 'white',
                                    borderRadius: '6px',
                                    cursor: 'grab',
                                    textAlign: 'center',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    userSelect: 'none',
                                    transition: 'transform 0.1s',
                                }}
                                onMouseDown={(e) => {
                                    (e.currentTarget as HTMLElement).style.transform = 'scale(0.95)';
                                }}
                                onMouseUp={(e) => {
                                    (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                                }}
                            >
                                {item.label}
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #cbd5e1' }}>
                        <h4 style={{ marginTop: 0, marginBottom: '10px' }}>⚙️ 控制</h4>
                        <button
                            onClick={toggleDnd}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                marginBottom: '8px',
                                backgroundColor: enabled ? '#22c55e' : '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '13px',
                            }}
                        >
                            {enabled ? '禁用 Dnd' : '启用 Dnd'}
                        </button>
                        <button
                            onClick={clearCanvas}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                backgroundColor: '#64748b',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '13px',
                            }}
                        >
                            清空画布
                        </button>
                    </div>
                </div>

                {/* 画布区域 */}
                <div style={{ position: 'relative' }}>
                    <div
                        ref={canvasRef}
                        style={{
                            width: '800px',
                            height: '500px',
                            border: `2px solid ${isDragging ? '#3b82f6' : '#e2e8f0'}`,
                            borderRadius: '8px',
                            overflow: 'hidden',
                            transition: 'border-color 0.2s',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                    />
                    {isDragging && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                padding: '6px 12px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                borderRadius: '4px',
                                fontSize: '12px',
                                pointerEvents: 'none',
                            }}
                        >
                            拖拽中...
                        </div>
                    )}
                </div>

                {/* 日志区域 */}
                <div
                    style={{
                        width: '300px',
                        padding: '15px',
                        backgroundColor: '#1e293b',
                        borderRadius: '8px',
                        color: '#e2e8f0',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        maxHeight: '500px',
                        overflow: 'auto',
                    }}
                >
                    <h4 style={{ marginTop: 0, marginBottom: '10px', color: '#94a3b8' }}>📋 事件日志</h4>
                    {logs.length === 0 ? (
                        <div style={{ color: '#64748b', fontStyle: 'italic' }}>暂无日志...</div>
                    ) : (
                        logs.map((log, index) => (
                            <div
                                key={index}
                                style={{
                                    padding: '4px 0',
                                    borderBottom: index < logs.length - 1 ? '1px solid #334155' : 'none',
                                }}
                            >
                                {log}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 代码示例 */}
            <div
                style={{
                    marginTop: '30px',
                    padding: '20px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                }}
            >
                <h4>💡 使用说明</h4>
                <pre style={{ margin: 0, overflow: 'auto', fontSize: '13px' }}>
                    {`// 1. 创建 Dnd 插件
const dnd = new Dnd({
    graph,
    enabled: true,
    onDragStart: (e) => console.log('拖拽开始'),
    onDrop: (e) => {
        console.log('放置位置:', e.position);
        return true; // 允许放置
    },
});

// 2. 在拖拽开始时调用 dnd.start()
element.addEventListener('dragstart', (e) => {
    dnd.start({
        id: 'node-1',
        label: '新节点',
        x: 0,
        y: 0,
    }, e);
});`}
                </pre>
            </div>
        </div>
    );
}
