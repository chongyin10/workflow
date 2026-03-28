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
    GridExample,
    ReactShapeExample,
    SnaplineExample,
    ClipboardExample,
    MiniMapExample,
    SiderPaneExample,
    ContextMenuExample,
    HistoryExample,
    SelectionExample,
    ExportExample,
    ToolsExample,
    ForceDirectedExample,
} from './index';

/**
 * Examples App - 示例应用入口
 *
 * 提供所有核心组件示例的导航和展示
 */
type ExampleKey = 'graph' | 'cell' | 'edge' | 'node' | 'port' | 'shape' | 'connectionValidation' | 'dnd' | 'dynamicHeightNode' | 'blankEvent' | 'grid' | 'reactShape' | 'snapline' | 'clipboard' | 'miniMap' | 'siderPane' | 'contextMenu' | 'history' | 'selection' | 'export' | 'tools' | 'forceDirected';

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
    {
        key: 'grid',
        title: '⚡ 网格类型示例',
        description: '线状网格(mesh)和点状网格(dot)切换展示',
        component: GridExample,
    },
    {
        key: 'reactShape',
        title: '⚛️ React Shape 示例',
        description: '使用 React 组件作为节点的自定义渲染',
        component: ReactShapeExample,
    },
    {
        key: 'snapline',
        title: '📏 Snapline 对齐线示例',
        description: '移动节点时的对齐辅助线插件',
        component: SnaplineExample,
    },
    {
        key: 'clipboard',
        title: '📋 Clipboard 剪贴板示例',
        description: '节点和边的复制、粘贴、剪切、删除功能',
        component: ClipboardExample,
    },
    {
        key: 'miniMap',
        title: '🗺️ MiniMap 小地图示例',
        description: '在画布上显示小地图，支持拖拽视口移动画布、自定义位置',
        component: MiniMapExample,
    },
    {
        key: 'siderPane',
        title: '📐 SiderPane 侧边栏示例',
        description: '在画布左侧提供可伸缩的侧边栏 UI 组件，支持自定义内容',
        component: SiderPaneExample,
    },
    {
        key: 'contextMenu',
        title: '🖱️ ContextMenu 右键菜单示例',
        description: '节点、边、单元格和空白区域的右键菜单事件演示',
        component: ContextMenuExample,
    },
    {
        key: 'history',
        title: '⏪ History 撤销重做示例',
        description: '提供撤销和重做功能，支持批量操作和键盘快捷键',
        component: HistoryExample,
    },
    {
        key: 'selection',
        title: '🖱️ Selection 框选示例',
        description: '在画布空白处拖动进行框选，支持多选和自定义样式',
        component: SelectionExample,
    },
    {
        key: 'export',
        title: '📤 Export 导出示例',
        description: '将画布内容导出为 PNG、JPEG、SVG 图片格式，支持自定义尺寸和样式',
        component: ExportExample,
    },
    {
        key: 'tools',
        title: '🔧 Tools 工具栏示例',
        description: '提供缩放、拖拽切换、撤销重做、搜索等工具栏功能',
        component: ToolsExample,
    },
    {
        key: 'forceDirected',
        title: '🌀 ForceDirected 力导向布局',
        description: '使用物理模拟算法自动布局节点和边',
        component: ForceDirectedExample,
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
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    boxSizing: 'border-box',
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
            <main style={{ flex: 1, background: '#f8fafc', marginLeft: '280px' }}>
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
