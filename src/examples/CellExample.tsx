import React, { useEffect, useRef, useState } from 'react';
import { Graph } from '../core/Graph';
import { Node } from '../core/Node';
import { Shape } from '../core/Shape';

/**
 * CellExample - Cell 基类组件使用示例
 * 
 * 展示功能：
 * - Cell 作为所有图形元素的抽象基类
 * - id、label、data 等基本属性
 * - isSelected、isHovered 状态管理
 * - toJSON() / fromJSON() 序列化
 * - clone() 克隆功能
 * - 自定义数据绑定
 */
export const CellExample: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<Graph | null>(null);
    const [selectedCell, setSelectedCell] = useState<any>(null);
    const [cellData, setCellData] = useState<Record<string, any>>({});

    useEffect(() => {
        if (!containerRef.current) return;

        const graph = new Graph({
            container: containerRef.current,
            width: 900,
            height: 500,
            draggable: true,
            scalable: true,
            backgroundColor: '#f8fafc',
            grid: { enabled: true, size: 20, color: '#e2e8f0' },
            onNodeSelect: (node) => {
                setSelectedCell(node);
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
        // ========== 示例 1：基础 Cell 属性 ==========
        const cell1 = graph.addNode({
            id: 'cell-basic',
            label: '基础 Cell',
            x: 150,
            y: 120,
            shape: Shape.Rect,
            style: {
                width: 140,
                height: 80,
                backgroundColor: '#3b82f6',
                borderColor: '#2563eb',
                textColor: '#ffffff',
            },
            data: { type: 'basic', priority: 1 },
        });

        // ========== 示例 2：带自定义数据的 Cell ==========
        const cell2 = graph.addNode({
            id: 'cell-data',
            label: '数据 Cell',
            x: 400,
            y: 120,
            shape: Shape.Circle,
            style: {
                width: 100,
                height: 100,
                backgroundColor: '#22c55e',
                borderColor: '#16a34a',
                textColor: '#ffffff',
            },
            data: {
                category: 'process',
                metadata: {
                    author: 'admin',
                    createdAt: new Date().toISOString(),
                    version: '1.0.0',
                },
                tags: ['important', 'reviewed'],
            },
        });

        // ========== 示例 3：可切换状态的 Cell ==========
        const cell3 = graph.addNode({
            id: 'cell-state',
            label: '状态 Cell',
            x: 650,
            y: 120,
            shape: Shape.Rect,
            style: {
                width: 140,
                height: 80,
                backgroundColor: '#f59e0b',
                borderColor: '#d97706',
                textColor: '#ffffff',
            },
            data: { status: 'pending', count: 0 },
        });

        // ========== 示例 4：层级结构 Cell ==========
        const parentCell = graph.addNode({
            id: 'cell-parent',
            label: '父 Cell',
            x: 250,
            y: 300,
            shape: Shape.Rect,
            style: {
                width: 160,
                height: 100,
                backgroundColor: '#8b5cf6',
                borderColor: '#7c3aed',
                textColor: '#ffffff',
            },
            data: { level: 'parent', children: ['cell-child'] },
        });

        const childCell = graph.addNode({
            id: 'cell-child',
            label: '子 Cell',
            x: 550,
            y: 300,
            shape: Shape.Circle,
            style: {
                width: 90,
                height: 90,
                backgroundColor: '#ec4899',
                borderColor: '#db2777',
                textColor: '#ffffff',
            },
            data: { level: 'child', parent: 'cell-parent' },
        });

        // 更新状态
        setCellData({
            'cell-basic': cell1.getData(),
            'cell-data': cell2.getData(),
            'cell-state': cell3.getData(),
            'cell-parent': parentCell.getData(),
            'cell-child': childCell.getData(),
        });
    };

    // 更新 Cell 数据
    const updateCellData = (key: string, value: any) => {
        if (!graphRef.current || !selectedCell) return;

        const currentData = selectedCell.getData() || {};
        const newData = { ...currentData, [key]: value };
        selectedCell.setData(newData);

        setCellData(prev => ({
            ...prev,
            [selectedCell.getId()]: newData,
        }));

        console.log('更新 Cell 数据:', selectedCell.getId(), newData);
    };

    // 更新 Cell 标签
    const updateCellLabel = (label: string) => {
        if (!graphRef.current || !selectedCell) return;

        selectedCell.setLabel(label);
        (graphRef.current as any)['scheduleRender']?.();
        console.log('更新 Cell 标签:', selectedCell.getId(), label);
    };

    // 克隆 Cell
    const cloneCell = () => {
        if (!graphRef.current || !selectedCell) return;

        const cloned = selectedCell.clone();
        const originalPos = (selectedCell as Node).getPosition();
        
        // 在克隆的 Cell 旁边创建新节点
        const newNode = graphRef.current.addNode({
            id: `cell-clone-${Date.now()}`,
            label: `${cloned.getLabel()} (克隆)`,
            x: originalPos.x + 180,
            y: originalPos.y,
            shape: Shape.Rect,
            style: (selectedCell as Node).getStyle(),
            data: cloned.getData(),
        });

        setCellData(prev => ({
            ...prev,
            [newNode.getId()]: newNode.getData(),
        }));

        console.log('克隆 Cell:', selectedCell.getId(), '->', newNode.getId());
    };

    // 序列化为 JSON
    const serializeCell = () => {
        if (!selectedCell) return;

        const json = selectedCell.toJSON();
        console.log('Cell JSON:', JSON.stringify(json, null, 2));
        alert(JSON.stringify(json, null, 2));
    };

    // 切换选中状态
    const toggleSelected = () => {
        if (!graphRef.current || !selectedCell) return;

        const newSelected = !selectedCell.getSelected?.();
        if (newSelected) {
            graphRef.current.selectNode(selectedCell.getId());
        } else {
            graphRef.current.selectNode(null);
        }
    };

    // 添加新 Cell
    const addNewCell = () => {
        if (!graphRef.current) return;

        const id = `cell-new-${Date.now()}`;
        const x = 100 + Math.random() * 400;
        const y = 100 + Math.random() * 200;

        const newCell = graphRef.current.addNode({
            id,
            label: `新 Cell`,
            x,
            y,
            shape: Math.random() > 0.5 ? Shape.Rect : Shape.Circle,
            style: {
                width: 120,
                height: 70,
                backgroundColor: '#64748b',
                borderColor: '#475569',
                textColor: '#ffffff',
            },
            data: { created: new Date().toISOString() },
        });

        setCellData(prev => ({
            ...prev,
            [id]: newCell.getData(),
        }));
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
            <h2>🧱 Cell 基类组件示例</h2>
            <p>展示 Cell 作为所有图形元素基类的核心功能</p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
                <button onClick={addNewCell} style={buttonStyle('#22c55e')}>
                    + 添加 Cell
                </button>
                <button onClick={cloneCell} disabled={!selectedCell} style={buttonStyle(selectedCell ? '#8b5cf6' : '#ccc')}>
                    📋 克隆
                </button>
                <button onClick={serializeCell} disabled={!selectedCell} style={buttonStyle(selectedCell ? '#3b82f6' : '#ccc')}>
                    📤 序列化 JSON
                </button>
                <button onClick={toggleSelected} disabled={!selectedCell} style={buttonStyle(selectedCell ? '#f59e0b' : '#ccc')}>
                    🎯 切换选中
                </button>
            </div>

            {selectedCell && (
                <div style={{
                    padding: '15px',
                    background: '#e0f2fe',
                    borderRadius: '8px',
                    marginBottom: '15px',
                }}>
                    <div style={{ marginBottom: '10px' }}>
                        <strong>选中 Cell:</strong> {selectedCell.getId()}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                        <label>标签:</label>
                        <input
                            type="text"
                            defaultValue={selectedCell.getLabel()}
                            onBlur={(e) => updateCellLabel(e.target.value)}
                            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <label>状态:</label>
                        <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: selectedCell.getSelected?.() ? '#22c55e' : '#64748b',
                            color: 'white',
                            fontSize: '12px',
                        }}>
                            {selectedCell.getSelected?.() ? '已选中' : '未选中'}
                        </span>
                        <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: selectedCell.getHovered?.() ? '#f59e0b' : '#64748b',
                            color: 'white',
                            fontSize: '12px',
                        }}>
                            {selectedCell.getHovered?.() ? '悬停中' : '未悬停'}
                        </span>
                    </div>
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
                <h3>📚 Cell 基类概述</h3>
                <p>Cell 是所有图形元素（Node、Edge、Port）的抽象基类，提供通用的属性和方法。</p>

                <h3>🔧 核心属性</h3>
                <ul style={{ lineHeight: '1.8' }}>
                    <li><strong>id:</strong> 唯一标识符，只读</li>
                    <li><strong>label:</strong> 显示标签文本</li>
                    <li><strong>data:</strong> 自定义数据对象，可存储任意业务数据</li>
                    <li><strong>isSelected:</strong> 是否被选中</li>
                    <li><strong>isHovered:</strong> 是否被悬停</li>
                    <li><strong>visible:</strong> 是否可见</li>
                    <li><strong>locked:</strong> 是否锁定（不可交互）</li>
                </ul>

                <h3>🎯 核心方法</h3>
                <ul style={{ lineHeight: '1.8' }}>
                    <li><strong>getId():</strong> 获取唯一 ID</li>
                    <li><strong>getLabel() / setLabel():</strong> 获取/设置标签</li>
                    <li><strong>getData() / setData():</strong> 获取/设置自定义数据</li>
                    <li><strong>getSelected() / setSelected():</strong> 选中状态管理</li>
                    <li><strong>getHovered() / setHovered():</strong> 悬停状态管理</li>
                    <li><strong>toJSON():</strong> 序列化为 JSON</li>
                    <li><strong>clone():</strong> 克隆当前 Cell</li>
                </ul>

                <h3>💡 使用场景</h3>
                <ul style={{ lineHeight: '1.8' }}>
                    <li>需要为所有图形元素统一管理 ID 和标签</li>
                    <li>需要在节点/边上绑定业务数据</li>
                    <li>需要实现选中、悬停等通用交互状态</li>
                    <li>需要序列化和反序列化图形数据</li>
                    <li>需要克隆现有图形元素</li>
                </ul>

                <h3>📝 继承关系</h3>
                <pre style={{ background: '#e2e8f0', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
{`Cell (抽象基类)
├── Node (节点)
│   └── 包含 Port (连接桩)
├── Edge (边)
└── Port (连接桩)
`}
                </pre>
            </div>
        </div>
    );
};

// 按钮样式辅助函数
const buttonStyle = (color: string): React.CSSProperties => ({
    padding: '8px 16px',
    background: color,
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: color === '#ccc' ? 'not-allowed' : 'pointer',
    fontSize: '13px',
});

export default CellExample;
