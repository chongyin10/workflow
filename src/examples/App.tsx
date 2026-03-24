import React, { useState } from 'react';
import {
    GraphExample,
    CellExample,
    EdgeExample,
    NodeExample,
    PortExample,
    ShapeExample,
    ConnectionValidationExample,
    DndExample,
    DynamicHeightNodeExample,
    BlankEventExample,
} from './index';

/**
 * Examples App - 示例应用入口
 *
 * 提供所有核心组件示例的导航和展示
 */
type ExampleKey = 'graph' | 'cell' | 'edge' | 'node' | 'port' | 'shape' | 'connectionValidation' | 'dnd' | 'dynamicHeightNode' | 'blankEvent';

interface ExampleItem {
    key: ExampleKey;
    title: string;
    description: string;
    component: React.FC;
}

const examples: ExampleItem[] = [
    {
        key: 'graph',
        title: '📊 Graph 综合示例',
        description: 'Graph 核心组件综合使用展示',
        component: GraphExample,
    },
    {
        key: 'cell',
        title: '🧱 Cell 基类示例',
        description: 'Cell 抽象基类属性和方法展示',
        component: CellExample,
    },
    {
        key: 'node',
        title: '📦 Node 节点示例',
        description: '节点形状、样式、端口管理展示',
        component: NodeExample,
    },
    {
        key: 'edge',
        title: '🌊 Edge 边示例',
        description: '边类型、样式、断开重连展示',
        component: EdgeExample,
    },
    {
        key: 'port',
        title: '🔌 Port 连接桩示例',
        description: '连接桩位置、样式、可见性展示',
        component: PortExample,
    },
    {
        key: 'shape',
        title: '🎨 Shape 形状示例',
        description: '内置形状类型和自定义多边形展示',
        component: ShapeExample,
    },
    {
        key: 'connectionValidation',
        title: '🔐 连接验证示例',
        description: 'validateConnection 回调控制和连接规则验证',
        component: ConnectionValidationExample,
    },
    {
        key: 'dnd',
        title: '🎯 Dnd 拖拽示例',
        description: '从外部拖拽节点到画布的交互展示',
        component: DndExample,
    },
    {
        key: 'dynamicHeightNode',
        title: '📐 动态高度节点示例',
        description: '高度随连接桩数量自动增长的节点',
        component: DynamicHeightNodeExample,
    },
    {
        key: 'blankEvent',
        title: '🖱️ Blank 事件示例',
        description: '画布空白区域点击、双击、右键、拖动、滚动事件演示',
        component: BlankEventExample,
    },
];

const App: React.FC = () => {
    const [activeKey, setActiveKey] = useState<ExampleKey>('graph');

    const activeExample = examples.find((ex) => ex.key === activeKey);
    const ActiveComponent = activeExample?.component || GraphExample;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            {/* 侧边栏导航 */}
            <aside
                style={{
                    width: '280px',
                    background: '#1e293b',
                    color: '#fff',
                    padding: '20px',
                    overflowY: 'auto',
                    flexShrink: 0,
                }}
            >
                <h1 style={{ fontSize: '20px', marginBottom: '10px', color: '#60a5fa' }}>
                    ZJPCY Workflow
                </h1>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '30px' }}>
                    核心组件示例
                </p>

                <nav>
                    {examples.map((example) => (
                        <button
                            key={example.key}
                            onClick={() => setActiveKey(example.key)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                marginBottom: '8px',
                                border: 'none',
                                borderRadius: '8px',
                                textAlign: 'left',
                                cursor: 'pointer',
                                background: activeKey === example.key ? '#3b82f6' : 'transparent',
                                color: activeKey === example.key ? '#fff' : '#cbd5e1',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                if (activeKey !== example.key) {
                                    e.currentTarget.style.background = '#334155';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeKey !== example.key) {
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            <div style={{ fontSize: '14px', fontWeight: 600 }}>
                                {example.title}
                            </div>
                            <div
                                style={{
                                    fontSize: '11px',
                                    marginTop: '4px',
                                    opacity: 0.8,
                                    color: activeKey === example.key ? '#bfdbfe' : '#94a3b8',
                                }}
                            >
                                {example.description}
                            </div>
                        </button>
                    ))}
                </nav>

                <div
                    style={{
                        marginTop: '40px',
                        padding: '16px',
                        background: '#0f172a',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#94a3b8',
                    }}
                >
                    <strong style={{ color: '#60a5fa' }}>提示</strong>
                    <p style={{ margin: '8px 0 0' }}>
                        点击左侧菜单切换不同组件示例。每个示例都包含交互式演示和详细说明。
                    </p>
                </div>
            </aside>

            {/* 主内容区域 */}
            <main style={{ flex: 1, overflow: 'auto', background: '#f8fafc' }}>
                {/* 顶部标题栏 */}
                <header
                    style={{
                        background: '#fff',
                        borderBottom: '1px solid #e2e8f0',
                        padding: '16px 24px',
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <div>
                            <h2 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>
                                {activeExample?.title}
                            </h2>
                            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                                {activeExample?.description}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <a
                                href="https://github.com/your-repo/zjpcy-workflow"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    padding: '8px 16px',
                                    background: '#f1f5f9',
                                    color: '#475569',
                                    textDecoration: 'none',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                }}
                            >
                                GitHub
                            </a>
                        </div>
                    </div>
                </header>

                {/* 示例内容 */}
                <div style={{ padding: '24px 120px 24px 24px' }}>
                    <ActiveComponent />
                </div>
            </main>
        </div>
    );
};

export default App;
