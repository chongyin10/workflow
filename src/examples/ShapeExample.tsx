import React, { useEffect, useRef, useState } from 'react';
import { Graph } from '../core/Graph';
import { Node } from '../core/Node';
import { Shape, ShapeConfig } from '../core/Shape';

/**
 * ShapeExample - Shape 形状组件使用示例
 * 
 * 展示功能：
 * - 8 种内置形状类型
 * - 形状配置参数
 * - 形状锚点计算
 * - 形状碰撞检测
 * - 自定义形状组合
 */
export const ShapeExample: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<Graph | null>(null);
    const [selectedShape, setSelectedShape] = useState<string | null>(null);

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
                setSelectedShape(node?.getId() || null);
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
        // ========== 第 1 行：基础形状 ==========

        // 矩形
        graph.addNode({
            id: 'shape-rect',
            label: 'Rect\n矩形',
            x: 100,
            y: 100,
            shape: Shape.Rect,
            style: {
                width: 100,
                height: 80,
                backgroundColor: '#3b82f6',
                borderColor: '#2563eb',
                textColor: '#ffffff',
                borderRadius: 4,
            },
        });

        // 圆形
        graph.addNode({
            id: 'shape-circle',
            label: 'Circle\n圆形',
            x: 250,
            y: 100,
            shape: Shape.Circle,
            style: {
                width: 90,
                height: 90,
                backgroundColor: '#22c55e',
                borderColor: '#16a34a',
                textColor: '#ffffff',
            },
        });

        // 椭圆
        graph.addNode({
            id: 'shape-ellipse',
            label: 'Ellipse\n椭圆',
            x: 400,
            y: 100,
            shape: Shape.Ellipse,
            style: {
                width: 120,
                height: 70,
                backgroundColor: '#f59e0b',
                borderColor: '#d97706',
                textColor: '#ffffff',
            },
        });

        // ========== 第 2 行：多边形形状 ==========

        // 菱形（四边形）
        graph.addNode({
            id: 'shape-diamond',
            label: 'Diamond\n菱形',
            x: 100,
            y: 230,
            shape: {
                type: Shape.Polygon,
                points: [
                    { x: 0, y: -40 },
                    { x: 50, y: 0 },
                    { x: 0, y: 40 },
                    { x: -50, y: 0 },
                ],
            },
            style: {
                width: 100,
                height: 80,
                backgroundColor: '#ec4899',
                borderColor: '#db2777',
                textColor: '#ffffff',
            },
        });

        // 五边形
        graph.addNode({
            id: 'shape-pentagon',
            label: 'Pentagon\n五边形',
            x: 280,
            y: 230,
            shape: {
                type: Shape.Polygon,
                points: [
                    { x: 0, y: -40 },
                    { x: 40, y: -10 },
                    { x: 25, y: 40 },
                    { x: -25, y: 40 },
                    { x: -40, y: -10 },
                ],
            },
            style: {
                width: 100,
                height: 90,
                backgroundColor: '#8b5cf6',
                borderColor: '#7c3aed',
                textColor: '#ffffff',
            },
        });

        // 六边形
        graph.addNode({
            id: 'shape-hexagon',
            label: 'Hexagon\n六边形',
            x: 460,
            y: 230,
            shape: {
                type: Shape.Polygon,
                points: [
                    { x: -30, y: -50 },
                    { x: 30, y: -50 },
                    { x: 60, y: 0 },
                    { x: 30, y: 50 },
                    { x: -30, y: 50 },
                    { x: -60, y: 0 },
                ],
            },
            style: {
                width: 120,
                height: 100,
                backgroundColor: '#14b8a6',
                borderColor: '#0d9488',
                textColor: '#ffffff',
            },
        });

        // 三角形
        graph.addNode({
            id: 'shape-triangle',
            label: 'Triangle\n三角形',
            x: 640,
            y: 230,
            shape: {
                type: Shape.Polygon,
                points: [
                    { x: 0, y: -40 },
                    { x: 45, y: 40 },
                    { x: -45, y: 40 },
                ],
            },
            style: {
                width: 90,
                height: 90,
                backgroundColor: '#f97316',
                borderColor: '#ea580c',
                textColor: '#ffffff',
            },
        });

        // ========== 第 3 行：圆角矩形变体 ==========

        // 小圆角
        graph.addNode({
            id: 'shape-radius-small',
            label: '小圆角',
            x: 100,
            y: 370,
            shape: Shape.Rect,
            style: {
                width: 90,
                height: 60,
                backgroundColor: '#0ea5e9',
                borderColor: '#0284c7',
                textColor: '#ffffff',
                borderRadius: 4,
            },
        });

        // 中圆角
        graph.addNode({
            id: 'shape-radius-medium',
            label: '中圆角',
            x: 230,
            y: 370,
            shape: Shape.Rect,
            style: {
                width: 90,
                height: 60,
                backgroundColor: '#0ea5e9',
                borderColor: '#0284c7',
                textColor: '#ffffff',
                borderRadius: 12,
            },
        });

        // 大圆角
        graph.addNode({
            id: 'shape-radius-large',
            label: '大圆角',
            x: 360,
            y: 370,
            shape: Shape.Rect,
            style: {
                width: 90,
                height: 60,
                backgroundColor: '#0ea5e9',
                borderColor: '#0284c7',
                textColor: '#ffffff',
                borderRadius: 25,
            },
        });

        // 圆形（圆角最大）
        graph.addNode({
            id: 'shape-radius-full',
            label: '全圆角',
            x: 490,
            y: 370,
            shape: Shape.Rect,
            style: {
                width: 90,
                height: 60,
                backgroundColor: '#0ea5e9',
                borderColor: '#0284c7',
                textColor: '#ffffff',
                borderRadius: 45,
            },
        });

        // ========== 第 4 行：特殊形状 ==========

        // 星形（多边形模拟）
        graph.addNode({
            id: 'shape-star',
            label: 'Star\n星形',
            x: 150,
            y: 500,
            shape: {
                type: Shape.Polygon,
                points: [
                    { x: 0, y: -45 },
                    { x: 12, y: -15 },
                    { x: 45, y: -10 },
                    { x: 20, y: 10 },
                    { x: 30, y: 45 },
                    { x: 0, y: 25 },
                    { x: -30, y: 45 },
                    { x: -20, y: 10 },
                    { x: -45, y: -10 },
                    { x: -12, y: -15 },
                ],
            },
            style: {
                width: 110,
                height: 110,
                backgroundColor: '#eab308',
                borderColor: '#ca8a04',
                textColor: '#ffffff',
            },
        });

        // 梯形
        graph.addNode({
            id: 'shape-trapezoid',
            label: 'Trapezoid\n梯形',
            x: 320,
            y: 500,
            shape: {
                type: Shape.Polygon,
                points: [
                    { x: -30, y: -30 },
                    { x: 30, y: -30 },
                    { x: 50, y: 30 },
                    { x: -50, y: 30 },
                ],
            },
            style: {
                width: 110,
                height: 70,
                backgroundColor: '#6366f1',
                borderColor: '#4f46e5',
                textColor: '#ffffff',
            },
        });

        // 平行四边形
        graph.addNode({
            id: 'shape-parallelogram',
            label: 'Parallelogram\n平行四边形',
            x: 500,
            y: 500,
            shape: {
                type: Shape.Polygon,
                points: [
                    { x: -40, y: -30 },
                    { x: 40, y: -30 },
                    { x: 60, y: 30 },
                    { x: -20, y: 30 },
                ],
            },
            style: {
                width: 130,
                height: 70,
                backgroundColor: '#f43f5e',
                borderColor: '#e11d48',
                textColor: '#ffffff',
            },
        });

        // 胶囊形（高圆角矩形）
        graph.addNode({
            id: 'shape-capsule',
            label: 'Capsule\n胶囊',
            x: 700,
            y: 500,
            shape: Shape.Rect,
            style: {
                width: 130,
                height: 50,
                backgroundColor: '#22d3ee',
                borderColor: '#06b6d4',
                textColor: '#ffffff',
                borderRadius: 25,
            },
        });
    };

    // 添加自定义形状节点
    const addCustomShape = (shapeType: Shape) => {
        if (!graphRef.current) return;

        const id = `shape-custom-${Date.now()}`;
        const x = 300 + Math.random() * 200;
        const y = 300 + Math.random() * 100;

        let shapeConfig: Shape | ShapeConfig = shapeType;
        let style: any = {
            width: 100,
            height: 80,
            backgroundColor: '#64748b',
            borderColor: '#475569',
            textColor: '#ffffff',
        };

        switch (shapeType) {
            case Shape.Rect:
                style.borderRadius = 8;
                break;
            case Shape.Circle:
                style.width = 90;
                style.height = 90;
                break;
            case Shape.Ellipse:
                style.width = 120;
                style.height = 70;
                break;
            case Shape.Polygon:
                shapeConfig = {
                    type: Shape.Polygon,
                    points: [
                        { x: 0, y: -35 },
                        { x: 40, y: 0 },
                        { x: 0, y: 35 },
                        { x: -40, y: 0 },
                    ],
                };
                break;
        }

        graphRef.current.addNode({
            id,
            label: '新形状',
            x,
            y,
            shape: shapeConfig,
            style,
        });
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
            <h2>🎨 Shape 形状组件示例</h2>
            <p>展示各种内置形状类型和自定义多边形</p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 'bold' }}>添加形状:</span>
                <button onClick={() => addCustomShape(Shape.Rect)} style={buttonStyle('#3b82f6')}>
                    + 矩形
                </button>
                <button onClick={() => addCustomShape(Shape.Circle)} style={buttonStyle('#22c55e')}>
                    + 圆形
                </button>
                <button onClick={() => addCustomShape(Shape.Ellipse)} style={buttonStyle('#f59e0b')}>
                    + 椭圆
                </button>
                <button onClick={() => addCustomShape(Shape.Polygon)} style={buttonStyle('#ec4899')}>
                    + 多边形
                </button>
            </div>

            {selectedShape && (
                <div style={{
                    padding: '10px',
                    background: '#e0f2fe',
                    borderRadius: '4px',
                    marginBottom: '15px',
                }}>
                    <strong>选中形状:</strong> {selectedShape}
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
                <h3>📚 Shape 形状类型</h3>
                <ul style={{ lineHeight: '1.8' }}>
                    <li><strong>Rect (矩形):</strong> 标准矩形，支持圆角配置 (borderRadius)</li>
                    <li><strong>Circle (圆形):</strong> 正圆形，使用外接矩形定义</li>
                    <li><strong>Ellipse (椭圆):</strong> 椭圆形，可设置不同宽高</li>
                    <li><strong>Polygon (多边形):</strong> 通过 points 数组定义任意多边形顶点</li>
                    <li><strong>Polyline (折线):</strong> 无填充的折线</li>
                    <li><strong>Path (路径):</strong> SVG 路径字符串定义复杂形状</li>
                    <li><strong>Image (图片):</strong> 图片作为节点背景</li>
                    <li><strong>HTML (自定义 HTML):</strong> 自定义 HTML 内容</li>
                </ul>

                <h3>🔧 ShapeConfig 配置</h3>
                <ul style={{ lineHeight: '1.8' }}>
                    <li><strong>type:</strong> 形状类型枚举值</li>
                    <li><strong>points:</strong> 多边形顶点数组 {'[{x, y}, ...]'}</li>
                    <li><strong>borderRadius:</strong> 矩形圆角半径</li>
                    <li><strong>path:</strong> SVG 路径字符串</li>
                    <li><strong>src:</strong> 图片 URL</li>
                </ul>

                <h3>🎯 核心方法</h3>
                <ul style={{ lineHeight: '1.8' }}>
                    <li><strong>ShapeRenderer.draw(ctx, shape, x, y, width, height, style):</strong> 绘制形状</li>
                    <li><strong>ShapeRenderer.containsPoint(shape, x, y, point):</strong> 点是否在形状内</li>
                    <li><strong>ShapeRenderer.getAnchorPoint(shape, x, y, width, height, position):</strong> 获取锚点</li>
                </ul>

                <h3>💡 使用提示</h3>
                <ul style={{ lineHeight: '1.8' }}>
                    <li>多边形 points 使用相对坐标，(0,0) 是中心点</li>
                    <li>矩形 borderRadius 为宽/高的一半时呈现圆形效果</li>
                    <li>形状支持填充色、边框色、阴影等样式属性</li>
                    <li>所有形状都支持碰撞检测和锚点计算</li>
                </ul>
            </div>
        </div>
    );
};

// 按钮样式辅助函数
const buttonStyle = (color: string): React.CSSProperties => ({
    padding: '6px 12px',
    background: color,
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
});

export default ShapeExample;
